import { StyleSheet, Text } from 'react-native';

const Home: React.FC = () => {
    return (
        <Text style={styles.text}>
            This is the home page.
        </Text>
    );
};

export default Home;

const styles = StyleSheet.create({
    text: {
        color: "#FFF",
    }
})