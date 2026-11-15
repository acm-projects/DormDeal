import { Slot, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import PaperBackground from "../src/components/paper-background";
import { TransitionHost } from "../src/components/transitions/TransitionHost";
import { setSessionFromUrl } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { colors } from "./root_styles";

const LANDING_ROUTE = "/Landing";
const HOME_ROUTE = "/home";
const PUBLIC_PAGES = [
    "login",
    "signup",
    "sign_up",
    "sign-up",
    "landing",
    "resetpassword",
];
const RootLayout = () => {
    const [loaded] = useFonts({
        Outfit: require("../assets/fonts/Outfit-VariableFont.ttf"),
        Caveat: require("../assets/fonts/Caveat-VariableFont.ttf"),
    });
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
        const current = String(
            segments[segments.length - 1] ?? "",
        ).toLowerCase();
        const isPublicPage = PUBLIC_PAGES.includes(current);
        if (!signedIn && !isPublicPage) {
            router.replace(LANDING_ROUTE);
        } else if (signedIn && isPublicPage && current !== "resetpassword") {
            router.replace(HOME_ROUTE);
        }
    }, [checked, signedIn, segments, router]);
    useEffect(() => {
        const handleUrl = async (url: string) => {
            const session = await setSessionFromUrl(url);
            const parsed = Linking.parse(url);
            const destination = (parsed.path ?? parsed.hostname ?? "").toLowerCase();
            if (session && destination === "resetpassword") {
                router.replace("/ResetPassword");
            }
        };
        const subscription = Linking.addEventListener("url", ({ url }) => {
            void handleUrl(url).catch(console.warn);
        });
        void Linking.getInitialURL().then((url) => {
            if (url) void handleUrl(url).catch(console.warn);
        });
        return () => subscription.remove();
    }, [router]);
    return (
        <View style={styles.screen}>
            <TransitionHost fontsReady={loaded}>
                <PaperBackground />
                {checked && <Slot />}
            </TransitionHost>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.appBg,
    },
});

export default RootLayout;
