import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import paperbg from '../../../assets/paper_bg.png'
import { Link } from 'expo-router'
import styles from '../../styles'

const Landing_Page = () => {
    return (
        <View style={landing_styles.container}>
            {/* background */}
            <Image source={paperbg} style={landing_styles.image_bg}/>
            {/* main work */}
            <Text style={landing_styles.header_1}>DormDeal</Text>
            <View style={landing_styles.temp_box}>
                <Text>insert useless content here.</Text>
            </View>
            <Text style={landing_styles.header_2}>Marketplace for students,<br/>by <Text style={{fontFamily: 'Gloria Hallelujah'}}>students.</Text></Text>
            <View style={landing_styles.button_container}>
                <TouchableOpacity style={[landing_styles.default_button, {backgroundColor: '#FFF'}]}>
                    <Text style={[landing_styles.default_text, {color: '#000'}]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[landing_styles.default_button, {backgroundColor: '#800000'}]}>
                    <Text style={[landing_styles.default_text, {color: '#FFF'}]}>Sign Up</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.navigation}>
                <Link href="/" style={[styles.card, {marginTop: 20}]}>Home Page</Link>
            </View>
        </View>
    );
}

const landing_styles = StyleSheet.create({ 
    container: {
        flex: 1,
        backgroundColor: '#F1EEEA',
        alignItems: 'center',
        justifyContent: 'center',
    },

    header_1: {
        fontFamily: 'Bricolage Grotesque',
        fontWeight: 'bold',
        fontSize: 40,
    },

    header_2: {
        textAlign: 'center',
        fontFamily: 'Outfit',
        fontSize: 24,
    },

    temp_box: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#FFF",
        marginTop: 25,
        marginBottom: 25,
        borderRadius: '50%',
        width: 300,
        height: '30%',
    },

    default_text: {
        fontFamily: 'Outfit',
        fontSize: 17,
        textAlign: 'center',
    },

    image_bg: {
        position: 'absolute',
        opacity: 0.35,
        width: '100%',
        height: '100%',
    },

    button_container: {
        position: 'absolute',
        bottom: '5%',
        margin: 'auto',
        width: '90%',
    },
    default_button: {
        backgroundColor: '#FFF',
        width: '100%',
        marginTop: 15,
        borderRadius: 24,
        padding: 10,
    },
})

export default Landing_Page;