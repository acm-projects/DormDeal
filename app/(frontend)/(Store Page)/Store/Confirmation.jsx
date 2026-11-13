import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Base from "../../../../src/components/base";
import { colors } from "../../../root_styles";

const CONFETTI = [
    {
        left: "7%",
        color: "#F7D95F",
        delay: 0,
        duration: 4100,
        drift: 34,
        turn: 420,
    },
    {
        left: "16%",
        color: "#B33B3B",
        delay: 450,
        duration: 4700,
        drift: -28,
        turn: -510,
    },
    {
        left: "25%",
        color: "#6F9160",
        delay: 980,
        duration: 3900,
        drift: 42,
        turn: 610,
    },
    {
        left: "34%",
        color: "#E691B7",
        delay: 250,
        duration: 5200,
        drift: -37,
        turn: -460,
    },
    {
        left: "43%",
        color: "#F7D95F",
        delay: 760,
        duration: 4400,
        drift: 26,
        turn: 550,
    },
    {
        left: "53%",
        color: "#B33B3B",
        delay: 1260,
        duration: 5000,
        drift: -45,
        turn: -630,
    },
    {
        left: "62%",
        color: "#6F9160",
        delay: 120,
        duration: 4600,
        drift: 31,
        turn: 470,
    },
    {
        left: "71%",
        color: "#E691B7",
        delay: 650,
        duration: 4200,
        drift: -33,
        turn: -580,
    },
    {
        left: "79%",
        color: "#F7D95F",
        delay: 1080,
        duration: 4900,
        drift: 39,
        turn: 520,
    },
    {
        left: "88%",
        color: "#B33B3B",
        delay: 350,
        duration: 4500,
        drift: -25,
        turn: -490,
    },
    {
        left: "12%",
        color: "#E691B7",
        delay: 1450,
        duration: 4300,
        drift: 36,
        turn: 490,
    },
    {
        left: "48%",
        color: "#6F9160",
        delay: 560,
        duration: 5100,
        drift: -31,
        turn: -550,
    },
    {
        left: "67%",
        color: "#F7D95F",
        delay: 1620,
        duration: 4000,
        drift: 44,
        turn: 600,
    },
    {
        left: "94%",
        color: "#E691B7",
        delay: 870,
        duration: 4800,
        drift: -29,
        turn: -520,
    },
];

const iconPopStyle = (progress, startX, startY, rotation) => ({
    opacity: progress,
    transform: [
        { scale: progress },
        {
            translateX: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [startX, 0],
            }),
        },
        {
            translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [startY, 0],
            }),
        },
        { rotate: rotation },
    ],
});

