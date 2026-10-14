import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import Base from '../components/base'
import styles from '../../root_styles'

import Logo from '../../../assets/images/icon.png'

const Settings = () => {
    return (
        <Base>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Change Settings Moment.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
            </View>
        </Base>
    );
}

export default Settings