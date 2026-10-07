import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../../styles'

import Logo from '../../../../assets/icon.png'

const Confirmation = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Great job larp; you checked it out!</Text>
            <View style={styles.navigation}>
                <Link href="/Messages" style={[styles.card, {marginTop: 20}]}>Messages Page</Link>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
            </View>
        </View>
    );
}

export default Confirmation