import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../../components/nav_button'
import Base from '../../components/base'
import styles from '../../../root_styles'

import Logo from '../../../../assets/images/icon.png'

const Shopping_Cart = () => {
    return (
        <Base>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>This is the Shopping Cart page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/Store/Checkout" text="Checkout Page"></Nav_Button>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Store" text="Go Back to Store Page"></Nav_Button>
            </View>
        </Base>
    );
}

export default Shopping_Cart