import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ReducedMotion = createContext<boolean | null>(true);
const nativeDriver = Platform.OS !== 'web';
const easeOut = Easing.bezier(0.2, 0.8, 0.25, 1);

export function FormMotionProvider({ children }: { children: ReactNode }) {
    const [reduced, setReduced] = useState<boolean | null>(null);
    useEffect(() => {
        let active = true;
        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
        void AccessibilityInfo.isReduceMotionEnabled().then(
            (enabled) => { if (active) setReduced((current) => current ?? enabled); },
            () => { if (active) setReduced((current) => current ?? false); },
        );
        return () => {
            active = false;
            subscription?.remove();
        };
    }, []);
    return <ReducedMotion.Provider value={reduced}>{children}</ReducedMotion.Provider>;
}

type Motion = 'fade' | 'wiggle' | 'pop' | 'softPop' | 'badge' | 'stamp' | 'shake' | 'door' | 'glow' | 'pulse';

const durations: Record<Motion, number> = {
    fade: 500, wiggle: 700, pop: 350, softPop: 250, badge: 300, stamp: 550, shake: 350, door: 1100, glow: 2400, pulse: 2200,
};

function useProgress(duration: number, delay: number, enabled: boolean, trigger?: number, loop = false, useNativeDriver = nativeDriver) {
    const reduced = useContext(ReducedMotion);
    const [progress] = useState(() => new Animated.Value(enabled ? 0 : 1));
    useEffect(() => {
        if (reduced === null) return;
        if (reduced || !enabled) {
            progress.setValue(1);
            return;
        }
        progress.setValue(0);
        const timing = Animated.timing(progress, {
            toValue: 1, duration, delay: loop ? 0 : delay,
            easing: loop ? Easing.inOut(Easing.sin) : easeOut,
            useNativeDriver, isInteraction: false,
        });
        const animation = loop ? Animated.sequence([Animated.delay(delay), Animated.loop(timing)]) : timing;
        animation.start();
        return () => animation.stop();
    }, [progress, reduced, enabled, trigger, duration, delay, loop, useNativeDriver]);
    return { progress, reduced };
}

export function FormMotion({ children, style, variant = 'fade', delay = 0, trigger }: {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: Motion;
    delay?: number;
    trigger?: number;
}) {
    const loop = variant === 'glow' || variant === 'pulse';
    const { progress, reduced } = useProgress(durations[variant], delay, trigger !== 0, trigger, loop);
    const animate = !reduced;
    let motion: Animated.WithAnimatedValue<ViewStyle>;
    switch (variant) {
        case 'wiggle':
            motion = { opacity: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }), transform: [
                { rotate: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['-9deg', '2deg', '-2deg'] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.7, 1.04, 1] }) },
            ] };
            break;
        case 'pop':
        case 'badge':
            motion = { transform: [{ scale: progress.interpolate({ inputRange: [0, 0.65, 1], outputRange: variant === 'badge' ? [0, 1.25, 1] : [0.94, 1.035, 1] }) }] };
            break;
        case 'softPop':
            motion = { transform: [{ scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.99, 1.01, 1] }) }] };
            break;
        case 'stamp':
            motion = { opacity: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 1] }), transform: [
                { rotate: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: ['-14deg', '-8deg', '-8deg'] }) },
                { scale: progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [2.2, 0.95, 1] }) },
            ] };
            break;
        case 'shake':
            motion = { transform: [{ translateX: progress.interpolate({ inputRange: [0, 0.25, 0.75, 1], outputRange: [0, -6, 6, 0] }) }] };
            break;
        case 'door':
            motion = { transformOrigin: 'left center', transform: [{ perspective: 700 }, {
                rotateY: animate ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-72deg'] }) : '-72deg',
            }] };
            break;
        case 'glow':
            motion = { opacity: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.75] }) };
            break;
        case 'pulse':
            motion = { opacity: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.22, 0] }), transform: [
                { scale: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1] }) },
            ] };
            break;
        default:
            motion = { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] };
    }
    return <Animated.View style={[style, (animate || variant === 'door') && motion]}>{children}</Animated.View>;
}

export function FormCheck({ color }: { color: string }) {
    const { progress, reduced } = useProgress(300, 0, true, undefined, false, false);
    const size = 18;
    const revealWidth = reduced ? size : progress.interpolate({ inputRange: [0, 1], outputRange: [0, size] });
    return (
        <View aria-hidden style={{ width: size, height: size, flexShrink: 0 }}>
            <Animated.View style={{ width: revealWidth, height: size, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }}>
                    <Svg width={size} height={size} viewBox="0 0 24 24">
                        <Path d="M5 12.5l5 5 9-11" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </View>
            </Animated.View>
        </View>
    );
}

export function FormColorFade({ visible, style }: { visible: boolean; style?: StyleProp<ViewStyle> }) {
    const reduced = useContext(ReducedMotion);
    const [opacity] = useState(() => new Animated.Value(Number(visible)));
    useEffect(() => {
        if (reduced !== false) {
            opacity.setValue(Number(visible));
            return;
        }
        const animation = Animated.timing(opacity, {
            toValue: Number(visible), duration: 350, useNativeDriver: nativeDriver, isInteraction: false,
        });
        animation.start();
        return () => animation.stop();
    }, [opacity, reduced, visible]);
    return <Animated.View style={[style, { opacity }]} />;
}
