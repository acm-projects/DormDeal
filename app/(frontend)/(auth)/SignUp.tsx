import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import Nav_Button from '../components/nav_button'
import Base from '../components/base'
import Account_Text_Input from '../components/account_text_input'
import { Header1, ErrorText } from '../components/text_styles'
import line_bar from '../../../assets/svgs/line.svg'
import line_bar2 from '../../../assets/svgs/line2.svg'
import styles from '../../root_styles'

const SignUp: React.FC = () => {
    return (
        <Base>
            {/* actual container */}
            <View style={login_styles.container}>
                <View style={[login_styles.base_row_flex_setup, {alignItems: 'center', justifyContent: 'flex-end', marginBottom: 25}]}>
                    <Header1>sign up</Header1>
                </View>

                <View style={[login_styles.base_row_flex_setup]}>
                    {/* 
                    <Account_Text_Input placeholder='Username' img_source={line_bar}></Account_Text_Input>
                    <Account_Text_Input placeholder='Password' img_source={line_bar2}></Account_Text_Input>
                    <Account_Text_Input placeholder='Confirm Password' img_source={line_bar2}>
                        <ErrorText style={login_styles.extra_text_guide}>Error Example.</ErrorText>
                    </Account_Text_Input>
                    */}

                    <View style={{flex: 1}}>
                        <TextInput style={[login_styles.text_input]} placeholder='Username'></TextInput>
                        <Image source={line_bar} style={[login_styles.line_bar]}/>
                    </View>
                    <View style={{flex: 1}}>
                        <TextInput style={[login_styles.text_input]} placeholder='Password'></TextInput>
                        <Image source={line_bar2} style={[login_styles.line_bar]}/>
                    </View>
                    <View style={{flex: 1}}>
                        <TextInput style={[login_styles.text_input]} placeholder='Confirm Password'></TextInput>
                        <Image source={line_bar2} style={[login_styles.line_bar]}/>
                        <Text style={[login_styles.extra_text_guide, {color: "#800000", fontWeight: 'bold'}]}>Error Example.</Text>
                    </View>
                </View>
                
                <View style={[login_styles.base_row_flex_setup, {marginTop: 25}]}>
                    <Nav_Button href="/" text="Sign Up"
                        m_style={[login_styles.default_button, {backgroundColor: '#800000', paddingTop: 3, paddingBottom: 3}]}
                        txt_style={{color: '#FFF', fontFamily: 'Caveat', borderBottomWidth: 0}}>
                    </Nav_Button>
                </View>
            </View>
        </Base>
    );
};

export default SignUp;

const login_styles = StyleSheet.create({
    header_1: {
        fontFamily: 'Outfit',
        fontWeight: 'bold',
        fontSize: 48,
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
        textAlign: 'left',
        fontSize: 13,
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