import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import styles from '../../styles'

import Logo from '../../../assets/images/icon.png'

const Create_Listing = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Create a Listing directly here.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Store/Listing/Service/1" text="If Made Listing, go here. (one or the other works)"></Nav_Button>
                <Nav_Button href="/Listings" text="Your Listings Page"></Nav_Button>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store" text="Store Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Create_Listing