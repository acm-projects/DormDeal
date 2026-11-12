import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import Svg, {
    Circle, ClipPath, Defs, G, Image as SvgImage, Line, LinearGradient, Mask, Pattern,
    Polygon, Polyline, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import { d, easeIO, easeO, pick, rnd, sleep } from './pageTransitions';
import type { Snapshot, TransitionScene } from './transitionSurface.types';

type NativeScene = TransitionScene & { from: string; to: string };
type Timeline = {
    animate: (value: Animated.Value, ms: number, options?: {
        delay?: number; easing?: (t: number) => number; driver?: boolean; to?: number; scaled?: boolean;
    }) => Promise<void>;
    pause: (ms: number) => Promise<void>;
};

export async function captureScreen(view: View): Promise<Snapshot> {
    return captureRef(view, { format: 'png', result: 'tmpfile' });
}

export function releaseScreen(snapshot: Snapshot) {
    if (typeof snapshot === 'string') releaseCapture(snapshot);
}

function useTimeline(scene: NativeScene, run: (timeline: Timeline) => Promise<void>) {
    const play = useEffectEvent(run);
    useEffect(() => {
        let active = true;
        const running = new Set<Animated.CompositeAnimation>();
        const timeline: Timeline = {
            animate: (value, ms, { delay = 0, easing = Easing.linear, driver = true, to = 1, scaled = true } = {}) => {
                if (!active) return Promise.reject(new Error('Transition stopped'));
                return new Promise((resolve, reject) => {
                    const animation = Animated.timing(value, {
                        toValue: to, duration: scaled ? d(ms) : ms, delay: d(delay), easing, useNativeDriver: driver, isInteraction: false,
                    });
                    running.add(animation);
                    animation.start(({ finished }) => {
                        running.delete(animation);
                        if (finished) resolve();
                        else reject(new Error('Transition stopped'));
                    });
                });
            },
            pause: async (ms) => {
                await sleep(d(ms));
                if (!active) throw new Error('Transition stopped');
            },
        };
        void play(timeline).catch((error) => {
            if (active) console.warn('Page transition failed', error);
        }).finally(() => {
            if (active) scene.complete();
        });
        return () => {
            active = false;
            running.forEach((animation) => animation.stop());
        };
    }, [scene]);
}

const Maroon = '#7a0000';
const Tape = '#fbe27a';
const overshoot = Easing.bezier(.2, .9, .3, 1.3);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

function interp(value: Animated.Value, start: number, end: number) {
    return value.interpolate({ inputRange: [0, 1], outputRange: [start, end] });
}

function ScreenImage({ uri, scene }: { uri: string; scene: TransitionScene }) {
    return <Image source={{ uri }} resizeMode="stretch" style={{ width: scene.width, height: scene.height }} />;
}

function Fade({ scene }: { scene: NativeScene }) {
    const [opacity] = useState(() => new Animated.Value(0));
    useTimeline(scene, ({ animate }) => animate(opacity, 200, { scaled: false }));
    return <>
        <ScreenImage uri={scene.from} scene={scene} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}><ScreenImage uri={scene.to} scene={scene} /></Animated.View>
    </>;
}

const colors = ['#fff08a', '#ffb3c7', '#a8e0ff', '#b9f2b0', '#ffd29a'];
const words = ['pickup 5pm', 'textbooks $20', 'desk lamp?', 'free couch!', 'laundry :(', 'ramen', 'move-in day', 'dorm deal!', 'study grp', 'mini fridge', 'lease?', 'extension cord'];

