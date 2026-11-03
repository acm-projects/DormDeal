import { useEffect, useId, useState } from 'react';
import { useRouter } from 'expo-router'
import { StyleSheet, View, ScrollView, Image, Pressable } from 'react-native';
import { ClipPath, Path, Rect, Svg } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Text from '../components/text_styles'
import { Header1 } from '../components/text_styles'
import Base from '../components/base'
import Button from '../components/button';
import { colors } from '../../root_styles'
import TabBar from '../components/tab_bar';
import Profile_Picture from '../../../assets/images/whoisthis.jpg'
import Location_Dot from '../../../assets/images/location_dot.png'
import Triple_Dots from '../../../assets/images/triple_dots.png'

const StarIcon = ({fillAmount = 1, size = 20}) => {
    const fill = Math.min(Math.max(fillAmount, 0), 1);
    const clipId = `starFill-${useId().replace(/:/g, '')}`;

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel={`${Math.round(fill * 100)}% of star filled`}>
            <Path
                d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.47l-5.86 3.09 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z"
                fill={colors.goldLight}
            />
            <ClipPath id={clipId}>
                <Rect x="0" y="0" width={24 * fill} height="24" rx="2" />
            </ClipPath>
            <Path
                d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.47l-5.86 3.09 1.12-6.54-4.75-4.63 6.56-.95L12 2.5z"
                fill={colors.gold}
                clipPath={`url(#${clipId})`}
            />
        </Svg>
    );
};

const Row = ({children}) => {
    return (
        <View style={styles.marketplace_listing_row}>
            { children }
        </View>
    );
}

const End_Row = () => {
    return (
        <View style={{
            height: 72,
        }}>
        </View>
    )
}

const Listing_Card = (props) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const router = useRouter();

    return (
        <Pressable style={styles.card} onPress={() => router.push(`/Store/Listing/Marketplace/live-${props.id}`)}>
            <View style={styles.cardPhoto}>
                <View style={[
                    styles.cardPhotoHeader,
                    !props.status && styles.cardPhotoHeaderWithoutCondition,
                ]}>
                    {props.status && (
                        <Text style={styles.statusLabel}>{props.status}</Text>
                    )}
                    <Button
                        style={styles.favoriteButton}
                        onPress={() => setIsFavorite((favorite) => !favorite)}
                        accessibilityLabel={isFavorite ? 'Remove listing from favorites' : 'Add listing to favorites'}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={16}
                            color={colors.ink}
                        />
                    </Button>
                </View>
            </View>
            <View style={styles.cardInfo}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{props.title}</Text>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.price}>{props.price}</Text>
                </View>
            </View>
            <Text style={styles.cardCategory}>{props.category}</Text>
        </Pressable>
    );
};

const Profile = () => {
    return (
        <Base>
            <View style={styles.profileContent}>
                <View style={styles.profileCard}>
                    <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
                        <Image source={Profile_Picture} style={{borderRadius: '50%', width: 70, height: 70}} resizeMode='cover'/>
                        <View>
                            <Text style={{textAlign: 'left', fontWeight: '600', fontSize: 22, marginBottom: 5}}>Larry Williams</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                                <StarIcon fillAmount={1} />
                                <StarIcon fillAmount={1} />
                                <StarIcon fillAmount={1} />
                                <StarIcon fillAmount={0.5} />
                                <StarIcon fillAmount={0} />
                                <Text style={{marginLeft: 10, fontSize: 14}}>3.5</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 20, alignItems: 'center'}}>
                        <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
                            <Image source={Location_Dot} style={{height: 25, width: 25, aspectRatio: 1}} resizeMode='contain'/>
                            <Text style={{fontSize: 15, color: '#222'}}>Andromeda Hall</Text>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'flex-end'}}>
                            <Pressable style={{padding: 3, paddingHorizontal: 15, backgroundColor: colors.maroon, borderRadius: 22}}>
                                <Text style={{fontSize: 15, color: colors.white}} selectable={false}>
                                    Message
                                </Text>
                            </Pressable>
                            <Pressable style={{padding: 3, paddingHorizontal: 15, backgroundColor: colors.maroonDark, borderRadius: 22, justifyContent: 'center'}}>
                                <Image source={Triple_Dots} style={{height: 15, width: 15}} resizeMode='contain'></Image>
                            </Pressable>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 20}}>
                        <View style={{alignItems: 'flex-start'}}>
                            <Text style={{fontSize: 26, fontFamily: 'Caveat'}}>9,299</Text>
                            <Text style={{fontSize: 12, opacity: 0.5}}>Active Listings</Text>
                        </View>
                        <View style={{flex:1, flexDirection: 'row', gap: 10, justifyContent: 'flex-end'}}>
                            <View style={{alignItems: 'flex-start'}}>
                                <Text style={{fontSize: 26, fontFamily: 'Caveat'}}>461</Text>
                                <Text style={{fontSize: 12, opacity: 0.5}}>Following</Text>
                            </View>
                            <View style={{alignItems: 'flex-start'}}>
                                <Text style={{fontSize: 26, fontFamily: 'Caveat'}}>349</Text>
                                <Text style={{fontSize: 12, opacity: 0.5}}>Followers</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{flex: 1, alignItems: 'center', textAlign: 'center', marginTop: 195}}>
                    <ScrollView contentContainerStyle={{gap: 15, paddingTop: 40}}>
                        <Header1 style={{fontSize: 30, marginBottom: 15}}>Current Listings</Header1>
                        <Row>
                            <Listing_Card title={"Tree"} price={"$67"} status={"new"}></Listing_Card>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                        </Row>
                        <Row>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                        </Row>
                        <Row>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                        </Row>
                        <Row>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                        </Row>
                        <Row>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                            <Listing_Card title={"see you got me"} price={"$67"}></Listing_Card>
                        </Row>
                        <End_Row/>
                    </ScrollView>
                </View>
            </View>
            <TabBar active="profile"/>
        </Base>
    );
}

export default Profile

const styles = StyleSheet.create({
    profileContent: {
        flex: 1,
        position: 'relative',
    },
    profileCard: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: colors.white,
        borderRadius: 22,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 8,
    },
    card: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 28,
        padding: 10,
        elevation: 4,
    },
    cardPhoto: {
        height: 150,
        borderRadius: 22,
        backgroundColor: colors.maroon,
        overflow: 'hidden',
        position: 'relative',
        padding: 10,
    },
    cardPhotoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardPhotoHeaderWithoutCondition: {
        justifyContent: 'flex-end',
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 4,
        paddingTop: 16,
        paddingBottom: 10,
    },
    marketplace_listing_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    cardLeft: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        textAlign: 'left',
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
    favoriteButton: {
        width: 27,
        height: 27,
        padding: 0,
        backgroundColor: colors.white,
    },
    statusLabel: {
        height: 27,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.white,
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 12,
        fontWeight: '600',
        borderRadius: 14,
    },
});