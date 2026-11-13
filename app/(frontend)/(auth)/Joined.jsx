import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    FormAction,
    FormBack,
    PaperForm,
    paperFormStyles,
} from "../../../src/components/paper-form";
import {
    FormCheck,
    FormColorFade,
    FormMotion,
} from "../../../src/components/form-motion";
import { colors } from "../../root_styles";
import { JoinedDormDealLogo } from "../../../src/components/joined-dormdeal-logo";

const homes = [
    ["dorm", "Dorm room", "tiny space with many dreams"],
    ["shared", "Shared apartment", "split the big stuff with roommates"],
    ["studio", "Studio of my own", "your home, all your way."],
    ["commuter", "Commuting from home", "just the campus essentials"],
];
const needs = [
    "Furniture",
    "Electronics",
    "Books",
    "Clothing",
    "Kitchen",
    "Decor",
    "Bikes & rides",
    "Tutoring",
];
const needRows = Array.from({ length: Math.ceil(needs.length / 2) }, (_, row) =>
    needs.slice(row * 2, row * 2 + 2),
);
const deals = [
    "Under $10",
    "Free stuff",
    "Barely used",
    "Services",
    "Move-out sales",
    "Same-hall pickup",
    "For my classes",
];
const questions = [
    "where are you living this year?",
    "what do you need most?",
    "which deals do you care about?",
];
const topics = ["Your space", "What you need", "Deals to flag"];

