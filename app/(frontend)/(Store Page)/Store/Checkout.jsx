import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    LayoutAnimation,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../../root_styles";
import Text from "../../../../src/components/text_styles";
import Base from "../../../../src/components/base";
import VisaImage from "../../../../assets/images/visa.png";

const orderedItems = [
    { image: null, title: "Mini fridge", price: "$60" },
    { image: null, title: "Calc II textbook", price: "$25" },
    { image: null, title: "Desk lamp", price: "$12" },
];

const PaymentIcon = ({ method }) =>
    method === "Visa *6767" ? (
        <Image
            source={VisaImage}
            style={checkoutUI.paymentIcon}
            resizeMode="contain"
        />
    ) : (
        <Ionicons
            name={method === "Zelle" ? "send-outline" : "cash-outline"}
            size={30}
            color={colors.maroon}
        />
    );

const PaymentOption = ({ method, selected, onPress }) => {
    const dotScale = useRef(new Animated.Value(selected ? 1 : 0)).current;
    const selectionFade = useRef(
        new Animated.Value(selected ? 1 : 0),
    ).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(dotScale, {
                toValue: selected ? 1 : 0,
                friction: 5,
                tension: 120,
                useNativeDriver: true,
            }),
            Animated.timing(selectionFade, {
                toValue: selected ? 1 : 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [dotScale, selected, selectionFade]);

    return (
        <Pressable
            onPress={onPress}
            style={checkoutUI.payRow}
        >
            <Animated.View
                pointerEvents="none"
                style={[
                    checkoutUI.paySelectionFill,
                    { opacity: selectionFade },
                ]}
            />
            <View style={checkoutUI.payContent}>
                <PaymentIcon method={method} />
                <Text style={checkoutUI.payLabel}>{method}</Text>
                <View style={checkoutUI.radio}>
                    <Animated.View
                        style={[
                            checkoutUI.radioDot,
                            { transform: [{ scale: dotScale }] },
                        ]}
                    />
                </View>
            </View>
        </Pressable>
    );
};

function RedesignedCheckout() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [payment, setPayment] = useState("Visa *6767");
    const itemReveal = useRef(new Animated.Value(0)).current;
    const pageExit = useRef(new Animated.Value(1)).current;
    const cartFlight = useRef(new Animated.Value(0)).current;
    const flagKnockout = useRef(new Animated.Value(0)).current;
    const finishReveal = useRef(new Animated.Value(0)).current;
    const [finishStageWidth, setFinishStageWidth] = useState(0);
    const [isConfirming, setIsConfirming] = useState(false);
    const methods = ["Visa *6767", "Zelle", "Cash at pickup"];
    const toggleItems = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen((current) => {
            const next = !current;
            if (next) {
                itemReveal.setValue(0);
                Animated.timing(itemReveal, {
                    toValue: 1,
                    delay: 130,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            }
            return next;
        });
    };
    const confirmPurchase = () => {
        if (isConfirming) return;

        setIsConfirming(true);
        Animated.parallel([
            Animated.sequence([
                Animated.timing(cartFlight, {
                    toValue: 1,
                    duration: 320,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(cartFlight, {
                    toValue: 2,
                    duration: 260,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(320),
                Animated.timing(flagKnockout, {
                    toValue: 1,
                    duration: 180,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(320),
                Animated.timing(finishReveal, {
                    toValue: 1,
                    duration: 170,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(500),
                Animated.timing(pageExit, {
                    toValue: 0,
                    duration: 420,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(({ finished }) => {
            if (finished) router.push("/Store/Confirmation");
        });
    };
    return (
        <Base>
            <Animated.View style={[checkoutUI.page, { opacity: pageExit }]}>
            <Pressable onPress={() => router.back()} style={checkoutUI.close}>
                <Ionicons name="close" size={30} color={colors.maroon} />
            </Pressable>
            <Text style={checkoutUI.title}>checkout</Text>
            <Text style={checkoutUI.sub}>just one more step!</Text>
            <ScrollView contentContainerStyle={checkoutUI.content}>
                <View style={checkoutUI.card}>
                    <Pressable
                        onPress={toggleItems}
                        style={checkoutUI.cardHeader}
                    >
                        <Ionicons
                            name="cart-outline"
                            size={34}
                            color={colors.ink}
                        />
                        <Text style={checkoutUI.cardHeading}>3 items</Text>
                        <Ionicons
                            name={open ? "chevron-up" : "chevron-down"}
                            size={28}
                            color={colors.ink}
                        />
                    </Pressable>
                    {open && (
                        <Animated.View
                            style={[
                                checkoutUI.tiles,
                                {
                                    opacity: itemReveal,
                                    transform: [
                                        {
                                            translateY: itemReveal.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-8, 0],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            {orderedItems.map((item) => (
                                <View key={item.title} style={checkoutUI.tile}>
                                    <View style={checkoutUI.tilePhoto} />
                                    <Text style={checkoutUI.tileName}>
                                        {item.title}
                                    </Text>
                                    <Text style={checkoutUI.tilePrice}>
                                        {item.price}
                                    </Text>
                                </View>
                            ))}
                        </Animated.View>
                    )}
                </View>
                <View style={checkoutUI.card}>
                    <Text style={checkoutUI.paymentHeading}>
                        Payment Option
                    </Text>
                    {methods.map((method) => (
                        <PaymentOption
                            key={method}
                            method={method}
                            selected={payment === method}
                            onPress={() => setPayment(method)}
                        />
                    ))}
                </View>
                <View style={checkoutUI.card}>
                    <Text style={checkoutUI.paymentHeading}>Order Summary</Text>
                    <View style={checkoutUI.sumRow}>
                        <Text>Subtotal</Text>
                        <Text>$97.00</Text>
                    </View>
                    <View style={checkoutUI.sumRow}>
                        <Text>Campus pickup</Text>
                        <Text>Free</Text>
                    </View>
                    <View style={checkoutUI.rule} />
                    <View style={checkoutUI.sumRow}>
                        <Text style={checkoutUI.total}>Total</Text>
                        <Text style={checkoutUI.total}>$97.00</Text>
                    </View>
                </View>
            </ScrollView>
            <View
                pointerEvents="none"
                style={checkoutUI.finishStage}
                onLayout={({ nativeEvent }) =>
                    setFinishStageWidth(nativeEvent.layout.width)
                }
            >
                <Animated.View
                    style={[
                        checkoutUI.finishCart,
                        {
                            transform: [
                                {
                                    translateX: cartFlight.interpolate({
                                        inputRange: [0, 1, 2],
                                        outputRange: [
                                            0,
                                            Math.max(finishStageWidth - 100, 0),
                                            finishStageWidth + 80,
                                        ],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Ionicons
                        name="cart-outline"
                        size={54}
                        color={colors.maroon}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        checkoutUI.finishFlag,
                        {
                            opacity: flagKnockout.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0],
                            }),
                            transform: [
                                {
                                    translateX: flagKnockout.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 28],
                                    }),
                                },
                                {
                                    translateY: flagKnockout.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -22],
                                    }),
                                },
                                {
                                    rotate: flagKnockout.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ["0deg", "28deg"],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={checkoutUI.finishFlagPole} />
                    <Ionicons name="flag" size={28} color={colors.gold} />
                </Animated.View>
                <Animated.Text
                    style={[
                        checkoutUI.finishText,
                        {
                            opacity: finishReveal,
                            transform: [
                                {
                                    scale: finishReveal.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.55, 1],
                                    }),
                                },
                                {
                                    translateY: finishReveal.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [8, -10],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    FINISH!
                </Animated.Text>
            </View>
            <Pressable
                disabled={isConfirming}
                onPress={confirmPurchase}
                style={checkoutUI.checkout}
            >
                <Text style={checkoutUI.checkoutText}>Confirm Purchase</Text>
            </Pressable>
            </Animated.View>
        </Base>
    );
}

const checkoutUI = StyleSheet.create({
    page: { flex: 1 },
    close: {
        width: 56,
        height: 56,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.08)`,
    },
    title: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 56,
        color: colors.maroon,
        letterSpacing: -2,
        marginTop: 22,
    },
    sub: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 24,
        color: colors.muted,
    },
    content: { gap: 16, paddingTop: 16, paddingBottom: 82 },
    card: {
        backgroundColor: colors.white,
        padding: 16,
    },
    cardHeader: {
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    cardHeading: {
        flex: 1,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 23,
    },
    tiles: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 12,
        marginTop: 18,
    },
    tile: { width: 80, alignItems: "flex-start" },
    tilePhoto: { width: 68, height: 68, backgroundColor: colors.maroon },
    tileName: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 16,
        textAlign: "left",
    },
    tilePrice: {
        fontFamily: "Outfit",
        fontWeight: "800",
        color: colors.maroon,
    },
    paymentHeading: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 25,
        marginBottom: 10,
    },
    paymentIcon: { width: 45, height: 30 },
    payRow: {
        minHeight: 54,
        paddingHorizontal: 10,
        position: "relative",
        overflow: "hidden",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    paySelectionFill: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.roseSelected,
    },
    payContent: {
        flex: 1,
        position: "relative",
        zIndex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    payLabel: { flex: 1, fontFamily: "Outfit", fontSize: 18 },
    radio: {
        width: 23,
        height: 23,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    radioDot: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: colors.maroon,
    },
    helper: {
        fontFamily: "Caveat",
        fontSize: 21,
        color: colors.muted,
        marginTop: 8,
    },
    sumRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 7,
    },
    rule: {
        borderTopWidth: 2,
        borderStyle: "dashed",
        borderColor: "#C58C8C",
        marginVertical: 10,
    },
    total: { fontFamily: "Outfit", fontWeight: "800", fontSize: 19 },
    checkout: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 52,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    finishStage: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 46,
        height: 58,
        overflow: "visible",
    },
    finishCart: {
        position: "absolute",
        top: 2,
        left: 18,
    },
    finishFlag: {
        position: "absolute",
        top: 13,
        right: 18,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    finishFlagPole: {
        width: 3,
        height: 34,
        marginTop: 1,
        backgroundColor: colors.maroon,
    },
    finishText: {
        position: "absolute",
        top: 3,
        right: 5,
        zIndex: 2,
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 13,
        fontWeight: "400",
        letterSpacing: 0.4,
    },
    checkoutText: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 19,
        color: colors.white,
    },
});

export default RedesignedCheckout;
