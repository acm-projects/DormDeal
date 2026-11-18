import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { colors } from "../../app/root_styles";

export function JoinedDormDealLogo() {
    const swing = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(swing, {
                    toValue: 1,
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false,
                }),
                Animated.timing(swing, {
                    toValue: 0,
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: false,
                }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [swing]);

    const tagRotation = swing.interpolate({
        inputRange: [0, 1],
        outputRange: ["-2.2deg", "2.2deg"],
    });

    return (
        <View
            accessible
            accessibilityLabel="DormDeal logo with a swinging Deal tag attached to the letter m"
            style={styles.logo}
        >
            <Animated.View
                style={[
                    styles.tagAssembly,
                    { transform: [{ rotate: tagRotation }] },
                ]}
            >
                <View style={styles.string} />
                <View style={styles.tagWrap}>
                    <DealTag />
                </View>
            </Animated.View>
            <Text style={styles.word}>Dorm</Text>
            <Svg width={160} height={12}>
                <Path
                    d="M2 7 Q16 1 30 7 T58 7 T86 7 T114 7 T142 6 T158 6"
                    stroke={colors.maroon}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
}

function DealTag() {
    return (
        <Svg width={150} height={74} viewBox="0 0 150 74">
            <Path
                d="M25 14 H138 a8 8 0 0 1 8 8 V58 a8 8 0 0 1 -8 8 H25 L5 40 Z"
                fill={colors.maroon}
                stroke={colors.maroonDark}
                strokeWidth={3}
            />
            <Circle
                cx={25}
                cy={40}
                r={6}
                fill={colors.appBg}
                stroke={colors.maroonDark}
                strokeWidth={2}
            />
            <SvgText
                x={89}
                y={52}
                fill="white"
                fontFamily="Outfit"
                fontSize={32}
                fontWeight="800"
                textAnchor="middle"
            >
                Deal
            </SvgText>
        </Svg>
    );
}

const styles = StyleSheet.create({
    logo: {
        width: 360,
        height: 210,
        position: "relative",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    word: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 68,
        letterSpacing: -3,
    },
    tagAssembly: {
        position: "absolute",
        // The Joined screen centers its welcome block lower than Landing.
        // Lengthen upward while keeping the tag at the same attachment point.
        top: -473,
        left: "58%",
        width: 150,
        height: 631,
        zIndex: 10,
        elevation: 10,
        transformOrigin: "0px 0px",
    },
    string: {
        position: "absolute",
        height: 595,
        top: 0,
        left: 0,
        borderLeftWidth: 2,
        borderColor: colors.ink,
    },
    tagWrap: {
        position: "absolute",
        top: 555,
        left: -25,
        zIndex: 1,
        elevation: 1,
    },
});
