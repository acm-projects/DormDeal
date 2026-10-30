import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router'
import { ActivityIndicator, Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import { Header1 } from '../components/text_styles';
import Text from '../components/text_styles';
import Button from '../components/button';
import Base from '../components/base';
import Search_Bar from '../components/search_bar';
import TabBar from '../components/tab_bar';
import Filter_Image from '../../../assets/svgs/filter.svg';
import Sort_Image from '../../../assets/svgs/sort.svg';
import {
    formatCategory,
    formatListingPrice,
    formatSellerName,
    getCategoryPreferences,
    getRecommendations,
} from '../../../lib/recommendations';

const Base_Filter_Button = ({text = "", enabled = false, onPress}) => {
    return (
        <Button
            style={[styles.filter_button, enabled && styles.enabled_filter_button]}
            onPress={onPress}
        >
            <Text
                style={[styles.filter_button_text, enabled && styles.enabled_filter_button_text]}
                selectable={false}
            >
                {text}
            </Text>
        </Button>
    );
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
            <Text style={styles.cardCategory}>{props.category}</Text>
        </Pressable>
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

const Store = () => {
    const [enabledFilters, setEnabledFilters] = useState({
        Budget: false,
        Convenience: false,
        Distance: false,
        filter: false,
        sort: false,
    });
    const [activePanel, setActivePanel] = useState(null);
    const [draftEnabled, setDraftEnabled] = useState(false);
    const { width: screenWidth } = Dimensions.get('window');
    const panelPosition = useState(new Animated.Value(screenWidth))[0];
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [preferences, setPreferences] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [listingError, setListingError] = useState(null);

    const hasUserFilters = enabledFilters.Budget
        || enabledFilters.Convenience
        || enabledFilters.Distance
        || enabledFilters.filter
        || enabledFilters.sort;

    useEffect(() => {
        if (activePanel) {
            Animated.timing(panelPosition, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [activePanel, panelPosition]);

    useEffect(() => {
        let active = true;

        const loadListings = async () => {
            setLoadingListings(true);
            setListingError(null);

            try {
                const recommendedListings = await getRecommendations(50);
                const learnedPreferences = await getCategoryPreferences().catch(() => []);

                if (active) {
                    setListings(recommendedListings);
                    setPreferences(learnedPreferences);
                }
            } catch (error) {
                if (active) {
                    setListingError(error instanceof Error ? error.message : 'Could not load listings. Please sign in and try again.');
                }
            } finally {
                if (active) setLoadingListings(false);
            }
        };

        loadListings();
        return () => { active = false; };
    }, []);

    const openPanel = (panel) => {
        setDraftEnabled(true);
        setActivePanel(panel);
    };

    const closePanel = () => {
        Animated.timing(panelPosition, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setActivePanel(null));
    };

    const applyPanelChanges = () => {
        setEnabledFilters((current) => ({ ...current, [activePanel]: draftEnabled }));
        closePanel();
    };

    const resetPanelChanges = () => {
        setDraftEnabled(false);
        setEnabledFilters((current) => ({ ...current, [activePanel]: false }));
        closePanel();
    };

    return (
        <Base>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 30}}>
                <Header1 style={{flex: 1,marginBottom: 0}}>catalog</Header1>
                <Button style={styles.shopping_Cart} onPress={() => router.push('/Store/Shopping Cart')}>
                    <Text>S</Text>
                </Button>
            </View>
            <View style={styles.listing_area}>
                <View style={styles.search_overlay}>
                    <View style={{marginLeft: 22, flexDirection: 'row', gap: 5}}>
                        <Button style={{height: 40, width: 'auto', paddingHorizontal: 10, paddingTop: 3, borderRadius: 10, marginBottom: -10, boxShadow: '', backgroundColor: colors.maroonLight, justifyContent: 'flex-start'}}><Text selectable={false} style={{color: colors.white}}>Marketplace</Text></Button>
                        <Button style={{height: 40, width: 'auto', paddingHorizontal: 10, paddingTop: 3, borderRadius: 10, marginBottom: -10, boxShadow: '', backgroundColor: colors.maroonDark, justifyContent: 'flex-start'}}><Text selectable={false} style={{color: colors.white}}>Services</Text></Button>
                    </View>
                    <Search_Bar placeholder="What are you looking for?" />
                </View>
                <ScrollView contentContainerStyle={styles.marketplace_listing_container} style={{marginTop: 48}} showsVerticalScrollIndicator={false}>
                    <ScrollView contentContainerStyle={styles.filter_container} showsHorizontalScrollIndicator={false}>
                        <Button
                            style={[[styles.filter_button,{backgroundColor: "#D4D4D4"}], enabledFilters.filter && styles.enabled_filter_button]}
                            onPress={() => openPanel('filter')}
                            accessibilityLabel="Open filter options"
                        >
                            <Image source={Filter_Image}/>
                        </Button>
                        <Button
                            style={[[styles.filter_button,{backgroundColor: "#D4D4D4"}], enabledFilters.sort && styles.enabled_filter_button]}
                            onPress={() => openPanel('sort')}
                            accessibilityLabel="Open sort options"
                        >
                            <Image source={Sort_Image}/>
                        </Button>
                        <Base_Filter_Button
                            text="Budget"
                            enabled={enabledFilters.Budget}
                            onPress={() => setEnabledFilters((current) => ({ ...current, Budget: !current.Budget }))}
                        />
                        <Base_Filter_Button
                            text="Convenience"
                            enabled={enabledFilters.Convenience}
                            onPress={() => setEnabledFilters((current) => ({ ...current, Convenience: !current.Convenience }))}
                        />
                        <Base_Filter_Button
                            text="Distance"
                            enabled={enabledFilters.Distance}
                            onPress={() => setEnabledFilters((current) => ({ ...current, Distance: !current.Distance }))}
                        />
                    </ScrollView>
                    {!hasUserFilters && (
                        <View style={styles.personalizationNote}>
                            <Text style={styles.personalizationTitle}>Picked for you</Text>
                            <Text style={styles.personalizationText}>
                                {preferences.length > 0
                                    ? `Based on ${preferences.slice(0, 3).map((preference) => formatCategory(preference.category)).join(', ')}`
                                    : 'Personalized automatically as you browse listings'}
                            </Text>
                        </View>
                    )}
                    {loadingListings ? (
                        <View style={styles.loadingListings}>
                            <ActivityIndicator color={colors.maroon} />
                        </View>
                    ) : listingError ? (
                        <Text style={styles.listingMessage}>{listingError}</Text>
                    ) : listings.length === 0 ? (
                        <Text style={styles.listingMessage}>No active listings are available.</Text>
                    ) : (
                        Array.from({ length: Math.ceil(listings.length / 2) }, (_, rowIndex) => (
                            <Row key={rowIndex}>
                                {listings.slice(rowIndex * 2, rowIndex * 2 + 2).map((listing) => {
                                    const sellerName = formatSellerName(listing.seller_name);
                                    const sellerWords = sellerName.split(/\s+/);
                                    const sellerInitials = sellerWords.slice(0, 2)
                                        .map((word) => word[0]?.toUpperCase())
                                        .join('') || '?';

                                    return (
                                        <Listing_Card
                                            key={listing.listing_id}
                                            id={listing.listing_id}
                                            title={listing.title}
                                            seller={sellerName}
                                            initials={sellerInitials}
                                            price={formatListingPrice(listing.price)}
                                            category={formatCategory(listing.category)}
                                            status={!hasUserFilters ? 'For you' : undefined}
                                        />
                                    );
                                })}
                            </Row>
                        ))
                    )}
                    <End_Row/>
                </ScrollView>
            </View>
            {activePanel && (
                <View style={styles.panel_layer}>
                    <Pressable style={styles.panel_backdrop} onPress={closePanel} accessibilityLabel="Close options" />
                    <Animated.View
                        style={[
                            styles.options_panel,
                            { transform: [{ translateX: panelPosition }] },
                        ]}
                    >
                        <View style={styles.options_header}>
                        <Text
                            style={styles.options_title}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            {activePanel === 'filter' ? 'Filter options' : 'Sort options'}
                        </Text>
                            <Pressable onPress={closePanel} style={styles.close_button} accessibilityLabel="Close options">
                                <Ionicons name="close" size={28} color={colors.ink} />
                            </Pressable>
                        </View>
                        <Text style={styles.options_description}>
                            {activePanel === 'filter'
                                ? 'Choose your marketplace filters.'
                                : 'Choose how marketplace listings are sorted.'}
                        </Text>
                        <View style={styles.options_actions}>
                            <Button style={styles.apply_button} onPress={applyPanelChanges}>
                                <Text style={styles.apply_button_text}>Apply changes</Text>
                            </Button>
                            <Button style={styles.reset_button} onPress={resetPanelChanges}>
                                <Text style={styles.reset_button_text}>Reset changes</Text>
                            </Button>
                        </View>
                    </Animated.View>
                </View>
            )}

            <TabBar active="search" />
        </Base>
    );
}

export default Store

const styles = StyleSheet.create({
    listing_area: {
        flex: 1,
        overflow: 'visible',
    },
    search_overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        elevation: 2,
    },
    filter_container: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 5,
    },
    filter_button: {
        boxShadow: '',
        height: 25,
        borderRadius: 25,
        width: 'auto',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 3.5,
        paddingBottom: 3.5,
    },
    filter_button_text: {
        fontSize: 14,
    },
    enabled_filter_button: {
        backgroundColor: '#CD5C5C',
    },
    enabled_filter_button_text: {
        color: '#FFFFFF',
    },

    marketplace_listing_container: {
        paddingTop: 43,
        gap: 15,
    },
    marketplace_listing_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    personalizationNote: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    personalizationTitle: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 13,
        fontWeight: '700',
    },
    personalizationText: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 12,
        marginTop: 2,
    },
    loadingListings: {
        alignItems: 'center',
        minHeight: 220,
        justifyContent: 'center',
    },
    listingMessage: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 14,
        paddingVertical: 40,
        textAlign: 'center',
    },
    panel_layer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 3,
        flexDirection: 'row',
    },
    panel_backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(31, 20, 20, 0.25)',
    },
    shopping_Cart: {
        width: 40,
        height: 40,
        backgroundColor: colors.white,
    },  
    options_panel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '65%',
        backgroundColor: colors.white,
        padding: 24,
        shadowColor: colors.ink,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: -4, height: 0 },
        elevation: 8,
    },
    options_header: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    options_title: {
        width: '100%',
        paddingHorizontal: 40,
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        fontSize: 30,
        lineHeight: 36,
        color: colors.ink,
        textAlign: 'center',
    },
    close_button: {
        position: 'absolute',
        right: 0,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    options_description: {
        marginTop: 24,
        fontFamily: 'Outfit',
        fontSize: 16,
        color: colors.muted,
    },
    options_actions: {
        marginTop: 'auto',
        gap: 12,
    },
    apply_button: {
        width: '100%',
        height: 48,
        backgroundColor: colors.maroon,
        borderRadius: 24,
    },
    apply_button_text: {
        color: colors.white,
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        fontSize: 16,
    },
    reset_button: {
        width: '100%',
        height: 48,
        backgroundColor: colors.blush,
        borderRadius: 24,
    },
    reset_button_text: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        fontSize: 16,
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
    favoriteButton: {
        width: 27,
        height: 27,
        padding: 0,
        backgroundColor: colors.white,
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
    cardCategory: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 11,
        paddingBottom: 4,
        paddingHorizontal: 4,
    },
});
