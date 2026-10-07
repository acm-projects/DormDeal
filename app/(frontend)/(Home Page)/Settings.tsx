import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../styles'

import Logo from '../../../assets/icon.png'

const Settings = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Change Settings Moment.</Text>
            <View style={styles.navigation}>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
            </View>
        </View>
    );
}

export default Settings