import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    FormAction,
    FormBack,
    FormStamp,
    PaperForm,
    paperFormStyles,
} from "../../../src/components/paper-form";
import { FormColorFade, FormMotion } from "../../../src/components/form-motion";
import { supabase } from "../../../lib/supabase";
import { colors } from "../../root_styles";

export default function ResetPassword() {
    const router = useRouter();
    const [account, setAccount] = useState<
        { email?: string } | null | undefined
    >();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [visible, setVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [message, setMessage] = useState("");
    const [shake, setShake] = useState(0);

    useEffect(() => {
        let active = true;
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" && session)
                setAccount(session.user);
        });
        async function loadAccount() {
            const { data, error } = await supabase.auth.getSession();
            if (active) setAccount(error ? null : (data.session?.user ?? null));
        }
        void loadAccount().catch(() => {
            if (active) setAccount(null);
        });
        return () => {
            active = false;
            data.subscription.unsubscribe();
        };
    }, []);

    const longEnough = password.length >= 8;
    const letterAndNumber = /[A-Za-z]/.test(password) && /\d/.test(password);
    const extraLength = password.length >= 12;
    const symbol = /[^A-Za-z0-9\s]/.test(password);
    const score =
        Number(longEnough) +
        Number(letterAndNumber) +
        Number(extraLength) +
        Number(symbol);
    const strength = password
        ? ["weak", "weak", "okay", "good", "strong"][score]
        : "";
    const match = password !== "" && password === confirm;
    const canSave = longEnough && letterAndNumber && match;
    const rules = [
        { label: "At least 8 characters", met: longEnough },
        { label: "A letter and a number", met: letterAndNumber },
        {
            label: "Bonus: 12+ characters or a symbol",
            met: extraLength || symbol,
        },
    ];
    const logIn = () => router.replace("/Login");

    async function save() {
        if (saving || !account) return;
        if (!canSave) {
            setMessage("Finish the checks above to save.");
            setShake((count) => count + 1);
            return;
        }
        setSaving(true);
        setMessage("");
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setPassword("");
            setConfirm("");
            setSaved(true);
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) setMessage(signOutError.message);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Could not save your password. Try again.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <PaperForm
            pageKey={saved ? "saved" : "form"}
            header={
                !saved && (
                    <FormBack
                        label="Back to login"
                        onPress={logIn}
                        disabled={saving}
                    />
                )
            }
            footer={
                account && !saved ? (
                    <>
                        {!!message && (
                            <Text
                                accessibilityRole="alert"
                                style={paperFormStyles.error}
                            >
                                {message}
                            </Text>
                        )}
                        <FormAction
                            onPress={save}
                            disabled={saving}
                            muted={!canSave}
                        >
                            {saving ? "Saving…" : "Save password!"}
                        </FormAction>
                    </>
                ) : undefined
            }
        >
            {saved ? (
                <View style={styles.success}>
                    <FormStamp title="ALL SET!" caption="PASSWORD UPDATED" />
                    <FormMotion delay={600}>
                        <Text style={[paperFormStyles.body, styles.center]}>
                            Log in with your new password to get back to the
                            board.
                        </Text>
                    </FormMotion>
                    {!!message && (
                        <Text
                            accessibilityRole="alert"
                            style={paperFormStyles.error}
                        >
                            {message}
                        </Text>
                    )}
                    <FormMotion delay={800}>
                        <FormAction onPress={logIn} disabled={saving}>
                            Log in!
                        </FormAction>
                    </FormMotion>
                </View>
            ) : (
                <View style={styles.form}>
                    <Text
                        accessibilityRole="header"
                        style={paperFormStyles.heading}
                    >
                        {"new\npassword"}
                    </Text>
                    {account ? (
                        <>
                            <View
                                style={[paperFormStyles.card, styles.account]}
                            >
                                <View style={styles.avatar}>
                                    <Text style={styles.initial}>
                                        {account.email?.[0]?.toUpperCase() ||
                                            "?"}
                                    </Text>
                                </View>
                                <View style={styles.accountText}>
                                    <Text style={styles.accountLabel}>
                                        Resetting password for
                                    </Text>
                                    <Text
                                        style={styles.email}
                                        numberOfLines={1}
                                    >
                                        {account.email ?? "Your account"}
                                    </Text>
                                </View>
                            </View>
                            <View>
                                <View style={[styles.marker, styles.yellow]}>
                                    <TextInput
                                        accessibilityLabel="New password"
                                        autoComplete="new-password"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!saving}
                                        value={password}
                                        onChangeText={(value) => {
                                            setPassword(value);
                                            setMessage("");
                                        }}
                                        secureTextEntry={!visible}
                                        placeholder="New password"
                                        placeholderTextColor={colors.muted}
                                        style={styles.input}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={
                                            visible
                                                ? "Hide passwords"
                                                : "Show passwords"
                                        }
                                        onPress={() => setVisible(!visible)}
                                        style={styles.show}
                                    >
                                        <Text style={styles.showText}>
                                            {visible ? "Hide" : "Show"}
                                        </Text>
                                    </Pressable>
                                </View>
                                <View style={styles.underline} />
                                <View
                                    style={styles.meter}
                                    accessible
                                    accessibilityLabel={
                                        strength
                                            ? `Password strength: ${strength}`
                                            : "Password strength"
                                    }
                                >
                                    {[1, 2, 3, 4].map((value) => (
                                        <View key={value} style={styles.bar}>
                                            <FormColorFade
                                                visible={score >= value}
                                                style={styles.filledBar}
                                            />
                                        </View>
                                    ))}
                                    <Text style={styles.strength}>
                                        {strength}
                                    </Text>
                                </View>
                            </View>
                            <FormMotion variant="shake" trigger={shake}>
                                <View style={[styles.marker, styles.pink]}>
                                    <TextInput
                                        accessibilityLabel="Confirm new password"
                                        autoComplete="new-password"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!saving}
                                        value={confirm}
                                        onChangeText={(value) => {
                                            setConfirm(value);
                                            setMessage("");
                                        }}
                                        onSubmitEditing={save}
                                        secureTextEntry={!visible}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={colors.muted}
                                        style={styles.input}
                                    />
                                </View>
                                <View style={styles.underline} />
                                <Text
                                    accessibilityLiveRegion="polite"
                                    style={[styles.showText, styles.match]}
                                >
                                    {confirm
                                        ? match
                                            ? "Passwords match"
                                            : "Passwords don’t match"
                                        : ""}
                                </Text>
                            </FormMotion>
                            <View style={styles.rules}>
                                {rules.map(({ label, met }) => (
                                    <View
                                        key={label}
                                        style={styles.rule}
                                        accessible
                                        accessibilityLabel={`${label}, ${met ? "met" : "not met"}`}
                                    >
                                        <View
                                            style={[
                                                styles.ruleBox,
                                                met && styles.ruleMet,
                                            ]}
                                        >
                                            {met && (
                                                <Ionicons
                                                    name="checkmark"
                                                    color={colors.white}
                                                    size={15}
                                                />
                                            )}
                                        </View>
                                        <Text style={styles.ruleText}>
                                            {label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text style={paperFormStyles.body}>
                            {account === undefined
                                ? "Checking your reset link…"
                                : "Open this page from the link in your reset email."}
                        </Text>
                    )}
                </View>
            )}
        </PaperForm>
    );
}

