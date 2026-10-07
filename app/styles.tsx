import { StyleSheet } from 'react-native';

const base_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    card: {
        fontFamily: 'Outfit',
        borderBottomWidth: 2,
    }
});

export default base_styles;
