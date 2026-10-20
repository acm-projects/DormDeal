import { StyleSheet, View, Image } from 'react-native'
import { Header1 } from '../components/text_styles'
import Text from '../components/text_styles'
import Nav_Button from '../components/nav_button'
import Base from '../components/base'
import styles from '../../root_styles'

const Landing_Page = () => {
    return (
        <Base>
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
                <Header1 style={{textAlign: 'center'}}>DormDeal</Header1>
            </View>
            <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
                <View style={landing_styles.temp_box}>
                    <Text>insert useless content here.</Text>
                </View>
                <Text style={{fontSize: 28}}>Marketplace for students,<br/>by <Text style={{fontFamily: 'Caveat', fontSize: 34, fontWeight: 'bold'}}>students.</Text></Text>
            </View>
            <View style={landing_styles.button_container}>
                <Nav_Button href="/Login" text="Login" 
                    m_style={[landing_styles.default_button, {backgroundColor: '#FFF'}]} 
                    txt_style={[landing_styles.default_text, {borderBottomWidth: 0, color: '#000'}]}>
                </Nav_Button>
                <Nav_Button href="/SignUp" text="Sign Up" 
                    m_style={[landing_styles.default_button, {backgroundColor: '#800000'}]} 
                    txt_style={[landing_styles.default_text, {borderBottomWidth: 0, color: '#FFF'}]}>
                </Nav_Button>
            </View>
        </Base>
    );
}

const landing_styles = StyleSheet.create({ 
    temp_box: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#FFF",
        marginTop: 25,
        marginBottom: 25,
        borderRadius: '50%',
        width: 300,
        height: 300,
    },

    default_text: {
        fontFamily: 'Outfit',
        fontSize: 17,
        textAlign: 'center',
    },

    button_container: {
        flex: 1,
        justifyContent: 'center',
    },
    default_button: {
        backgroundColor: '#FFF',
        width: '100%',
        marginTop: 15,
        borderRadius: 24,
        padding: 10,
        textAlign: 'center',
    },
})

export default Landing_Page;