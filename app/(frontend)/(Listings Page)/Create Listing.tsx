import { StyleSheet, Text, View, Image } from 'react-native';
import { Link } from 'expo-router'
import styles from '../../styles'

import Logo from '../../../assets/icon.png'

const Create_Listing = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Create a Listing directly here.</Text>
            <View style={styles.navigation}>
                <Link href="/Store/Listing/Service" style={[styles.card, {marginTop: 20}]}>If Made Listing, go here. (one or the other works)</Link>
                <Link href="/Listings" style={[styles.card, {marginTop: 20}]}>Your Listings Page</Link>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
                <Link href="/Store" style={[styles.card, {marginTop: 20}]}>Store Page</Link>
            </View>
        </View>
    );
}

export default Create_Listing