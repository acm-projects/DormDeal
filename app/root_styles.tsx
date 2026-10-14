import { StyleSheet } from 'react-native';

export const component_root_styles = StyleSheet.create({
    default_text: {
        fontFamily: 'Outfit',
        fontWeight: 'regular',
        textAlign: 'center',
        color: "#000",
        fontSize: 17,
    }
})
const base_styles = StyleSheet.create({
    navigation: {
        flexDirection: 'row',
        columnGap: 15,
    },
    img: {
        width: 50,
        height: 50,
    },
    nav_button: {
        fontFamily: 'Outfit',
        textAlign: 'center',
        fontSize: 17,
        borderBottomWidth: 2,
    }
});

export default base_styles;
