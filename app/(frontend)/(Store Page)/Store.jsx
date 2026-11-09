import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router'
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Image, LayoutAnimation, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { colors } from '../../root_styles';
import { Header1 } from '../components/text_styles';
import Text from '../components/text_styles';
import Button from '../components/button';
import Base from '../components/base';
import Search_Bar from '../components/search_bar';
import TabBar from '../components/tab_bar';
import Shopping_Cart_Image from '../../../assets/images/shopping_cart.png';
import Filter_Image from '../../../assets/svgs/filter.svg';
import Sort_Image from '../../../assets/svgs/sort.svg';
import Sort_Up_Image from '../../../assets/svgs/sort_up.svg';
import Sort_Down_Image from '../../../assets/svgs/sort_down.svg';
import No_Sort_Image from '../../../assets/svgs/no_sort.svg';
import Furniture_Image from '../../../assets/svgs/furniture.svg';
import Electronics_Image from '../../../assets/svgs/electronics.svg';
import Textbooks_Image from '../../../assets/svgs/textbooks.svg';
import Clothing_Image from '../../../assets/svgs/clothing.svg';
import Budget_Image from '../../../assets/svgs/budget.svg';
import Convenience_Image from '../../../assets/svgs/convenience.svg';
import Distance_Image from '../../../assets/svgs/distance.svg';
import {
    formatCategory,
    formatListingPrice,
    formatSellerName,
} from '../../../lib/recommendations';
import { getMarketplaceListings } from '../../../lib/api/listings';
import { getFavoriteListingIds, setListingFavorite } from '../../../lib/api/favorites';

