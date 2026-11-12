import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { d, notifyTransitionComplete, registerTransitionHost, type TransitionId, type TransitionSource } from './pageTransitions';
import { captureScreen, releaseScreen, TransitionSurface } from './transitionSurface';
import type { Snapshot, TransitionScene } from './transitionSurface.types';

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => { resolve = done; });
    return { promise, resolve };
}

type TransitionOperation = ReturnType<typeof deferred> & {
    committed: ReturnType<typeof deferred>;
    complete: ReturnType<typeof deferred>;
    cancelled: boolean;
};

async function waitFor(promise: Promise<void>, message: string, timeout = 3000) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        await Promise.race([promise, new Promise<void>((_, reject) => {
            timer = setTimeout(() => reject(new Error(message)), timeout);
        })]);
    } finally {
        clearTimeout(timer);
    }
}

export function TransitionHost({ children, fontsReady }: { children: ReactNode; fontsReady: boolean }) {
    const router = useRouter();
    const pathname = usePathname();
    const screen = useRef<View>(null);
    const destination = useRef<{ path: string; resolve: () => void } | null>(null);
    const operation = useRef<TransitionOperation | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [scene, setScene] = useState<TransitionScene | null>(null);

    useLayoutEffect(() => {
        if (destination.current?.path === pathname) destination.current.resolve();
    }, [pathname]);

    const cancel = useCallback(() => {
        const current = operation.current;
        if (!current || current.cancelled) return;
        current.cancelled = true;
        current.resolve();
        current.committed.resolve();
        current.complete.resolve();
        destination.current = null;
        setScene(null);
    }, []);

    const navigate = useCallback(async (from: TransitionSource, to: string, id?: TransitionId) => {
        if (!id || !fontsReady || !screen.current || !size.width || !size.height) {
            router.push(to as Href);
            return;
        }
        const bottom = Math.min(from.stageBottom ?? 0, size.height - 1);
        let outgoing: Snapshot | undefined;
        let incoming: Snapshot | undefined;
        let navigated = false;
        const ready = deferred();
        const committed = deferred();
        const complete = deferred();
        const current: TransitionOperation = { ...ready, committed, complete, cancelled: false };
        operation.current = current;
        try {
            outgoing = await captureScreen(screen.current);
            if (current.cancelled) return;
            const initial: TransitionScene = { from: outgoing, id, ...size, bottom, ready: ready.resolve, complete: complete.resolve };
            setScene(initial);
            await waitFor(ready.promise, 'Could not display the outgoing screen.');
            if (current.cancelled) return;

            destination.current = { path: to, resolve: committed.resolve };
            router.push(to as Href);
            navigated = true;
            await waitFor(committed.promise, 'The destination did not mount.');
            if (current.cancelled) return;
            await nextFrame();
            await nextFrame();
            if (current.cancelled || !screen.current) return;
            incoming = await captureScreen(screen.current);
            if (current.cancelled) return;
            setScene({ ...initial, to: incoming });
            await waitFor(complete.promise, 'The transition did not finish.', d(2500) + 4000);
        } catch (error) {
            console.warn('Page transition skipped', error);
            if (!navigated && !current.cancelled) router.push(to as Href);
        } finally {
            if (operation.current === current) {
                operation.current = null;
                destination.current = null;
                setScene(null);
            }
            if (outgoing !== undefined) releaseScreen(outgoing);
            if (incoming !== undefined) releaseScreen(incoming);
            if (id && !current.cancelled) notifyTransitionComplete(id);
        }
    }, [fontsReady, router, size]);

    useLayoutEffect(() => registerTransitionHost(navigate, cancel), [cancel, navigate]);

    return (
        <View style={styles.fill} onLayout={({ nativeEvent: { layout } }) => {
            setSize((current) => current.width === layout.width && current.height === layout.height
                ? current : { width: layout.width, height: layout.height });
        }}>
            <View ref={screen} collapsable={false} style={styles.fill}>{children}</View>
            {scene && <TransitionSurface scene={scene} />}
        </View>
    );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
