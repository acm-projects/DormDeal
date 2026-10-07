import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router'
import paperbg from '../../../assets/paper_bg.png'
import microsoft_logo from '../../../assets/microsoft.png'
import styles from '../../styles'

const Login: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image source={paperbg} style={styles.image_bg}/>
            {/* actual container */}
            <View style={login_styles.container}>
                <View style={[login_styles.base_row_flex_setup, {justifyContent: 'flex-end', marginBottom: 25}]}>
                    <Text style={[styles.default_text, login_styles.default_text]}>
                        Login Page
                    </Text>
                </View>
                <View style={[login_styles.base_row_flex_setup, {}]}>
                    <TextInput style={[styles.default_text, login_styles.text_input]} placeholder='Username'></TextInput>
                    <Text style={[login_styles.extra_text_guide, {color: "#800000"}]}>Error Example.</Text>
                    <TextInput style={[styles.default_text, login_styles.text_input, {marginTop: 10,}]} placeholder='Password'></TextInput>
                    <Text style={[login_styles.extra_text_guide, {color: "#B26666"}]}>Forgot your password?</Text>
                </View>
                <View style={[login_styles.base_row_flex_setup, {marginTop: 25}]}>
                    <Link href="/" style={[login_styles.default_button, {fontFamily: 'Gloria Hallelujah', backgroundColor: '#800000', color: '#FFF'}]}>Login! (temporarially directs you to home page)</Link>
                    <TouchableOpacity style={[login_styles.default_button, {marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}]}>
                        <Image source={microsoft_logo} style={{marginRight: 5, width: 25, height: 25}}></Image>
                        <Text style={{fontFamily: 'Gloria Hallelujah', textAlign: "center"}}>Login With Microsoft OAuth</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Login;

const login_styles = StyleSheet.create({
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