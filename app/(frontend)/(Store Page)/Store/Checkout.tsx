import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../../components/nav_button'
import styles from '../../../styles'

import Logo from '../../../../assets/icon.png'

const Checkout = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is where you're checking out.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Store/Confirmation" text="Confirmation Page"></Nav_Button>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store" text="Store Page"></Nav_Button>
                <Nav_Button href="/Store/Shopping Cart" text="Back to Shopping Cart Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Checkout