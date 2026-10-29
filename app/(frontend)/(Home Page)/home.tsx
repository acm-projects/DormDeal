import { useEffect, useRef, useState } from 'react';
import { Text, View, ImageBackground, StyleSheet, ScrollView, Pressable, Animated, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { items } from '../../../data/items';
import { formatCategory, recordListingInteraction, RecommendedListing } from '../../../lib/recommendations';

import PaperBg from '../../../assets/images/paper_bg.png';




// what one pickup looks like
type Pickup = {
    id: string;
    type: 'buy' | 'sell';
    day: string;
    date: string;
    item: string;
    time: string;
    place: string;
};

// fake pickups for now
const pickups: Pickup[] = [
    { id: 'p1', type: 'buy', day: 'THU', date: '15', item: 'Adjustable desk lamp', time: '5:30 PM', place: 'Helix Hall Lobby' },
    { id: 'p2', type: 'buy', day: 'SAT', date: '17', item: 'Mini fridge, 3.1 ft', time: '11:00 AM', place: 'Sciences Building' },
    { id: 'p3', type: 'sell', day: 'FRI', date: '16', item: 'Twin XL sheets', time: '2:00 PM', place: 'Student Union' },
];

// what a card needs
type RecCardProps = {
    title: string;
    seller: string;
    initials: string;
    price: string;
    category: string;
    reason?: string;
};

// one card, reused for every item
const RecCard = (props: RecCardProps) => {
    return (
        <View style={home.card}>
            <View style={home.cardPhoto} />
            <View style={home.categoryBadge}>
                <Text style={home.categoryBadgeText}>{props.category}</Text>
            </View>
            <View style={home.cardInfo}>
                <View style={home.cardLeft}>
                    <Text style={home.cardTitle} numberOfLines={1}>{props.title}</Text>
                    <View style={home.sellerRow}>
                        <View style={home.sellerDot}>
                            <Text style={home.sellerInitials}>{props.initials}</Text>
                        </View>
                        <Text style={home.sellerName}>{props.seller}</Text>
                    </View>
                </View>
                <View style={home.cardRight}>
                    <Text style={home.priceLabel}>Price</Text>
                    <Text style={home.price}>{props.price}</Text>
                </View>
            </View>
            {props.reason ? <Text style={home.reason}>{props.reason}</Text> : null}
        </View>
    );
};

// the deck: tap top card to open it, swipe it to send it to the back
type FeedListing = {
    id: string;
    title: string;
    seller: string;
    initials: string;
    price: string;
    category: string;
    reason?: string;
    isLive: boolean;
    liveListingId?: number;
};

const fallbackListings: FeedListing[] = items.map((item) => ({
    ...item,
    isLive: false,
}));

const CardStack = ({ listings }: { listings: FeedListing[] }) => {
    const [deck, setDeck] = useState(listings);
    const deckRef = useRef(listings);
    const router = useRouter();
    const position = useRef(new Animated.ValueXY()).current; // where the top card is being dragged

    useEffect(() => {
        setDeck(listings);
        deckRef.current = listings;
        position.setValue({ x: 0, y: 0 });
    }, [listings, position]);

    const swipe = useRef(
        PanResponder.create({
            // check before the card's Pressable does, only grab if moving sideways
            onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8,
            onPanResponderTerminationRequest: () => false, // don't let the page scroll steal it

            // card follows the finger
            onPanResponderMove: Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),

            // finger lifted
            onPanResponderRelease: (_, g) => {
                if (Math.abs(g.dx) > 100) {
                    const dismissed = deckRef.current[0];
                    if (dismissed?.isLive) {
                        recordListingInteraction(dismissed.liveListingId!, 'dismiss').catch(() => undefined);
                    }
                    // flung far enough: fly off screen, then move to back
                    Animated.timing(position, {
                        toValue: { x: g.dx > 0 ? 500 : -500, y: g.dy },
                        duration: 200,
                        useNativeDriver: false,
                    }).start(() => {
                        setDeck((current) => {
                            const next = [...current.slice(1), current[0]];
                            deckRef.current = next;
                            return next;
                        });
                        position.setValue({ x: 0, y: 0 }); // reset for the next card
                    });
                } else {
                    // not far enough: spring back to the middle
                    Animated.spring(position, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    // tilt the card as it's dragged, like flicking a real card
    const tilt = position.x.interpolate({
        inputRange: [-200, 0, 200],
        outputRange: ['-12deg', '0deg', '12deg'],
    });

    return (
        <View style={home.stack}>
            {deck.map((item, index) => {
                if (index > 2) return null; // only show the top 3

                const card = (
                    <RecCard
                        title={item.title}
                        seller={item.seller}
                        initials={item.initials}
                        price={item.price}
                        category={item.category}
                        reason={item.reason}
                    />
                );

                // top card: draggable + tappable
                if (index === 0) {
                    return (
                        <Animated.View
                            key={item.id}
                            {...swipe.panHandlers}
                            style={[
                                home.stackSlot,
                                {
                                    zIndex: deck.length,
                                    transform: [
                                        { translateX: position.x },
                                        { translateY: position.y },
                                        { rotate: tilt },
                                    ],
                                },
                            ]}
                        >
                            <Pressable onPress={() => router.push(`/Store/Listing/Marketplace/${item.id}`)}>
                                {card}
                            </Pressable>
                        </Animated.View>
                    );
                }

                // cards behind: just sit there peeking out
                return (
                    <View
                        key={item.id}
                        style={[
                            home.stackSlot,
                            {
                                zIndex: deck.length - index,
                                transform: [
                                    { translateX: index * 35 },     // peek out to the right
                                    { scale: 1 - index * 0.04 },    // a bit smaller further back
                                ],
                            },
                        ]}
                    >
                        {card}
                    </View>
                );
            })}
        </View>
    );
};

// one pickup row
const PickupCard = (props: { pickup: Pickup }) => {
    const p = props.pickup;

    return (
        <Pressable style={home.pickupCard}>
            <View style={home.dateBox}>
                <Text style={home.dateDay}>{p.day}</Text>
                <Text style={home.dateNum}>{p.date}</Text>
            </View>

            <View style={home.pickupInfo}>
                <Text style={home.pickupItem} numberOfLines={1}>{p.item}</Text>
                <View style={home.pickupWhere}>
                    <Ionicons name="location-outline" size={15} color={colors.muted} />
                    <Text style={home.pickupWhereText}>{p.time} · {p.place}</Text>
                </View>
            </View>

            <Ionicons name="chevron-forward" size={22} color={colors.ink} />
        </Pressable>
    );
};

const Home = () => {
    const userName = 'Maya'; // swap for real name once login works
    const initials = 'MR';   // same, comes from login later
    const [mode, setMode] = useState<'buy' | 'sell'>('buy'); // which tab is picked
    const shown = pickups.filter((p) => p.type === mode);   // only the matching pickups
    const router = useRouter();

    return (
        <ImageBackground source={PaperBg} style={home.screen}>
            <ScrollView contentContainerStyle={home.content}>

                {/* greeting on the left, avatar on the right */}
                <View style={home.headerRow}>
                    <View style={home.greeting}>
                        <Text style={home.hello}>Hello,</Text>
                        <Text style={home.name}>{userName}</Text>
                        <Text style={home.subtitle}>What are you looking for today?</Text>
                    </View>

                    <View style={home.profileActions}>
                        <Pressable
                            style={home.settingsButton}
                            onPress={() => router.push('/Settings')}
                            accessibilityLabel="Open settings"
                        >
                            <Ionicons name="settings-outline" size={20} color={colors.ink} />
                        </Pressable>
                        <View style={home.avatar}>
                            <Text style={home.avatarText}>{initials}</Text>
                        </View>
                    </View>
                </View>

                <View style={home.sectionRow}>
                    <Text style={home.sectionTitle}>Upcoming pickups</Text>

                    <View style={home.toggle}>
                        <Pressable
                            onPress={() => setMode('buy')}
                            style={[home.toggleOption, mode === 'buy' && home.toggleActive]}
                        >
                            <Text style={[home.toggleText, mode === 'buy' && home.toggleTextActive]}>Buy</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setMode('sell')}
                            style={[home.toggleOption, mode === 'sell' && home.toggleActive]}
                        >
                            <Text style={[home.toggleText, mode === 'sell' && home.toggleTextActive]}>Sell</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={home.pickupList}>
                    {shown.map((p) => (
                        <PickupCard key={p.id} pickup={p} />
                    ))}
                    {shown.length === 0 && (
                        <Text style={home.emptyText}>No pickups yet!</Text>
                    )}
                </View>

            </ScrollView>

            <TabBar active="home" />
        </ImageBackground>
    );
};

function toFeedListing(listing: RecommendedListing): FeedListing {
    const words = listing.seller_name.trim().split(/\s+/);
    const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || '?';

    return {
        id: `live-${listing.listing_id}`,
        title: listing.title,
        seller: listing.seller_name,
        initials,
        price: `$${Number(listing.price).toFixed(2)}`,
        category: formatCategory(listing.category),
        reason: listing.recommendation_reason,
        isLive: true,
        liveListingId: listing.listing_id,
    };
}

const home = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%', // fill the whole width, parent was squishing us
        backgroundColor: colors.cream,
    },
    content: {
        paddingTop: 70,
        paddingHorizontal: 24,
        paddingBottom: 130, // room so the tab bar doesn't cover the last card
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    greeting: {
        gap: 2,
    },
    hello: {
        fontSize: 32,
        color: colors.maroon,
        fontFamily: 'Caveat',
    },
    name: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    subtitle: {
        fontSize: 15,
        color: colors.muted,
        fontFamily: 'Outfit',
        marginTop: 4,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.maroon,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Outfit',
    },
    settingsButton: {
        width: 30,
        height: 30,
        padding: 6,
        borderRadius: 28,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // section title rows
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 36,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    sectionNote: {
        fontSize: 22,
        color: colors.maroon,
        fontFamily: 'Caveat',
        transform: [{ rotate: '-4deg' }], // little tilt like handwriting
    },
    seeAll: {
        marginLeft: 'auto', // pushes it to the far right
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },

    // polaroid cards
    card: {
        width: 250,
        backgroundColor: colors.white,
        borderRadius: 30,
        padding: 14, // thick white border, polaroid style
        boxShadow: [{
            offsetX: 0,
            offsetY: 0,
            blurRadius: 10,
            color: 'rgba(0,0,0,0.25)',
        }],
    },
    cardPhoto: {
        height: 260,
        borderRadius: 22,
        backgroundColor: colors.maroon, // placeholder until real photos
        boxShadow: [{
            offsetX: 0,
            offsetY: 0,
            blurRadius: 4,
            color: 'rgba(0,0,0,1)',
            inset: true,
        }],
    },
    categoryBadge: {
        position: 'absolute',
        top: 24,
        left: 24,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.white,
    },
    categoryBadgeText: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 12,
        fontWeight: '700',
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 4,
        paddingTop: 16,
        paddingBottom: 10,
    },
    cardLeft: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sellerDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerInitials: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    sellerName: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    reason: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 12,
        paddingHorizontal: 4,
        paddingBottom: 8,
    },
    priceLabel: {
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    stack: {
        width: 250 + 44, // card width + room for the peeking cards
        height: 390,
        alignSelf: 'center',
    },
    stackSlot: {
        position: 'absolute',
        top: 0,
        left: 0,
    },

    // buy / sell switch
    toggle: {
        flexDirection: 'row',
        marginLeft: 'auto', // push to the right
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 4,
    },
    toggleOption: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 16,
    },
    toggleActive: {
        backgroundColor: colors.maroon,
    },
    toggleText: {
        fontSize: 20,
        fontFamily: 'Caveat',
        color: colors.ink,
    },
    toggleTextActive: {
        color: colors.white,
    },

    // pickup cards
    pickupList: {
        gap: 12,
    },
    pickupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 12,
        paddingRight: 16,
    },
    dateBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDay: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    dateNum: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    pickupInfo: {
        flex: 1, // take the middle space so the arrow sits on the right
        gap: 4,
    },
    pickupItem: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    pickupWhere: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pickupWhereText: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    emptyText: {
        fontSize: 20,
        fontFamily: 'Caveat',
        color: colors.muted,
        textAlign: 'center',
        paddingVertical: 12,
    },
    swipeHint: {
        fontSize: 20,
        fontFamily: 'Caveat',
        color: colors.muted,
        textAlign: 'center',
        marginTop: 4,
    },
    preferencePanel: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    preferenceLabel: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    preferenceText: {
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 13,
        marginTop: 3,
    },
    coldStartText: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 13,
        marginBottom: 12,
        textAlign: 'center',
    },
    loadingRecommendations: {
        alignItems: 'center',
        height: 390,
        justifyContent: 'center',
    },
    recommendationError: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default Home;
