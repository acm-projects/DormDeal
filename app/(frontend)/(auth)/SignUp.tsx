import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import Nav_Button from '../components/nav_button'
import paperbg from '../../../assets/paper_bg.png'
import microsoft_logo from '../../../assets/microsoft.png'
import styles from '../../styles'

const SignUp: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image source={paperbg} style={styles.image_bg}/>
            {/* actual container */}
            <View style={signup_styles.container}>
                <View style={[signup_styles.base_row_flex_setup, {justifyContent: 'flex-end', marginBottom: 25}]}>
                    <Text style={[styles.default_text, signup_styles.default_text]}>
                        Sign Up Page
                    </Text>
                </View>
                <View style={[signup_styles.base_row_flex_setup, {}]}>
                    <TextInput style={[styles.default_text, signup_styles.text_input]} placeholder='Username'></TextInput>
                    <TextInput style={[styles.default_text, signup_styles.text_input, {marginTop: 10,}]} placeholder='Password'></TextInput>
                    <TextInput style={[styles.default_text, signup_styles.text_input, {marginTop: 10,}]} placeholder='Confirm Password'></TextInput>
                    <Text style={[signup_styles.extra_text_guide, {color: "#800000"}]}>Error Example.</Text>
                </View>
                <View style={[signup_styles.base_row_flex_setup, {marginTop: 25}]}>
                    <Nav_Button href="/" text="Sign Up! (temporarially directs you to home page)"
                        m_style={[signup_styles.default_button, {backgroundColor: '#800000'}]}
                        txt_style={{color: '#FFF', fontFamily: 'Gloria Hallelujah', borderBottomWidth: 0}}>
                    </Nav_Button>

                    <TouchableOpacity style={[signup_styles.default_button, {marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}]}>
                        <Image source={microsoft_logo} style={{marginRight: 5, width: 25, height: 25}}></Image>
                        <Text style={{fontFamily: 'Gloria Hallelujah', textAlign: "center"}}>Sign Up With Microsoft OAuth</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default SignUp;

const signup_styles = StyleSheet.create({
    header_1: {
        fontSize: 34,
    },
    default_text: {
        fontFamily: 'Gloria Hallelujah',
        color: "#000000",
    },
    text_input: {
        fontFamily: 'Gloria Hallelujah',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 17,
        paddingRight: 17,
        borderStyle: 'dashed',
        textAlign: 'left',
        height: 'auto',
        flex: 1,
    },
    extra_text_guide: {
        flex: 1, 
        marginTop: 5, 
        marginLeft: 17,
        fontWeight: '600',
    },
    container: {
        paddingTop: 50,
        paddingBottom: 50,
        height: '100%',
        width: '100%',
    },
    base_row_flex_setup: {
        flex: 1,
        width: '80%',
        marginLeft: '10%',
        marginRight: '10%',
    },
    default_button: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 24,
        padding: 7,
        textAlign: 'center',
    },
})