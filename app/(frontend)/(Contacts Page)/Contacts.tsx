import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import styles from '../../styles'
import Logo from '../../../assets/images/icon.png'

const Contacts = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Contacts Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Messages/1" text="Messages Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Service/2" text="Listing from Person"></Nav_Button>
            </View>
        </View>
    );
}

export default Contacts