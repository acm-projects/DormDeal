import { Slot, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// your login page is Login.tsx, so its URL is /Login
const LOGIN_ROUTE = '/Login';

// pages anyone can open without being logged in (last part of the URL, lowercase)
const PUBLIC_PAGES = ['login', 'signup', 'sign_up', 'sign-up', 'landing', 'resetpassword'];

const LoadFonts = () => {
    const [loaded, error] = useFonts({
        'Outfit': require('../assets/fonts/Outfit-VariableFont.ttf'),
        'Caveat': require('../assets/fonts/Caveat-VariableFont.ttf'),
    });

    useEffect(() => {
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }
}

const RootLayout = () => {
    LoadFonts();

    const router = useRouter();
    const segments = useSegments();
    const [checked, setChecked] = useState(false);
    const [signedIn, setSignedIn] = useState(false);

    // are we logged in? (and keep listening for login/logout)
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSignedIn(!!data.session);
            setChecked(true);
        });
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setSignedIn(!!session);
        });
        return () => data.subscription.unsubscribe();
    }, []);

    // not logged in and not on a public page -> go to login
    useEffect(() => {
        if (!checked) return;
        const current = String(segments[segments.length - 1] ?? '').toLowerCase();
        if (!signedIn && !PUBLIC_PAGES.includes(current)) {
            router.replace(LOGIN_ROUTE);
        }
    }, [checked, signedIn, segments]);

    if (!checked) return null;

    return <Slot/>
}

export default RootLayout

/*import { Slot, Stack } from 'expo-router'
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

const LoadFonts = () => {
    const [loaded, error] = useFonts({
        'Outfit': require('../assets/fonts/Outfit-VariableFont.ttf'),
        'Caveat': require('../assets/fonts/Caveat-VariableFont.ttf'),
    });

    useEffect(() => {
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }
}

const RootLayout = () => {
    LoadFonts();
    
    return (
        /*{
        <View style={{flex: 1}}>
            <Stack screenOptions={{
                headerStyle: { backgroundColor: '#ddd' },
                headerTintColor: '#0000FF',
            }}>
                <Stack.Screen name="index" options={{ title: 'INDEX THIS', headerShown: false }}/>
                <Stack.Screen name="(frontend)/(auth)/Landing" options={{ headerShown: false }}/>
                 <Slot /> 
            </Stack> 
            <Text style={styles.footer}>Footer</Text>
        </View>  }*/
        /*<Slot/>
    )
}

export default RootLayout*/