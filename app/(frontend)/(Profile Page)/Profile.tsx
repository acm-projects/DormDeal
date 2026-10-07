import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../styles'

import Logo from '../../../assets/icon.png'

const Profile = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is the Profile Page.</Text>
            <View style={styles.navigation}>
                <Link href="/Listings" style={[styles.card, {marginTop: 20}]}>Listings Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
                <Link href="/Contacts" style={[styles.card, {marginTop: 20}]}>Contacts Page</Link>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store/Listing/Marketplace" style={[styles.card, {marginTop: 20}]}>Listing Page</Link>
            </View>
        </View>
    );
}

export default Profile