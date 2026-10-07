import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../styles'

import Logo from '../../../assets/icon.png'

const Store = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is the Store Page.</Text>
            <View style={styles.navigation}>
                <Link href="/Store/Shopping Cart" style={[styles.card, {marginTop: 20}]}>Shopping Cart Page</Link>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store/Listing/Service" style={[styles.card, {marginTop: 20}]}>Service Listing Page</Link>
                <Link href="/Store/Listing/Marketplace" style={[styles.card, {marginTop: 20}]}>Marketplace Listing Page</Link>
            </View>
        </View>
    );
}

export default Store