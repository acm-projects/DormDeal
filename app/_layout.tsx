import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const LOGIN_ROUTE = '/Login';
const PUBLIC_PAGES = ['login', 'signup', 'sign_up', 'sign-up', 'landing', 'resetpassword'];

const LoadFonts = () => {
    const [loaded, error] = useFonts({
        'Outfit': require('../assets/fonts/Outfit-VariableFont.ttf'),
        'Caveat': require('../assets/fonts/Caveat-VariableFont.ttf'),
    });

    useEffect(() => {}, [loaded, error]);

    if (!loaded && !error) return null;
};

const RootLayout = () => {
    LoadFonts();

    const router = useRouter();
    const segments = useSegments();
    const [checked, setChecked] = useState(false);
    const [signedIn, setSignedIn] = useState(false);

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

    useEffect(() => {
        if (!checked) return;

        const current = String(segments[segments.length - 1] ?? '').toLowerCase();
        if (!signedIn && !PUBLIC_PAGES.includes(current)) {
            router.replace(LOGIN_ROUTE);
        }
    }, [checked, signedIn, segments, router]);

    if (!checked) return null;
    return <Slot />;
};

export default RootLayout;
