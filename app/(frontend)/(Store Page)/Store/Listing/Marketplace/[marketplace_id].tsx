import { useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Image,
    TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../../root_styles";
import { items } from "../../../../../../data/items";
import { supabase } from "../../../../../../lib/supabase";
import { getListing } from "../../../../../../lib/api/listings";
import {
    getListingReviewData,
    saveListingReview,
    type ListingReviewData,
} from "../../../../../../lib/api/reviews";
import {
    formatCategory,
    formatListingPrice,
    formatSellerName,
    recordListingInteraction,
} from "../../../../../../lib/recommendations";

type DisplayItem = {
    id: string;
    liveListingId?: number;
    sellerId?: string;
    title: string;
    seller: string;
    initials: string;
    price: string;
    condition: string;
    category: string;
    description: string;
    pickup: string;
    pickupDate?: string;
    pickupTime?: string;
    posted: string;
    isLive: boolean;
    imageUrl?: string | null;
};

const StarRating = ({
    value,
    onChange,
    size = 24,
}: {
    value: number;
    onChange?: (rating: number) => void;
    size?: number;
}) => (
    <View style={page.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
                key={star}
                disabled={!onChange}
                onPress={() => onChange?.(star)}
                accessibilityRole={onChange ? "button" : undefined}
                accessibilityLabel={`${star} star${star === 1 ? "" : "s"}`}
                hitSlop={6}
            >
                <Ionicons
                    name={star <= Math.round(value) ? "star" : "star-outline"}
                    size={size}
                    color={colors.gold}
                />
            </Pressable>
        ))}
    </View>
);

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// 'YYYY-MM-DD' -> 'Nov 3'
function prettyDate(key?: string) {
    if (!key) return "Not set";
    const [, m, d] = key.split("-").map(Number);
    return `${monthNames[m - 1].slice(0, 3)} ${d}`;
}

