import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import component_root_styles from "../../app/root_styles";

const Search_Bar = ({
    placeholder = "",
    style = {},
    inputStyle = null,
    ...inputProps
}) => {
    return (
        <View style={[styles.search_bar_container, style]}>
            <TextInput
                {...inputProps}
                style={[
                    component_root_styles.default_text,
                    styles.search_bar_txt,
                    inputStyle,
                ]}
                placeholder={placeholder}
            />
            <View pointerEvents="none" style={styles.search_divider} />
            <Pressable
                onPress={inputProps.onSubmitEditing}
                style={styles.search_button}
                accessibilityLabel="Search"
            >
                <Ionicons name="search-outline" size={23} color="#777" />
            </Pressable>
        </View>
    );
};

export default Search_Bar;

const styles = StyleSheet.create({
    search_bar_container: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        flexShrink: 1,
        minWidth: 0,
        backgroundColor: "#E4E4E4",
        borderWidth: 1,
        borderColor: "#CCCCCC",
        width: "100%",
        height: 45,
        borderRadius: 24,
        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.08)",
    },
    search_bar_txt: {
        flex: 1,
        minWidth: 0,
        paddingLeft: 20,
        paddingRight: 4,
        marginRight: 0,
        borderRadius: 24,
        height: "100%",
        fontWeight: "bold",
        textAlign: "left",
        color: "#7D7D7D",
    },
    search_button: {
        width: 38,
        height: 44,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    search_divider: {
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        height: 1,
        backgroundColor: "#808080",
        opacity: 0.2,
        zIndex: 2,
    },
});
