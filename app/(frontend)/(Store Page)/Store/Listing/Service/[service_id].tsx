import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../../../../root_styles";

const Service_Listing = () => {
    const router = useRouter();
    return (
        <View style={styles.screen}>
            <Pressable
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={[styles.back, styles.lightShadow]}
            >
                <Ionicons name="chevron-back" size={30} color={colors.maroon} />
            </Pressable>
            <View style={styles.content}>
                <View style={styles.hero}>
                    <Ionicons
                        name="school-outline"
                        size={68}
                        color={colors.maroon}
                    />
                </View>
                <Text style={styles.eyebrow}>SERVICE</Text>
                <Text style={styles.title}>This is a service listing.</Text>
                <Text style={styles.copy}>
                    Details, availability, and a way to message the provider
                    will appear here.
                </Text>
            </View>
        </View>
    );
};

export default Service_Listing;

const styles = StyleSheet.create({
    lightShadow: {},
    screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 20 },
    back: {
        width: 56,
        height: 56,
        marginTop: 24,
        backgroundColor: colors.cream,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.08)`,
    },
    content: { flex: 1, justifyContent: "center", gap: 13 },
    hero: {
        width: 112,
        height: 112,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.rose,
        borderRadius: 4,
    },
    eyebrow: {
        fontFamily: "Outfit",
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 2,
        color: colors.maroon,
    },
    title: {
        fontFamily: "Outfit",
        fontSize: 38,
        lineHeight: 42,
        fontWeight: "800",
        color: colors.ink,
    },
    copy: {
        fontFamily: "Outfit",
        fontSize: 17,
        lineHeight: 24,
        color: colors.muted,
    },
});
