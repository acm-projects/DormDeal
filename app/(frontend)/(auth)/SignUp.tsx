import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Base from '../components/base';
import { BackButton, PrimaryButton } from '../components/design';
import { colors } from '../../root_styles';
import { signInWithMicrosoft, signUpWithPassword } from '../../../lib/auth';
import MicrosoftLogo from '../../../assets/images/microsoft.png';
const SignUp = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const submit = async () => {
        if (!name.trim() || !email.trim()) return setMessage('Please fill in all fields.');
        if (password.length < 8) return setMessage('Password must be at least 8 characters.');
        if (password !== confirm) return setMessage("Passwords don't match");
        setLoading(true);
        setMessage('');
        try {
            const result = await signUpWithPassword(name.trim(), email.trim(), password);
            const createdAccount = (result.user?.identities?.length ?? 0) > 0;
            if (!createdAccount) {
                setMessage('An account already exists for that email. Please log in instead.');
            } else if (result.session) {
                router.replace('/Joined');
            } else {
                setMessage('Check your email to confirm your account, then log in.');
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Unable to sign up. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return <Base><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <BackButton onPress={() => router.replace('/Landing')} /><Text style={styles.title}>sign up</Text>
                <View style={styles.form}>
                        <Field value={name} onChangeText={setName} placeholder="Username" />
                        <Field value={email} onChangeText={setEmail} placeholder="School email" keyboardType="email-address" />
                        <View style={styles.passwordRow}><Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPassword} noLine /><Pressable onPress={() => setShowPassword(value => !value)} style={styles.show}><Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text></Pressable></View><View style={styles.line} />
                        <Field value={confirm} onChangeText={setConfirm} placeholder="Confirm Password" secureTextEntry={!showPassword} highlightPink />
                        <Text style={styles.error}>{message}</Text><PrimaryButton onPress={submit} disabled={loading}>{loading ? 'Signing up...' : 'Sign Up!'}</PrimaryButton><Pressable accessibilityLabel="Sign up with Microsoft" onPress={signInWithMicrosoft} style={microsoftStyle.button}><Image source={MicrosoftLogo} style={microsoftStyle.logo} /><Text style={microsoftStyle.text}>Sign up with Microsoft</Text></Pressable>
                </View>
                <View style={styles.footer}><Text style={styles.footerText}>Already have an account? </Text><Pressable onPress={() => router.push('/Login')}><Text style={styles.link}>Log in</Text></Pressable></View>
        </ScrollView></KeyboardAvoidingView></Base>;
};
const Field = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    noLine,
    highlightPink
}: any) => <><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#777" secureTextEntry={secureTextEntry} keyboardType={keyboardType} style={[styles.input, noLine && styles.passwordInput, highlightPink && styles.pink]} />{!noLine && <View style={styles.line} />}</>;
const microsoftStyle = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 4,
        backgroundColor: colors.white,
        borderColor: '#E5DDDA',
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12
    },
    logo: {
        width: 28,
        height: 28,
        resizeMode: 'contain'
    },
    text: {
        fontFamily: 'Caveat',
        fontWeight: '700',
        fontSize: 26,
        color: colors.ink
    }
});
const styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    content: {
        flexGrow: 1,
        paddingTop: 8,
        paddingHorizontal: 14,
        paddingBottom: 18
    },
    title: {
        textAlign: 'center',
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 64,
        fontWeight: '700',
        marginTop: 80,
        marginBottom: 60
    },
    form: {
        paddingHorizontal: 20,
        gap: 12
    },
    input: {
        height: 42,
        fontFamily: 'Outfit',
        fontSize: 20,
        color: colors.ink,
        paddingHorizontal: 8
    },
    passwordInput: {
        width: '100%',
        paddingRight: 82
    },
    line: {
        height: 3,
        backgroundColor: colors.ink
    },
    passwordRow: {
        height: 56,
        width: '100%',
        position: 'relative',
        justifyContent: 'center',
        backgroundColor: 'rgba(246,224,74,0.65)'
    },
    pink: {
        backgroundColor: 'rgba(243,166,198,0.7)'
    },
    show: {
        position: 'absolute',
        right: 10,
        minWidth: 58,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    showText: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontWeight: '700'
    },
    error: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontWeight: '700',
        minHeight: 20
    },
    marker: {
        color: '#E58BB3',
        fontSize: 40,
        textAlign: 'right',
        transform: [{
            rotate: '-10deg'
        }]
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: 24
    },
    footerText: {
        fontFamily: 'Outfit',
        fontSize: 15
    },
    link: {
        color: colors.maroon,
        textDecorationLine: 'underline',
        fontFamily: 'Outfit',
        fontWeight: '700',
        fontSize: 15
    }
});
export default SignUp;
