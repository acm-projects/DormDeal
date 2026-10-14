import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../../components/nav_button'
import Base from '../../components/base'
import styles from '../../../root_styles'

import Logo from '../../../../assets/images/icon.png'

const Messages = () => {
    return (
        <Base>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Messaging Someone Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Contacts" text="Contacts Page"></Nav_Button>
                <Nav_Button href="/Messages/Reminders" text="Reminders Page"></Nav_Button>
                <Nav_Button href="/Profile" text="Go To Profile Page"></Nav_Button>
            </View>
        </Base>
    );
}

export default Messages