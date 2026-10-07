import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import styles from '../../styles'
import Logo from '../../../assets/icon.png'

const Profile = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is the Profile Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Listings" text="Listings Page"></Nav_Button>
                <Nav_Button href="/Store" text="Store Page"></Nav_Button>
                <Nav_Button href="/Contacts" text="Contacts Page"></Nav_Button>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Marketplace/1" text="Listing Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Profile