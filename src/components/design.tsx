import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { colors } from "../../app/root_styles";

export const BackButton = ({ onPress }: { onPress?: () => void }) => {
    const router = useRouter();
    return (
        <Pressable
            accessibilityLabel="Go back"
            onPress={onPress ?? (() => router.back())}
            style={styles.back}
        >
            <Ionicons name="chevron-back" size={30} color={colors.maroon} />
        </Pressable>
    );
};

export const PageTitle = ({
    children,
    handwritten = false,
}: {
    children: ReactNode;
    handwritten?: boolean;
}) => (
    <Text style={[styles.pageTitle, handwritten && styles.handwrittenTitle]}>
        {children}
    </Text>
);

export const Squiggle = () => (
    <View style={styles.squiggle}>
        <Svg width={168} height={16} viewBox="0 0 168 16">
            <Path
                d="M6 9 Q20 3 34 9 T62 9 T90 9 T118 9 T146 8 T162 8"
                stroke={colors.maroon}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
            />
        </Svg>
    </View>
);

export const PhotoBlock = ({
    color = colors.maroon,
    label = "[photo]",
}: {
    color?: string;
    label?: string;
}) => (
    <View style={[styles.photo, { backgroundColor: color }]}>
        <Text style={styles.photoLabel}>{label}</Text>
    </View>
);

export const PrimaryButton = ({
    children,
    onPress,
    disabled,
}: {
    children: ReactNode;
    onPress?: () => void;
    disabled?: boolean;
}) => (
    <Pressable
        disabled={disabled}
        onPress={onPress}
        style={[styles.primary, disabled && { opacity: 0.6 }]}
    >
        <Text style={styles.primaryText}>{children}</Text>
    </Pressable>
);

export const SecondaryButton = ({
    children,
    onPress,
}: {
    children: ReactNode;
    onPress?: () => void;
}) => (
    <Pressable onPress={onPress} style={styles.secondary}>
        <Text style={styles.secondaryText}>{children}</Text>
    </Pressable>
);

export const styles = StyleSheet.create({
    back: {
        width: 56,
        height: 56,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 0,
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.08)`,
    },
    pageTitle: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 52,
        fontWeight: "700",
        letterSpacing: -1.5,
    },
    handwrittenTitle: { fontFamily: "Caveat", fontSize: 40, color: colors.ink },
    squiggle: { width: 168, height: 16, marginTop: 2, overflow: "visible" },
    squiggleLine: {
        borderTopWidth: 3,
        borderColor: colors.maroon,
        borderRadius: 10,
        transform: [{ rotate: "2deg" }],
        marginTop: 4,
    },
    photo: { alignItems: "center", justifyContent: "center" },
    photoLabel: {
        color: colors.rose,
        fontFamily: "Caveat",
        fontWeight: "600",
        fontSize: 19,
    },
    primary: {
        minHeight: 52,
        borderRadius: 6,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    primaryText: {
        color: colors.white,
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 27,
    },
    secondary: {
        minHeight: 52,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
    },
    secondaryText: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 18,
    },
});
