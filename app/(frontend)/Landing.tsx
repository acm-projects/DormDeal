import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import paperbg from '../../assets/paper_bg.png'

const Landing_Page = () => {
    return (
        <View style={styles.container}>
            {/* background */}
            <Image source={paperbg} style={styles.image_bg}/>
            {/* main work */}
            <Text style={styles.header_1}>DormDeal</Text>
            <View style={styles.temp_box}>
                <Text>insert useless content here.</Text>
            </View>
            <Text style={styles.header_2}>Marketplace for students,<br/>by <Text style={{fontFamily: 'Gloria Hallelujah'}}>students.</Text></Text>
            <View style={styles.button_container}>
                <TouchableOpacity style={[styles.default_button, {backgroundColor: '#FFF'}]}>
                    <Text style={[styles.default_text, {color: '#000'}]}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.default_button, {backgroundColor: '#800000'}]}>
                    <Text style={[styles.default_text, {color: '#FFF'}]}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        height: 300,
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
        bottom: 75,
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