import { useState } from 'react';
import { Text, View, ImageBackground, StyleSheet, ScrollView, Pressable } from 'react-native'; // NEW: ScrollView, Pressable
import { colors } from '../../styles';
import { Ionicons } from '@expo/vector-icons';

import PaperBg from '../../../assets/paper_bg.png';

// fake items for now, later these come from the backend
const recommended = [
    { id: '1', title: 'Mini fridge', seller: 'Alex R.', initials: 'AR', price: '$60' },
    { id: '2', title: 'Desk lamp', seller: 'Jordan M.', initials: 'JM', price: '$12' },
    { id: '3', title: 'Twin XL sheets', seller: 'Priya S.', initials: 'PS', price: '$15' },
];
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

// one card, reused for every item
type RecCardProps = {
    title: string;
    seller: string;
    initials: string;
    price: string;
};
const RecCard = (props: RecCardProps) => {
    return (
        <View style={home.card}>
            <View style={home.cardPhoto} />
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
        </View>
    );
};
// the deck: top card on front, tap it to send it to the back
const CardStack = () => {
    const [deck, setDeck] = useState(recommended);

    const sendToBack = () => {
        setDeck((current) => [...current.slice(1), current[0]]);
    };

    return (
        <View style={home.stack}>
            {deck.map((item, index) => {
                if (index > 2) return null; // only show the top 3

                return (
                    <Pressable
                        key={item.id}
                        onPress={index === 0 ? sendToBack : undefined}
                        style={[
                            home.stackSlot,
                            {
                                zIndex: deck.length - index, // first card sits on top
                                transform: [
                                    { translateX: index * 22 },     // peek out to the right
                                    { scale: 1 - index * 0.04 },    // a bit smaller further back
                                ],
                            },
                        ]}
                    >
                        <RecCard
                            title={item.title}
                            seller={item.seller}
                            initials={item.initials}
                            price={item.price}
                        />
                    </Pressable>
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

    return (
        <ImageBackground source={PaperBg} style={home.screen}>
            <ScrollView contentContainerStyle={home.content}>

                
                <View style={home.headerRow}>
                    <View style={home.greeting}>
                        <Text style={home.hello}>Hello,</Text>
                        <Text style={home.name}>{userName}</Text>
                        <Text style={home.subtitle}>What are you looking for today?</Text>
                    </View>

                    <View style={home.avatar}>
                        <Text style={home.avatarText}>{initials}</Text>
                    </View>
                </View>

                
                <View style={home.sectionRow}>
                    <Text style={home.sectionTitle}>Recommended</Text>
                    <Text style={home.sectionNote}>just for you!</Text>
                    <Pressable style={home.seeAll}>
                        <Text style={home.seeAllText}>See all</Text>
                    </Pressable>
                </View>

                
                <CardStack />

            </ScrollView>
        </ImageBackground>
    );
};

const home = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%', // fill the whole width
        backgroundColor: colors.cream,
    },
    content: { 
        paddingTop: 70,
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        transform: [{ rotate: '-4deg' }], 
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

    // NEW: card styles
    cardRow: {
        gap: 14,
        paddingVertical: 6, // room for the shadow
    },
        card: {
        width: 250,           // was 230
        backgroundColor: colors.white,
        borderRadius: 30,
        padding: 14,          // thicker white border, polaroid style
        shadowColor: colors.ink,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4, // shadow on android
    },
    cardPhoto: {
        height: 260,          // was 170, taller than it is wide now
        borderRadius: 22,
        backgroundColor: colors.maroon, // placeholder until real photos
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 4,
        paddingTop: 16,       // more room under the photo
        paddingBottom: 10,
    },
    cardTitle: {
        fontSize: 19,         // was 17
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
        width: 250 + 44,      // card width + room for the peeking cards
        height: 390,          // was 290
        alignSelf: 'center',
    },
    stackSlot: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
});

export default Home;