function Sticky({ scene }: { scene: NativeScene }) {
    const H = scene.height - scene.bottom;
    const cw = scene.width / 5;
    const ch = H / 9;
    const [fromOpacity] = useState(() => new Animated.Value(1));
    const [notes] = useState(() => {
        const grid = Array.from({ length: 45 }, () => ({
            word: Math.random() < .35 ? pick(words) : '', color: pick(colors), rot: rnd(-7, 7),
            slap: new Animated.Value(0), peel: new Animated.Value(0),
        }));
        const delays = grid.map(() => rnd(0, 520));
        return grid.map((note, i) => ({
            ...note, delay: delays[i], dx: rnd(-40, 40), dy: -rnd(120, 220), turn: rnd(-40, 40), peelDelay: rnd(0, 430),
        }));
    });
    useTimeline(scene, async ({ animate, pause }) => {
        await Promise.all(notes.map((note) => animate(note.slap, 180, { delay: note.delay, easing: overshoot })));
        fromOpacity.setValue(0);
        await pause(80);
        await Promise.all(notes.map((note) => animate(note.peel, 400, { delay: note.peelDelay, easing: Easing.bezier(.42, 0, 1, 1) })));
    });
    return <>
        <ScreenImage uri={scene.to} scene={scene} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fromOpacity }]}><ScreenImage uri={scene.from} scene={scene} /></Animated.View>
        {notes.map((note, i) => {
            const turn = Animated.add(Animated.multiply(Animated.subtract(1, note.slap), 25), interp(note.peel, note.rot, note.rot + note.turn));
            return <Animated.View key={i} style={[styles.sticky, {
                left: (i % 5) * cw - 8, top: Math.floor(i / 5) * ch - 8, width: cw + 16, height: ch + 16,
                backgroundColor: note.color, opacity: Animated.multiply(note.slap, Animated.subtract(1, note.peel)),
                transform: [{ perspective: 1400 }, { translateX: interp(note.peel, 0, note.dx) },
                    { translateY: interp(note.peel, 0, note.dy) }, { rotateX: note.peel.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '75deg'] }) },
                    { rotate: turn.interpolate({ inputRange: [-60, 60], outputRange: ['-60deg', '60deg'] }) }, { scale: interp(note.slap, 1.9, 1) }],
            }]}><Text style={styles.stickyText}>{note.word}</Text></Animated.View>;
        })}
    </>;
}

function Stamp({ scene }: { scene: NativeScene }) {
    const W = scene.width;
    const H = scene.height - scene.bottom;
    const [slam] = useState(() => new Animated.Value(0));
    const [fade] = useState(() => new Animated.Value(1));
    const [flood] = useState(() => new Animated.Value(0));
    const [shake] = useState(() => new Animated.Value(0));
    const radius = interp(flood, 0, Math.hypot(W, H) / 2 + 30);
    useTimeline(scene, async ({ animate, pause }) => {
        await animate(slam, 420, { easing: Easing.bezier(.42, 0, 1, 1) });
        const impact = animate(shake, 200);
        await Promise.all([impact, animate(flood, 800, { easing: easeO, driver: false }),
            pause(450).then(() => animate(fade, 300, { to: 0 }))]);
    });
    return <Animated.View style={[StyleSheet.absoluteFill, { transform: [
        { translateX: shake.interpolate({ inputRange: [0, 1 / 3, 2 / 3, 1], outputRange: [0, 0, 3, 0] }) },
        { translateY: shake.interpolate({ inputRange: [0, 1 / 3, 2 / 3, 1], outputRange: [0, 6, -4, 0] }) },
    ] }]}>
        <ScreenImage uri={scene.from} scene={scene} />
        <Svg style={StyleSheet.absoluteFill} width={W} height={H}>
            <Defs><ClipPath id="transition-ink"><AnimatedCircle cx={W / 2} cy={H / 2} r={radius} /></ClipPath></Defs>
            <SvgImage href={scene.to} width={W} height={scene.height} clipPath="url(#transition-ink)" preserveAspectRatio="none" />
            <AnimatedCircle cx={W / 2} cy={H / 2} r={Animated.add(radius, 3)} fill="none" stroke={Maroon} strokeWidth={12} />
            <AnimatedCircle cx={W / 2} cy={H / 2} r={radius} fill="none" stroke={Tape} strokeWidth={8} />
        </Svg>
        <View style={styles.center}>
            <Animated.View style={[styles.stamp, {
                opacity: Animated.multiply(fade, slam.interpolate({ inputRange: [0, .72, 1], outputRange: [0, 1, 1] })),
                transform: [
                    { scale: slam.interpolate({ inputRange: [0, .72, .86, 1], outputRange: [3.6, 1, .92, 1] }) },
                    { rotate: slam.interpolate({ inputRange: [0, .72, 1], outputRange: ['-16deg', '-10deg', '-10deg'] }) },
                ],
            }]}>
                <Text style={styles.stampTitle}>DEAL!</Text><Text style={styles.stampCaption}>DORMDEAL ✓</Text>
            </Animated.View>
        </View>
    </Animated.View>;
}

