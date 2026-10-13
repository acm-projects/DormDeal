import { StyleSheet } from 'react-native';

const base_styles = StyleSheet.create({
    navigation: {
        flexDirection: 'row',
        columnGap: 15,
    },
    title: {
        fontWeight: 800,
        fontSize: 50,
        marginBottom: 25,
        fontFamily: 'Outfit',
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
