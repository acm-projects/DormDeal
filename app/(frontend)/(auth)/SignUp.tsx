import { useState } from 'react';
import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Base from '../components/base'
import Account_Text_Input from '../components/account_text_input'
import { Header1, ErrorText } from '../components/text_styles'
import line_bar from '../../../assets/svgs/line.svg'
import line_bar2 from '../../../assets/svgs/line2.svg'
import microsoft_logo from '../../../assets/images/microsoft.png'
import { signInWithMicrosoft, signUpWithPassword } from '../../../lib/auth'
import styles from '../../root_styles'

const SignUp: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim()) return setMessage('Please fill in all fields.');
        if (password.length < 8) return setMessage('Password must be at least 8 characters.');
        if (password !== confirm) return setMessage('Passwords do not match.');
        try {
            setLoading(true);
            setMessage('');
            const data = await signUpWithPassword(name.trim(), email.trim(), password);
            if (data.session) router.replace('/');
            else setMessage('Check your email to confirm your account, then log in.');
        } catch (e: any) {
            setMessage(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Base>
            {/* actual container */}
            <View style={[login_styles.base_row_flex_setup, {alignItems: 'center', justifyContent: 'flex-end', marginBottom: 25}]}>
                <Header1 style={{marginBottom: 0}}>sign up</Header1>
            </View>

            <View style={[login_styles.base_row_flex_setup]}>
                <View style={{flex: 1}}>
                    <TextInput style={[login_styles.text_input]} placeholder='Username'
                        value={name} onChangeText={setName}></TextInput>
                    <Image source={line_bar} style={[login_styles.line_bar]}/>
                </View>
                <View style={{flex: 1}}>
                    <TextInput style={[login_styles.text_input]} placeholder='Email'
                        value={email} onChangeText={setEmail}
                        autoCapitalize='none' keyboardType='email-address'></TextInput>
                    <Image source={line_bar2} style={[login_styles.line_bar]}/>
                </View>
                <View style={{flex: 1}}>
                    <TextInput style={[login_styles.text_input]} placeholder='Password'
                        value={password} onChangeText={setPassword}
                        secureTextEntry autoCapitalize='none'></TextInput>
                    <Image source={line_bar2} style={[login_styles.line_bar]}/>
                </View>
                <View style={{flex: 1}}>
                    <TextInput style={[login_styles.text_input]} placeholder='Confirm Password'
                        value={confirm} onChangeText={setConfirm}
                        secureTextEntry autoCapitalize='none'></TextInput>
                    <Image source={line_bar2} style={[login_styles.line_bar]}/>
                    {message ? (
                        <Text style={[login_styles.extra_text_guide, {color: "#800000", fontWeight: 'bold'}]}>{message}</Text>
                    ) : null}
                </View>
            </View>

            <View style={[login_styles.base_row_flex_setup, {marginTop: 25}]}>
                <TouchableOpacity onPress={handleSignUp} disabled={loading}
                    style={[login_styles.default_button, {backgroundColor: '#800000', paddingTop: 3, paddingBottom: 3, opacity: loading ? 0.6 : 1}]}>
                    <Text style={{color: '#FFF', fontSize: 22, fontFamily: 'Caveat', textAlign: 'center'}}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={signInWithMicrosoft} style={[login_styles.default_button, {marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 3, paddingBottom: 3}]}>
                    <Image source={microsoft_logo} style={{marginRight: 5, width: 25, height: 25}}></Image>
                    <Text style={{fontFamily: 'Caveat', fontSize: 20, textAlign: "center"}}>Microsoft Sign Up</Text>
                </TouchableOpacity>
            </View>
        </Base>
    );
};

export default SignUp;

// login_styles stays exactly as you have it
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
        width: '100%',
    },
    default_button: {
        backgroundColor: '#FFF',
        width: '100%',
        borderRadius: 24,
        padding: 7,
        textAlign: 'center',
    },
})