function Plane({ scene }: { scene: NativeScene }) {
    const W = scene.width;
    const H = scene.height - scene.bottom;
    const angle = Math.atan2(-H, W);
    const gradientAngle = Math.atan2(-W, H);
    const span = W * Math.cos(gradientAngle) - H * Math.sin(gradientAngle);
    const [flight] = useState(() => new Animated.Value(0));
    const [trailOpacity] = useState(() => new Animated.Value(1));
    const trail = useRef<Polyline>(null);
    const samples = Array.from({ length: 61 }, (_, index) => {
        const t = index / 60;
        const s = -.08 + t * 1.2;
        const wave = Math.sin(t * Math.PI * 3) * 34;
        return { t, x: W * s - Math.sin(angle) * wave, y: H * (1 - s) + Math.cos(angle) * wave,
            rotation: angle * 180 / Math.PI + Math.cos(t * Math.PI * 3) * 16 };
    });
    const positions = samples.map(({ t }) => t);
    useTimeline(scene, async ({ animate }) => {
        const history: string[] = [];
        const listener = flight.addListener(({ value }) => {
            const t = Math.min(1, value);
            const s = -.08 + t * 1.2;
            const wave = Math.sin(t * Math.PI * 3) * 34;
            history.push(`${W * s - Math.sin(angle) * wave - 40 * Math.cos(angle)},${H * (1 - s) + Math.cos(angle) * wave - 40 * Math.sin(angle)}`);
            trail.current?.setNativeProps({ points: history.join(' ') });
        });
        try { await animate(flight, 1400, { easing: easeIO, driver: false }); }
        finally { flight.removeListener(listener); }
        await animate(trailOpacity, 250, { to: 0 });
    });
    return <>
        <ScreenImage uri={scene.from} scene={scene} />
        <Svg style={StyleSheet.absoluteFill} width={W} height={H}>
            <Defs>
                <LinearGradient id="transition-plane-edge">
                    <Stop offset="0" stopColor="white" />
                    <Stop offset="0.998" stopColor="white" />
                    <Stop offset="1" stopColor="white" stopOpacity={0} />
                </LinearGradient>
                <Mask id="transition-plane-mask" x={0} y={0} width={W} height={H} maskUnits="userSpaceOnUse" maskType="alpha">
                    <G transform={`translate(0 ${H}) rotate(${gradientAngle * 180 / Math.PI})`}>
                        <AnimatedRect x={interp(flight, -2.076 * span, -.876 * span)} y={-2 * span}
                            width={2 * span} height={4 * span} fill="url(#transition-plane-edge)" />
                    </G>
                </Mask>
            </Defs>
            <SvgImage href={scene.to} width={W} height={scene.height} mask="url(#transition-plane-mask)" preserveAspectRatio="none" />
        </Svg>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: trailOpacity }]}>
            <Svg width={W} height={H}><Polyline ref={trail} points="0,0" fill="none" stroke={Maroon} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 9" opacity={.8} /></Svg>
        </Animated.View>
        <Animated.View style={[styles.plane, { transform: [
            { translateX: flight.interpolate({ inputRange: positions, outputRange: samples.map(({ x }) => x - 80) }) },
            { translateY: flight.interpolate({ inputRange: positions, outputRange: samples.map(({ y }) => y - 25) }) },
            { rotate: flight.interpolate({ inputRange: positions, outputRange: samples.map(({ rotation }) => rotation + 'deg') }) },
        ] }]}>
            <Svg width={80} height={50} viewBox="0 0 80 50">
                <Polygon points="0,4 80,25 20,25" fill="#fff" /><Polygon points="0,46 80,25 20,25" fill="#d9d4cb" />
                <Polygon points="20,25 0,4 8,25" fill="#eee" /><Line x1={20} y1={25} x2={80} y2={25} stroke="#bbb" strokeWidth={1} />
            </Svg>
        </Animated.View>
    </>;
}

