import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router'
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text as NativeText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import Text, { Header1 } from '../components/text_styles';
import Button from '../components/button';
import Base from '../components/base';
import Search_Bar from '../components/search_bar';
import TabBar from '../components/tab_bar';
import CatalogOptions from '../../../components/catalog-options';
import Shopping_Cart_Image from '../../../assets/images/shopping_cart.png';
import Filter_Image from '../../../assets/svgs/filter.svg';
import Sort_Image from '../../../assets/svgs/sort.svg';
import {
    formatCategory,
    formatListingPrice,
    formatSellerName,
} from '../../../lib/recommendations';
import { getMarketplaceListings } from '../../../lib/api/listings';
import { getFavoriteListingIds, setListingFavorite } from '../../../lib/api/favorites';

const Listing_Card = (props) => {
    const router = useRouter();
    const rotation = `${((props.id * 37) % 401 - 200) / 100}deg`;

    return (
        <View style={[styles.card_wrapper, {transform: [{rotate: rotation}]}]}>
            <View style={styles.card_pin} />
            <Pressable style={styles.card} onPress={() => router.push(`/Store/Listing/Marketplace/live-${props.id}`)}>
            <View style={styles.cardPhoto}>
                {props.imageUrl ? (
                    <Image source={{uri: props.imageUrl}} style={styles.cardPhotoImage} resizeMode="cover" />
                ) : (
                    <Text style={styles.photo_placeholder}>[photo]</Text>
                )}
                <View style={[
                    styles.cardPhotoHeader,
                    !props.status && styles.cardPhotoHeaderWithoutCondition,
                ]}>
                    {props.status && (
                        <Text style={styles.statusLabel}>{props.status}</Text>
                    )}
                </View>
                <Button
                    style={styles.favoriteButton}
                    disabled={props.favoriteBusy}
                    onPress={(event) => {
                        event.stopPropagation();
                        props.onToggleFavorite();
                    }}
                    accessibilityLabel={props.isFavorite ? 'Remove listing from favorites' : 'Add listing to favorites'}
                >
                    <Ionicons
                        name={props.isFavorite ? 'heart' : 'heart-outline'}
                        size={16}
                        color={props.isFavorite ? colors.maroon : colors.ink}
                    />
                </Button>
            </View>
            <View style={styles.cardInfo}>
                <NativeText style={styles.cardTitle} numberOfLines={2}>{props.title}</NativeText>
                <View style={styles.sellerRow}>
                    <View style={styles.sellerDot}>
                        <Text style={styles.sellerInitials}>{props.initials}</Text>
                    </View>
                    <NativeText style={styles.sellerName} numberOfLines={1}>{props.seller}</NativeText>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.price}>{props.price}</Text>
                </View>
            </View>
            <Text style={styles.cardCategory}>{props.category}</Text>
            </Pressable>
        </View>
    );
};

