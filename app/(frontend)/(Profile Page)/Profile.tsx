import { StyleSheet, Text } from 'react-native';

const Listings: React.FC = () => {
    return (
        <Text style={styles.header_1}>
            This is the Profile page.
        </Text>
    );
};

export default Listings;

const styles = StyleSheet.create({
    header_1: {
        fontSize: 34,
    },
})