function LoaderDots() {
    const [dots] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));
    useEffect(() => {
        const loops = dots.map((dot, index) => Animated.sequence([
            Animated.delay(index * 150),
            Animated.loop(Animated.timing(dot, { toValue: 1, duration: 900, useNativeDriver: true, isInteraction: false })),
        ]));
        loops.forEach((loop) => loop.start());
        return () => loops.forEach((loop) => loop.stop());
    }, [dots]);
    return <View style={styles.loaderText}>
        <Text style={styles.loaderLabel}>Moving you in</Text>
        {dots.map((dot, index) => <Animated.Text key={index} style={[styles.loaderLabel, { transform: [{
            translateY: dot.interpolate({ inputRange: [0, .3, .6, 1], outputRange: [0, -8, 0, 0] }),
        }] }]}>.</Animated.Text>)}
    </View>;
}

function Door({ scene }: { scene: NativeScene }) {
    const W = scene.width;
    const H = scene.height - scene.bottom;
    const [arrival] = useState(() => new Animated.Value(0));
    const [oldPage] = useState(() => new Animated.Value(1));
    const [light] = useState(() => new Animated.Value(0));
    const [glow] = useState(() => new Animated.Value(0));
    const [hinge] = useState(() => new Animated.Value(0));
    const [reveal] = useState(() => new Animated.Value(0));
    const [revealing] = useState(() => new Animated.Value(0));
    const frameTop = (H - 295) / 2;
    useTimeline(scene, async ({ animate, pause }) => {
        await animate(arrival, 230, { easing: overshoot });
        oldPage.setValue(0);
        await pause(120);
        await Promise.all([
            animate(light, 450, { delay: 80 }), animate(glow, 700),
            animate(hinge, 700, { easing: Easing.bezier(.3, 1.35, .5, 1) }),
        ]);
        await pause(240);
        revealing.setValue(1);
        await animate(reveal, 560, { easing: Easing.bezier(.7, 0, .3, 1), driver: false });
    });
    return <>
        <ScreenImage uri={scene.to} scene={scene} />
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: oldPage }]}><ScreenImage uri={scene.from} scene={scene} /></Animated.View>
        <Animated.View style={[styles.center, { opacity: arrival, transform: [{ scale: interp(arrival, .82, 1) }] }]}>
            <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient id="transition-door-bg" cx="50%" cy="38%" rx="72%" ry="72%">
                        <Stop offset="0" stopColor="#a01616" /><Stop offset="1" stopColor="#6a0000" />
                    </RadialGradient>
                    <Pattern id="transition-door-dots" width={18} height={18} patternUnits="userSpaceOnUse"><Circle cx={9} cy={9} r={1.2} fill="#fff" opacity={.08} /></Pattern>
                </Defs>
                <Rect width={W} height={H} fill="url(#transition-door-bg)" /><Rect width={W} height={H} fill="url(#transition-door-dots)" />
            </Svg>
            <View style={styles.loaderGroup}>
                <View style={styles.frame}>
                    <Animated.View style={[styles.glow, { opacity: glow }]} />
                    <Animated.View style={[StyleSheet.absoluteFill, { opacity: light }]}>
                        <Svg width="100%" height="100%">
                            <Defs><LinearGradient id="transition-door-light" x1={0} x2={0} y1={0} y2="100%">
                                <Stop offset="0" stopColor="#fff8cf" /><Stop offset=".65" stopColor="#ffd45e" /><Stop offset="1" stopColor="#eaa92c" />
                            </LinearGradient></Defs>
                            <Rect width="100%" height="100%" fill="url(#transition-door-light)" />
                        </Svg>
                    </Animated.View>
                    <Animated.View style={[styles.door, { transform: [{ perspective: 700 }, {
                        rotateY: hinge.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-72deg'] }),
                    }] }]}>
                        <Text style={styles.plate}>208</Text>
                        <View style={styles.peep} /><View style={styles.doorPanel} /><View style={[styles.doorPanel, styles.doorPanelBottom]} /><View style={styles.knob} />
                    </Animated.View>
                </View>
                <View style={styles.mat}><Text style={styles.matText}>WELCOME HOME</Text></View>
                <LoaderDots />
            </View>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: revealing }]}>
            <Svg width={W} height={H}>
                <Defs><ClipPath id="transition-door-clip"><AnimatedRect
                    x={interp(reveal, (W - 150) / 2, 0)} y={interp(reveal, frameTop, 0)}
                    width={interp(reveal, 150, W)} height={interp(reveal, 214, H)} rx={interp(reveal, 6, 0)}
                /></ClipPath></Defs>
                <SvgImage href={scene.to} width={W} height={scene.height} clipPath="url(#transition-door-clip)" preserveAspectRatio="none" />
            </Svg>
        </Animated.View>
    </>;
}

