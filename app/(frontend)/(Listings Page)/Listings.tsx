import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../root_styles";
import TabBar from "../../../src/components/tab_bar";
import Base from "../../../src/components/base";
import { BackButton, Squiggle } from "../../../src/components/design";
import {
    deleteListing,
    getMyListings,
    updateListing,
} from "../../../lib/api/listings";
import type { Listing } from "../../../lib/api/types";
import type { ListingWithImage } from "../../../lib/api/listings";
import {
    formatCategory,
    formatListingPrice,
} from "../../../lib/recommendations";
const Listings = () => {
    const router = useRouter();
    const [listings, setListings] = useState<ListingWithImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const loadListings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setListings(await getMyListings());
        } catch (loadError) {
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Could not load your listings.",
            );
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        let active = true;
        getMyListings()
            .then((data) => {
                if (active) setListings(data);
            })
            .catch((loadError) => {
                if (active)
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Could not load your listings.",
                    );
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);
    const beginEditing = (listing: Listing) => {
        setEditingId(listing.listing_id);
        setEditTitle(listing.title);
        setEditDescription(listing.description ?? "");
        setEditPrice(listing.price === null ? "" : String(listing.price));
    };
    const saveEdit = async (id: number) => {
        setBusyId(id);
        try {
            const updated = await updateListing(id, {
                title: editTitle,
                description: editDescription,
                price: editPrice.trim() === "" ? Number.NaN : Number(editPrice),
            });
            setListings((current) =>
                current.map((listing) =>
                    listing.listing_id === id
                        ? {
                              ...listing,
                              ...updated,
                          }
                        : listing,
                ),
            );
            setEditingId(null);
        } catch (saveError) {
            Alert.alert(
                "Could not save changes",
                saveError instanceof Error
                    ? saveError.message
                    : "Please try again.",
            );
        } finally {
            setBusyId(null);
        }
    };
    const changeStatus = async (listing: Listing) => {
        setBusyId(listing.listing_id);
        try {
            const nextStatus =
                listing.status === "active"
                    ? "pending"
                    : listing.status === "pending"
                      ? "sold"
                      : "active";
            const updated = await updateListing(listing.listing_id, {
                status: nextStatus,
            });
            setListings((current) =>
                current.map((item) =>
                    item.listing_id === listing.listing_id
                        ? {
                              ...item,
                              ...updated,
                          }
                        : item,
                ),
            );
        } catch (statusError) {
            Alert.alert(
                "Could not update status",
                statusError instanceof Error
                    ? statusError.message
                    : "Please try again.",
            );
        } finally {
            setBusyId(null);
        }
    };
    const removeListing = async (listing: Listing) => {
        setBusyId(listing.listing_id);
        try {
            await deleteListing(listing.listing_id);
            setListings((current) =>
                current.filter(
                    (item) => item.listing_id !== listing.listing_id,
                ),
            );
            setDeleteConfirmId(null);
        } catch (deleteError) {
            Alert.alert(
                "Could not delete listing",
                deleteError instanceof Error
                    ? deleteError.message
                    : "Please try again.",
            );
        } finally {
            setBusyId(null);
        }
    };
    return (
        <Base style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View>
                        <BackButton onPress={() => router.back()} />
                        <Text style={styles.heading}>my listings</Text>
                        <Squiggle />
                        <Text style={styles.count}>
                            {listings.length} listings
                        </Text>
                    </View>
                    <Pressable
                        style={styles.createButton}
                        onPress={() => router.push("/Create Listing")}
                    >
                        <Ionicons name="add" size={22} color={colors.white} />
                        <Text style={styles.createText}>New listing</Text>
                    </Pressable>
                </View>

                <View style={styles.search}>
                    <Ionicons name="search" size={25} color={colors.maroon} />
                    <TextInput
                        placeholder="Search my listings"
                        placeholderTextColor={colors.muted}
                        style={styles.searchInput}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator
                        style={styles.loader}
                        color={colors.maroon}
                    />
                ) : error ? (
                    <View style={styles.messageCard}>
                        <Text style={styles.error}>{error}</Text>
                        <Pressable onPress={loadListings}>
                            <Text style={styles.retry}>Try again</Text>
                        </Pressable>
                    </View>
                ) : listings.length === 0 ? (
                    <View style={styles.messageCard}>
                        <Text style={styles.emptyTitle}>
                            Nothing listed yet
                        </Text>
                        <Text style={styles.emptyText}>
                            Create your first listing to start selling on
                            campus.
                        </Text>
                    </View>
                ) : (
                    listings.map((listing) => (
                        <View key={listing.listing_id} style={styles.card}>
                            {editingId === listing.listing_id ? (
                                <>
                                    <Text style={styles.editLabel}>Title</Text>
                                    <TextInput
                                        value={editTitle}
                                        onChangeText={setEditTitle}
                                        style={styles.input}
                                    />
                                    <Text style={styles.editLabel}>
                                        Description
                                    </Text>
                                    <TextInput
                                        value={editDescription}
                                        onChangeText={setEditDescription}
                                        multiline
                                        style={[
                                            styles.input,
                                            styles.description,
                                        ]}
                                    />
                                    <Text style={styles.editLabel}>Price</Text>
                                    <TextInput
                                        value={editPrice}
                                        onChangeText={setEditPrice}
                                        keyboardType="decimal-pad"
                                        style={styles.input}
                                    />
                                    <View style={styles.actions}>
                                        <Pressable
                                            style={styles.secondaryButton}
                                            onPress={() => setEditingId(null)}
                                        >
                                            <Text style={styles.secondaryText}>
                                                Cancel
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.primaryButton}
                                            disabled={
                                                busyId === listing.listing_id
                                            }
                                            onPress={() =>
                                                saveEdit(listing.listing_id)
                                            }
                                        >
                                            {busyId === listing.listing_id ? (
                                                <ActivityIndicator
                                                    color={colors.white}
                                                />
                                            ) : (
                                                <Text
                                                    style={styles.primaryText}
                                                >
                                                    Save
                                                </Text>
                                            )}
                                        </Pressable>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.cardTop}>
                                        {listing.image_url ? (
                                            <Image
                                                source={{
                                                    uri: listing.image_url,
                                                }}
                                                style={styles.photoImage}
                                            />
                                        ) : (
                                            <View
                                                style={styles.photoPlaceholder}
                                            >
                                                <Text style={styles.photoText}>
                                                    [photo]
                                                </Text>
                                            </View>
                                        )}
                                        <View style={styles.cardTitleWrap}>
                                            <Text style={styles.cardTitle}>
                                                {listing.title}
                                            </Text>
                                            <Text style={styles.meta}>
                                                {formatCategory(
                                                    listing.category,
                                                )}{" "}
                                                ·{" "}
                                                {formatListingPrice(
                                                    listing.price,
                                                )}
                                            </Text>
                                            <Text style={styles.published}>
                                                Published{" "}
                                                {listing.created_at
                                                    ? new Date(
                                                          listing.created_at,
                                                      ).toLocaleDateString(
                                                          undefined,
                                                          {
                                                              month: "short",
                                                              day: "numeric",
                                                          },
                                                      )
                                                    : "recently"}{" "}
                                                · Marketplace
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.status,
                                                listing.status !== "active" &&
                                                    styles.statusInactive,
                                            ]}
                                        >
                                            <Text style={styles.statusText}>
                                                {listing.status}
                                            </Text>
                                        </View>
                                    </View>
                                    {listing.description ? (
                                        <Text
                                            numberOfLines={4}
                                            ellipsizeMode="tail"
                                            style={styles.cardDescription}
                                        >
                                            {listing.description}
                                        </Text>
                                    ) : null}
                                    <Text style={styles.activity}>
                                        24 views · 3 saves · 2 messages
                                    </Text>
                                    <View style={styles.actions}>
                                        <Pressable
                                            style={styles.iconButton}
                                            onPress={() =>
                                                beginEditing(listing)
                                            }
                                            accessibilityLabel="Edit listing"
                                        >
                                            <Ionicons
                                                name="pencil"
                                                size={18}
                                                color={colors.maroon}
                                            />
                                        </Pressable>
                                        <Pressable
                                            style={styles.secondaryButton}
                                            disabled={
                                                busyId === listing.listing_id
                                            }
                                            onPress={() =>
                                                changeStatus(listing)
                                            }
                                        >
                                            <Text style={styles.secondaryText}>
                                                {listing.status === "active"
                                                    ? "Mark pending"
                                                    : listing.status ===
                                                        "pending"
                                                      ? "Mark sold"
                                                      : "Mark unsold"}
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.deleteButton}
                                            disabled={
                                                busyId === listing.listing_id
                                            }
                                            onPress={() =>
                                                setDeleteConfirmId(
                                                    listing.listing_id,
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={18}
                                                color={colors.white}
                                            />
                                        </Pressable>
                                    </View>
                                    {deleteConfirmId === listing.listing_id ? (
                                        <View style={styles.deleteConfirm}>
                                            <Text
                                                style={styles.deleteConfirmText}
                                            >
                                                Delete this listing permanently?
                                            </Text>
                                            <View style={styles.actions}>
                                                <Pressable
                                                    style={
                                                        styles.secondaryButton
                                                    }
                                                    onPress={() =>
                                                        setDeleteConfirmId(null)
                                                    }
                                                >
                                                    <Text
                                                        style={
                                                            styles.secondaryText
                                                        }
                                                    >
                                                        Cancel
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    style={
                                                        styles.confirmDeleteButton
                                                    }
                                                    disabled={
                                                        busyId ===
                                                        listing.listing_id
                                                    }
                                                    onPress={() =>
                                                        removeListing(listing)
                                                    }
                                                >
                                                    {busyId ===
                                                    listing.listing_id ? (
                                                        <ActivityIndicator
                                                            color={colors.white}
                                                        />
                                                    ) : (
                                                        <Text
                                                            style={
                                                                styles.primaryText
                                                            }
                                                        >
                                                            Delete
                                                        </Text>
                                                    )}
                                                </Pressable>
                                            </View>
                                        </View>
                                    ) : null}
                                </>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
            <TabBar />
        </Base>
    );
};
const styles = StyleSheet.create({
    screen: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
    },
    content: {
        // Keep the side gutters inside the scroll viewport so shadows can extend into them.
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 130,
        gap: 14,
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    heading: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 46,
        letterSpacing: -2,
        marginTop: 22,
    },
    count: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 15,
        marginTop: 2,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: colors.maroon,
        paddingHorizontal: 16,
        height: 48,
    },
    createText: {
        color: colors.white,
        fontFamily: "Outfit",
        fontWeight: "700",
    },
    loader: {
        marginTop: 80,
    },
    search: {
        height: 54,
        marginBottom: 10,
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Outfit",
        fontSize: 17,
        color: colors.ink,
    },
    messageCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        gap: 8,
    },
    error: {
        color: colors.maroon,
        fontFamily: "Outfit",
        textAlign: "center",
    },
    retry: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
    },
    emptyTitle: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 18,
    },
    emptyText: {
        color: colors.muted,
        fontFamily: "Outfit",
        textAlign: "center",
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        gap: 12,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
    },
    photoPlaceholder: {
        width: 82,
        height: 82,
        backgroundColor: colors.tileRed,
        alignItems: "center",
        justifyContent: "center",
    },
    photoImage: {
        width: 82,
        height: 82,
        backgroundColor: colors.blush,
    },
    photoText: {
        fontFamily: "Caveat",
        color: colors.rose,
        fontSize: 20,
    },
    cardTitleWrap: {
        flex: 1,
    },
    cardTitle: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 21,
    },
    meta: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 15,
        marginTop: 3,
    },
    status: {
        backgroundColor: colors.sage,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    statusInactive: {
        backgroundColor: colors.mustard,
    },
    statusText: {
        color: colors.white,
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 17,
        textTransform: "capitalize",
    },
    cardDescription: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 16,
        lineHeight: 23,
    },
    published: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 14,
        marginTop: 3,
    },
    activity: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 14,
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },
    iconButton: {
        width: 52,
        height: 44,
        borderRadius: 3,
        backgroundColor: colors.blush,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButton: {
        flex: 1,
        height: 44,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryText: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
    },
    primaryButton: {
        flex: 1,
        height: 44,
        borderRadius: 3,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryText: {
        color: colors.white,
        fontFamily: "Outfit",
        fontWeight: "700",
    },
    deleteButton: {
        width: 52,
        height: 44,
        borderRadius: 3,
        backgroundColor: colors.maroonLight,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteConfirm: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.maroonLight,
        borderRadius: 3,
        padding: 14,
        gap: 8,
    },
    deleteConfirmText: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
        textAlign: "left",
    },
    confirmDeleteButton: {
        flex: 1,
        height: 44,
        borderRadius: 3,
        backgroundColor: colors.maroonLight,
        alignItems: "center",
        justifyContent: "center",
    },
    editLabel: {
        color: colors.maroon,
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 22,
    },
    input: {
        minHeight: 48,
        borderRadius: 3,
        backgroundColor: colors.white,
        paddingHorizontal: 13,
        color: colors.ink,
        fontFamily: "Outfit",
        borderWidth: 1,
        borderColor: "#E5DDDA",
    },
    description: {
        minHeight: 100,
        paddingTop: 12,
        textAlignVertical: "top",
    },
});
export default Listings;
