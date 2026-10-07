import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../../styles'

import Logo from '../../../../assets/icon.png'

const Reminders = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Don't forget.. Or Else.. (Reminders)</Text>
            <View style={styles.navigation}>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
                <Link href="/Messages" style={[styles.card, {marginTop: 20}]}>Messages Page</Link>
                <Link href="/Store/Listing/Marketplace" style={[styles.card, {marginTop: 20}]}>Listing Page</Link>
                <Link href="/Profile" style={[styles.card, {marginTop: 20}]}>Go To Profile Page</Link>
            </View>
        </View>
    );
}

export default Reminders