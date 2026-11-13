import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
    AccessibilityInfo,
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { captureRef, releaseCapture } from "react-native-view-shot";
import Svg, {
    Defs,
    G,
    Image as SvgImage,
    Line,
    LinearGradient,
    Mask,
    Polygon,
    Polyline,
    Rect,
    Stop,
} from "react-native-svg";
import { d, easeIO, pick, rnd, sleep } from "./pageTransitions";
import type { Snapshot, TransitionScene } from "./transitionSurface.types";

type NativeScene = TransitionScene & { from: string; to: string };
type Timeline = {
    animate: (
        value: Animated.Value,
        ms: number,
        options?: {
            delay?: number;
            easing?: (t: number) => number;
            driver?: boolean;
            to?: number;
            scaled?: boolean;
        },
    ) => Promise<void>;
    pause: (ms: number) => Promise<void>;
};

export async function captureScreen(view: View): Promise<Snapshot> {
    return captureRef(view, { format: "png", result: "tmpfile" });
}

export function releaseScreen(snapshot: Snapshot) {
    if (typeof snapshot === "string") releaseCapture(snapshot);
}

function useTimeline(
    scene: NativeScene,
    run: (timeline: Timeline) => Promise<void>,
) {
    const play = useEffectEvent(run);
    useEffect(() => {
        let active = true;
        const running = new Set<Animated.CompositeAnimation>();
        const timeline: Timeline = {
            animate: (
                value,
                ms,
                {
                    delay = 0,
                    easing = Easing.linear,
                    driver = true,
                    to = 1,
                    scaled = true,
                } = {},
            ) => {
                if (!active)
                    return Promise.reject(new Error("Transition stopped"));
                return new Promise((resolve, reject) => {
                    const animation = Animated.timing(value, {
                        toValue: to,
                        duration: scaled ? d(ms) : ms,
                        delay: d(delay),
                        easing,
                        useNativeDriver: driver,
                        isInteraction: false,
                    });
                    running.add(animation);
                    animation.start(({ finished }) => {
                        running.delete(animation);
                        if (finished) resolve();
                        else reject(new Error("Transition stopped"));
                    });
                });
            },
            pause: async (ms) => {
                await sleep(d(ms));
                if (!active) throw new Error("Transition stopped");
            },
        };
        void play(timeline)
            .catch((error) => {
                if (active) console.warn("Page transition failed", error);
            })
            .finally(() => {
                if (active) scene.complete();
            });
        return () => {
            active = false;
            running.forEach((animation) => animation.stop());
        };
    }, [scene]);
}

const maroon = "#7a0000";
const overshoot = Easing.bezier(0.2, 0.9, 0.3, 1.3);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const noteColors = ["#fff08a", "#ffb3c7", "#a8e0ff", "#b9f2b0", "#ffd29a"];
const noteWords = [
    "pickup 5pm",
    "textbooks $20",
    "desk lamp?",
    "free couch!",
    "laundry :(",
    "ramen",
    "move-in day",
    "dorm deal!",
    "study grp",
    "mini fridge",
    "lease?",
    "extension cord",
];

function interp(value: Animated.Value, start: number, end: number) {
    return value.interpolate({ inputRange: [0, 1], outputRange: [start, end] });
}

function ScreenImage({ uri, scene }: { uri: string; scene: TransitionScene }) {
    return (
        <Image
            source={{ uri }}
            resizeMode="stretch"
            style={{ width: scene.width, height: scene.height }}
        />
    );
}

function Fade({ scene }: { scene: NativeScene }) {
    const [opacity] = useState(() => new Animated.Value(0));
    useTimeline(scene, ({ animate }) =>
        animate(opacity, 200, { scaled: false }),
    );
    return (
        <>
            <ScreenImage uri={scene.from} scene={scene} />
            <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
                <ScreenImage uri={scene.to} scene={scene} />
            </Animated.View>
        </>
    );
}

