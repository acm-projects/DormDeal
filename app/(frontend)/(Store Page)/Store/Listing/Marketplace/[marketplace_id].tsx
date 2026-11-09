import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../../root_styles';
import { items } from '../../../../../../data/items';
import { supabase } from '../../../../../../lib/supabase';
import { getListing } from '../../../../../../lib/api/listings';
import { formatCategory, formatListingPrice, formatSellerName, recordListingInteraction } from '../../../../../../lib/recommendations';

type DisplayItem = {
    id: string;
    liveListingId?: number;
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

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// 'YYYY-MM-DD' -> 'Nov 3'
function prettyDate(key?: string) {
    if (!key) return 'Not set';
    const [, m, d] = key.split('-').map(Number);
    return `${monthNames[m - 1].slice(0, 3)} ${d}`;
}

const Marketplace_Listing = () => {
    const { marketplace_id } = useLocalSearchParams<{ marketplace_id: string }>(); // the number at the end of the address
    const router = useRouter();
    const parsedLiveListingId = marketplace_id?.startsWith('live-')
        ? Number(marketplace_id.slice('live-'.length))
        : null;
    const liveListingId = parsedLiveListingId !== null
        && Number.isInteger(parsedLiveListingId)
        && parsedLiveListingId > 0
        ? parsedLiveListingId
        : null;
    const demoItem = liveListingId ? undefined : items.find((candidate) => candidate.id === marketplace_id);
    const [item, setItem] = useState<DisplayItem | null>(demoItem ? { ...demoItem, isLive: false } : null);
    const [loading, setLoading] = useState(Boolean(liveListingId && !demoItem));
    const [messaging, setMessaging] = useState(false);
    const [messageError, setMessageError] = useState('');

    useEffect(() => {
        if (!liveListingId || demoItem) return;

        let active = true;

        const loadListing = async () => {
            try {
                const data = await getListing(liveListingId);

                if (!active) return;

                const { data: sellerData } = await supabase
                    .from('app-users')
                    .select('name')
                    .eq('user_id', data.seller_id)
                    .maybeSingle();
                const seller = formatSellerName(sellerData?.name);
                const initials = seller.split(/\s+/).slice(0, 2).map((word: string) => word[0]?.toUpperCase()).join('');

                setItem({
                    id: String(data.listing_id),
                    liveListingId: data.listing_id,
                    title: data.title,
                    seller,
                    initials,
                    price: formatListingPrice(data.price),
                    condition: 'Available',
                    category: formatCategory(data.category),
                    description: data.description ?? 'No description provided.',
                    pickup: 'Arrange with seller',
                    posted: new Date(data.created_at).toLocaleDateString(),
                    isLive: true,
                    imageUrl: data.image_url,
                });

                recordListingInteraction(data.listing_id, 'view').catch(() => undefined);
            } catch {
                if (active) setItem(null);
            }

            if (active) setLoading(false);
        };

        loadListing();
        return () => { active = false; };
    }, [demoItem, liveListingId]);

    // open (or create) a chat with this listing's seller, then go to it
    const messageSeller = async () => {
        if (!item?.liveListingId) {
            setMessageError("This listing can't be messaged yet.");
            return;
        }
        setMessageError('');
        setMessaging(true);

        recordListingInteraction(item.liveListingId, 'message').catch(() => undefined);

        const { data: conversationId, error } = await supabase.rpc('start_conversation', {
            p_listing_id: item.liveListingId,
        });

        setMessaging(false);

        if (error) {
            setMessageError(error.message);
            return;
        }
        router.push(`/Messages/${conversationId}`);
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
            <ScrollView contentContainerStyle={page.content}>

                {/* listing photo with a placeholder color when none was uploaded */}
                <View style={page.photo}>
                    {item.imageUrl && (
                        <Image source={{ uri: item.imageUrl }} style={page.photoImage} resizeMode="cover" />
                    )}
                    <Pressable style={page.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
                        <Ionicons name="chevron-back" size={22} color={colors.ink} />
                    </Pressable>
                </View>

                <View style={page.body}>
                    {/* seller */}
                    <View style={page.sellerCard}>
                        <View style={page.sellerAvatar}>
                            <Text style={page.sellerInitials}>{item.initials}</Text>
                        </View>
                        <View style={page.sellerInfo}>
                            <Text style={page.sellerName}>{item.seller}</Text>
                            <Text style={page.verified}>Verified student</Text>
                        </View>
                    </View>

                    {/* title + price */}
                    <Text style={page.title}>{item.title}</Text>
                    <Text style={page.price}>{item.price}</Text>

                    {/* tags */}
                    <View style={page.tags}>
                        <View style={[page.tag, page.tagMain]}>
                            <Text style={[page.tagText, page.tagTextMain]}>{item.condition}</Text>
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
                            <Text style={page.detailValue}>{item.condition}</Text>
                        </View>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Pickup</Text>
                            <Text style={page.detailValue}>{item.pickup}</Text>
                        </View>
                        <View style={page.detailRow}>
                            <Text style={page.detailLabel}>Pickup date</Text>
                            <Text style={page.detailValue}>
                                {prettyDate(item.pickupDate)}{item.pickupTime ? ` · ${item.pickupTime}` : ''}
                            </Text>
                        </View>
                        <View style={[page.detailRow, page.detailRowLast]}>
                            <Text style={page.detailLabel}>Posted</Text>
                            <Text style={page.detailValue}>{item.posted}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* buttons stuck to the bottom */}
            <View style={page.actionBar}>
                {messageError ? <Text style={page.errorText}>{messageError}</Text> : null}
                <View style={page.actionRow}>
                    <Pressable
                        style={[page.messageButton, messaging && { opacity: 0.6 }]}
                        onPress={messageSeller}
                        disabled={messaging}
                    >
                        <Text style={page.messageText}>{messaging ? 'Opening…' : 'Message'}</Text>
                    </Pressable>
                    <Pressable style={page.buyButton} onPress={() => {
                        if (item.liveListingId) recordListingInteraction(item.liveListingId, 'purchase').catch(() => undefined);
                        router.push('/Store/Checkout');
                    }}>
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
        width: '100%',
        backgroundColor: colors.cream,
    },
    content: {
        paddingBottom: 140, // room for the button bar
    },
    photo: {
        height: 380,
        backgroundColor: colors.maroon,
    },
    photoImage: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 56,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        padding: 20,
        gap: 14,
    },
    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerInitials: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    sellerInfo: {
        gap: 2,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    verified: {
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    price: {
        fontSize: 30,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
        marginTop: -6,
    },
    tags: {
        flexDirection: 'row',
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
        fontSize: 13,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    tagTextMain: {
        color: colors.white,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    details: {
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: colors.blush,
    },
    detailRowLast: {
        borderBottomWidth: 0, // no line under the last row
    },
    detailLabel: {
        fontSize: 14,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    actionBar: {
        position: 'absolute', // stuck to the bottom
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
        flexDirection: 'row',
        gap: 10,
    },
    errorText: {
        fontSize: 13,
        color: '#B00020',
        fontFamily: 'Outfit',
        textAlign: 'center',
    },
    messageButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: colors.maroon,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    buyButton: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.maroon,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
        fontFamily: 'Outfit',
    },
    notFound: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: colors.cream,
    },
    notFoundText: {
        fontSize: 18,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
});

export default Marketplace_Listing;