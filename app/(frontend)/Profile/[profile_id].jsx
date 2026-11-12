import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing, FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../components/text_styles';
import Base from '../components/base';
import TabBar from '../components/tab_bar';

const colors = {
    maroon: '#8F0000',
    ink: '#241818',
    muted: '#625757',
    gold: '#F3D83B',
    palePink: '#F4DCDC',
    paleBlue: '#DDE3EE',
    paleGreen: '#DDE8D8',
    paleTan: '#E8DDCB',
    white: '#FFFFFF',
};

const profile = {
    initials: 'AR',
    name: 'Alex R.',
    yearAndMajor: 'Junior · Biology',
    rating: '4.8',
    reviews: '(23)',
    location: 'Helix Hall · North Campus',
};

const listings = [
    {title: 'Mini fridge', price: '$60', color: colors.palePink},
    {title: 'Dorm rug', price: '$25', color: colors.paleTan},
    {title: 'Desk lamp', price: '$15', color: colors.paleBlue},
    {title: 'Laundry basket', price: '$10', color: colors.paleGreen},
];

const Rating = () => (
    <View style={styles.rating} accessibilityLabel={`Rated ${profile.rating} out of 5, ${profile.reviews} reviews`}>
        <Text style={styles.ratingNumber}>{profile.rating}</Text>
        <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={16} color={colors.gold} />
            ))}
        </View>
        <Text style={styles.reviewCount}>{profile.reviews}</Text>
    </View>
);

const ListingCard = ({listing, onPress}) => (
    <Pressable
        style={styles.listingCard}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${listing.title}, ${listing.price}`}
    >
        <View style={[styles.listingImage, {backgroundColor: listing.color}]}>
            <Text style={styles.photoPlaceholder}>[photo]</Text>
        </View>
        <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.listingPrice}>{listing.price}</Text>
    </Pressable>
);

const Profile = () => {
    const router = useRouter();
    const {height} = useWindowDimensions();
    const [revealProgress] = useState(() => new Animated.Value(0));

    useEffect(() => {
        const reveal = Animated.timing(revealProgress, {
            toValue: 1,
            duration: 750,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });

        reveal.start();
        return () => {
            reveal.stop();
        };
    }, [revealProgress]);

    const paperRevealStyle = {
        transform: [
            {
                translateY: revealProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                }),
            },
            {
                rotate: revealProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['15deg', '0deg'],
                }),
            },
        ],
    };

    const listHeader = (
        <View>
            <Pressable
                style={styles.moreButton}
                accessibilityRole="button"
                accessibilityLabel="More profile options"
                hitSlop={10}
            >
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.maroon} />
            </Pressable>

            <View style={styles.avatar} accessibilityLabel={`${profile.name} profile photo`}>
                <Text style={styles.avatarText}>{profile.initials}</Text>
            </View>

            <View style={styles.nameHighlight}>
                <Text style={styles.profileName}>{profile.name}</Text>
            </View>
            <Text style={styles.profileSubtitle}>{profile.yearAndMajor}</Text>

            <View style={styles.ratingActions}>
                <Rating />
                <Pressable
                    style={styles.messageButton}
                    onPress={() => router.push('/Contacts')}
                    accessibilityRole="button"
                    accessibilityLabel={`Message ${profile.name}`}
                >
                    <Ionicons name="mail-outline" size={17} color={colors.maroon} />
                    <Text style={styles.messageText}>Message</Text>
                </Pressable>
            </View>

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={15} color={colors.maroon} />
                    <Text style={styles.metaText}>{profile.location}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="checkmark-circle" size={15} color={colors.maroon} />
                    <Text style={styles.metaText}>Verified student</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Selling right now</Text>
                <Text style={styles.listingCount}>{listings.length} listings</Text>
            </View>
            <View style={styles.sectionRule} />
        </View>
    );

    return (
        <Base style={styles.base}>
            <Animated.View
                style={[styles.profileSheet, paperRevealStyle]}
            >
                <FlatList
                    data={listings}
                    renderItem={({item}) => (
                        <ListingCard
                            listing={item}
                            onPress={() => router.push('/Store')}
                        />
                    )}
                    keyExtractor={(item) => item.title}
                    numColumns={2}
                    columnWrapperStyle={styles.listingRow}
                    ListHeaderComponent={listHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No listings available right now.</Text>
                    }
                />
            </Animated.View>
            <TabBar active="profile" />
        </Base>
    );
};

export default Profile;

const styles = StyleSheet.create({
    base: {
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 0,
    },
    profileSheet: {
        flex: 1,
        backgroundColor: colors.white,
        shadowColor: colors.ink,
        shadowOpacity: 0.16,
        shadowRadius: 7,
        shadowOffset: {width: 1, height: 2},
        elevation: 3,
    },
    listContent: {
        flexGrow: 1,
        paddingTop: 28,
        paddingHorizontal: 18,
        paddingBottom: 105,
    },
    moreButton: {
        position: 'absolute',
        top: 26,
        right: 19,
        zIndex: 2,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 96,
        height: 96,
        marginTop: 30,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 48,
        backgroundColor: colors.maroon,
        borderWidth: 3,
        borderColor: colors.white,
        shadowColor: colors.ink,
        shadowOpacity: 0.26,
        shadowRadius: 4,
        shadowOffset: {width: 0, height: 2},
        elevation: 4,
    },
    avatarText: {
        color: colors.white,
        fontFamily: 'Outfit',
        fontSize: 36,
        fontWeight: '800',
    },
    nameHighlight: {
        alignSelf: 'center',
        marginTop: 15,
        paddingHorizontal: 5,
        backgroundColor: colors.gold,
    },
    profileName: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 34,
        lineHeight: 39,
        fontWeight: '800',
        textAlign: 'center',
    },
    profileSubtitle: {
        marginTop: 2,
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 16,
        textAlign: 'center',
    },
    ratingActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 10,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 36,
    },
    ratingNumber: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 16,
        fontWeight: '800',
    },
    stars: {
        flexDirection: 'row',
        marginLeft: 6,
        gap: 1,
    },
    reviewCount: {
        marginLeft: 6,
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 10,
    },
    messageButton: {
        minHeight: 36,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: colors.palePink,
    },
    messageText: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 15,
        fontWeight: '800',
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 14,
        rowGap: 5,
        marginTop: 10,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginTop: 28,
    },
    sectionTitle: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 22,
        fontWeight: '800',
    },
    listingCount: {
        color: colors.muted,
        fontFamily: 'Caveat',
        fontSize: 20,
        fontWeight: '700',
    },
    sectionRule: {
        height: 2,
        marginTop: 6,
        backgroundColor: colors.maroon,
    },
    listingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        columnGap: 12,
    },
    listingCard: {
        flex: 1,
        padding: 6,
        backgroundColor: colors.white,
        shadowColor: colors.ink,
        shadowOpacity: 0.16,
        shadowRadius: 4,
        shadowOffset: {width: 1, height: 2},
        elevation: 3,
    },
    listingImage: {
        height: 94,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoPlaceholder: {
        color: colors.maroon,
        fontFamily: 'Caveat',
        fontSize: 15,
        fontStyle: 'italic',
    },
    listingTitle: {
        marginTop: 5,
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 16,
        fontWeight: '700',
    },
    listingPrice: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 18,
        fontWeight: '800',
    },
    emptyText: {
        marginTop: 24,
        color: colors.muted,
        fontFamily: 'Caveat',
        fontSize: 22,
        textAlign: 'center',
    },
});