export default function Joined() {
    const router = useRouter();
    const { from } = useLocalSearchParams();
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [living, setLiving] = useState("");
    const [picks, setPicks] = useState([]);
    const [flags, setFlags] = useState([]);
    const [skippedFrom, setSkippedFrom] = useState(null);
    const [message, setMessage] = useState("");
    const [nameShake, setNameShake] = useState(0);
    const question = step >= 3 && step <= 5;
    const displayName = name.trim() || "friend";
    const validation = [
        "",
        name.trim() ? "" : "Tell us your name first.",
        "",
        living ? "" : "Pick one to continue.",
        picks.length ? "" : "Pick at least one, up to three.",
        flags.length ? "" : "Pick at least one, or skip the quiz.",
    ];

    function goTo(next) {
        setMessage("");
        setStep(next);
    }

    function back() {
        if (step === 0) {
            leave();
            return;
        }
        goTo(skippedFrom ?? step - 1);
        setSkippedFrom(null);
    }

    function skip() {
        setSkippedFrom(step);
        goTo(5);
    }

    function toggleNeed(need) {
        if (!picks.includes(need) && picks.length === 3) {
            setMessage(
                "You can pick up to three. Tap a selected card to remove it.",
            );
            return;
        }
        setMessage("");
        setPicks((current) =>
            current.includes(need)
                ? current.filter((pick) => pick !== need)
                : [...current, need],
        );
    }

    function leave() {
        if (from === "settings" && router.canGoBack()) router.back();
        else router.replace("/home");
    }

    useEffect(() => {
        if (step !== 0) return;
        const timer = setTimeout(() => setStep(1), 1800);
        return () => clearTimeout(timer);
    }, [step]);

    return (
        <PaperForm
            pageKey={step}
            stageVariant={step === 1 ? "slide" : "fade"}
            header={
                <View style={styles.top}>
                    <FormBack
                        label={step === 0 ? "Close quiz" : "Go back"}
                        close={step === 0}
                        onPress={back}
                    />
                    {question && (
                        <View style={styles.progress}>
                            <View style={styles.row}>
                                {[3, 4, 5].map((value) => (
                                    <View key={value} style={styles.tick}>
                                        <FormColorFade
                                            visible={value <= step}
                                            style={styles.currentTick}
                                        />
                                        <FormColorFade
                                            visible={value < step}
                                            style={styles.doneTick}
                                        />
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.progressText}>
                                question {step - 2} of 3
                            </Text>
                        </View>
                    )}
                </View>
            }
            footer={
                step !== 0 && (
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
                        pulse={step === 6}
                        muted={Boolean(validation[step])}
                        onPress={() => {
                            if (step === 6) leave();
                            else if (validation[step]) {
                                setMessage(validation[step]);
                                if (step === 1)
                                    setNameShake((count) => count + 1);
                            } else goTo(step + 1);
                        }}
                    >
                        {
                            [
                                "Let’s go!",
                                "Next!",
                                "Let's go!",
                                "Next!",
                                "Next!",
                                "Complete Quiz",
                                "Go!",
                            ][step]
                        }
                    </FormAction>
                    {step > 0 && step < 6 && (
                        <Pressable
                            accessibilityRole="button"
                            onPress={skip}
                            style={styles.skip}
                        >
                            <Text style={paperFormStyles.link}>Skip quiz</Text>
                        </Pressable>
                    )}
                </>
                )
            }
        >
            {step === 0 && (
                <View style={styles.welcome}>
                    <FormMotion variant="stamp" delay={100}>
                        <JoinedDormDealLogo />
                    </FormMotion>
                    <FormMotion variant="wiggle" delay={350}>
                        <Text
                            accessibilityRole="header"
                            style={[paperFormStyles.heading, styles.center]}
                        >
                            your campus, your way.
                        </Text>
                    </FormMotion>
                </View>
            )}
            {step === 1 && (
                <View style={styles.intro}>
                    <Text
                        accessibilityRole="header"
                        style={[
                            paperFormStyles.heading,
                            styles.center,
                            styles.introHeading,
                        ]}
                    >
                        first, what's your name?
                    </Text>
                    <FormMotion
                        variant="shake"
                        trigger={nameShake}
                        style={styles.nameField}
                    >
                        <TextInput
                            accessibilityLabel="Your first name"
                            value={name}
                            maxLength={20}
                            autoCapitalize="words"
                            autoComplete="given-name"
                            placeholder="Your first name"
                            placeholderTextColor={colors.muted}
                            style={styles.nameInput}
                            onChangeText={(value) => {
                                setName(value);
                                setMessage("");
                            }}
                        />
                        <View style={styles.underline} />
                    </FormMotion>
                </View>
            )}
            {step === 2 && (
                <View style={styles.intro}>
                    <Text
                        accessibilityRole="header"
                        style={[paperFormStyles.heading, styles.introHeading]}
                    >
                        {"nice to meet you, " + displayName + "."}
                    </Text>
                    <FormMotion delay={250}>
                        <View style={[paperFormStyles.note, styles.introNote]}>
                            <Text style={paperFormStyles.noteText}>
                                Before we start, let’s learn a little about you.
                            </Text>
                        </View>
                    </FormMotion>
                    <View style={styles.options}>
                        {topics.map((topic, index) => (
                            <FormMotion
                                key={topic}
                                delay={550 + index * 150}
                                style={[paperFormStyles.card, styles.topic]}
                            >
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {index + 1}
                                    </Text>
                                </View>
                                <Text style={styles.optionText}>{topic}</Text>
                            </FormMotion>
                        ))}
                    </View>
                </View>
            )}
            {question && (
                <View style={styles.questionStep}>
                    <Text
                        accessibilityRole="header"
                        style={[paperFormStyles.heading, styles.question]}
                    >
                        {questions[step - 3]}
                    </Text>
                    {step === 3 && (
                <View accessibilityRole="radiogroup" style={styles.options}>
                    {homes.map(([id, label, note], index) => {
                        const selected = living === id;
                        return (
                            <FormMotion key={id} delay={120 + index * 70}>
                                <FormMotion
                                    variant="softPop"
                                    trigger={Number(selected)}
                                >
                                    <Pressable
                                        accessibilityRole="radio"
                                        accessibilityState={{
                                            checked: selected,
                                        }}
                                        onPress={() => {
                                            setLiving(id);
                                            setMessage("");
                                        }}
                                        style={[
                                            paperFormStyles.card,
                                            styles.livingOption,
                                            selected && styles.selected,
                                        ]}
                                    >
                                        <View style={styles.check}>
                                            <FormColorFade
                                                visible={selected}
                                                style={styles.radioDot}
                                            />
                                        </View>
                                        <View style={styles.optionCopy}>
                                            <Text style={styles.optionText}>
                                                {label}
                                            </Text>
                                            <Text style={styles.optionNote}>
                                                {note}
                                            </Text>
                                        </View>
                                    </Pressable>
                                </FormMotion>
                            </FormMotion>
                        );
                    })}
                </View>
                    )}
                    {step === 4 && (
                <View style={styles.needGrid}>
                    {needRows.map((row, rowIndex) => (
                        <View key={row[0]} style={styles.needRow}>
                            {row.map((need, columnIndex) => {
                                const rank = picks.indexOf(need) + 1;
                                return (
                                    <FormMotion
                                        key={need}
                                        delay={
                                            120 +
                                            (rowIndex * 2 + columnIndex) * 70
                                        }
                                        style={styles.needColumn}
                                    >
                                        <FormMotion
                                            variant="pop"
                                            trigger={Number(rank > 0)}
                                            style={styles.needCard}
                                        >
                                            <Pressable
                                                accessibilityRole="checkbox"
                                                accessibilityState={{
                                                    checked: rank > 0,
                                                }}
                                                onPress={() => toggleNeed(need)}
                                                style={[
                                                    paperFormStyles.card,
                                                    styles.need,
                                                    rank > 0 && styles.selected,
                                                ]}
                                            >
                                                {rank > 0 && (
                                                    <FormMotion
                                                        variant="badge"
                                                        style={[
                                                            styles.badge,
                                                            styles.rank,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.badgeText
                                                            }
                                                        >
                                                            {rank}
                                                        </Text>
                                                    </FormMotion>
                                                )}
                                                <Text style={styles.needText}>
                                                    {need}
                                                </Text>
                                            </Pressable>
                                        </FormMotion>
                                    </FormMotion>
                                );
                            })}
                        </View>
                    ))}
                </View>
                    )}
                    {step === 5 && (
                <View style={styles.options}>
                    <View style={styles.dealHeader}>
                        <Text style={styles.count}>
                            {flags.length} of {deals.length} selected
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                setFlags(
                                    flags.length === deals.length
                                        ? []
                                        : [...deals],
                                );
                                setMessage("");
                            }}
                        >
                            <Text style={paperFormStyles.link}>
                                {flags.length === deals.length
                                    ? "Clear all"
                                    : "Select all"}
                            </Text>
                        </Pressable>
                    </View>
                    {deals.map((deal, index) => {
                        const selected = flags.includes(deal);
                        return (
                            <FormMotion key={deal} delay={120 + index * 70}>
                                <Pressable
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: selected }}
                                    onPress={() => {
                                        setFlags((current) =>
                                            selected
                                                ? current.filter(
                                                      (flag) => flag !== deal,
                                                  )
                                                : [...current, deal],
                                        );
                                        setMessage("");
                                    }}
                                    style={[
                                        paperFormStyles.card,
                                        styles.deal,
                                        selected && styles.dealSelected,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.check,
                                            selected && styles.checked,
                                        ]}
                                    >
                                        {selected && (
                                            <FormCheck color={colors.white} />
                                        )}
                                    </View>
                                    <Text style={styles.optionText}>
                                        {deal}
                                    </Text>
                                </Pressable>
                            </FormMotion>
                        );
                    })}
                </View>
                    )}
                </View>
            )}
            {step === 6 && (
                <View style={styles.done}>
                    <View
                        style={styles.doorFrame}
                        importantForAccessibility="no-hide-descendants"
                    >
                        <FormMotion variant="glow" style={styles.glow} />
                        <FormMotion
                            variant="door"
                            delay={500}
                            style={styles.door}
                        >
                            <Text style={styles.doorLabel}>DORM</Text>
                            <View style={styles.knob} />
                        </FormMotion>
                    </View>
                    <FormMotion variant="stamp" delay={1100}>
                        <Text
                            accessibilityRole="header"
                            style={[paperFormStyles.heading, styles.center]}
                        >
                            welcome home!
                        </Text>
                    </FormMotion>
                    <FormMotion delay={1300}>
                        <Text style={[paperFormStyles.body, styles.center]}>
                            {"ready to joined a trusted community, " +
                                displayName +
                                "?"}
                        </Text>
                    </FormMotion>
                    <FormMotion delay={1500} style={paperFormStyles.note}>
                        <Text style={[paperFormStyles.noteText, styles.center]}>
                            Built for students, made by students.
                        </Text>
                    </FormMotion>
                </View>
            )}
        </PaperForm>
    );
}

