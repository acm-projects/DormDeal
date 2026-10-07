import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from './styles'

import Logo from '../assets/icon.png'

const App = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is technically: The home page.</Text>
            <View style={styles.navigation}>
                <Link href="/Landing" style={[styles.card, {marginTop: 20}]}>Landing Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
                <Link href="/Listings" style={[styles.card, {marginTop: 20}]}>Listings Page</Link>
                <Link href="/Contacts" style={[styles.card, {marginTop: 20}]}>Contacts Page</Link>
                <Link href="/Profile" style={[styles.card, {marginTop: 20}]}>Profile Page</Link>
                <Link href="/Settings" style={[styles.card, {marginTop: 20}]}>Settings Page</Link>
                <Link href="/Store/Listing/Service" style={[styles.card, {marginTop: 20}]}>Recommended Listing Moment</Link>
            </View>
        </View>
    );
}

export default App