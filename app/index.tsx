import { StyleSheet, Text, View, Image } from 'react-native';
import styles from './styles'
import Nav_Button from './(frontend)/components/nav_button'

import Logo from '../assets/icon.png'

const App = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is technically: The home page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Landing" text="Landing Page"></Nav_Button>
                <Nav_Button href="/Store" text="Store Page"></Nav_Button>
                <Nav_Button href="/Listings" text="Listings Page"></Nav_Button>
                <Nav_Button href="/Contacts" text="Contacts Page"></Nav_Button>
                <Nav_Button href="/Profile/1" text="Profile Page"></Nav_Button>
                <Nav_Button href="/Settings" text="Settings Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Marketplace/1" text="Recommended Listing Page"></Nav_Button>
            </View>
        </View>
    );
}

export default App