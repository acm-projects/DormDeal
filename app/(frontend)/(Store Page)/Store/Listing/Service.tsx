import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../../../styles'

import Logo from '../../../../../assets/icon.png'

const Service_Listing = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is a SERVICES listing.</Text>
            <View style={styles.navigation}>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
                <Link href="/Profile" style={[styles.card, {marginTop: 20}]}>Go to Profile</Link>
            </View>
        </View>
    );
}

export default Service_Listing