const Filter_Option = ({
    backgroundColor = colors.blush,
    image,
    iconName,
    text,
    enabled = false,
    onPress,
}) => {
    return (
        <Pressable
            style={[styles.sample_filter, enabled && styles.enabled_sample_filter]}
            onPress={onPress ? () => onPress(text) : undefined}
            accessibilityLabel={`Filter by ${text}`}
            testID={text}
        >
            {image && (
                <View style={[styles.sample_filter_image_container, {backgroundColor: enabled ? colors.maroon : backgroundColor}]}>
                    <Image source={image} style={styles.sample_filter_image} />
                </View>
            )}
            {iconName && (
                <View style={[styles.sample_filter_image_container, {backgroundColor: enabled ? colors.maroon : backgroundColor}]}>
                    <Ionicons name={iconName} size={34} color={enabled ? colors.white : colors.maroon} />
                </View>
            )}
            <Text
                style={[styles.sample_filter_text, enabled && styles.enabled_sample_filter_text]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
            >
                {text}
            </Text>
        </Pressable>
    );
};

const Filter_Panel = ({filterOptions, onToggle, onClose, onApply, onReset}) => {
    const filterOptionsByRow = [
        {image: Furniture_Image, text: 'Furniture'},
        {image: Textbooks_Image, text: 'Textbooks'},
        {image: Budget_Image, text: 'Under $25'},
        {image: Distance_Image, text: 'Distance'},
        {image: Electronics_Image, text: 'Electronics'},
        {image: Clothing_Image, text: 'Clothing'},
        {image: Convenience_Image, text: 'Convenience'},
        {iconName: 'heart', text: 'Favorites'},
    ];

    return (
        <>
            <View style={styles.options_header}>
                <Text
                    style={styles.options_title}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                >
                    Filter options
                </Text>
                <Pressable onPress={onClose} style={styles.close_button} accessibilityLabel="Close options">
                    <Ionicons name="close" size={28} color={colors.ink} />
                </Pressable>
            </View>
            <Text style={styles.options_description}>
                Choose your marketplace filters.
            </Text>
            <ScrollView style={styles.filter_panel_grid} showsVerticalScrollIndicator={false}>
                {Array.from({length: Math.ceil(filterOptionsByRow.length / 2)}, (_, rowIndex) => (
                    <View key={rowIndex} style={styles.filter_panel_grid_row}>
                        {filterOptionsByRow.slice(rowIndex * 2, rowIndex * 2 + 2).map((option) => (
                            <Filter_Option
                                key={option.text}
                                image={option.image}
                                iconName={option.iconName}
                                text={option.text}
                                enabled={filterOptions[option.text]}
                                onPress={onToggle}
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>
            <View style={styles.options_actions}>
                <Button style={styles.apply_button} onPress={onApply}>
                    <Text style={styles.apply_button_text}>Apply changes</Text>
                </Button>
                <Button style={styles.reset_button} onPress={onReset}>
                    <Text style={styles.reset_button_text}>Reset changes</Text>
                </Button>
            </View>
        </>
    );
};

const Sort_Option = ({id, image, selected, onPress, onLayout}) => {
    const labelOpacity = useState(new Animated.Value(0))[0];
    const labelPosition = useState(new Animated.Value(-10))[0];
    const iconPosition = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (selected) {
            labelPosition.setValue(-10);
            Animated.parallel([
                Animated.timing(labelOpacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(labelPosition, {
                    toValue: 14,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(iconPosition, {
                    toValue: -10,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(labelOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(iconPosition, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start(({finished}) => {
                if (!finished) return;

                labelPosition.setValue(-10);
            });
        }
    }, [iconPosition, labelOpacity, labelPosition, selected]);

    return (
        <Pressable
            style={[styles.sort_option, selected && styles.selected_sort_option]}
            onPress={onPress}
            onLayout={onLayout}
            accessibilityLabel={`Sort ${id}`}
        >
            <Animated.Image
                source={image}
                style={[
                    styles.sort_option_image,
                    {transform: [{translateY: iconPosition}]},
                ]}
            />
            <Animated.Text
                style={[
                    styles.sort_option_label,
                    {
                        opacity: labelOpacity,
                        transform: [{translateY: labelPosition}],
                    },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
            >
                {id}
            </Animated.Text>
        </Pressable>
    );
};

const Sort_Checkbox_Option = ({text, enabled = false, onToggle}) => {
    return (
        <Pressable
            style={styles.sort_option_row}
            onPress={onToggle}
            accessibilityRole="checkbox"
            accessibilityState={{checked: enabled}}
        >
            <Ionicons
                name={enabled ? 'checkbox' : 'square-outline'}
                size={24}
                color="#000000"
            />
            <Text style={styles.sort_option_row_text}>{text}</Text>
        </Pressable>
    );
};

const Sort_Panel = ({onClose, sortConfig, onApply, onReset}) => {
    const [selectedSort, setSelectedSort] = useState(sortConfig.direction);
    const [selectedField, setSelectedField] = useState(sortConfig.field);
    const [sortLayouts, setSortLayouts] = useState({});
    const highlightPosition = useState(new Animated.Value(0))[0];
    const highlightWidth = useState(new Animated.Value(0))[0];
    const sortOptions = [
        {id: 'Ascending', image: Sort_Up_Image},
        {id: 'Descending', image: Sort_Down_Image},
        {id: 'Unsorted', image: No_Sort_Image},
    ];

    const selectSort = (sortId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedSort(sortId);
    };

    const resetSortOptions = () => {
        setSelectedSort('Descending');
        setSelectedField('Date Published');
        onReset();
    };

    useEffect(() => {
        const selectedLayout = sortLayouts[selectedSort];
        if (!selectedLayout) return;

        Animated.parallel([
            Animated.timing(highlightPosition, {
                toValue: selectedLayout.x,
                duration: 180,
                useNativeDriver: false,
            }),
            Animated.timing(highlightWidth, {
                toValue: selectedLayout.width,
                duration: 180,
                useNativeDriver: false,
            }),
        ]).start();
    }, [highlightPosition, highlightWidth, selectedSort, sortLayouts]);

    return (
        <>
            <View style={styles.options_header}>
                <Text
                    style={styles.options_title}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                >
                    Sort options
                </Text>
                <Pressable onPress={onClose} style={styles.close_button} accessibilityLabel="Close options">
                    <Ionicons name="close" size={28} color={colors.ink} />
                </Pressable>
            </View>
            <Text style={styles.options_description}>
                Choose how marketplace listings are sorted.
            </Text>
            <View style={styles.sort_options}>
                <Animated.View
                    style={[
                        styles.sort_option_highlight,
                        {
                            left: highlightPosition,
                            width: highlightWidth,
                            pointerEvents: "none"
                        },
                    ]}
                />
                {sortOptions.map((option) => (
                    <Sort_Option
                        key={option.id}
                        id={option.id}
                        image={option.image}
                        selected={selectedSort === option.id}
                        onPress={() => selectSort(option.id)}
                        onLayout={(event) => {
                            const {x, width} = event.nativeEvent.layout;
                            setSortLayouts((current) => ({
                                ...current,
                                [option.id]: {x, width},
                            }));
                        }}
                    />
                ))}
            </View>
            <ScrollView style={{marginVertical: 24}}>
                <Sort_Checkbox_Option
                    text="Name"
                    enabled={selectedField === 'Name'}
                    onToggle={() => setSelectedField('Name')}
                />
                <Sort_Checkbox_Option
                    text="Seller"
                    enabled={selectedField === 'Seller'}
                    onToggle={() => setSelectedField('Seller')}
                />
                <Sort_Checkbox_Option
                    text="Relevance"
                    enabled={selectedField === 'Relevance'}
                    onToggle={() => setSelectedField('Relevance')}
                />
                <Sort_Checkbox_Option
                    text="Price"
                    enabled={selectedField === 'Price'}
                    onToggle={() => setSelectedField('Price')}
                />
                <Sort_Checkbox_Option
                    text="Date Published"
                    enabled={selectedField === 'Date Published'}
                    onToggle={() => setSelectedField('Date Published')}
                />
            </ScrollView>
            <View style={styles.options_actions}>
                <Button style={styles.apply_button} onPress={() => onApply({field: selectedField, direction: selectedSort})}>
                    <Text style={styles.apply_button_text}>Apply changes</Text>
                </Button>
                <Button style={styles.reset_button} onPress={resetSortOptions}>
                    <Text style={styles.reset_button_text}>Reset changes</Text>
                </Button>
            </View>
        </>
    );
};

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
                <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{props.title}</Text>
                    <View style={styles.sellerRow}>
                        <View style={styles.sellerDot}>
                            <Text style={styles.sellerInitials}>{props.initials}</Text>
                        </View>
                        <Text style={styles.sellerName} numberOfLines={1} ellipsizeMode="tail">{props.seller}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
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
    const [draftFilterOptions, setDraftFilterOptions] = useState({});
    const { width: screenWidth } = Dimensions.get('window');
    const panelPosition = useState(new Animated.Value(screenWidth))[0];
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

    useEffect(() => {
        if (activePanel) {
            Animated.timing(panelPosition, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [activePanel, panelPosition]);

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

    const openPanel = (panel) => {
        if (panel === 'filter') {
            setDraftFilterOptions({
                'Under $25': enabledFilters['Under $25'],
                Favorites: enabledFilters.Favorites,
                Furniture: enabledFilters.Furniture,
                Electronics: enabledFilters.Electronics,
                Textbooks: enabledFilters.Textbooks,
                Clothing: enabledFilters.Clothing,
                Convenience: enabledFilters.Convenience,
                Distance: enabledFilters.Distance,
            });
        }
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
        if (activePanel === 'filter') {
            const hasAppliedFilter = Object.values(draftFilterOptions).some(Boolean);
            setEnabledFilters((current) => ({
                ...current,
                ...draftFilterOptions,
                filter: hasAppliedFilter,
            }));
        } else {
            setEnabledFilters((current) => ({ ...current, [activePanel]: true }));
        }
        closePanel();
    };

    const resetPanelChanges = () => {
        if (activePanel === 'filter') {
            const resetFilters = {
                'Under $25': false,
                Favorites: false,
                Furniture: false,
                Electronics: false,
                Textbooks: false,
                Clothing: false,
                Convenience: false,
                Distance: false,
                filter: false,
            };
            setDraftFilterOptions(resetFilters);
        } else {
            setEnabledFilters((current) => ({ ...current, [activePanel]: false }));
            closePanel();
        }
    };

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
            <View style={styles.board_background} pointerEvents="none">
                <Svg width="100%" height="100%">
                    <Defs>
                        <Pattern id="board-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                            <Circle cx="8" cy="8" r="1.5" fill="#a9865d" opacity="0.7" />
                        </Pattern>
                    </Defs>
                    <Rect width="100%" height="100%" fill="#c7a77d" />
                    <Rect width="100%" height="100%" fill="url(#board-dots)" />
                </Svg>
            </View>
            <View style={styles.catalog_panel}>
                <View style={styles.catalog_pin} />
                <View style={styles.catalog_pin_secondary} />
                <View style={styles.catalog_title_row}>
                    <Header1 style={styles.catalog_title}>catalog</Header1>
                    <Text style={styles.new_posts}>24 new posts today</Text>
                    <Button style={styles.shopping_Cart} onPress={() => router.push('/Store/Shopping Cart')} accessibilityLabel="Open shopping cart">
                        <Image source={Shopping_Cart_Image} style={styles.shopping_Cart_Image} resizeMode="contain" />
                    </Button>
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
                        placeholder="Search the b..."
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
                        onPress={() => openPanel('filter')}
                        accessibilityLabel="Open filter options"
                    >
                        <Image source={Filter_Image} style={[styles.catalog_filter_icon, styles.catalog_filter_icon_tint]} />
                    </Button>
                    <Button
                        style={[styles.catalog_icon_button, enabledFilters.sort && styles.catalog_icon_button_active]}
                        onPress={() => openPanel('sort')}
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
                                    <Text style={styles.search_suggestion_title} numberOfLines={1}>{listing.title}</Text>
                                    <Text style={styles.search_suggestion_category} numberOfLines={1}>
                                        {formatCategory(listing.category)} · {formatListingPrice(listing.price)}
                                    </Text>
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
            {activePanel && (
                <View style={styles.panel_layer}>
                    <Pressable style={styles.panel_backdrop} onPress={closePanel} accessibilityLabel="Close options" />
                    <Animated.View
                        style={[
                            styles.options_panel,
                            { transform: [{ translateX: panelPosition }] },
                        ]}
                    >
                        {activePanel === 'filter' ? (
                            <Filter_Panel
                                filterOptions={draftFilterOptions}
                                onToggle={(filter) => setDraftFilterOptions((current) => ({
                                    ...current,
                                    [filter]: !current[filter],
                                }))}
                                onClose={closePanel}
                                onApply={applyPanelChanges}
                                onReset={resetPanelChanges}
                            />
                        ) : (
                            <Sort_Panel
                                onClose={closePanel}
                                sortConfig={sortConfig}
                                onApply={(nextSort) => {
                                    setSortConfig(nextSort);
                                    setEnabledFilters((current) => ({
                                        ...current,
                                        sort: nextSort.field !== 'Date Published' || nextSort.direction !== 'Descending',
                                    }));
                                    closePanel();
                                }}
                                onReset={() => {
                                    setSortConfig({field: 'Date Published', direction: 'Descending'});
                                    setEnabledFilters((current) => ({...current, sort: false}));
                                    closePanel();
                                }}
                            />
                        )}
                    </Animated.View>
                </View>
            )}

            <TabBar active="catalog" />
        </Base>
    );
}

export default Store

const styles = StyleSheet.create({
    board_background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#c7a77d',
    },
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
        fontSize: 15,
        fontWeight: '600',
    },
    search_suggestion_category: {
        marginTop: 2,
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 12,
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
    filter_panel_grid: {
        marginTop: 24,
        gap: 6,
    },
    filter_panel_grid_row: {
        flexDirection: 'row',
    },
    sample_filter: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
        padding: 8,
        borderRadius: 12,
    },
    enabled_sample_filter: {
        opacity: 0.9,
    },
    sample_filter_image_container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
    },
    sample_filter_image: {
        width: 52,
        height: 31,
    },
    sample_filter_text: {
        maxWidth: '100%',
        textAlign: 'center',
        color: colors.ink,
        fontFamily: 'Caveat',
        fontSize: 24,
        fontWeight: '800',
    },
    enabled_sample_filter_text: {
        color: colors.maroon,
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
    panel_layer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 200,
        elevation: 30,
        flexDirection: 'row',
    },
    panel_backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(31, 20, 20, 0.25)',
    },
    shopping_Cart: {
        width: 40,
        height: 40,
        backgroundColor: 'transparent',
        boxShadow: '',
    },
    shopping_Cart_Image: {
        width: 30,
        height: 30,
    },
    options_panel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 201,
        width: '75%',
        backgroundColor: colors.white,
        padding: 24,
        shadowColor: colors.ink,
        shadowOpacity: 0.15,
        shadowRadius: 15,
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
    sort_options: {
        flexDirection: 'row',
        marginTop: 24,
        padding: 12,
        borderRadius: 22,
        backgroundColor: '#EEE',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sort_option: {
        flex: 1,
        height: 82,
        borderRadius: 22,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        overflow: 'hidden',
    },
    selected_sort_option: {
        zIndex: 1,
    },
    sort_option_highlight: {
        position: 'absolute',
        top: 12,
        bottom: 12,
        borderRadius: 22,
        backgroundColor: '#FFF',
    },
    sort_option_label: {
        position: 'absolute',
        top: 38,
        width: '100%',
        textAlign: 'center',
        color: colors.ink,
        fontFamily: 'Caveat',
        fontSize: 15,
        fontWeight: '800',
        whiteSpace: 'nowrap',
    },
    sort_option_image: {
        width: 36,
        height: 36,
    },
    sort_option_row: {
        marginBottom: 15,
        borderRadius: 22,
        padding: 12,
        backgroundColor: '#EEEEEE',
        flexDirection: 'row',
        alignItems: 'center',
    },
    sort_option_row_text: {
        marginLeft: 10,
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
        position: 'relative',
        minHeight: 76,
        paddingHorizontal: 4,
        paddingTop: 16,
        paddingBottom: 8,
    },
    cardLeft: {
        width: '100%',
        gap: 6,
    },
    cardTitle: {
        textAlign: 'left',
        paddingRight: 72,
        fontSize: 18,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Caveat',
        lineHeight: 20,
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
        fontSize: 9,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    sellerName: {
        flex: 1,
        minWidth: 0,
        textAlign: 'left',
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    cardRight: {
        position: 'absolute',
        top: 12,
        right: 4,
        alignItems: 'flex-end',
        flexShrink: 0,
        width: 68,
        minWidth: 68,
    },
    priceLabel: {
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    price: {
        fontSize: 21,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    cardCategory: {
        minHeight: 18,
        marginTop: 4,
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 11,
        lineHeight: 14,
        paddingBottom: 4,
        paddingHorizontal: 4,
        textAlign: 'center',
    },
});
