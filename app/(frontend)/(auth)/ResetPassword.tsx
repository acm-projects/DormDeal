import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function ResetPassword() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') setReady(true);
        });

        supabase.auth.getSession().then(({ data: sessionData }) => {
            if (sessionData.session) setReady(true);
        });

        return () => data.subscription.unsubscribe();
    }, []);

    const save = async () => {
        if (password.length < 8) {
            setMessage('Use at least 8 characters.');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage('Password updated. Please log in.');
        await supabase.auth.signOut();
        setTimeout(() => router.replace('/Login'), 1200);
    };

    if (!ready) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
                <Text>Open this page from the link in your reset email.</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
            <Text style={{ marginBottom: 8 }}>New password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
            />
            <Pressable onPress={save} style={{ backgroundColor: '#800000', borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save password</Text>
            </Pressable>
            {message ? <Text style={{ marginTop: 12 }}>{message}</Text> : null}
        </View>
    );
}
