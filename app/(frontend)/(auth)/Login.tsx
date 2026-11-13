import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import Base from "../../../src/components/base";
import { BackButton } from "../../../src/components/design";
import { colors } from "../../root_styles";
import { signInWithMicrosoft, signInWithPassword } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import MicrosoftLogo from "../../../assets/images/microsoft.png";
export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const login = async () => {
        if (!email.trim() || !password)
            return setMessage("Use your school email, like you@school.edu");
        setLoading(true);
        setMessage("");
        try {
            await signInWithPassword(email.trim(), password);
            router.replace("/");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to log in. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };
    const forgot = async () => {
        if (!email.trim()) return setMessage("Enter your school email first.");
        const { error } = await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
                redirectTo:
                    Platform.OS === "web"
                        ? `${window.location.origin}/ResetPassword`
                        : undefined,
            },
        );
        setMessage(
            error
                ? error.message
                : "If an account exists for that email, a reset link is on its way.",
        );
    };
    return (
        <Base>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.content}>
                    <View style={styles.back}>
                        <BackButton
                            onPress={() => router.replace("/Landing")}
                        />
                    </View>
                    <View style={styles.center}>
                        <Text style={styles.title}>login</Text>
                        <View style={styles.form}>
                            <Field
                                label="Username"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Text style={styles.helper}>
                                Use your school email, like you@school.edu
                            </Text>
                            <View style={styles.marker}>
                                <TextInput
                                    accessibilityLabel="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!show}
                                    placeholder="Password"
                                    placeholderTextColor="#777"
                                    style={[styles.input, styles.passwordInput]}
                                />
                                <Pressable
                                    accessibilityLabel={
                                        show ? "Hide password" : "Show password"
                                    }
                                    onPress={() => setShow(!show)}
                                    style={styles.show}
                                >
                                    <Text style={styles.showText}>
                                        {show ? "Hide" : "Show"}
                                    </Text>
                                </Pressable>
                            </View>
                            <View style={styles.line} />
                            <Pressable
                                onPress={forgot}
                                accessibilityLabel="Reset password"
                            >
                                <Text style={styles.forgot}>
                                    Forgot Password?
                                </Text>
                            </Pressable>
                            {!!message && (
                                <Text style={styles.message}>{message}</Text>
                            )}
                            <Pressable
                                accessibilityLabel="Log in"
                                onPress={login}
                                disabled={loading}
                                style={styles.primary}
                            >
                                <Text style={styles.primaryText}>
                                    {loading ? "Logging in..." : "Login!"}
                                </Text>
                            </Pressable>
                            <Pressable
                                accessibilityLabel="Log in with Microsoft"
                                onPress={signInWithMicrosoft}
                                style={styles.microsoft}
                            >
                                <Image
                                    source={MicrosoftLogo}
                                    style={styles.microsoftLogo}
                                />
                                <Text style={styles.microsoftText}>
                                    Microsoft Login
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New to DormDeal? </Text>
                        <Pressable onPress={() => router.push("/SignUp")}>
                            <Text style={styles.link}>Sign up</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Base>
    );
}
function Field(props: any) {
    return (
        <>
            <TextInput
                accessibilityLabel={props.label}
                placeholder={props.label}
                placeholderTextColor="#777"
                style={styles.input}
                {...props}
            />
            <View style={styles.line} />
        </>
    );
}
const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 14,
        paddingBottom: 8,
    },
    back: {
        position: "absolute",
        top: 0,
        left: 14,
        zIndex: 20,
        elevation: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        textAlign: "center",
        marginBottom: 42,
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 58,
        letterSpacing: -2,
    },
    form: {
        paddingHorizontal: 16,
        gap: 10,
    },
    input: {
        height: 46,
        flex: 1,
        minWidth: 0,
        paddingHorizontal: 8,
        fontFamily: "Outfit",
        fontSize: 20,
        color: colors.ink,
    },
    passwordInput: {
        flexShrink: 1,
    },
    line: {
        height: 3,
        backgroundColor: "#1A1A1A",
    },
    helper: {
        fontFamily: "Outfit",
        color: colors.maroon,
        fontWeight: "700",
        fontSize: 13,
        marginTop: -6,
    },
    marker: {
        height: 56,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(246,224,74,.75)",
    },
    show: {
        width: 68,
        minHeight: 44,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    showText: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 15,
    },
    forgot: {
        color: "#B04A4A",
        fontFamily: "Outfit",
        fontSize: 16,
        textDecorationLine: "underline",
        marginBottom: 10,
    },
    message: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
    },
    primary: {
        height: 52,
        borderRadius: 6,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
    },
    primaryText: {
        color: colors.white,
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 30,
    },
    microsoft: {
        height: 52,
        borderRadius: 6,
        backgroundColor: colors.white,
        borderColor: "#E5DDDA",
        borderWidth: 2,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    microsoftLogo: {
        width: 28,
        height: 28,
        resizeMode: "contain",
    },
    microsoftText: {
        fontFamily: "Caveat",
        fontSize: 28,
        fontWeight: "700",
        color: colors.ink,
    },
    footer: {
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "center",
    },
    footerText: {
        fontFamily: "Outfit",
        fontSize: 16,
        color: colors.ink,
    },
    link: {
        fontFamily: "Outfit",
        fontSize: 16,
        fontWeight: "700",
        color: colors.maroon,
        textDecorationLine: "underline",
    },
});
