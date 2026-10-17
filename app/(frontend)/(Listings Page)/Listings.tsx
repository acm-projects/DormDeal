import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import Base from '../components/base'
import styles from '../../root_styles'

import Logo from '../../../assets/images/icon.png'

const Listings = () => {
    return (
        <Base>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is the Listings page.</Text>
            <Text style={{fontFamily: 'Gloria Hallelujah'}}>You make listings here.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Create Listing" text="Create a Listing Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Marketplace/1" text="Listing Page"></Nav_Button>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store" text="Store Page"></Nav_Button>
            </View>
        </Base>
    );
}

export default Listings