const styles = StyleSheet.create({
    top: { flexDirection: "row", alignItems: "center", gap: 16 },
    progress: { flex: 1, gap: 4 },
    row: { flexDirection: "row", gap: 8 },
    tick: {
        flex: 1,
        height: 8,
        borderRadius: 3,
        backgroundColor: "#D9D4CB",
        overflow: "hidden",
    },
    doneTick: { ...StyleSheet.absoluteFill, backgroundColor: colors.maroon },
    currentTick: { ...StyleSheet.absoluteFill, backgroundColor: "#C98A8A" },
    progressText: {
        fontFamily: "Caveat",
        fontSize: 20,
        color: colors.maroon,
        fontWeight: "700",
    },
    welcome: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
    },
    intro: { flexGrow: 1, justifyContent: "center", gap: 20 },
    introHeading: { width: "100%", textAlign: "center" },
    introNote: { transform: [{ rotate: "-0.5deg" }], marginBottom: 8 },
    nameField: { marginTop: 8 },
    nameInput: {
        minHeight: 56,
        borderRadius: 6,
        padding: 14,
        backgroundColor: "#F7E26B",
        fontFamily: "Outfit",
        color: colors.ink,
        fontSize: 23,
        fontWeight: "600",
    },
    underline: {
        height: 3,
        marginTop: 6,
        borderRadius: 2,
        backgroundColor: colors.ink,
    },
    questionStep: { flexGrow: 1, justifyContent: "center", gap: 20 },
    question: { fontSize: 42, lineHeight: 43 },
    options: { gap: 10 },
    topic: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 6,
    },
    badge: {
        minWidth: 27,
        minHeight: 27,
        borderRadius: 7,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.maroon,
    },
    badgeText: { fontFamily: "Outfit", fontWeight: "800", color: colors.white },
    livingOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        minHeight: 74,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: "transparent",
    },
    optionCopy: { flex: 1 },
    optionText: {
        flexShrink: 1,
        fontFamily: "Outfit",
        color: colors.ink,
        fontWeight: "700",
        fontSize: 17,
    },
    optionNote: { fontFamily: "Caveat", color: colors.maroon, fontSize: 20 },
    check: {
        width: 26,
        height: 26,
        flexShrink: 0,
        borderRadius: 6,
        borderWidth: 3,
        borderColor: colors.maroon,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    radioDot: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -6,
        marginLeft: -6,
        width: 12,
        height: 12,
        borderRadius: 3,
        backgroundColor: colors.maroon,
    },
    needGrid: { gap: 12 },
    needRow: { flexDirection: "row", gap: 12 },
    needColumn: { flex: 1, minWidth: 0 },
    needCard: { flex: 1 },
    need: {
        flex: 1,
        minHeight: 84,
        borderRadius: 8,
        paddingHorizontal: 11,
        paddingTop: 25,
        paddingBottom: 8,
        justifyContent: "flex-end",
        borderWidth: 3,
        borderColor: "transparent",
    },
    needText: {
        fontFamily: "Caveat",
        fontSize: 26,
        lineHeight: 27,
        fontWeight: "700",
        color: colors.ink,
    },
    rank: { position: "absolute", right: 6, top: 5 },
    selected: { borderColor: colors.maroon },
    dealHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 32,
    },
    count: {
        fontFamily: "Outfit",
        fontWeight: "600",
        color: colors.muted,
        fontSize: 14,
    },
    deal: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        minHeight: 52,
        borderRadius: 6,
        borderLeftWidth: 6,
        borderLeftColor: colors.rose,
    },
    dealSelected: { borderLeftColor: colors.maroon },
    checked: { backgroundColor: colors.maroon },
    skip: { minHeight: 36, justifyContent: "center" },
    done: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        paddingVertical: 10,
    },
    center: { textAlign: "center" },
    doorFrame: {
        width: 154,
        height: 200,
        backgroundColor: "#FFF6BF",
        borderColor: "#4D2A1A",
        borderWidth: 8,
        borderBottomWidth: 0,
        borderRadius: 5,
    },
    glow: { ...StyleSheet.absoluteFill, backgroundColor: colors.goldLight },
    door: {
        width: "100%",
        height: "100%",
        borderWidth: 5,
        borderColor: "#8F1111",
        backgroundColor: colors.maroon,
        paddingTop: 20,
        alignItems: "center",
    },
    doorLabel: {
        fontFamily: "Outfit",
        fontWeight: "800",
        backgroundColor: colors.cream,
        color: colors.maroon,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    knob: {
        position: "absolute",
        right: 8,
        top: "55%",
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: colors.goldLight,
    },
});
