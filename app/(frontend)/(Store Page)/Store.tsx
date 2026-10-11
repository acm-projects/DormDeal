import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import styles from '../../styles'

import Logo from '../../../assets/images/icon.png'

const Store = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is the Store Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Store/Shopping Cart" text="Shopping Cart Page"></Nav_Button>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Service/1" text="Service Listing Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Marketplace/1" text="Marketplace Listing Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Store