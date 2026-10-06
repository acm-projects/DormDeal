import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'

import Logo from '../assets/icon.png'

const App = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is technically, the home page.</Text>
            <Link href="/Listings" style={[styles.card, {marginTop: 20}]}>Listings Page</Link>
            <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
            <Link href="/Landing" style={[styles.card, {marginTop: 20}]}>Landing Page</Link>
            <Link href="/Landing" style={[styles.card, {marginTop: 20}]}>Landing Page</Link>
            <Link href="/Landing" style={[styles.card, {marginTop: 20}]}>Landing Page</Link>
        </View>
    );
}

export default App

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
