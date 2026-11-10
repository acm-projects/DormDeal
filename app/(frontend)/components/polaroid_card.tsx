import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { colors } from '../../root_styles';

type PolaroidCardProps = {
    title: string;
    seller: string;
    initials: string;
    price: string;
    priceUnit?: string;          // like '/hr' for services
    category: string;
    imageUrl?: string | null;
    photo?: React.ReactNode;     // custom photo area (services show an icon instead of a picture)
    photoColor?: string;         // background behind the photo, defaults to maroon
    corner?: React.ReactNode;    // top-right of the photo, like the favorite heart
    onPress: () => void;
};

// a listing shown as a polaroid: square photo, white frame with a deeper bottom edge.
// the content matches the Recommended cards on Home
const PolaroidCard = (props: PolaroidCardProps) => {
    return (
        <Pressable style={card.frame} onPress={props.onPress}>
            <View style={[card.photo, props.photoColor ? { backgroundColor: props.photoColor } : null]}>
                {props.photo ?? (props.imageUrl
                    ? <Image source={{ uri: props.imageUrl }} style={card.photoImage} resizeMode="cover" />
                    : null)}
                <View style={card.categoryBadge}>
                    <Text style={card.categoryBadgeText} numberOfLines={1}>{props.category}</Text>
                </View>
                {props.corner ? <View style={card.corner}>{props.corner}</View> : null}
            </View>

            <View style={card.info}>
                <View style={card.left}>
                    <Text style={card.title} numberOfLines={2}>{props.title}</Text>
                    <View style={card.sellerRow}>
                        <View style={card.sellerDot}>
                            <Text style={card.sellerInitials}>{props.initials}</Text>
                        </View>
                        <Text style={card.sellerName} numberOfLines={1}>{props.seller}</Text>
                    </View>
                </View>
                <View style={card.right}>
                    <Text style={card.priceLabel}>Price</Text>
                    <Text style={card.price}>
                        {props.price}
                        {props.priceUnit ? <Text style={card.priceUnit}>{props.priceUnit}</Text> : null}
                    </Text>
                </View>
            </View>

        </Pressable>
    );
};

const card = StyleSheet.create({
    frame: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 4,          // square-ish corners, like a real polaroid
        padding: 10,
        paddingBottom: 14,        // deeper bottom edge, like a real polaroid
        shadowColor: colors.ink,
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    photo: {
        aspectRatio: 1,           // square photo
        borderRadius: 2,
        backgroundColor: colors.maroon, // placeholder until real photos
        overflow: 'hidden',
    },
    photoImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        maxWidth: '70%',
        borderRadius: 14,
        paddingHorizontal: 9,
        paddingVertical: 4,
        backgroundColor: colors.white,
    },
    categoryBadgeText: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 11,
        fontWeight: '700',
    },
    corner: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 6,
        paddingHorizontal: 2,
        paddingTop: 10,
        paddingBottom: 8,
    },
    left: {
        flex: 1,
        gap: 5,
    },
    title: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    sellerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerInitials: {
        fontSize: 8,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    sellerName: {
        flexShrink: 1,
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    right: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: 11,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    priceUnit: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.muted,
    },
});

export default PolaroidCard;
