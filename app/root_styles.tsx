import { StyleSheet } from 'react-native';

export const colors = {
    maroon: '#800000',
    maroonDark: '#4C0000',
    gold: '#F2B33D',
    goldLight: '#FCEFC9',
    sage: '#9BB08A',
    cream: '#F1EEEA',
    ink: '#1F1414',
    muted: '#6B5E5E',
    white: '#FFFFFF',
    blush: '#F3E3E3',
    maroonLight: '#A8322A',
};

const base_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image_bg: {
        position: 'absolute',
        opacity: 0.35,
        width: '100%',
        height: '100%',
    },
    default_text: {
        fontFamily: 'Outfit',
        fontWeight: 'regular',
        textAlign: 'center',
        color: "#000",
        fontSize: 17,
    }

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
})

export default base_styles;
