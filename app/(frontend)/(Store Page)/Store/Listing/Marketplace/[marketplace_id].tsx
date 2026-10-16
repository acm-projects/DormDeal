import { Text, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../../root_styles';
import { items } from '../../../../../../data/items';

const Marketplace_Listing = () => {
    const { marketplace_id } = useLocalSearchParams<{ marketplace_id: string }>(); // the number at the end of the address
    const router = useRouter();

    // find the item whose id matches the address
    const item = items.find((i) => i.id === marketplace_id);

    // bad link, no item with that id
    if (!item) {
        return (
            <View style={page.notFound}>
                <Text style={page.notFoundText}>Couldn't find that item.</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={page.link}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={page.screen}>
            <ScrollView contentContainerStyle={page.content}>

                {/* photo placeholder with back button on top */}
                <View style={page.photo}>
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
                        <View style={[page.detailRow, page.detailRowLast]}>
                            <Text style={page.detailLabel}>Posted</Text>
                            <Text style={page.detailValue}>{item.posted}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* buttons stuck to the bottom */}
            <View style={page.actionBar}>
                <Pressable style={page.messageButton}>
                    <Text style={page.messageText}>Message</Text>
                </Pressable>
                <Pressable style={page.buyButton} onPress={() => router.push('/Store/Checkout')}>
                    <Text style={page.buyText}>Buy now</Text>
                </Pressable>
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
        paddingBottom: 120, // room for the button bar
    },
    photo: {
        height: 380,
        backgroundColor: colors.maroon, // placeholder until real photos
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
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 30,
        backgroundColor: colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
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