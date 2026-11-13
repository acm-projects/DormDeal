import { StyleSheet, Pressable } from "react-native";

const Button = ({
    href = "/",
    onPress = () => 1,
    disabled = false,
    style = {},
    children = [],
}) => {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[styles.pressable, style]}
        >
            {children}
        </Pressable>
    );
};

export default Button;

const styles = StyleSheet.create({
    pressable: {
        width: 56,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF8E8",
        borderRadius: 0,
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.12)",
    },
});
