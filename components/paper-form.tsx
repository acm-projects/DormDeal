import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Base from '../app/(frontend)/components/base';
import { colors } from '../app/root_styles';
import { FormMotion, FormMotionProvider } from './form-motion';

export function PaperForm({ children, header, footer, pageKey }: {
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    pageKey?: string | number;
}) {
    const insets = useSafeAreaInsets();
    const gutters = { paddingLeft: Math.max(20, insets.left), paddingRight: Math.max(20, insets.right) };
    return (
        <FormMotionProvider>
            <Base style={styles.base}>
                <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    {header && <View style={gutters}>{header}</View>}
                    <ScrollView key={pageKey} contentContainerStyle={[styles.content, gutters]} keyboardShouldPersistTaps="handled">
                        <FormMotion style={styles.stage}>{children}</FormMotion>
                    </ScrollView>
                    {footer && <View style={[styles.footer, gutters]}>{footer}</View>}
                </KeyboardAvoidingView>
            </Base>
        </FormMotionProvider>
    );
}

export function FormBack({ label = 'Go back', close = false, onPress, disabled }: {
    label?: string;
    close?: boolean;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={disabled} style={styles.back}>
            <Ionicons name={close ? 'close' : 'chevron-back'} size={30} color={colors.maroon} />
        </Pressable>
    );
}

export function FormAction({ children, onPress, disabled, muted, pulse }: {
    children: ReactNode;
    onPress: () => void;
    disabled?: boolean;
    muted?: boolean;
    pulse?: boolean;
}) {
    return (
        <View>
            {pulse && <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <FormMotion variant="pulse" delay={2400} style={styles.halo} />
            </View>}
            <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
                style={({ pressed }) => [styles.action, (disabled || muted) && styles.muted, pressed && styles.pressed]}>
                <Text style={styles.actionText}>{children}</Text>
            </Pressable>
        </View>
    );
}

export function FormStamp({ title, caption }: { title: string; caption: string }) {
    return (
        <FormMotion variant="stamp" delay={100} style={styles.stamp}>
            <Text style={styles.stampTitle}>{title}</Text>
            <Text style={styles.stampCaption}>{caption}</Text>
        </FormMotion>
    );
}

export const paperFormStyles = StyleSheet.create({
    heading: { fontFamily: 'Outfit', fontSize: 54, lineHeight: 55, fontWeight: '800', letterSpacing: -2, color: colors.maroon },
    body: { fontFamily: 'Outfit', fontSize: 17, lineHeight: 23, color: colors.ink },
    error: { fontFamily: 'Outfit', fontSize: 14, fontWeight: '700', color: colors.maroon, textAlign: 'center' },
    link: { fontFamily: 'Outfit', fontSize: 15, fontWeight: '700', color: colors.maroon, textDecorationLine: 'underline', textAlign: 'center' },
    card: { backgroundColor: colors.white, boxShadow: '0px 3px 9px rgba(0, 0, 0, 0.14)' },
    note: { backgroundColor: colors.goldLight, padding: 16, transform: [{ rotate: '2deg' }], boxShadow: '0px 4px 9px rgba(0, 0, 0, 0.16)' },
    noteText: { fontFamily: 'Caveat', fontSize: 25, fontWeight: '700', color: colors.ink },
});

const styles = StyleSheet.create({
    base: { paddingLeft: 0, paddingRight: 0 },
    page: { flex: 1, width: '100%' },
    stage: { flexGrow: 1 },
    content: { flexGrow: 1, paddingTop: 22, paddingBottom: 18 },
    footer: { gap: 8, paddingTop: 8, paddingBottom: 4 },
    back: { width: 56, height: 56, borderRadius: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.18)' },
    action: { minHeight: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: colors.maroon, boxShadow: '0px 4px 9px rgba(122, 0, 0, 0.22)' },
    actionText: { color: colors.white, fontFamily: 'Caveat', fontSize: 30, fontWeight: '700', textAlign: 'center', paddingHorizontal: 10 },
    muted: { opacity: 0.55 },
    pressed: { transform: [{ translateY: 3 }], boxShadow: 'none' },
    halo: { ...StyleSheet.absoluteFill, margin: -6, opacity: 0, backgroundColor: colors.maroon, borderRadius: 20 },
    stamp: { alignSelf: 'center', borderWidth: 8, borderColor: colors.maroon, borderRadius: 9, paddingHorizontal: 16, paddingVertical: 8, transform: [{ rotate: '-8deg' }] },
    stampTitle: { fontFamily: 'Outfit', fontSize: 46, fontWeight: '800', letterSpacing: 2, color: colors.maroon, textAlign: 'center' },
    stampCaption: { fontFamily: 'Outfit', fontSize: 14, fontWeight: '700', letterSpacing: 3, color: colors.maroon, textAlign: 'center' },
});
