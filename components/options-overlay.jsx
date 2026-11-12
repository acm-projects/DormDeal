import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Modal, Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OptionsOverlay({ children, onClose, title, anchored = false, anchorTop = null }) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [progress] = useState(() => new Animated.Value(0));
    const [reduced, setReduced] = useState(null);
    const [closing, setClosing] = useState(false);
    const [trigger] = useState(() => Platform.OS === 'web' && typeof document !== 'undefined' ? document.activeElement : null);

    useEffect(() => {
        let active = true;
        AccessibilityInfo.isReduceMotionEnabled().then(
            (value) => { if (active) setReduced(value); },
            () => { if (active) setReduced(false); },
        );
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (reduced === null) return;
        const animation = Animated.timing(progress, {
            toValue: closing ? 0 : 1,
            duration: reduced ? 150 : anchored ? 300 : 450,
            easing: Easing.bezier(0.2, 0.8, 0.25, 1),
            useNativeDriver: Platform.OS !== 'web',
        });
        animation.start(({ finished }) => { if (finished && closing) onClose(); });
        return () => animation.stop();
    }, [anchored, closing, onClose, progress, reduced]);

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const getDialog = () => document.getElementById('dormdeal-options-dialog');
        const focusable = () => [...(getDialog()?.querySelectorAll('button, [href], [tabindex="0"], input, textarea') ?? [])]
            .filter((element) => !element.disabled && element.getAttribute('aria-disabled') !== 'true' && element.getClientRects().length);
        const frame = requestAnimationFrame(() => (focusable()[0] ?? getDialog())?.focus());
        const keydown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setClosing(true);
            }
            if (event.key !== 'Tab') return;
            const items = focusable();
            const target = event.shiftKey ? items.at(-1) : items[0];
            const edge = event.shiftKey ? items[0] : items.at(-1);
            if (!getDialog()?.contains(document.activeElement) || document.activeElement === edge) {
                event.preventDefault();
                target?.focus();
            }
        };
        document.addEventListener('keydown', keydown);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('keydown', keydown);
            requestAnimationFrame(() => trigger?.isConnected && trigger.focus());
        };
    }, [trigger]);

    const close = () => setClosing(true);
    const panelWidth = Math.min(334, width * (anchored ? 0.8 : 0.86));
    const top = Math.max(insets.top + 8, Math.min(anchorTop ?? insets.top + 100, height / 3));
    const transform = reduced !== false ? [] : anchored
        ? [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }]
        : [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [panelWidth, 0] }) }];

    return <Modal transparent visible animationType="none" onRequestClose={close} statusBarTranslucent navigationBarTranslucent>
        <View style={styles.screen}>
            <Animated.View style={[styles.scrim, { opacity: progress.interpolate({ inputRange: [0, 0.78, 1], outputRange: [0, 1, 1] }) }]}>
                <Pressable accessible={false} style={StyleSheet.absoluteFill} onPress={close} />
            </Animated.View>
            <Animated.View nativeID="dormdeal-options-dialog" role="dialog" aria-modal accessibilityLabel={title}
                accessibilityViewIsModal pointerEvents={closing ? 'none' : 'auto'} style={[
                    styles.panel,
                    anchored ? { top, right: Math.max(14, insets.right), maxHeight: height - top - Math.max(16, insets.bottom) }
                        : { top: 0, bottom: 0, backgroundColor: '#C9AC84', paddingTop: Math.max(16, insets.top), paddingBottom: Math.max(12, insets.bottom) },
                    { width: panelWidth, transform, opacity: anchored || reduced !== false ? progress : 1 },
                ]}>
                {children(close)}
            </Animated.View>
        </View>
    </Modal>;
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(30,10,10,.55)' },
    panel: { position: 'absolute', right: 0 },
});