const styles = StyleSheet.create({
    form: { gap: 20, paddingTop: 11 },
    account: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    accountText: { flex: 1 },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.rose,
        alignItems: "center",
        justifyContent: "center",
    },
    initial: { fontFamily: "Outfit", fontWeight: "800", color: colors.maroon },
    accountLabel: { fontFamily: "Caveat", fontSize: 19, color: colors.muted },
    email: {
        fontFamily: "Outfit",
        fontSize: 16,
        fontWeight: "700",
        color: colors.ink,
    },
    marker: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 6,
        paddingLeft: 14,
        paddingRight: 10,
        minHeight: 55,
    },
    yellow: { backgroundColor: "#F7E26B" },
    pink: { backgroundColor: "#F4B9D2" },
    input: {
        flex: 1,
        minWidth: 0,
        fontFamily: "Outfit",
        fontSize: 20,
        fontWeight: "500",
        color: colors.ink,
        paddingVertical: 10,
    },
    underline: {
        height: 3,
        marginTop: 5,
        borderRadius: 2,
        backgroundColor: colors.ink,
    },
    show: { minHeight: 44, justifyContent: "center", paddingHorizontal: 5 },
    showText: {
        fontFamily: "Outfit",
        color: colors.maroon,
        fontWeight: "800",
        fontSize: 14,
    },
    meter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
    bar: { flex: 1, height: 8, backgroundColor: "#D9D4CB", borderRadius: 3 },
    filledBar: {
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.maroon,
        borderRadius: 3,
    },
    strength: {
        width: 53,
        textAlign: "right",
        fontFamily: "Outfit",
        fontSize: 13,
        fontWeight: "700",
        color: colors.maroon,
    },
    match: { minHeight: 18, marginTop: 6 },
    rules: { gap: 8 },
    rule: { flexDirection: "row", gap: 10, alignItems: "center" },
    ruleBox: {
        width: 21,
        height: 21,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
    ruleMet: { backgroundColor: colors.maroon, borderStyle: "solid" },
    ruleText: {
        flexShrink: 1,
        fontFamily: "Outfit",
        color: colors.ink,
        fontSize: 14,
    },
    success: {
        flex: 1,
        justifyContent: "center",
        gap: 30,
        paddingVertical: 25,
    },
    center: { textAlign: "center" },
});
