import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../styles'

import Logo from '../../../assets/icon.png'

const Messages = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Messaging Someone Page.</Text>
            <View style={styles.navigation}>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Contacts" style={[styles.card, {marginTop: 20}]}>Contacts Page</Link>
                <Link href="/Messages/Reminders" style={[styles.card, {marginTop: 20}]}>Reminders Page</Link>
                <Link href="/Profile" style={[styles.card, {marginTop: 20}]}>Go To Profile Page</Link>
            </View>
        </View>
    );
}

export default Messages