const Store = () => {
    const [enabledFilters, setEnabledFilters] = useState({
        'Under $25': false,
        Favorites: false,
        Furniture: false,
        Electronics: false,
        Textbooks: false,
        Clothing: false,
        Convenience: false,
        Distance: false,
        filter: false,
        sort: false,
    });
    const [activePanel, setActivePanel] = useState(null);
    const closePanel = useCallback(() => setActivePanel(null), []);
    const router = useRouter();
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [listingError, setListingError] = useState(null);
    const [current_tab, set_new_tab] = useState("marketplace");
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [favoriteListingIds, setFavoriteListingIds] = useState(new Set());
    const [favoriteBusyIds, setFavoriteBusyIds] = useState(new Set());
    const [sortConfig, setSortConfig] = useState({field: 'Date Published', direction: 'Descending'});

    const categoryFilters = ['Furniture', 'Electronics', 'Textbooks', 'Clothing'];
    const selectedCategories = categoryFilters.filter((category) => enabledFilters[category]);
    const filteredListings = listings.filter((listing) => {
        if (selectedCategories.length > 0 && !selectedCategories.includes(formatCategory(listing.category))) return false;
        if (enabledFilters['Under $25'] && Number(listing.price) > 25) return false;
        if (enabledFilters.Favorites && !favoriteListingIds.has(listing.listing_id)) return false;
        return true;
    });
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const scoreListing = useCallback((listing) => {
        if (!normalizedQuery) return 0;

        const title = listing.title.toLocaleLowerCase();
        const category = formatCategory(listing.category).toLocaleLowerCase();
        const seller = formatSellerName(listing.seller_name).toLocaleLowerCase();
        const description = (listing.description ?? '').toLocaleLowerCase();

        if (title === normalizedQuery) return 5;
        if (title.startsWith(normalizedQuery)) return 4;
        if (title.includes(normalizedQuery)) return 3;
        if (category.startsWith(normalizedQuery) || seller.startsWith(normalizedQuery)) return 2;
        if (category.includes(normalizedQuery) || seller.includes(normalizedQuery) || description.includes(normalizedQuery)) return 1;
        return 0;
    }, [normalizedQuery]);
    const visibleListings = useMemo(() => {
        const scoredListings = filteredListings
            .map((listing) => ({listing, score: scoreListing(listing)}))
            .filter(({score}) => !normalizedQuery || score > 0);

        if (sortConfig.direction === 'Unsorted') return scoredListings.map(({listing}) => listing);

        const direction = sortConfig.direction === 'Ascending' ? 1 : -1;
        return scoredListings.sort((a, b) => {
            let comparison = 0;
            if (sortConfig.field === 'Name') comparison = a.listing.title.localeCompare(b.listing.title);
            if (sortConfig.field === 'Seller') comparison = formatSellerName(a.listing.seller_name).localeCompare(formatSellerName(b.listing.seller_name));
            if (sortConfig.field === 'Price') comparison = Number(a.listing.price) - Number(b.listing.price);
            if (sortConfig.field === 'Date Published') comparison = new Date(a.listing.created_at).getTime() - new Date(b.listing.created_at).getTime();
            if (sortConfig.field === 'Relevance') comparison = a.score - b.score;
            return comparison * direction || a.listing.title.localeCompare(b.listing.title);
        }).map(({listing}) => listing);
    }, [filteredListings, normalizedQuery, scoreListing, sortConfig]);
    const searchSuggestions = searchFocused && normalizedQuery
        ? visibleListings.slice(0, 5)
        : [];

    useFocusEffect(useCallback(() => {
        let active = true;

        const loadListings = async () => {
            setLoadingListings(true);
            setListingError(null);

            try {
                const [marketplaceListings, favoriteIds] = await Promise.all([
                    getMarketplaceListings(),
                    getFavoriteListingIds(),
                ]);

                if (active) {
                    setListings(marketplaceListings);
                    setFavoriteListingIds(new Set(favoriteIds));
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
    }, []));

    const toggleFavorite = async (listingId) => {
        if (favoriteBusyIds.has(listingId)) return;
        const wasFavorite = favoriteListingIds.has(listingId);
        setFavoriteBusyIds((current) => new Set(current).add(listingId));
        setFavoriteListingIds((current) => {
            const next = new Set(current);
            if (wasFavorite) next.delete(listingId);
            else next.add(listingId);
            return next;
        });

        try {
            await setListingFavorite(listingId, !wasFavorite);
        } catch (error) {
            setFavoriteListingIds((current) => {
                const next = new Set(current);
                if (wasFavorite) next.add(listingId);
                else next.delete(listingId);
                return next;
            });
            Alert.alert('Could not update favorite', error instanceof Error ? error.message : 'Please try again.');
        } finally {
            setFavoriteBusyIds((current) => {
                const next = new Set(current);
                next.delete(listingId);
                return next;
            });
        }
    };

    return (
        <Base>
            <View style={styles.catalog_panel}>
                <View style={styles.catalog_pin} />
                <View style={styles.catalog_pin_secondary} />
                <View style={styles.catalog_title_row}>
                    <Header1 style={styles.catalog_title}>catalog</Header1>
                    <Text style={styles.new_posts}>24 new posts today</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel="Open shopping cart" style={styles.shoppingCart}
                        onPress={() => router.push('/Store/Shopping Cart')}>
                        <Image source={Shopping_Cart_Image} style={styles.shoppingCartIcon} resizeMode="contain" />
                    </Pressable>
                </View>
                <View style={styles.catalog_tabs}>
                    <Button
                        style={[styles.catalog_tab, styles.catalog_tab_marketplace, current_tab === 'marketplace' && styles.catalog_tab_active]}
                        onPress={() => set_new_tab('marketplace')}
                        accessibilityState={{selected: current_tab === 'marketplace'}}
                    >
                        <Text style={[styles.catalog_tab_text, current_tab === 'marketplace' && styles.catalog_tab_text_active]}>MARKETPLACE</Text>
                    </Button>
                    <Button
                        style={[styles.catalog_tab, styles.catalog_tab_services, current_tab === 'services' && styles.catalog_tab_active]}
                        onPress={() => set_new_tab('services')}
                        accessibilityState={{selected: current_tab === 'services'}}
                    >
                        <Text style={[styles.catalog_tab_text, current_tab === 'services' && styles.catalog_tab_text_active]}>SERVICES</Text>
                    </Button>
                </View>
                <View style={styles.catalog_search_row}>
                    <Search_Bar
                        style={styles.catalog_search}
                        inputStyle={styles.catalog_search_input}
                        placeholder="Search the board"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        onSubmitEditing={() => setSearchFocused(false)}
                        returnKeyType="search"
                        accessibilityLabel="Search marketplace listings"
                    />
                    <Button
                        style={[styles.catalog_icon_button, enabledFilters.filter && styles.catalog_icon_button_active]}
                        onPress={() => setActivePanel('filter')}
                        accessibilityLabel="Open filter options"
                    >
                        <Image source={Filter_Image} style={[styles.catalog_filter_icon, styles.catalog_filter_icon_tint]} />
                    </Button>
                    <Button
                        style={[styles.catalog_icon_button, enabledFilters.sort && styles.catalog_icon_button_active]}
                        onPress={() => setActivePanel('sort')}
                        accessibilityLabel="Open sort options"
                    >
                        <Image source={Sort_Image} style={[styles.catalog_filter_icon, styles.catalog_filter_icon_tint]} />
                    </Button>
                </View>
            </View>
            <View style={styles.listing_area}>
                {searchSuggestions.length > 0 && (
                    <View style={styles.search_suggestions}>
                        {searchSuggestions.map((listing, index) => (
                            <Pressable
                                key={listing.listing_id}
                                style={[styles.search_suggestion, index < searchSuggestions.length - 1 && styles.search_suggestion_border]}
                                onPressIn={() => router.push(`/Store/Listing/Marketplace/live-${listing.listing_id}`)}
                                accessibilityLabel={`Open ${listing.title}`}
                            >
                                <Ionicons name="search" size={17} color={colors.muted} />
                                <View style={styles.search_suggestion_text}>
                                    <NativeText style={styles.search_suggestion_title} numberOfLines={1}>{listing.title}</NativeText>
                                    <NativeText style={styles.search_suggestion_category} numberOfLines={1}>
                                        {formatCategory(listing.category)} · {formatListingPrice(listing.price)}
                                    </NativeText>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
                <FlatList
                    style={styles.listing_flat_list}
                    contentContainerStyle={styles.marketplace_listing_container}
                    columnWrapperStyle={styles.marketplace_listing_row}
                    data={visibleListings}
                    numColumns={2}
                    keyExtractor={(listing) => String(listing.listing_id)}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={false}
                    ListHeaderComponent={null}
                    ListEmptyComponent={(
                        loadingListings ? (
                            <View style={styles.loadingListings}>
                                <ActivityIndicator color={colors.maroon} />
                            </View>
                        ) : listingError ? (
                            <Text style={styles.listingMessage}>{listingError}</Text>
                        ) : (
                            <Text style={styles.listingMessage}>
                                {normalizedQuery
                                    ? `No listings match “${searchQuery.trim()}”.`
                                    : enabledFilters.Favorites
                                        ? 'You have no favorites matching these filters.'
                                        : 'No active listings match these filters.'}
                            </Text>
                        )
                    )}
                    renderItem={({item: listing}) => {
                        const sellerName = formatSellerName(listing.seller_name);
                        const sellerWords = sellerName.split(/\s+/);
                        const sellerInitials = sellerWords.slice(0, 2)
                            .map((word) => word[0]?.toUpperCase())
                            .join('') || '?';

                        return (
                            <Listing_Card
                                id={listing.listing_id}
                                title={listing.title}
                                seller={sellerName}
                                initials={sellerInitials}
                                price={formatListingPrice(listing.price)}
                                category={formatCategory(listing.category)}
                                imageUrl={listing.image_url}
                                isFavorite={favoriteListingIds.has(listing.listing_id)}
                                favoriteBusy={favoriteBusyIds.has(listing.listing_id)}
                                onToggleFavorite={() => toggleFavorite(listing.listing_id)}
                            />
                        );
                    }}
                />
            </View>
            {activePanel && <CatalogOptions kind={activePanel} appliedFilters={enabledFilters} sortConfig={sortConfig} onClose={closePanel}
                onApplyFilters={(filters) => setEnabledFilters((current) => ({ ...current, ...filters, filter: Object.values(filters).some(Boolean) }))}
                onApplySort={(sort) => {
                    setSortConfig(sort);
                    setEnabledFilters((current) => ({ ...current, sort: sort.field !== 'Date Published' || sort.direction !== 'Descending' }));
                }} />}
            <TabBar active="catalog" />
        </Base>
    );
}

export default Store

const styles = StyleSheet.create({
    shoppingCart: { width: 44, height: 44, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
    shoppingCartIcon: { width: 25, height: 25 },
    catalog_panel: {
        position: 'relative',
        backgroundColor: colors.white,
        padding: 14,
        marginBottom: 14,
        transform: [{rotate: '-0.77deg'}],
        shadowColor: colors.ink,
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: {width: 3, height: 5},
        elevation: 5,
    },
    catalog_pin: {
        position: 'absolute',
        top: -7,
        left: '22%',
        width: 14,
        height: 14,
        marginLeft: -7,
        borderRadius: 7,
        backgroundColor: colors.maroon,
        shadowColor: colors.ink,
        shadowOpacity: 0.35,
        shadowRadius: 2,
        shadowOffset: {width: 1, height: 2},
        elevation: 3,
        zIndex: 2,
    },
    catalog_pin_secondary: {
        position: 'absolute',
        top: -7,
        right: '22%',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.maroon,
        shadowColor: colors.ink,
        shadowOpacity: 0.35,
        shadowRadius: 2,
        shadowOffset: {width: 1, height: 2},
        elevation: 3,
        zIndex: 2,
        transform: [{rotate: '-12deg'}],
    },
    catalog_title_row: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
    },
    catalog_title: {
        flexShrink: 1,
        marginBottom: 0,
        fontFamily: 'Outfit',
        fontSize: 40,
        lineHeight: 44,
        color: colors.maroon,
    },
    new_posts: {
        flex: 1,
        marginHorizontal: 10,
        color: colors.maroon,
        fontFamily: 'Caveat',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
    },
    catalog_tabs: {
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: 10,
        gap: 6,
    },
    catalog_tab: {
        flex: 1,
        height: 44,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: colors.maroon,
        backgroundColor: colors.white,
    },
    catalog_tab_marketplace: {
        borderStyle: 'dashed',
    },
    catalog_tab_services: {
        borderStyle: 'dashed',
    },
    catalog_tab_active: {
        backgroundColor: colors.maroon,
        borderStyle: 'solid',
    },
    catalog_tab_text: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    catalog_tab_text_active: {
        color: colors.white,
    },
    catalog_search_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    catalog_search: {
        flex: 1,
        height: 45,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderStyle: 'solid',
        borderRadius: 0,
        backgroundColor: colors.white,
        boxShadow: '',
    },
    catalog_search_input: {
        paddingLeft: 12,
        paddingRight: 8,
        marginRight: 0,
        fontFamily: 'Outfit',
        fontWeight: '400',
        color: colors.ink,
    },
    catalog_icon_button: {
        width: 45,
        height: 45,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: colors.maroon,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    catalog_icon_button_active: {
        backgroundColor: colors.goldLight,
    },
    catalog_filter_icon: {
        width: 23,
        height: 23,
    },
    catalog_filter_icon_tint: {
        tintColor: colors.maroon,
    },
    listing_area: {
        flex: 1,
        overflow: 'visible',
    },
    listing_flat_list: {
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
    search_suggestions: {
        marginTop: 6,
        marginHorizontal: 4,
        borderRadius: 16,
        backgroundColor: colors.white,
        overflow: 'hidden',
        shadowColor: colors.ink,
        shadowOpacity: 0.14,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: 5},
        elevation: 7,
    },
    search_suggestion: {
        minHeight: 58,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    search_suggestion_border: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#D8D8D8',
    },
    search_suggestion_text: {
        flex: 1,
    },
    search_suggestion_title: {
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 17,
        fontWeight: '600',
    },
    search_suggestion_category: {
        marginTop: 2,
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 14,
    },
    filter_container: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 5,
    },
    filter_button: {
        height: 25,
        borderRadius: 25,
        border: '1px solid #CCCCCC',
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
        paddingTop: 4,
        paddingHorizontal: 8,
        paddingBottom: 130,
        gap: 22,
        overflow: 'visible',
    },
    marketplace_listing_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
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
    card: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 0,
        padding: 8,
        shadowColor: colors.ink,
        shadowOpacity: 0.24,
        shadowRadius: 7,
        shadowOffset: {width: 2, height: 4},
        elevation: 4,
    },
    card_wrapper: {
        flex: 1,
        position: 'relative',
        paddingTop: 9,
    },
    card_pin: {
        position: 'absolute',
        top: 1,
        left: '50%',
        width: 14,
        height: 14,
        marginLeft: -7,
        borderRadius: 7,
        zIndex: 2,
        backgroundColor: colors.maroon,
        shadowColor: colors.ink,
        shadowOpacity: 0.35,
        shadowRadius: 2,
        shadowOffset: {width: 1, height: 2},
        elevation: 3,
    },
    cardPhoto: {
        height: 150,
        borderRadius: 0,
        backgroundColor: colors.maroon,
        overflow: 'hidden',
        position: 'relative',
        padding: 10,
    },
    cardPhotoImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    cardPhotoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardPhotoHeaderWithoutCondition: {
        justifyContent: 'flex-start',
    },
    photo_placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.white,
        fontFamily: 'Caveat',
        fontSize: 20,
        textAlign: 'center',
        textAlignVertical: 'center',
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
        borderRadius: 2,
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 27,
        height: 27,
        padding: 0,
        backgroundColor: colors.white,
        borderRadius: 0,
    },
    cardInfo: {
        gap: 6,
        paddingHorizontal: 4,
        paddingTop: 12,
        paddingBottom: 4,
    },
    cardTitle: {
        textAlign: 'left',
        fontSize: 20,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
        lineHeight: 24,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 6,
        width: '100%',
        minHeight: 22,
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
        fontSize: 11,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    sellerName: {
        flex: 1,
        minWidth: 0,
        textAlign: 'left',
        fontSize: 15,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    priceRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        gap: 6,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    cardCategory: {
        minHeight: 18,
        marginTop: 4,
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 14,
        lineHeight: 18,
        paddingBottom: 4,
        paddingHorizontal: 4,
        textAlign: 'center',
    },
});
