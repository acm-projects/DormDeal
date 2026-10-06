import { StyleSheet, Text, View } from 'react-native';

const About = () => {
    return (
        <View>
            <Text style={styles.title}>
                About Me
            </Text>
            <Text style={styles.text}>
                I didn't know that this was the About Me Page.
            </Text>
        </View>
    );
};

export default About

const styles = StyleSheet.create({
    title: {
        fontWeight: 800,
        fontSize: 32,
        color: "#6d0000",
        marginBottom: 25,
    },

    text: {
        fontSize: 16,
        color: "#FFF",
    }
})