const nativeEffects = { sticky: Sticky, stamp: Stamp, plane: Plane, door: Door };

export function TransitionSurface({ scene }: { scene: TransitionScene }) {
    const [reduced, setReduced] = useState<boolean | null>(null);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        let active = true;
        void AccessibilityInfo.isReduceMotionEnabled().then(
            (value) => { if (active) setReduced(value); },
            () => { if (active) setReduced(false); },
        );
        return () => { active = false; };
    }, []);
    const Effect = reduced ? Fade : nativeEffects[scene.id];
    return <View pointerEvents="auto" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={[styles.stage, { bottom: scene.bottom, backgroundColor: loaded ? '#cfc9bf' : 'transparent' }]}>
        {scene.to && loaded && reduced !== null ? <Effect scene={scene as NativeScene} /> : <>
            <Image source={{ uri: scene.from as string }} resizeMode="stretch" onLoad={scene.ready}
                style={{ width: scene.width, height: scene.height }} />
            {scene.to && <Image source={{ uri: scene.to as string }} onLoad={() => setLoaded(true)} onError={scene.complete}
                style={[styles.preload, { width: scene.width, height: scene.height }]} />}
        </>}
    </View>;
}

const styles = StyleSheet.create({
    stage: { ...StyleSheet.absoluteFill, zIndex: 200, overflow: 'hidden', isolation: 'isolate' },
    preload: { position: 'absolute', opacity: 0 },
    center: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center' },
    sticky: { position: 'absolute', paddingVertical: 10, paddingHorizontal: 8, overflow: 'hidden', boxShadow: '0 3px 6px #0004' },
    stickyText: { fontFamily: 'Caveat', fontWeight: '700', fontSize: 22, lineHeight: 22, color: '#3a3a3a' },
    stamp: { borderWidth: 9, borderColor: Maroon, borderRadius: 14, paddingVertical: 6, paddingHorizontal: 22, backgroundColor: '#fff8', mixBlendMode: 'multiply' },
    stampTitle: { fontFamily: 'Outfit', fontSize: 66, lineHeight: 70, fontWeight: '800', letterSpacing: 3, color: Maroon, textAlign: 'center' },
    stampCaption: { fontFamily: 'Outfit', fontSize: 15, fontWeight: '700', letterSpacing: 6, color: Maroon, textAlign: 'center' },
    plane: { position: 'absolute', left: 0, top: 0, width: 80, height: 50, transformOrigin: '100% 50%' },
    loaderGroup: { alignItems: 'center' },
    frame: { width: 150, height: 214, borderWidth: 9, borderBottomWidth: 0, borderColor: '#3a0000', backgroundColor: '#160800', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
    glow: { ...StyleSheet.absoluteFill, boxShadow: '0 0 90px 26px #ffd45ea8' },
    door: { ...StyleSheet.absoluteFill, transformOrigin: 'left center', backgroundColor: '#eee3d1', alignItems: 'center', boxShadow: 'inset 0 0 0 4px #d6caae, 3px 0 10px #0004' },
    plate: { marginTop: 20, backgroundColor: Tape, color: '#5a4400', fontFamily: 'Outfit', fontSize: 13, fontWeight: '800', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 2 },
    peep: { position: 'absolute', top: 58, width: 11, height: 11, borderRadius: 6, backgroundColor: '#333', borderWidth: 2, borderColor: '#c9a94f' },
    knob: { position: 'absolute', right: 12, top: 118, width: 17, height: 17, borderRadius: 9, backgroundColor: '#d5b64b' },
    doorPanel: { position: 'absolute', left: 18, right: 18, top: 84, height: 52, borderWidth: 3, borderColor: '#cfc2a5' },
    doorPanelBottom: { top: 146, height: 56 },
    mat: { width: 196, height: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Tape, borderRadius: 2 },
    matText: { color: '#5a4400', fontFamily: 'Outfit', fontSize: 9, fontWeight: '800', letterSpacing: 5 },
    loaderText: { height: 36, marginTop: 30, flexDirection: 'row', alignItems: 'center' },
    loaderLabel: { fontFamily: 'Caveat', fontWeight: '700', fontSize: 30, color: '#fbeed0' },
});