function Sticky({ scene }: { scene: NativeScene }) {
    const height = scene.height - scene.bottom,
        cellWidth = scene.width / 5,
        cellHeight = height / 9;
    const [fromOpacity] = useState(() => new Animated.Value(1));
    const [notes] = useState(() =>
        Array.from({ length: 45 }, () => ({
            word: Math.random() < 0.35 ? pick(noteWords) : "",
            color: pick(noteColors),
            rotation: rnd(-7, 7),
            slap: new Animated.Value(0),
            peel: new Animated.Value(0),
            delay: rnd(0, 520),
            dx: rnd(-40, 40),
            dy: -rnd(120, 220),
            turn: rnd(-40, 40),
            peelDelay: rnd(0, 430),
        })),
    );
    useTimeline(scene, async ({ animate, pause }) => {
        await Promise.all(
            notes.map((note) =>
                animate(note.slap, 180, {
                    delay: note.delay,
                    easing: overshoot,
                }),
            ),
        );
        fromOpacity.setValue(0);
        await pause(180);
        await Promise.all(
            notes.map((note) =>
                animate(note.peel, 400, {
                    delay: note.peelDelay,
                    easing: Easing.bezier(0.42, 0, 1, 1),
                }),
            ),
        );
    });
    return (
        <>
            <ScreenImage uri={scene.to} scene={scene} />
            <Animated.View
                style={[StyleSheet.absoluteFill, { opacity: fromOpacity }]}
            >
                <ScreenImage uri={scene.from} scene={scene} />
            </Animated.View>
            {notes.map((note, index) => {
                const rotation = Animated.add(
                    Animated.multiply(Animated.subtract(1, note.slap), 25),
                    interp(note.peel, note.rotation, note.rotation + note.turn),
                );
                return (
                    <Animated.View
                        key={index}
                        style={[
                            styles.sticky,
                            {
                                left: (index % 5) * cellWidth - 8,
                                top: Math.floor(index / 5) * cellHeight - 8,
                                width: cellWidth + 16,
                                height: cellHeight + 16,
                                backgroundColor: note.color,
                                opacity: Animated.multiply(
                                    note.slap,
                                    Animated.subtract(1, note.peel),
                                ),
                                transform: [
                                    { perspective: 1400 },
                                    {
                                        translateX: interp(
                                            note.peel,
                                            0,
                                            note.dx,
                                        ),
                                    },
                                    {
                                        translateY: interp(
                                            note.peel,
                                            0,
                                            note.dy,
                                        ),
                                    },
                                    {
                                        rotateX: note.peel.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["0deg", "75deg"],
                                        }),
                                    },
                                    {
                                        rotate: rotation.interpolate({
                                            inputRange: [-60, 60],
                                            outputRange: ["-60deg", "60deg"],
                                        }),
                                    },
                                    { scale: interp(note.slap, 1.9, 1) },
                                ],
                            },
                        ]}
                    >
                        <Text style={styles.stickyText}>{note.word}</Text>
                    </Animated.View>
                );
            })}
        </>
    );
}