export default function Confirmation() {
    const router = useRouter();
    const checkProgress = useRef(new Animated.Value(0)).current;
    const detailsIn = useRef(new Animated.Value(0)).current;
    const iconPops = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const confettiFalls = useRef(
        CONFETTI.map(() => new Animated.Value(0)),
    ).current;

    useEffect(() => {
        const primaryAnimation = Animated.parallel([
            Animated.timing(checkProgress, {
                toValue: 1,
                duration: 650,
                useNativeDriver: false,
            }),
            ...confettiFalls.map((fall, index) =>
                Animated.sequence([
                    Animated.delay(CONFETTI[index].delay),
                    Animated.timing(fall, {
                        toValue: 1,
                        duration: CONFETTI[index].duration,
                        useNativeDriver: false,
                    }),
                ]),
            ),
        ]);
        const detailsAnimation = Animated.sequence([
            Animated.delay(620),
            Animated.spring(detailsIn, {
                toValue: 1,
                friction: 7,
                tension: 70,
                useNativeDriver: false,
            }),
            Animated.stagger(
                140,
                iconPops.map((pop) =>
                    Animated.spring(pop, {
                        toValue: 1,
                        friction: 6,
                        tension: 85,
                        useNativeDriver: false,
                    }),
                ),
            ),
        ]);
        primaryAnimation.start();
        detailsAnimation.start();

        return () => {
            primaryAnimation.stop();
            detailsAnimation.stop();
        };
    }, [checkProgress, confettiFalls, detailsIn, iconPops]);

    const detailStyle = {
        opacity: detailsIn,
        transform: [
            {
                scale: detailsIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.25, 1],
                }),
            },
        ],
    };

    return (
        <Base style={confirmUI.screen}>
            <View style={confirmUI.center}>
                <View style={confirmUI.hero}>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            confirmUI.icon,
                            confirmUI.schoolIcon,
                            iconPopStyle(iconPops[0], 135, 72, "-8deg"),
                        ]}
                    >
                        <Ionicons
                            name="school"
                            size={70}
                            color={colors.maroon}
                        />
                    </Animated.View>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            confirmUI.icon,
                            confirmUI.flaskIcon,
                            iconPopStyle(iconPops[1], -128, 67, "13deg"),
                        ]}
                    >
                        <Ionicons
                            name="flask-outline"
                            size={70}
                            color={colors.mustard}
                        />
                    </Animated.View>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            confirmUI.icon,
                            confirmUI.bookIcon,
                            iconPopStyle(iconPops[2], 126, -64, "-9deg"),
                        ]}
                    >
                        <Ionicons
                            name="book-outline"
                            size={68}
                            color={colors.sage}
                        />
                    </Animated.View>
                    <View style={confirmUI.check}>
                        <Animated.View
                            style={[
                                confirmUI.checkReveal,
                                {
                                    width: checkProgress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 92],
                                    }),
                                },
                            ]}
                        >
                            <Ionicons
                                name="checkmark"
                                size={88}
                                color={colors.white}
                            />
                        </Animated.View>
                    </View>
                    <Animated.View style={[confirmUI.grade, detailStyle]}>
                        <Text style={confirmUI.gradeText}>A+</Text>
                    </Animated.View>
                </View>
                <Text style={confirmUI.title}>Order confirmed!</Text>
                <Text style={confirmUI.plan}>your new plan now:</Text>
                <View style={confirmUI.schedule}>
                    <Text style={confirmUI.scheduleTitle}>Pickup schedule</Text>
                    <View style={confirmUI.scheduleRow}>
                        <View style={confirmUI.schedulePerson}>
                            <Text style={confirmUI.person}>Alex R.</Text>
                            <Text style={confirmUI.location}>
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color={colors.ink}
                                />{" "}
                                Library lobby
                            </Text>
                        </View>
                        <Text style={confirmUI.when}>Fri, 3 PM</Text>
                        <Text style={confirmUI.items}>2 items</Text>
                    </View>
                    <View style={confirmUI.scheduleRow}>
                        <View style={confirmUI.schedulePerson}>
                            <Text style={confirmUI.person}>Jordan M.</Text>
                            <Text style={confirmUI.location}>
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color={colors.ink}
                                />{" "}
                                Student Union
                            </Text>
                        </View>
                        <Text style={confirmUI.when}>Sat, 11 AM</Text>
                        <Text style={confirmUI.items}>1 item</Text>
                    </View>
                </View>
            </View>
            <View pointerEvents="none" style={confirmUI.screenConfettiLayer}>
                {CONFETTI.map((piece, index) => {
                    const fall = confettiFalls[index];
                    const animationStyle = {
                        left: piece.left,
                        backgroundColor: piece.color,
                        opacity: fall.interpolate({
                            inputRange: [0, 0.03, 0.92, 1],
                            outputRange: [0, 1, 1, 0],
                        }),
                        transform: [
                            {
                                translateY: fall.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-110, 1180],
                                }),
                            },
                            {
                                translateX: fall.interpolate({
                                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                                    outputRange: [
                                        0,
                                        piece.drift,
                                        -piece.drift * 0.65,
                                        piece.drift * 0.45,
                                        0,
                                    ],
                                }),
                            },
                            {
                                rotate: fall.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["0deg", `${piece.turn}deg`],
                                }),
                            },
                        ],
                    };

                    return (
                        <Animated.View
                            key={`${piece.left}-${index}`}
                            style={[confirmUI.confetti, animationStyle]}
                        />
                    );
                })}
            </View>
            <View style={confirmUI.actions}>
                <Pressable
                    onPress={() => router.push("/Contacts")}
                    style={confirmUI.primary}
                >
                    <Text style={confirmUI.primaryText}>
                        Message the sellers
                    </Text>
                </Pressable>
                <View style={confirmUI.secondaryActions}>
                    <Pressable
                        onPress={() => router.replace("/home")}
                        style={[confirmUI.secondary, confirmUI.lightShadow]}
                    >
                        <Text style={confirmUI.secondaryText}>Go home</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push("/Store")}
                        style={[confirmUI.secondary, confirmUI.lightShadow]}
                    >
                        <Text style={confirmUI.secondaryText}>
                            Keep browsing
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Base>
    );
}
const confirmUI = StyleSheet.create({
    screen: { overflow: "hidden" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    lightShadow: {},
    screenConfettiLayer: {
        ...StyleSheet.absoluteFillObject,
        overflow: "hidden",
    },
    confetti: {
        position: "absolute",
        top: 0,
        width: 9,
        height: 17,
        borderRadius: 2,
    },
    icon: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    schoolIcon: { top: -22, left: -55 },
    flaskIcon: { top: -16, right: -50 },
    bookIcon: { top: 111, left: -45 },
    hero: {
        width: 230,
        height: 170,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    check: {
        width: 132,
        height: 132,
        borderRadius: 66,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    checkReveal: {
        position: "absolute",
        left: 20,
        top: 22,
        height: 90,
        overflow: "hidden",
    },
    grade: {
        position: "absolute",
        top: 79,
        right: 0,
        width: 81,
        height: 81,
        borderRadius: 41,
        borderWidth: 4,
        borderColor: "#C0392B",
        backgroundColor: colors.appBg,
        alignItems: "center",
        justifyContent: "center",
    },
    gradeText: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 50,
        color: "#C0392B",
    },
    title: {
        marginTop: 12,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 42,
        letterSpacing: -1.5,
        color: colors.maroon,
    },
    plan: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 25,
        color: colors.muted,
        marginTop: 17,
    },
    schedule: {
        width: "100%",
        marginTop: 12,
        padding: 15,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 4,
        gap: 15,
        backgroundColor: colors.white,
    },
    scheduleTitle: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 25,
        color: colors.maroon,
    },
    scheduleRow: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    schedulePerson: { flex: 1 },
    person: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 16,
        lineHeight: 19,
        color: colors.ink,
    },
    location: {
        fontFamily: "Outfit",
        fontSize: 12,
        color: colors.muted,
        marginTop: 5,
    },
    when: {
        fontFamily: "Outfit",
        fontSize: 14,
        lineHeight: 19,
        fontWeight: "700",
        color: colors.maroon,
        flex: 1,
        textAlign: "center",
    },
    items: {
        fontFamily: "Outfit",
        fontSize: 12,
        lineHeight: 19,
        color: colors.muted,
        textAlign: "right",
    },
    actions: { gap: 10, paddingBottom: 8, flexShrink: 0 },
    secondaryActions: { flexDirection: "row", gap: 10, height: 48 },
    primary: {
        height: 48,
        minHeight: 48,
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryText: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 16,
        color: colors.white,
    },
    secondary: {
        height: 48,
        minHeight: 48,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    secondaryText: {
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 16,
        color: colors.maroon,
    },
});
