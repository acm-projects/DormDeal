import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import Nav_Button from '../components/nav_button'
import paperbg from '../../../assets/images/paper_bg.png'
import microsoft_logo from '../../../assets/images/microsoft.png'
import login_header from '../../../assets/images/login_header.png'
import line_bar from '../../../assets/svgs/line.svg'
import line_bar2 from '../../../assets/svgs/line2.svg'
import styles from '../../styles'

const Login: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image source={paperbg} style={styles.image_bg}/>
            {/* actual container */}
            <View style={login_styles.container}>
                <View style={[login_styles.base_row_flex_setup, {alignItems: 'center', justifyContent: 'flex-end', marginBottom: 25}]}>
                    <Text style={[styles.default_text, login_styles.default_text, login_styles.header_1]}>
                        Sign Up
                    </Text>
                </View>

                <View style={[login_styles.base_row_flex_setup, {flex: 1}]}>
                    <View style={{flex: 1}}>
                        <TextInput style={[styles.default_text, login_styles.text_input]} placeholder='Username'></TextInput>
                        <Image source={line_bar} style={[login_styles.line_bar]}/>
                    </View>
                    <View style={{flex: 1}}>
                        <TextInput style={[styles.default_text, login_styles.text_input]} placeholder='Password'></TextInput>
                        <Image source={line_bar2} style={[login_styles.line_bar]}/>
                    </View>
                    <View style={{flex: 1}}>
                        <TextInput style={[styles.default_text, login_styles.text_input]} placeholder='Confirm Password'></TextInput>
                        <Image source={line_bar2} style={[login_styles.line_bar]}/>
                        <Text style={[login_styles.extra_text_guide, {color: "#800000", fontWeight: 'bold'}]}>Error Example.</Text>
                    </View>
                </View>
                
                <View style={[login_styles.base_row_flex_setup, {marginTop: 25}]}>
                    <Nav_Button href="/" text="Sign Up"
                        m_style={[login_styles.default_button, {backgroundColor: '#800000', paddingTop: 3, paddingBottom: 3}]}
                        txt_style={{color: '#FFF', fontFamily: 'Gloria Hallelujah', borderBottomWidth: 0}}>
                    </Nav_Button>
                </View>
            </View>
        </View>
    );
};

export default Login;

const login_styles = StyleSheet.create({
    header_1: {
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        fontSize: 34,
        color: '#800000',
    },
    default_text: {
        fontFamily: 'Gloria Hallelujah',
        color: "#000000",
    },
    line_bar: {
        position: 'relative',
        top: 5,
        width: '100%',
    },
    text_input: {
        fontSize: 17,
        fontFamily: 'Outfit',
        fontWeight: 'regular',
        borderStyle: 'dashed',
        textAlign: 'left',
        height: 'auto',
    },
    extra_text_guide: {
        flex: 1, 
        marginTop: 5, 
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