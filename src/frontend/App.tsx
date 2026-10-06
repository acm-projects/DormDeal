import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import Home from './Home'
import Logo from '../../assets/icon.png'

export default function App() {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Open up App.js to start working on your app!</Text>
            <View style={styles.card}>
                <Home/>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020202',
        color: "#FFF",
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 800,
        fontSize: 50,
        color: "#FFF",
        marginBottom: 25,
    },
    img: {
        width: 50,
        height: 50,
    },
    card: {
        backgroundColor: "#444",
        padding: 20,
        borderRadius: 10,
        boxShadow: '4px 4px rgb(255, 255, 255)',
    }
});
