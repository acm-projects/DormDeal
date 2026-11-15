import { useEffect, useRef, useState } from "react";
import {
    Animated,
    LayoutAnimation,
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../app/root_styles";
import { events } from "../../data/events";
import type { CalEvent } from "../../data/events";
import { items } from "../../data/items";
const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
const body = "Outfit";
const heading = "Caveat";

// year, month (0-11), day -> 'YYYY-MM-DD'
function toKey(year: number, month: number, day: number) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
}
export default function Calendar() {
    const router = useRouter();
    const today = new Date();
    const todayKey = toKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    // pickups come from items, events come from events.ts
    const pickupEvents: CalEvent[] = items.map((i): CalEvent => ({
        id: `pickup-${i.id}`,
        date: i.pickupDate,
        title: `Pick up: ${i.title}`,
        time: i.pickupTime,
        place: i.pickup,
        type: "pickup",
    }));
    const allEvents: CalEvent[] = [...events, ...pickupEvents];

    // shown = first day of the month we're looking at
    const [shown, setShown] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );
    // picked = the day tapped (starts on today)
    const [picked, setPicked] = useState(todayKey);
    const monthMotion = useRef(new Animated.Value(0)).current;
    const eventMotion = useRef(new Animated.Value(1)).current;
    const year = shown.getFullYear();
    const month = shown.getMonth();

    // blank squares before the 1st, then the days
    const blanks = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < blanks; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    // chop the flat list into rows of 7
    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    // label for the info panel, like "October 31"
    const [, pm, pd] = picked.split("-").map(Number);
    const pickedLabel = `${monthNames[pm - 1]} ${pd}`;
    const dayEvents = allEvents.filter((e) => e.date === picked);
    function changeMonth(step: number) {
        LayoutAnimation.configureNext({
            duration: 260,
            update: { type: LayoutAnimation.Types.easeInEaseOut },
        });
        setShown(new Date(year, month + step, 1));
        monthMotion.setValue(step > 0 ? 28 : -28);
        Animated.timing(monthMotion, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
        }).start();
    }
    function pickDay(key: string) {
        LayoutAnimation.configureNext({
            duration: 220,
            update: { type: LayoutAnimation.Types.easeInEaseOut },
        });
        setPicked(key);
    }
    useEffect(() => {
        eventMotion.setValue(0);
        Animated.timing(eventMotion, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [eventMotion, picked]);
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => changeMonth(-1)}
                    hitSlop={10}
                    style={styles.monthButton}
                    accessibilityLabel="Previous month"
                >
                    <Text style={styles.arrow}>‹</Text>
                </Pressable>
                <Text
                    style={styles.monthTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                >
                    {monthNames[month]} {year}
                </Text>
                <Pressable
                    onPress={() => changeMonth(1)}
                    hitSlop={10}
                    style={styles.monthButton}
                    accessibilityLabel="Next month"
                >
                    <Text style={styles.arrow}>›</Text>
                </Pressable>
            </View>

            <Animated.View
                style={{
                    opacity: monthMotion.interpolate({
                        inputRange: [-28, 0, 28],
                        outputRange: [0, 1, 0],
                    }),
                    transform: [{ translateX: monthMotion }],
                }}
            >
                <View style={styles.weekRow}>
                    {weekdays.map((w, i) => (
                        <Text key={i} style={styles.weekday}>
                            {w}
                        </Text>
                    ))}
                </View>

                {weeks.map((week, wi) => (
                    <View key={wi} style={styles.weekRow}>
                        {week.map((day, di) => {
                        if (day === null)
                            return <View key={di} style={styles.cell} />;
                        const key = toKey(year, month, day);
                        const dayEvs = allEvents.filter((e) => e.date === key);
                        const hasEvent = dayEvs.some((e) => e.type === "event");
                        const hasPickup = dayEvs.some(
                            (e) => e.type === "pickup",
                        );
                        const isPicked = key === picked;
                        const isToday = key === todayKey;
                        return (
                            <Pressable
                                key={di}
                                onPress={() => pickDay(key)}
                                style={styles.cell}
                            >
                                <View
                                    style={[
                                        styles.dayCircle,
                                        isPicked && styles.dayPicked,
                                        isToday && !isPicked && styles.dayToday,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isPicked && styles.dayTextPicked,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </View>
                                <View style={styles.dotRow}>
                                    {hasEvent && (
                                        <View
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor:
                                                        colors.gold,
                                                },
                                            ]}
                                        />
                                    )}
                                    {hasPickup && (
                                        <View
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor:
                                                        colors.maroon,
                                                },
                                            ]}
                                        />
                                    )}
                                </View>
                            </Pressable>
                        );
                        })}
                    </View>
                ))}
            </Animated.View>

            {/* legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: colors.gold,
                            },
                        ]}
                    />
                    <Text style={styles.legendText}>UTD event</Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.dot,
                            {
                                backgroundColor: colors.maroon,
                            },
                        ]}
                    />
                    <Text style={styles.legendText}>Pickup</Text>
                </View>
            </View>

            {/* info panel for the picked day */}
            <View style={styles.dayPanel}>
                <Animated.View
                    style={{
                        opacity: eventMotion,
                        transform: [
                            {
                                translateY: eventMotion.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [8, 0],
                                }),
                            },
                        ],
                    }}
                >
                <Text style={styles.panelTitle}>{pickedLabel}</Text>

                {dayEvents.length === 0 ? (
                    <Text style={styles.emptyText}>Nothing planned.</Text>
                ) : (
                    dayEvents.map((e) => (
                        <View key={e.id} style={styles.eventRow}>
                            <Text style={styles.eventTitle}>{e.title}</Text>
                            <Text style={styles.eventMeta}>
                                {e.time} · {e.place}
                            </Text>

                            {e.borrow && (
                                <>
                                    <Text style={styles.borrowLabel}>
                                        Borrow for this:
                                    </Text>
                                    <View style={styles.chipRow}>
                                        {e.borrow.map((b) => (
                                            <Pressable
                                                key={b}
                                                style={styles.chip}
                                                onPress={() =>
                                                    router.push("/Store")
                                                }
                                            >
                                                <Text style={styles.chipText}>
                                                    {b}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>
                    ))
                )}
                </Animated.View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 3,
        padding: 14,
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.blush,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    monthButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    monthTitle: {
        flex: 1,
        fontFamily: heading,
        fontSize: 22,
        lineHeight: 30,
        fontWeight: "500",
        color: colors.ink,
        textAlign: "center",
    },
    arrow: {
        fontFamily: body,
        fontSize: 26,
        color: colors.maroon,
    },
    weekRow: {
        flexDirection: "row",
    },
    weekday: {
        flex: 1,
        fontFamily: body,
        textAlign: "center",
        color: colors.muted,
        fontSize: 12,
        marginBottom: 4,
    },
    cell: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 4,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    dayPicked: {
        backgroundColor: colors.maroon,
    },
    dayToday: {
        borderWidth: 1.5,
        borderColor: colors.gold,
    },
    dayText: {
        fontFamily: body,
        color: colors.ink,
        fontSize: 14,
    },
    dayTextPicked: {
        color: colors.white,
    },
    dotRow: {
        flexDirection: "row",
        gap: 3,
        marginTop: 3,
        height: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    legend: {
        flexDirection: "row",
        gap: 14,
        marginTop: 10,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    legendText: {
        fontFamily: body,
        fontSize: 12,
        color: colors.muted,
    },
    dayPanel: {
        marginTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.blush,
        paddingTop: 12,
    },
    panelTitle: {
        fontFamily: heading,
        fontSize: 20,
        fontWeight: "500",
        color: colors.ink,
        marginBottom: 8,
    },
    emptyText: {
        fontFamily: body,
        color: colors.muted,
        fontStyle: "italic",
    },
    eventRow: {
        marginBottom: 12,
    },
    eventTitle: {
        fontFamily: heading,
        fontSize: 15,
        color: colors.ink,
    },
    eventMeta: {
        fontFamily: body,
        fontSize: 13,
        color: colors.muted,
        marginTop: 2,
    },
    borrowLabel: {
        fontFamily: body,
        fontSize: 12,
        color: colors.muted,
        marginTop: 6,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 6,
    },
    chip: {
        backgroundColor: colors.goldLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    chipText: {
        fontFamily: body,
        color: colors.maroonDark,
        fontSize: 12,
    },
});
