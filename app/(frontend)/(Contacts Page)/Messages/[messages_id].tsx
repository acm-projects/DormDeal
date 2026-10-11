import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../../components/nav_button'
import styles from '../../../styles'

import Logo from '../../../../assets/images/icon.png'

const Messages = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Messaging Someone Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Contacts" text="Contacts Page"></Nav_Button>
                <Nav_Button href="/Messages/Reminders" text="Reminders Page"></Nav_Button>
                <Nav_Button href="/Profile" text="Go To Profile Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Messages