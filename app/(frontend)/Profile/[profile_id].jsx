import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router'
import { StyleSheet, View, ScrollView, Image, Pressable } from 'react-native';
import Nav_Button from '../components/nav_button'
import Text from '../components/text_styles'
import { Header1 } from '../components/text_styles'
import Base from '../components/base'
import { colors } from '../../root_styles'
import Star from '../../../assets/images/star.png'
import TabBar from '../components/tab_bar';
import Profile_Picture from '../../../assets/images/whoisthis.jpg'

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
        <Pressable style={styles.card} onPress={() => router.push(`/Store/Listing/Marketplace/1`)}>
            <View style={styles.cardPhoto}>
                <View style={[
                    styles.cardPhotoHeader,styles.cardPhotoHeaderWithoutCondition,
                ]}> 
                </View>
            </View>
            <View style={styles.cardInfo}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{props.title}</Text>
                    <View style={styles.sellerRow}>
                        <View style={styles.sellerDot}>
                            <Text style={styles.sellerInitials}>{props.initials}</Text>
                        </View>
                        <Text style={styles.sellerName}>{props.seller}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.price}>{props.price}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const Profile = () => {
    return (
        <Base>
            <View style={{flexDirection: 'row'}}>
                <View>
                    <Image source={Profile_Picture} style={{width: 150, height: 150, borderRadius: '50%'}}></Image>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'flex-start', marginLeft: 10}}>
                    <Text style={{fontFamily: 'Caveat', fontSize: 28, fontWeight: 1000, color: '#800000', marginBottom: 10}}>Minh Do (Larp Version)</Text>
                    <View style={{flexDirection: 'row', gap: 5}}>
                        <Image source={Star} style={{width: 25, height: 25}}/>
                        <Image source={Star} style={{width: 25, height: 25}}/>
                        <Image source={Star} style={{width: 25, height: 25}}/>
                        <Image source={Star} style={{width: 25, height: 25}}/>
                        <Image source={Star} style={{width: 25, height: 25}}/>
                        <Text style={{marginLeft: 3, fontSize: 17, fontWeight: 'bold'}}>3.8</Text>
                    </View>
                </View>
            </View>
            <View style={{marginTop: 30, alignItems: 'center', textAlign: 'center'}}>
                <Header1 style={{fontSize: 30, marginBottom: 15}}>Current Listings</Header1>
                <ScrollView contentContainerStyle={{gap: 15}}>
                    <Row>
                        <Listing_Card title={"Tree"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                    </Row>
                    <Row>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                    </Row>
                    <Row>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                    </Row>
                    <Row>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                    </Row>
                    <Row>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                        <Listing_Card title={"see you got me"} seller={"sell"} initials={"MD"} price={"$67"}></Listing_Card>
                    </Row>
                </ScrollView>
            </View>
            <TabBar active="profile"/>
        </Base>
    );
}

export default Profile

const styles = StyleSheet.create({
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
        alignItems: 'flex-end',
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
});