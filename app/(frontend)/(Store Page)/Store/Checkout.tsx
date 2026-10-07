import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../../styles'

import Logo from '../../../../assets/icon.png'

const Checkout = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is where you're checking out.</Text>
            <View style={styles.navigation}>
                <Link href="/Store/Confirmation" style={[styles.card, {marginTop: 20}]}>Confirmation Page</Link>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
                <Link href="/Store/Shopping Cart" style={[styles.card, {marginTop: 20}]}>Back to Shopping Cart Page</Link>
            </View>
        </View>
    );
}

export default Checkout