function Plane({ scene }: { scene: NativeScene }) {
    const width = scene.width,
        height = scene.height - scene.bottom,
        angle = Math.atan2(-height, width),
        gradientAngle = Math.atan2(-width, height),
        span =
            width * Math.cos(gradientAngle) - height * Math.sin(gradientAngle);
    const [flight] = useState(() => new Animated.Value(0));
    const [trailOpacity] = useState(() => new Animated.Value(1));
    const trail = useRef<Polyline>(null);
    const samples = Array.from({ length: 61 }, (_, index) => {
        const t = index / 60,
            s = -0.08 + t * 1.2,
            wave = Math.sin(t * Math.PI * 3) * 34;
        return {
            t,
            x: width * s - Math.sin(angle) * wave,
            y: height * (1 - s) + Math.cos(angle) * wave,
            rotation: (angle * 180) / Math.PI + Math.cos(t * Math.PI * 3) * 16,
        };
    });
    const positions = samples.map(({ t }) => t);
    useTimeline(scene, async ({ animate }) => {
        const history: string[] = [];
        const listener = flight.addListener(({ value }) => {
            const t = Math.min(1, value),
                s = -0.08 + t * 1.2,
                wave = Math.sin(t * Math.PI * 3) * 34;
            history.push(
                `${width * s - Math.sin(angle) * wave - 40 * Math.cos(angle)},${height * (1 - s) + Math.cos(angle) * wave - 40 * Math.sin(angle)}`,
            );
            trail.current?.setNativeProps({ points: history.join(" ") });
        });
        try {
            await animate(flight, 1400, { easing: easeIO, driver: false });
        } finally {
            flight.removeListener(listener);
        }
        await animate(trailOpacity, 250, { to: 0 });
    });
    return (
        <>
            <ScreenImage uri={scene.from} scene={scene} />
            <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
                <Defs>
                    <LinearGradient id="transition-plane-edge">
                        <Stop offset="0" stopColor="white" />
                        <Stop offset="0.998" stopColor="white" />
                        <Stop offset="1" stopColor="white" stopOpacity={0} />
                    </LinearGradient>
                    <Mask
                        id="transition-plane-mask"
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        maskUnits="userSpaceOnUse"
                        maskType="alpha"
                    >
                        <G
                            transform={`translate(0 ${height}) rotate(${(gradientAngle * 180) / Math.PI})`}
                        >
                            <AnimatedRect
                                x={interp(flight, -2.076 * span, -0.876 * span)}
                                y={-2 * span}
                                width={2 * span}
                                height={4 * span}
                                fill="url(#transition-plane-edge)"
                            />
                        </G>
                    </Mask>
                </Defs>
                <SvgImage
                    href={scene.to}
                    width={width}
                    height={scene.height}
                    mask="url(#transition-plane-mask)"
                    preserveAspectRatio="none"
                />
            </Svg>
            <Animated.View
                style={[StyleSheet.absoluteFill, { opacity: trailOpacity }]}
            >
                <Svg width={width} height={height}>
                    <Polyline
                        ref={trail}
                        points="0,0"
                        fill="none"
                        stroke={maroon}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray="1 9"
                        opacity={0.8}
                    />
                </Svg>
            </Animated.View>
            <Animated.View
                style={[
                    styles.plane,
                    {
                        transform: [
                            {
                                translateX: flight.interpolate({
                                    inputRange: positions,
                                    outputRange: samples.map(({ x }) => x - 80),
                                }),
                            },
                            {
                                translateY: flight.interpolate({
                                    inputRange: positions,
                                    outputRange: samples.map(({ y }) => y - 25),
                                }),
                            },
                            {
                                rotate: flight.interpolate({
                                    inputRange: positions,
                                    outputRange: samples.map(
                                        ({ rotation }) => `${rotation}deg`,
                                    ),
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Svg width={80} height={50} viewBox="0 0 80 50">
                    <Polygon points="0,4 80,25 20,25" fill="#fff" />
                    <Polygon points="0,46 80,25 20,25" fill="#d9d4cb" />
                    <Polygon points="20,25 0,4 8,25" fill="#eee" />
                    <Line
                        x1={20}
                        y1={25}
                        x2={80}
                        y2={25}
                        stroke="#bbb"
                        strokeWidth={1}
                    />
                </Svg>
            </Animated.View>
        </>
    );
}

const nativeEffects = { sticky: Sticky, plane: Plane };

export function TransitionSurface({ scene }: { scene: TransitionScene }) {
    const [reduced, setReduced] = useState<boolean | null>(null);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        let active = true;
        void AccessibilityInfo.isReduceMotionEnabled().then(
            (value) => {
                if (active) setReduced(value);
            },
            () => {
                if (active) setReduced(false);
            },
        );
        return () => {
            active = false;
        };
    }, []);
    const Effect = reduced ? Fade : nativeEffects[scene.id];
    return (
        <View
            pointerEvents="auto"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
                styles.stage,
                {
                    bottom: scene.bottom,
                    backgroundColor: loaded ? "#cfc9bf" : "transparent",
                },
            ]}
        >
            {scene.to && loaded && reduced !== null ? (
                <Effect scene={scene as NativeScene} />
            ) : (
                <>
                    <Image
                        source={{ uri: scene.from as string }}
                        resizeMode="stretch"
                        onLoad={scene.ready}
                        style={{ width: scene.width, height: scene.height }}
                    />
                    {scene.to && (
                        <Image
                            source={{ uri: scene.to as string }}
                            onLoad={() => setLoaded(true)}
                            onError={scene.complete}
                            style={[
                                styles.preload,
                                { width: scene.width, height: scene.height },
                            ]}
                        />
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    stage: {
        ...StyleSheet.absoluteFill,
        zIndex: 200,
        overflow: "hidden",
        isolation: "isolate",
    },
    preload: { position: "absolute", opacity: 0 },
    sticky: {
        position: "absolute",
        paddingVertical: 10,
        paddingHorizontal: 8,
        overflow: "hidden",
        boxShadow: "0 3px 6px #0004",
    },
    stickyText: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 22,
        lineHeight: 22,
        color: "#3a3a3a",
    },
    plane: {
        position: "absolute",
        left: 0,
        top: 0,
        width: 80,
        height: 50,
        transformOrigin: "100% 50%",
    },
});
