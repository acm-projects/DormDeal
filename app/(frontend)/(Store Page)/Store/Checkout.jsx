import { useEffect, useRef, useState } from "react";
import {
    Animated,
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
    const fade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fade.setValue(0.45);
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.spring(dotScale, {
                toValue: selected ? 1 : 0,
                friction: 5,
                tension: 120,
                useNativeDriver: true,
            }),
        ]).start();
    }, [dotScale, fade, selected]);

    return (
        <Pressable
            onPress={onPress}
            style={[
                checkoutUI.payRow,
                selected && checkoutUI.paySelected,
            ]}
        >
            <Animated.View
                style={[checkoutUI.payContent, { opacity: fade }]}
            >
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
            </Animated.View>
        </Pressable>
    );
};

function RedesignedCheckout() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [payment, setPayment] = useState("Visa *6767");
    const itemReveal = useRef(new Animated.Value(0)).current;
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
    return (
        <Base>
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
            <Pressable
                onPress={() => router.push("/Store/Confirmation")}
                style={checkoutUI.checkout}
            >
                <Text style={checkoutUI.checkoutText}>Confirm Purchase</Text>
            </Pressable>
        </Base>
    );
}

const checkoutUI = StyleSheet.create({
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
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    paySelected: { backgroundColor: colors.roseSelected },
    payContent: {
        flex: 1,
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
        left: 20,
        right: 20,
        bottom: 16,
        height: 52,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    checkoutText: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 19,
        color: colors.white,
    },
});

export default RedesignedCheckout;
