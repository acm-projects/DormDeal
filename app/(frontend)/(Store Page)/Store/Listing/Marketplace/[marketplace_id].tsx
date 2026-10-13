import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../../../../styles';

const Marketplace_Listing = () => {
    const { marketplace_id } = useLocalSearchParams<{ marketplace_id: string }>(); // the number at the end of the address

    return (
        <View style={page.screen}>
            <Text style={page.test}>You opened item #{marketplace_id}</Text>
        </View>
    );
};

const page = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cream,
    },
    test: {
        fontSize: 24,
        fontFamily: 'Outfit',
        color: colors.maroon,
    },
});

export default Marketplace_Listing;