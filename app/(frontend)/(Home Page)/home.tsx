import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Pressable,
    Animated,
    PanResponder,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../root_styles";
import TabBar from "../../../src/components/tab_bar";
import Calendar from "../../../src/components/calendar";
import { items } from "../../../data/items";
import {
    formatCategory,
    formatListingPrice,
    formatSellerName,
    getRecommendations,
    recordListingInteraction,
    RecommendedListing,
} from "../../../lib/recommendations";

// what one pickup looks like
type Pickup = {
    id: string;
    itemId: string; // which listing this pickup belongs to
    type: "buy" | "sell";
    day: string;
    date: string;
    item: string;
    time: string;
    place: string;
};

// fake pickups for now
const pickups: Pickup[] = [
    {
        id: "p1",
        itemId: "2",
        type: "buy",
        day: "THU",
        date: "15",
        item: "Adjustable desk lamp",
        time: "5:30 PM",
        place: "Helix Hall Lobby",
    },
    {
        id: "p2",
        itemId: "1",
        type: "buy",
        day: "SAT",
        date: "17",
        item: "Mini fridge, 3.1 ft",
        time: "11:00 AM",
        place: "Sciences Building",
    },
    {
        id: "p3",
        itemId: "3",
        type: "sell",
        day: "FRI",
        date: "16",
        item: "Twin XL sheets",
        time: "2:00 PM",
        place: "Student Union",
    },
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
            <View style={home.cardPhoto}>
                <Text selectable={false} style={home.photoPlaceholder}>
                    [item photo]
                </Text>
            </View>
            <View style={home.categoryBadge}>
                <Text selectable={false} style={home.categoryBadgeText}>
                    {props.category}
                </Text>
            </View>
            <View style={home.cardInfo}>
                <View style={home.cardLeft}>
                    <Text
                        selectable={false}
                        style={home.cardTitle}
                        numberOfLines={1}
                    >
                        {props.title}
                    </Text>
                    <View style={home.sellerRow}>
                        <View style={home.sellerDot}>
                            <Text
                                selectable={false}
                                style={home.sellerInitials}
                            >
                                {props.initials}
                            </Text>
                        </View>
                        <Text selectable={false} style={home.sellerName}>
                            {props.seller}
                        </Text>
                    </View>
                </View>
                <View style={home.cardRight}>
                    <Text selectable={false} style={home.priceLabel}>
                        Price
                    </Text>
                    <Text selectable={false} style={home.price}>
                        {props.price}
                    </Text>
                </View>
            </View>
            {props.reason ? (
                <Text selectable={false} style={home.reason}>
                    {props.reason}
                </Text>
            ) : null}
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
const CARD_WIDTH = 250;
function getVisualDeck(listings: FeedListing[]) {
    if (listings.length < 3) return listings;
    return [listings[0], listings[1], listings[2], ...listings.slice(3)];
}
function getTapeRotation(id: string) {
    let hash = 0;
    for (const character of id) {
        hash = (hash * 31 + character.charCodeAt(0)) | 0;
    }
    return Math.abs(hash) % 2 === 0 ? "5deg" : "-7deg";
}
const CardStack = ({
    listings,
    setPageScrollLocked,
}: {
    listings: FeedListing[];
    setPageScrollLocked: (locked: boolean) => void;
}) => {
    const [deck, setDeck] = useState(() => getVisualDeck(listings));
    const [undoing, setUndoing] = useState(false);
    const [undoOutgoing, setUndoOutgoing] = useState<FeedListing | null>(null);
    const router = useRouter();
    const { width: viewportWidth } = useWindowDimensions();
    // The card starts centered. Allow room for the rotated corners and shadow.
    const offscreenLeft = -(viewportWidth / 2 + CARD_WIDTH);
    const deckRef = useRef(getVisualDeck(listings));
    const dismissedHistory = useRef<FeedListing[]>([]);
    const frontPosition = useRef(new Animated.ValueXY()).current;
    const undoProgress = useRef(new Animated.Value(1)).current;
    const undoOutgoingOpacity = useRef(new Animated.Value(1)).current;
    const rearLeftPosition = useRef(new Animated.Value(-34)).current;
    const rearRightPosition = useRef(new Animated.Value(34)).current;
    const rearLeftScale = useRef(new Animated.Value(0.96)).current;
    const rearRightScale = useRef(new Animated.Value(0.92)).current;
    const rearLeftRotation = useRef(new Animated.Value(-5)).current;
    const rearRightRotation = useRef(new Animated.Value(5)).current;
    const incomingOpacity = useRef(new Animated.Value(0)).current;
    const noRecommendationsOpacity = useRef(new Animated.Value(0)).current;
    const transitionRunning = useRef(false);
    const advance = () => {
        if (transitionRunning.current) return;
        const current = deckRef.current;
        const dismissed = current[0];
        if (!dismissed) return;
        dismissedHistory.current.push(dismissed);
        transitionRunning.current = true;
        if (dismissed.isLive) {
            recordListingInteraction(dismissed.liveListingId!, "dismiss").catch(
                () => undefined,
            );
        }
        Animated.parallel([
            Animated.timing(frontPosition, {
                toValue: {
                    x: offscreenLeft,
                    y: 0,
                },
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(rearLeftPosition, {
                toValue: 0,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(rearLeftScale, {
                toValue: 1,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(rearLeftRotation, {
                toValue: 0,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(rearRightPosition, {
                toValue: -34,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(rearRightScale, {
                toValue: 0.96,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(rearRightRotation, {
                toValue: -5,
                duration: 280,
                useNativeDriver: false,
            }),
            Animated.timing(incomingOpacity, {
                toValue: 1,
                duration: 280,
                useNativeDriver: false,
            }),
        ]).start(({ finished }) => {
            if (!finished) return;
            const next = [
                current[1],
                current[2],
                current[3],
                ...current.slice(4),
            ];
            deckRef.current = next;
            setDeck(next);
        });
    };
    const undo = () => {
        if (transitionRunning.current) return;
        const restored = dismissedHistory.current.pop();
        if (!restored) return;
        transitionRunning.current = true;
        setUndoOutgoing(deckRef.current[2] ?? null);
        undoOutgoingOpacity.setValue(1);
        const next = [restored, ...deckRef.current];
        deckRef.current = next;
        frontPosition.setValue({
            x: 0,
            y: 0,
        });
        undoProgress.setValue(0);
        setUndoing(true);
        setDeck(next);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(undoProgress, {
                        toValue: 1,
                        duration: 280,
                        useNativeDriver: false,
                    }),
                    Animated.timing(undoOutgoingOpacity, {
                        toValue: 0,
                        duration: 280,
                        useNativeDriver: false,
                    }),
                ]).start(() => {
                    setUndoing(false);
                    setUndoOutgoing(null);
                    undoOutgoingOpacity.setValue(1);
                });
            });
        });
    };
    useEffect(() => {
        const nextDeck = getVisualDeck(listings);
        deckRef.current = nextDeck;
        dismissedHistory.current = [];
        setDeck(nextDeck);
    }, [listings]);
    useLayoutEffect(() => {
        // Reset after the departing card has left the rendered deck.
        frontPosition.setValue({
            x: 0,
            y: 0,
        });
        rearLeftPosition.setValue(-34);
        rearRightPosition.setValue(34);
        rearLeftScale.setValue(0.96);
        rearRightScale.setValue(0.92);
        rearLeftRotation.setValue(-5);
        rearRightRotation.setValue(5);
        incomingOpacity.setValue(0);
        if (!undoing) transitionRunning.current = false;
    }, [
        deck,
        undoing,
        frontPosition,
        rearLeftPosition,
        rearRightPosition,
        rearLeftScale,
        rearRightScale,
        rearLeftRotation,
        rearRightRotation,
        incomingOpacity,
    ]);
    useEffect(() => {
        noRecommendationsOpacity.setValue(0);
        if (!deck[0]) {
            Animated.timing(noRecommendationsOpacity, {
                toValue: 1,
                duration: 450,
                useNativeDriver: false,
            }).start();
        }
    }, [deck, noRecommendationsOpacity]);
    const advanceRef = useRef(advance);
    advanceRef.current = advance;
    const swipe = useRef(
        PanResponder.create({
            // Only claim a gesture once it is clearly horizontal. This leaves
            // vertical and diagonal drags to the enclosing page ScrollView.
            onMoveShouldSetPanResponderCapture: (_, g) =>
                !transitionRunning.current &&
                Math.abs(g.dx) > 8 &&
                Math.abs(g.dx) > Math.abs(g.dy),
            onPanResponderGrant: () => setPageScrollLocked(true),
            onPanResponderTerminationRequest: () => false,
            // don't let the page scroll steal it

            // card follows the finger
            onPanResponderMove: Animated.event(
                [
                    null,
                    {
                        dx: frontPosition.x,
                        dy: frontPosition.y,
                    },
                ],
                {
                    useNativeDriver: false,
                },
            ),
            // finger lifted
            onPanResponderRelease: (_, g) => {
                // Restore page scrolling as soon as the user lifts their finger;
                // the card animation can finish independently.
                setPageScrollLocked(false);
                if (transitionRunning.current) return;
                if (Math.abs(g.dx) > 100) {
                    advanceRef.current();
                } else {
                    // not far enough: spring back to the middle
                    Animated.spring(frontPosition, {
                        toValue: {
                            x: 0,
                            y: 0,
                        },
                        useNativeDriver: false,
                    }).start();
                }
            },
            onPanResponderTerminate: () => setPageScrollLocked(false),
        }),
    ).current;

    // tilt the card as it's dragged, like flicking a real card
    const tilt = frontPosition.x.interpolate({
        inputRange: [-200, 0, 200],
        outputRange: ["-12deg", "0deg", "12deg"],
        extrapolate: "clamp",
    });
    return (
        <View style={home.stack}>
            {deck.slice(0, 4).map((item, depth) => {
                if (!item) return null;
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
                const layer = (
                    <>
                        <View
                            style={[
                                home.tape,
                                {
                                    transform: [
                                        {
                                            rotate: getTapeRotation(item.id),
                                        },
                                    ],
                                },
                            ]}
                        />
                        {card}
                    </>
                );

                // top card: draggable + tappable
                if (depth === 0) {
                    return (
                        <Animated.View
                            key={item.id}
                            {...swipe.panHandlers}
                            style={[
                                home.stackSlot,
                                {
                                    zIndex: 3,
                                    transform: [
                                        {
                                            translateX: undoing
                                                ? undoProgress.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [
                                                          offscreenLeft,
                                                          0,
                                                      ],
                                                  })
                                                : frontPosition.x,
                                        },
                                        {
                                            translateY: undoing
                                                ? 0
                                                : frontPosition.y,
                                        },
                                        {
                                            rotate: tilt,
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Pressable
                                onPress={() =>
                                    router.push(
                                        `/Store/Listing/Marketplace/${item.id}`,
                                    )
                                }
                            >
                                {layer}
                            </Pressable>
                        </Animated.View>
                    );
                }
                if (depth === 3) {
                    return (
                        <Animated.View
                            key={item.id}
                            style={[
                                home.stackSlot,
                                {
                                    zIndex: 0,
                                    opacity: undoing ? 0 : incomingOpacity,
                                    transform: [
                                        {
                                            translateX: undoing
                                                ? undoProgress.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [-34, 34],
                                                  })
                                                : 34,
                                        },
                                        {
                                            scale: undoing
                                                ? undoProgress.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [0.96, 0.92],
                                                  })
                                                : 0.92,
                                        },
                                        {
                                            rotate: undoing
                                                ? undoProgress.interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: [
                                                          "-5deg",
                                                          "5deg",
                                                      ],
                                                  })
                                                : "5deg",
                                        },
                                    ],
                                },
                            ]}
                        >
                            {layer}
                        </Animated.View>
                    );
                }
                return (
                    <Animated.View
                        key={item.id}
                        style={[
                            home.stackSlot,
                            {
                                zIndex: depth === 1 ? 2 : 1,
                                transform: [
                                    {
                                        translateX: undoing
                                            ? undoProgress.interpolate({
                                                  inputRange: [0, 1],
                                                  outputRange:
                                                      depth === 1
                                                          ? [0, -34]
                                                          : [-34, 34],
                                              })
                                            : depth === 1
                                              ? rearLeftPosition
                                              : rearRightPosition,
                                    },
                                    {
                                        scale: undoing
                                            ? undoProgress.interpolate({
                                                  inputRange: [0, 1],
                                                  outputRange:
                                                      depth === 1
                                                          ? [1, 0.96]
                                                          : [0.96, 0.92],
                                              })
                                            : depth === 1
                                              ? rearLeftScale
                                              : rearRightScale,
                                    },
                                    {
                                        rotate: undoing
                                            ? undoProgress.interpolate({
                                                  inputRange: [0, 1],
                                                  outputRange:
                                                      depth === 1
                                                          ? ["0deg", "-5deg"]
                                                          : ["-5deg", "5deg"],
                                              })
                                            : (depth === 1
                                                  ? rearLeftRotation
                                                  : rearRightRotation
                                              ).interpolate({
                                                  inputRange: [-5, 5],
                                                  outputRange: [
                                                      "-5deg",
                                                      "5deg",
                                                  ],
                                              }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {layer}
                    </Animated.View>
                );
            })}
            {undoOutgoing && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        home.stackSlot,
                        {
                            zIndex: 1,
                            opacity: undoOutgoingOpacity,
                            transform: [
                                {
                                    translateX: 34,
                                },
                                {
                                    scale: 0.92,
                                },
                                {
                                    rotate: "5deg",
                                },
                            ],
                        },
                    ]}
                >
                    <View
                        style={[
                            home.tape,
                            {
                                transform: [
                                    {
                                        rotate: getTapeRotation(
                                            undoOutgoing.id,
                                        ),
                                    },
                                ],
                            },
                        ]}
                    />
                    <RecCard
                        title={undoOutgoing.title}
                        seller={undoOutgoing.seller}
                        initials={undoOutgoing.initials}
                        price={undoOutgoing.price}
                        category={undoOutgoing.category}
                        reason={undoOutgoing.reason}
                    />
                </Animated.View>
            )}
            {!deck[0] && (
                <Animated.Text
                    style={[
                        home.noRecommendations,
                        {
                            opacity: noRecommendationsOpacity,
                        },
                    ]}
                >
                    No more recommended listings... :(
                </Animated.Text>
            )}
            <View style={home.stackControls}>
                <Text style={home.swipeHint}>
                    swipe left{" "}
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color={colors.maroon}
                    />
                </Text>
                <Pressable
                    style={[
                        home.nextButton,
                        dismissedHistory.current.length === 0 &&
                            home.undoDisabled,
                    ]}
                    onPress={undo}
                    accessibilityLabel="Undo last dismissed recommendation"
                >
                    <Ionicons
                        name="return-up-back"
                        size={27}
                        color={colors.maroon}
                    />
                </Pressable>
            </View>
        </View>
    );
};

// one pickup row, tap it to open the listing
const PickupCard = (props: { pickup: Pickup }) => {
    const p = props.pickup;
    const router = useRouter();
    return (
        <Pressable
            style={home.pickupCard}
            onPress={() =>
                router.push(`/Store/Listing/Marketplace/${p.itemId}`)
            }
        >
            <View style={home.dateBox}>
                <Text style={home.dateDay}>{p.day}</Text>
                <Text style={home.dateNum}>{p.date}</Text>
            </View>

            <View style={home.pickupInfo}>
                <Text style={home.pickupItem} numberOfLines={1}>
                    {p.item}
                </Text>
                <View style={home.pickupWhere}>
                    <Ionicons
                        name="location-outline"
                        size={15}
                        color={colors.muted}
                    />
                    <Text style={home.pickupWhereText}>
                        {p.time} · {p.place}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};
const Home = () => {
    const userName = "Alex R."; // swap for real name once login works
    const initials = "AR"; // same, comes from login later
    const [mode, setMode] = useState<"buy" | "sell">("buy"); // which tab is picked
    const [pageScrollLocked, setPageScrollLocked] = useState(false);
    const pickupMotion = useRef(new Animated.Value(0)).current;
    const pickupOpacity = useRef(new Animated.Value(1)).current;
    const pickupTransitionRunning = useRef(false);
    const shown = pickups.filter((p) => p.type === mode); // only the matching pickups
    const router = useRouter();

    const selectPickupMode = (nextMode: "buy" | "sell") => {
        if (nextMode === mode || pickupTransitionRunning.current) return;

        pickupTransitionRunning.current = true;
        const direction = nextMode === "sell" ? 1 : -1;
        Animated.parallel([
            Animated.timing(pickupMotion, {
                toValue: direction * 28,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(pickupOpacity, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) {
                pickupTransitionRunning.current = false;
                return;
            }

            setMode(nextMode);
            pickupMotion.setValue(-direction * 28);
            pickupOpacity.setValue(0);
            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(pickupMotion, {
                        toValue: 0,
                        duration: 160,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pickupOpacity, {
                        toValue: 1,
                        duration: 160,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    pickupTransitionRunning.current = false;
                });
            });
        });
    };

    // recommended cards: start with the demo items, swap in real ones once they load
    const [listings, setListings] = useState<FeedListing[]>(fallbackListings);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [recError, setRecError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        getRecommendations(20)
            .then((recs) => {
                if (cancelled) return;
                // nothing recommended yet (new account, no listings): keep the demo cards
                if (recs.length > 0) setListings(recs.map(toFeedListing));
            })
            .catch((err) => {
                if (cancelled) return;
                console.warn("Could not load recommendations", err);
                setRecError(
                    "Couldn't load your recommendations, showing examples.",
                );
            })
            .finally(() => {
                if (!cancelled) setLoadingRecs(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);
    return (
        <View style={home.screen}>
            <ScrollView
                contentContainerStyle={home.content}
                directionalLockEnabled
                scrollEnabled={!pageScrollLocked}
            >
                {/* greeting on the left, avatar on the right */}
                <View style={home.headerRow}>
                    <View style={home.greeting}>
                        <Text style={home.hello}>Hello,</Text>
                        <Text style={home.name}>{userName}</Text>
                        <Text style={home.subtitle}>
                            What are you looking for today?
                        </Text>
                    </View>

                    <View style={home.profileActions}>
                        <Pressable
                            style={home.settingsButton}
                            onPress={() => router.push("/Settings")}
                            accessibilityLabel="Open settings"
                        >
                            <Ionicons
                                name="settings-outline"
                                size={20}
                                color={colors.ink}
                            />
                        </Pressable>
                        <View style={home.avatar}>
                            <Text style={home.avatarText}>{initials}</Text>
                        </View>
                    </View>
                </View>

                <View style={home.recommendationHeading}>
                    <View style={home.sectionRow}>
                        <View style={home.recommendedTitle}>
                            <Text style={home.sectionTitle}>Recommended</Text>
                            <Svg
                                width={126}
                                height={8}
                                viewBox="0 0 126 8"
                                style={home.squiggle}
                            >
                                <Path
                                    d="M1 4 C13 1, 22 7, 35 4 S57 1, 70 4 S92 7, 105 4 S118 2, 125 4"
                                    stroke={colors.maroon}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </Svg>
                        </View>
                        <Text style={home.sectionNote}>just for you!</Text>
                    </View>
                    <Pressable
                        style={home.seeAll}
                        onPress={() => router.push("/Store")}
                    >
                        <Text style={home.seeAllText}>See all</Text>
                    </Pressable>
                </View>

                {loadingRecs ? (
                    <View style={home.loadingRecommendations}>
                        <ActivityIndicator color={colors.maroon} />
                    </View>
                ) : (
                    <CardStack
                        listings={listings}
                        setPageScrollLocked={setPageScrollLocked}
                    />
                )}
                {recError ? (
                    <Text style={home.recommendationError}>{recError}</Text>
                ) : null}
                <View style={home.sectionRow}>
                    <Text style={home.sectionTitle}>Upcoming pickups</Text>

                    <View style={home.toggle}>
                        <Pressable
                            onPress={() => selectPickupMode("buy")}
                            style={[
                                home.toggleOption,
                                mode === "buy" && home.toggleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    home.toggleText,
                                    mode === "buy" && home.toggleTextActive,
                                ]}
                            >
                                Buy
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => selectPickupMode("sell")}
                            style={[
                                home.toggleOption,
                                mode === "sell" && home.toggleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    home.toggleText,
                                    mode === "sell" && home.toggleTextActive,
                                ]}
                            >
                                Sell
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <Animated.View
                    style={[
                        home.pickupList,
                        {
                            opacity: pickupOpacity,
                            transform: [{ translateX: pickupMotion }],
                        },
                    ]}
                >
                    {shown.map((p) => (
                        <PickupCard key={p.id} pickup={p} />
                    ))}
                    {shown.length === 0 && (
                        <Text style={home.emptyText}>No pickups yet!</Text>
                    )}
                </Animated.View>

                <View style={[home.sectionRow, home.calendarHeader]}>
                    <Text style={home.sectionTitle}>Your calendar</Text>
                    <Text style={home.sectionNote}>plan ahead!</Text>
                </View>

                <Calendar />
            </ScrollView>

            <TabBar active="home" />
        </View>
    );
};
function toFeedListing(listing: RecommendedListing): FeedListing {
    const sellerName = formatSellerName(listing.seller_name);
    const words = sellerName.split(/\s+/);
    const initials =
        words
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("") || "?";
    return {
        id: `live-${listing.listing_id}`,
        title: listing.title,
        seller: sellerName,
        initials,
        price: formatListingPrice(listing.price),
        category: formatCategory(listing.category),
        reason: listing.recommendation_reason,
        isLive: true,
        liveListingId: listing.listing_id,
    };
}
const home = StyleSheet.create({
    screen: {
        flex: 1,
        width: "100%",
    },
    content: {
        paddingTop: 48,
        paddingHorizontal: 18,
        paddingBottom: 130, // room so the tab bar doesn't cover the last card
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 86,
    },
    profileActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    greeting: {
        gap: 2,
    },
    hello: {
        fontSize: 30,
        color: colors.maroon,
        fontFamily: "Caveat",
    },
    name: {
        fontSize: 46,
        fontWeight: "800",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    subtitle: {
        fontSize: 14,
        color: colors.muted,
        fontFamily: "Outfit",
        marginTop: 4,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.maroon,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "700",
        fontFamily: "Outfit",
    },
    settingsButton: {
        width: 42,
        height: 42,
        borderRadius: 28,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    // section title rows
    recommendationHeading: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginTop: 28,
        marginBottom: 2,
    },
    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 0,
        marginBottom: 14,
    },
    calendarHeader: {
        marginTop: 24,
    },
    sectionTitle: {
        flexShrink: 1,
        fontSize: 22,
        fontWeight: "700",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    recommendedTitle: {
        position: "relative",
    },
    squiggle: {
        position: "absolute",
        left: 0,
        bottom: -7,
    },
    sectionNote: {
        fontSize: 20,
        color: colors.maroon,
        fontFamily: "Caveat",
        transform: [
            {
                rotate: "-4deg",
            },
        ], // little tilt like handwriting
    },
    seeAll: {
        marginBottom: 14,
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    // polaroid cards
    card: {
        width: CARD_WIDTH,
        backgroundColor: colors.white,
        borderRadius: 3,
        padding: 12,
        boxShadow: [
            {
                offsetX: 0,
                offsetY: 5,
                blurRadius: 12,
                color: "rgba(31,20,20,0.22)",
            },
        ],
    },
    cardPhoto: {
        height: 250,
        borderRadius: 4,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: [
            {
                offsetX: 0,
                offsetY: 0,
                blurRadius: 5,
                color: "rgba(31,20,20,0.16)",
                inset: true,
            },
        ],
    },
    photoPlaceholder: {
        color: colors.white,
        fontFamily: "Caveat",
        fontSize: 19,
        fontStyle: "italic",
    },
    categoryBadge: {
        position: "absolute",
        top: 22,
        left: 22,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.goldLight,
    },
    categoryBadgeText: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 12,
        fontWeight: "700",
    },
    cardInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingHorizontal: 4,
        paddingTop: 14,
        paddingBottom: 8,
    },
    cardLeft: {
        flex: 1,
        gap: 6,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: "600",
        color: colors.ink,
        fontFamily: "Caveat",
        flexShrink: 1,
    },
    sellerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    sellerDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.blush,
        alignItems: "center",
        justifyContent: "center",
    },
    sellerInitials: {
        fontSize: 9,
        fontWeight: "700",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    sellerName: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: "Outfit",
    },
    cardRight: {
        alignItems: "flex-end",
        minWidth: 48,
    },
    reason: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 12,
        paddingHorizontal: 4,
        paddingBottom: 8,
    },
    priceLabel: {
        fontSize: 12,
        color: colors.muted,
        fontFamily: "Outfit",
    },
    price: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    stack: {
        width: "100%",
        height: 468,
        alignSelf: "center",
        marginTop: 15,
    },
    noRecommendations: {
        position: "absolute",
        top: 190,
        left: 0,
        right: 0,
        color: colors.maroon,
        fontFamily: "Caveat",
        fontSize: 24,
        textAlign: "center",
    },
    stackSlot: {
        position: "absolute",
        top: 0,
        left: "50%",
        marginLeft: -CARD_WIDTH / 2,
    },
    tape: {
        position: "absolute",
        top: -12,
        left: 112,
        width: 62,
        height: 24,
        backgroundColor: colors.gold,
        opacity: 0.72,
        zIndex: 2,
    },
    nextButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.maroon,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 15,
    },
    undoDisabled: {
        opacity: 0.35,
    },
    stackControls: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 24,
        flexDirection: "row",
        alignItems: "center",
        zIndex: 10,
        marginTop: 15,
        paddingHorizontal: 26,
    },
    // buy / sell switch
    toggle: {
        flexDirection: "row",
        marginLeft: "auto",
        // push to the right
        backgroundColor: colors.white,
        borderRadius: 3,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.blush,
    },
    toggleOption: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 3,
    },
    toggleActive: {
        backgroundColor: colors.maroon,
    },
    toggleText: {
        fontSize: 16,
        fontFamily: "Outfit",
        fontWeight: "600",
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
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.white,
        borderRadius: 3,
        padding: 12,
        paddingRight: 16,
    },
    dateBox: {
        width: 58,
        height: 58,
        borderRadius: 3,
        backgroundColor: colors.blush,
        alignItems: "center",
        justifyContent: "center",
    },
    dateDay: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    dateNum: {
        fontSize: 26,
        fontWeight: "700",
        color: colors.maroon,
        fontFamily: "Outfit",
    },
    pickupInfo: {
        flex: 1,
        // take the middle space
        gap: 4,
    },
    pickupItem: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    pickupWhere: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    pickupWhereText: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: "Outfit",
    },
    emptyText: {
        fontSize: 20,
        fontFamily: "Caveat",
        color: colors.muted,
        textAlign: "center",
        paddingVertical: 12,
    },
    swipeHint: {
        fontSize: 19,
        fontFamily: "Caveat",
        color: colors.maroon,
        textAlign: "left",
        flex: 1,
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
        fontFamily: "Outfit",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    preferenceText: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 13,
        marginTop: 3,
    },
    coldStartText: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 13,
        marginBottom: 12,
        textAlign: "center",
    },
    loadingRecommendations: {
        alignItems: "center",
        height: 390,
        justifyContent: "center",
    },
    recommendationError: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 12,
        marginTop: 8,
        textAlign: "center",
    },
});
export default Home;
