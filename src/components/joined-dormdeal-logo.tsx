import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { colors } from "../../app/root_styles";

export function JoinedDormDealLogo() {
    const swing = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(swing, {
                    toValue: 1,
                    duration: 3600,
                    useNativeDriver: false,
                }),
                Animated.timing(swing, {
                    toValue: 0,
                    duration: 3600,
                    useNativeDriver: false,
                }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [swing]);

    const tagRotation = swing.interpolate({
        inputRange: [0, 1],
        outputRange: ["-5deg", "5deg"],
    });

    return (
        <View
            accessible
            accessibilityLabel="DormDeal logo with a swinging Deal tag attached to the letter m"
            style={styles.logo}
        >
            <Text style={styles.word}>Dorm</Text>
            <Svg
                width={58}
                height={126}
                viewBox="0 0 58 126"
                style={styles.string}
            >
                <Path
                    d="M33 0 C16 9 16 30 33 38 C48 46 48 60 33 68 V126"
                    fill="none"
                    stroke={colors.ink}
                    strokeWidth={2}
                    strokeLinecap="round"
                />
            </Svg>
            <Animated.View
                style={[
                    styles.tagWrap,
                    { transform: [{ rotate: tagRotation }] },
                ]}
            >
                <DealTag />
            </Animated.View>
            <Svg width={190} height={12} style={styles.squiggle}>
                <Path
                    d="M2 7 Q20 1 38 7 T74 7 T110 7 T146 7 T188 6"
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
        height: 330,
        position: "relative",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    word: {
        top: 45,
        alignSelf: "center",
        position: "absolute",
        zIndex: 1,
        color: colors.ink,
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 102,
        letterSpacing: -5,
    },
    string: {
        position: "absolute",
        top: 122,
        left: 32,
        zIndex: 2,
    },
    tagWrap: {
        position: "absolute",
        top: 208,
        left: 40,
        zIndex: 3,
        elevation: 3,
        transformOrigin: "25px 40px",
    },
    squiggle: { position: "absolute", top: 168 },
});
