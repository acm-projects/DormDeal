import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../../components/nav_button'
import styles from '../../../styles'

import Logo from '../../../../assets/images/icon.png'

const Reminders = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Don't forget.. Or Else.. (Reminders)</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store" text="Store Page"></Nav_Button>
                <Nav_Button href="/Messages/1" text="Messages Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Marketplace/3" text="Listing Page"></Nav_Button>
                <Nav_Button href="/Profile" text="Go To Profile Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Reminders