const Marketplace_Listing = () => {
    const { marketplace_id } = useLocalSearchParams<{
        marketplace_id: string;
    }>(); // the number at the end of the address
    const router = useRouter();
    const parsedLiveListingId = marketplace_id?.startsWith("live-")
        ? Number(marketplace_id.slice("live-".length))
        : null;
    const liveListingId =
        parsedLiveListingId !== null &&
        Number.isInteger(parsedLiveListingId) &&
        parsedLiveListingId > 0
            ? parsedLiveListingId
            : null;
    const demoItem = liveListingId
        ? undefined
        : items.find((candidate) => candidate.id === marketplace_id);
    const [item, setItem] = useState<DisplayItem | null>(
        demoItem ? { ...demoItem, isLive: false } : null,
    );
    const [loading, setLoading] = useState(Boolean(liveListingId && !demoItem));
    const [messaging, setMessaging] = useState(false);
    const [messageError, setMessageError] = useState("");
    const [reviewData, setReviewData] = useState<ListingReviewData | null>(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [savingReview, setSavingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewNotice, setReviewNotice] = useState("");

    useEffect(() => {
        if (!liveListingId || demoItem) return;

        let active = true;

        const loadListing = async () => {
            try {
                const data = await getListing(liveListingId);

                if (!active) return;

                const { data: sellerData } = await supabase
                    .from("app-users")
                    .select("name")
                    .eq("user_id", data.seller_id)
                    .maybeSingle();
                const seller = formatSellerName(sellerData?.name);
                const initials = seller
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((word: string) => word[0]?.toUpperCase())
                    .join("");

                setItem({
                    id: String(data.listing_id),
                    liveListingId: data.listing_id,
                    sellerId: data.seller_id,
                    title: data.title,
                    seller,
                    initials,
                    price: formatListingPrice(data.price),
                    condition: "Available",
                    category: formatCategory(data.category),
                    description: data.description ?? "No description provided.",
                    pickup: "Arrange with seller",
                    posted: new Date(data.created_at).toLocaleDateString(),
                    isLive: true,
                    imageUrl: data.image_url,
                });

                try {
                    const reviews = await getListingReviewData(
                        data.listing_id,
                        data.seller_id,
                    );
                    if (active) {
                        setReviewData(reviews);
                        setSelectedRating(reviews.currentUserReview?.rating ?? 0);
                        setReviewText(
                            reviews.currentUserReview?.review_text ?? "",
                        );
                    }
                } catch (reviewLoadError) {
                    if (active) {
                        setReviewError(
                            reviewLoadError instanceof Error
                                ? reviewLoadError.message
                                : "Could not load reviews.",
                        );
                    }
                }

                recordListingInteraction(data.listing_id, "view").catch(
                    () => undefined,
                );
            } catch {
                if (active) setItem(null);
            }

            if (active) setLoading(false);
        };

        loadListing();
        return () => {
            active = false;
        };
    }, [demoItem, liveListingId]);

    // open (or create) a chat with this listing's seller, then go to it
    const messageSeller = async () => {
        if (!item?.liveListingId) {
            setMessageError("This listing can't be messaged yet.");
            return;
        }
        setMessageError("");
        setMessaging(true);

        recordListingInteraction(item.liveListingId, "message").catch(
            () => undefined,
        );

        const { data: conversationId, error } = await supabase.rpc(
            "start_conversation",
            {
                p_listing_id: item.liveListingId,
            },
        );

        setMessaging(false);

        if (error) {
            setMessageError(error.message);
            return;
        }
        router.push(`/Messages/${conversationId}`);
    };

    const submitReview = async () => {
        if (!item?.liveListingId || !item.sellerId) return;

        setSavingReview(true);
        setReviewError("");
        setReviewNotice("");
        try {
            await saveListingReview(
                item.liveListingId,
                selectedRating,
                reviewText,
            );
            const reviews = await getListingReviewData(
                item.liveListingId,
                item.sellerId,
            );
            setReviewData(reviews);
            setSelectedRating(reviews.currentUserReview?.rating ?? 0);
            setReviewText(reviews.currentUserReview?.review_text ?? "");
            setReviewNotice("Your review has been saved.");
        } catch (saveError) {
            setReviewError(
                saveError instanceof Error
                    ? saveError.message
                    : "Could not save your review.",
            );
        } finally {
            setSavingReview(false);
        }
    };

    if (loading) {
        return (
            <View style={page.notFound}>
                <ActivityIndicator color={colors.maroon} />
                <Text style={page.notFoundText}>Loading listing…</Text>
            </View>
        );
    }

    // bad link, no item with that id
    if (!item) {
        return (
            <View style={page.notFound}>
                <Text style={page.notFoundText}>Could not find that item.</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={page.link}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={page.screen}>
            <ScrollView
                contentContainerStyle={page.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* listing photo with a placeholder color when none was uploaded */}
                <View style={page.photo}>
                    {item.imageUrl && (
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={page.photoImage}
                            resizeMode="cover"
                        />
                    )}
                    <Pressable
                        style={page.backButton}
                        onPress={() => router.back()}
                        accessibilityLabel="Go back"
                    >
                        <Ionicons
                            name="chevron-back"
                            size={30}
                            color={colors.maroon}
                        />
                    </Pressable>
                </View>

                <View style={page.body}>
                    {/* seller */}
                    <View style={page.sellerCard}>
                        <View style={page.sellerAvatar}>
                            <Text style={page.sellerInitials}>
                                {item.initials}
                            </Text>
                        </View>
                        <View style={page.sellerInfo}>
                            <Text style={page.sellerName}>{item.seller}</Text>
                            <Text style={page.verified}>Verified student</Text>
                        </View>
                        {reviewData ? (
                            <View style={page.sellerRating}>
                                <View style={page.ratingSummaryRow}>
                                    <Ionicons
                                        name="star"
                                        size={17}
                                        color={colors.gold}
                                    />
                                    <Text style={page.ratingSummaryText}>
                                        {reviewData.averageRating?.toFixed(1) ?? "New"}
                                    </Text>
                                </View>
                                <Text style={page.ratingCountText}>
                                    {reviewData.ratingCount} rating
                                    {reviewData.ratingCount === 1 ? "" : "s"}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* title + price */}
                    <Text style={page.title}>{item.title}</Text>
                    <Text style={page.price}>{item.price}</Text>

                    {/* tags */}
                    <View style={page.tags}>
                        <View style={[page.tag, page.tagMain]}>
                            <Text style={[page.tagText, page.tagTextMain]}>
                                {item.condition}
                            </Text>
                        </View>
                        <View style={page.tag}>
                            <Text style={page.tagText}>{item.category}</Text>
                        </View>
                    </View>

                    {/* description */}
                    <Text style={page.description}>{item.description}</Text>

                    {/* details list */}
                    <View style={page.details}>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Condition</Text>
                            <Text style={page.detailValue}>
                                {item.condition}
                            </Text>
                        </View>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Pickup</Text>
                            <Text style={page.detailValue}>{item.pickup}</Text>
                        </View>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Pickup date</Text>
                            <Text style={page.detailValue}>
                                {prettyDate(item.pickupDate)}
                                {item.pickupTime ? ` · ${item.pickupTime}` : ""}
                            </Text>
                        </View>
                        <View style={[page.detailRow, page.detailRowLast]}>
                            <Text style={page.detailLabel}>Posted</Text>
                            <Text style={page.detailValue}>{item.posted}</Text>
                        </View>
                    </View>

                    {item.isLive ? (
                        <View style={page.reviewsSection}>
                            <View style={page.reviewsHeadingRow}>
                                <View>
                                    <Text style={page.reviewsTitle}>
                                        Ratings & reviews
                                    </Text>
                                    <Text style={page.reviewsNote}>
                                        share your experience
                                    </Text>
                                </View>
                                {reviewData?.averageRating ? (
                                    <View style={page.averageRating}>
                                        <Text style={page.averageRatingValue}>
                                            {reviewData.averageRating.toFixed(1)}
                                        </Text>
                                        <StarRating
                                            value={reviewData.averageRating}
                                            size={16}
                                        />
                                    </View>
                                ) : null}
                            </View>

                            {reviewData?.canReview ? (
                                <View style={page.reviewForm}>
                                    <Text style={page.reviewFormTitle}>
                                        {reviewData.currentUserReview
                                            ? "Update your review"
                                            : "Rate this seller"}
                                    </Text>
                                    <StarRating
                                        value={selectedRating}
                                        onChange={setSelectedRating}
                                        size={30}
                                    />
                                    <TextInput
                                        style={page.reviewInput}
                                        value={reviewText}
                                        onChangeText={setReviewText}
                                        placeholder="How was your experience with this seller?"
                                        placeholderTextColor={colors.mutedLight}
                                        multiline
                                        maxLength={1000}
                                        textAlignVertical="top"
                                    />
                                    {reviewError ? (
                                        <Text style={page.reviewError}>
                                            {reviewError}
                                        </Text>
                                    ) : null}
                                    {reviewNotice ? (
                                        <Text style={page.reviewNotice}>
                                            {reviewNotice}
                                        </Text>
                                    ) : null}
                                    <Pressable
                                        style={[
                                            page.reviewButton,
                                            savingReview && page.buttonDisabled,
                                        ]}
                                        onPress={submitReview}
                                        disabled={savingReview}
                                    >
                                        {savingReview ? (
                                            <ActivityIndicator
                                                color={colors.white}
                                            />
                                        ) : (
                                            <Text style={page.reviewButtonText}>
                                                Save review
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            ) : reviewData ? (
                                <Text style={page.ownListingNote}>
                                    Sellers cannot review their own listings.
                                </Text>
                            ) : reviewError ? (
                                <Text style={page.reviewError}>{reviewError}</Text>
                            ) : (
                                <ActivityIndicator color={colors.maroon} />
                            )}

                            <View style={page.reviewList}>
                                <Text style={page.reviewListTitle}>
                                    Reviews on this listing
                                </Text>
                                {reviewData?.reviews.length ? (
                                    reviewData.reviews.map((review) => (
                                        <View
                                            key={review.review_id}
                                            style={page.reviewCard}
                                        >
                                            <View style={page.reviewCardHeader}>
                                                <View>
                                                    <Text
                                                        style={page.reviewerName}
                                                    >
                                                        {review.reviewer_name}
                                                    </Text>
                                                    <Text
                                                        style={page.reviewDate}
                                                    >
                                                        {new Date(
                                                            review.created_at,
                                                        ).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                <StarRating
                                                    value={review.rating}
                                                    size={16}
                                                />
                                            </View>
                                            <Text style={page.reviewBody}>
                                                {review.review_text}
                                            </Text>
                                        </View>
                                    ))
                                ) : reviewData ? (
                                    <Text style={page.noReviews}>
                                        No reviews yet. Be the first to leave one.
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            {/* buttons stuck to the bottom */}
            <View style={page.actionBar}>
                {messageError ? (
                    <Text style={page.errorText}>{messageError}</Text>
                ) : null}
                <View style={page.actionRow}>
                    <Pressable
                        style={[
                            page.messageButton,
                            messaging && { opacity: 0.6 },
                        ]}
                        onPress={messageSeller}
                        disabled={messaging}
                    >
                        <Text style={page.messageText}>
                            {messaging ? "Opening…" : "Message"}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={page.buyButton}
                        onPress={() => {
                            if (item.liveListingId)
                                recordListingInteraction(
                                    item.liveListingId,
                                    "purchase",
                                ).catch(() => undefined);
                        }}
                    >
                        <Text style={page.buyText}>Add to cart</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const page = StyleSheet.create({
    screen: {
        flex: 1,
        width: "100%",
        backgroundColor: colors.white,
    },
    content: {
        paddingBottom: 140, // room for the button bar
    },
    photo: {
        height: 380,
        backgroundColor: colors.white,
    },
    photoImage: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
    },
    backButton: {
        position: "absolute",
        top: 24,
        left: 24,
        width: 56,
        height: 56,
        borderRadius: 0,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.08)`,
    },
    body: {
        padding: 20,
        gap: 14,
    },
    sellerCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 12,
    },
    sellerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.blush,
        alignItems: "center",
        justifyContent: "center",
    },
    sellerInitials: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    sellerInfo: {
        gap: 2,
        flex: 1,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    verified: {
        fontSize: 14,
        color: colors.muted,
        fontFamily: "Outfit",
    },
    sellerRating: {
        alignItems: "flex-end",
        gap: 1,
    },
    ratingSummaryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingSummaryText: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 16,
        fontWeight: "700",
    },
    ratingCountText: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 12,
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    price: {
        fontSize: 30,
        fontWeight: "700",
        color: colors.maroon,
        fontFamily: "Outfit",
        marginTop: -6,
    },
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.white,
    },
    tagMain: {
        backgroundColor: colors.maroon,
    },
    tagText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    tagTextMain: {
        color: colors.white,
    },
    description: {
        fontSize: 17,
        lineHeight: 25,
        color: colors.ink,
        fontFamily: "Outfit",
    },
    details: {
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: colors.blush,
    },
    detailRowLast: {
        borderBottomWidth: 0, // no line under the last row
    },
    detailLabel: {
        fontSize: 16,
        color: colors.muted,
        fontFamily: "Outfit",
    },
    detailValue: {
        flexShrink: 1,
        textAlign: "right",
        fontSize: 16,
        fontWeight: "600",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    reviewsSection: {
        gap: 14,
        marginTop: 8,
    },
    reviewsHeadingRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
    },
    reviewsTitle: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 24,
        fontWeight: "700",
    },
    reviewsNote: {
        color: colors.maroon,
        fontFamily: "Caveat",
        fontSize: 19,
        marginTop: -2,
    },
    averageRating: {
        alignItems: "flex-end",
        gap: 2,
    },
    averageRatingValue: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 26,
        fontWeight: "700",
    },
    stars: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    reviewForm: {
        backgroundColor: colors.cream,
        borderColor: colors.blush,
        borderWidth: 1,
        gap: 12,
        padding: 16,
    },
    reviewFormTitle: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 17,
        fontWeight: "700",
    },
    reviewInput: {
        minHeight: 108,
        backgroundColor: colors.white,
        borderColor: colors.blush,
        borderWidth: 1,
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 16,
        lineHeight: 22,
        padding: 12,
    },
    reviewButton: {
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: colors.maroon,
        height: 44,
        justifyContent: "center",
        minWidth: 132,
        paddingHorizontal: 18,
    },
    reviewButtonText: {
        color: colors.white,
        fontFamily: "Outfit",
        fontSize: 15,
        fontWeight: "700",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    reviewError: {
        color: "#B00020",
        fontFamily: "Outfit",
        fontSize: 13,
    },
    reviewNotice: {
        color: colors.activeGreen,
        fontFamily: "Outfit",
        fontSize: 13,
        fontWeight: "600",
    },
    ownListingNote: {
        backgroundColor: colors.cream,
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 14,
        padding: 14,
    },
    reviewList: {
        gap: 10,
    },
    reviewListTitle: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 17,
        fontWeight: "700",
    },
    reviewCard: {
        backgroundColor: colors.white,
        borderBottomColor: colors.blush,
        borderBottomWidth: 1,
        gap: 9,
        paddingVertical: 12,
    },
    reviewCardHeader: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    reviewerName: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 15,
        fontWeight: "700",
    },
    reviewDate: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 12,
        marginTop: 2,
    },
    reviewBody: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 15,
        lineHeight: 22,
    },
    noReviews: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 14,
        paddingVertical: 8,
    },
    actionBar: {
        position: "absolute", // stuck to the bottom
        left: 0,
        right: 0,
        bottom: 0,
        gap: 8,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 30,
        backgroundColor: colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
    },
    errorText: {
        fontSize: 13,
        color: "#B00020",
        fontFamily: "Outfit",
        textAlign: "center",
    },
    messageButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    messageText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    buyButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    buyText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.white,
        fontFamily: "Outfit",
    },
    notFound: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        backgroundColor: colors.cream,
    },
    notFoundText: {
        fontSize: 18,
        color: colors.ink,
        fontFamily: "Outfit",
    },
    link: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
});

export default Marketplace_Listing;
