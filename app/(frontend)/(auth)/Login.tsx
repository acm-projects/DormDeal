import { useState } from 'react';
import { StyleSheet, Image, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Header1, ErrorText } from '../components/text_styles'
import Base from '../components/base'
import microsoft_logo from '../../../assets/images/microsoft.png'
import line_bar from '../../../assets/svgs/line.svg'
import line_bar2 from '../../../assets/svgs/line2.svg'
import { signInWithMicrosoft, signInWithPassword } from '../../../lib/auth'
import styles from '../../root_styles'

const Login: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password) return setMessage('Enter your email and password.');
        try {
            setLoading(true);
            setMessage('');
            await signInWithPassword(email.trim(), password);
            router.replace('/');
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
                <Header1>login</Header1>
            </View>

            <View style={[login_styles.base_row_flex_setup, {flex: 0.66, display: 'flex'}]}>
                <View style={{flex: 1}}>
                    <TextInput style={[login_styles.text_input]} placeholder='Email'
                        value={email} onChangeText={setEmail}
                        autoCapitalize='none' keyboardType='email-address'></TextInput>
                    <Image source={line_bar} style={[login_styles.line_bar]}/>
                    {message ? (
                        <ErrorText style={login_styles.extra_text_guide}>{message}</ErrorText>
                    ) : null}
                </View>
                <View style={{flex: 1}}>
                    <TextInput style={[login_styles.text_input]} placeholder='Password'
                        value={password} onChangeText={setPassword}
                        secureTextEntry autoCapitalize='none'></TextInput>
                    <Image source={line_bar2} style={[login_styles.line_bar]}/>
                    <Text style={[login_styles.extra_text_guide, {color: "#B26666"}]}>Forgot your password?</Text>
                </View>
            </View>

            <View style={[login_styles.base_row_flex_setup, {marginTop: 25}]}>
                <TouchableOpacity onPress={handleLogin} disabled={loading}
                    style={[login_styles.default_button, {backgroundColor: '#800000', paddingTop: 3, paddingBottom: 3, opacity: loading ? 0.6 : 1}]}>
                    <Text style={{color: '#FFF', fontFamily: 'Caveat', fontSize: 20, textAlign: 'center'}}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={signInWithMicrosoft} style={[login_styles.default_button, {marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 3, paddingBottom: 3}]}>
                    <Image source={microsoft_logo} style={{marginRight: 5, width: 25, height: 25}}></Image>
                    <Text style={{fontFamily: 'Caveat', fontSize: 20, textAlign: "center"}}>Microsoft Login</Text>
                </TouchableOpacity>
            </View>
        </Base>
    );
};

export default Login;

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