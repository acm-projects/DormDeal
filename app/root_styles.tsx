import { StyleSheet } from "react-native";

export const colors = {
    maroon: "#800000",
    maroonDark: "#5A0000",
    gold: "#F6E04A",
    goldLight: "#FFE27A",
    sage: "#6F8F60",
    cream: "#FBF7F0",
    appBg: "#EDEAE4",
    ink: "#2A2A2A",
    muted: "#5B5B5B",
    mutedLight: "#9A8F86",
    divider: "#EFE9E2",
    rose: "#F3DADA",
    roseSelected: "#F8EDED",
    mustard: "#B07A10",
    activeGreen: "#4F7A45",
    tileRed: "#A33A3A",
    switchOff: "#CFCAC2",
    white: "#FFFFFF",
    blush: "#F3DADA",
    maroonLight: "#A8322A",
};

const base_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.appBg,
        alignItems: "center",
        justifyContent: "center",
    },
    image_bg: {
        position: "absolute",
        opacity: 0.35,
        width: "100%",
        height: "100%",
    },
    default_text: {
        fontFamily: "Outfit",
        fontWeight: "400",
        color: colors.ink,
        fontSize: 17,
    },
    navigation: {
        flexDirection: "row",
        columnGap: 15,
    },
    img: {
        width: 50,
        height: 50,
    },
    nav_button: {
        fontFamily: "Outfit",
        textAlign: "center",
        fontSize: 17,
        borderBottomWidth: 2,
    },
});

export default base_styles;
