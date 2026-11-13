import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../app/root_styles";
import { FormColorFade, FormMotion, FormMotionProvider } from "./form-motion";
import PaperBackground from "./paper-background";
import OptionsOverlay from "./options-overlay";

const filters = [
    ["Furniture", "bed-outline"],
    ["Textbooks", "book-outline"],
    ["Under $25", "cash-outline"],
    ["Distance", "location-outline"],
    ["Electronics", "desktop-outline"],
    ["Clothing", "shirt-outline"],
    ["Convenience", "file-tray-outline"],
    ["Favorites", "heart-outline"],
];
const directions = [
    ["Ascending", "Ascending", "arrow-up"],
    ["Descending", "Descending", "arrow-down"],
    ["Unsorted", "No order", "reorder-three-outline"],
];
const fields = [
    ["Name", "Name", "A to Z", "Z to A"],
    ["Seller", "Seller", "A to Z", "Z to A"],
    ["Relevance", "Relevance", "best last", "best first"],
    ["Price", "Price", "cheapest first", "priciest first"],
    ["Date Published", "Date published", "oldest first", "newest first"],
];
const defaultSort = { field: "Date Published", direction: "Descending" };

function Check({ selected, badge = false }) {
    if (badge && !selected) return null;
    return (
        <View
            style={[
                styles.check,
                selected && styles.checkSelected,
                badge && styles.badge,
            ]}
        >
            {selected && (
                <FormMotion variant="badge">
                    <Ionicons name="checkmark" size={17} color={colors.white} />
                </FormMotion>
            )}
        </View>
    );
}

export default function CatalogOptions({
    kind,
    appliedFilters,
    sortConfig,
    onApplyFilters,
    onApplySort,
    onClose,
}) {
    const filter = kind === "filter";
    const [draftFilters, setDraftFilters] = useState(() =>
        Object.fromEntries(
            filters.map(([name]) => [name, Boolean(appliedFilters[name])]),
        ),
    );
    const [sort, setSort] = useState(sortConfig ?? defaultSort);
    const unordered = sort.direction === "Unsorted";

    return (
        <OptionsOverlay
            title={filter ? "Filter listings" : "Sort listings"}
            onClose={onClose}
        >
            {(close) => (
                <FormMotionProvider>
                    <View style={styles.board}>
                        <View style={styles.paper}>
                            <View pointerEvents="none" style={styles.texture}>
                                <PaperBackground />
                            </View>
                            <View
                                pointerEvents="none"
                                aria-hidden
                                style={styles.clip}
                            >
                                <View style={styles.clipSlot} />
                            </View>
                            <View style={styles.header}>
                                <Text
                                    accessibilityRole="header"
                                    style={styles.title}
                                >
                                    {kind}
                                </Text>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Close options"
                                    onPress={close}
                                    style={styles.close}
                                >
                                    <Ionicons
                                        name="close"
                                        size={28}
                                        color={colors.maroon}
                                    />
                                </Pressable>
                            </View>
                            <Text style={styles.subtitle}>
                                {filter
                                    ? "what do you want to see?"
                                    : "any particular order you prefer?"}
                            </Text>
                            <ScrollView
                                style={styles.scroll}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {filter ? (
                                    <View style={styles.grid}>
                                        {filters.map(([name, icon], index) => (
                                            <FormMotion
                                                key={name}
                                                delay={index * 50}
                                                style={styles.tileColumn}
                                            >
                                                <Pressable
                                                    accessibilityRole="button"
                                                    aria-pressed={
                                                        draftFilters[name]
                                                    }
                                                    disabled={
                                                        name === "Distance" ||
                                                        name === "Convenience"
                                                    }
                                                    accessibilityHint={
                                                        name === "Distance" ||
                                                        name === "Convenience"
                                                            ? "This filter is unavailable until listings include location data"
                                                            : undefined
                                                    }
                                                    onPress={() =>
                                                        setDraftFilters(
                                                            (current) => ({
                                                                ...current,
                                                                [name]: !current[
                                                                    name
                                                                ],
                                                            }),
                                                        )
                                                    }
                                                    style={({ pressed }) => [
                                                        styles.tile,
                                                        draftFilters[name] &&
                                                            styles.tileSelected,
                                                        pressed &&
                                                            styles.pressed,
                                                        (name === "Distance" ||
                                                            name ===
                                                                "Convenience") &&
                                                            styles.unavailable,
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={icon}
                                                        size={26}
                                                        color={colors.maroon}
                                                    />
                                                    <Text
                                                        style={styles.tileLabel}
                                                    >
                                                        {name}
                                                    </Text>
                                                    <Check
                                                        selected={
                                                            draftFilters[name]
                                                        }
                                                        badge
                                                    />
                                                </Pressable>
                                            </FormMotion>
                                        ))}
                                    </View>
                                ) : (
                                    <>
                                        <View
                                            accessibilityRole="radiogroup"
                                            accessibilityLabel="Sort direction"
                                            style={styles.directions}
                                        >
                                            {directions.map(
                                                ([direction, label, icon]) => {
                                                    const selected =
                                                        sort.direction ===
                                                        direction;
                                                    return (
                                                        <View
                                                            key={direction}
                                                            style={
                                                                styles.directionColumn
                                                            }
                                                        >
                                                            <Pressable
                                                                accessibilityRole="radio"
                                                                accessibilityState={{
                                                                    checked:
                                                                        selected,
                                                                }}
                                                                onPress={() =>
                                                                    setSort(
                                                                        (
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            direction,
                                                                        }),
                                                                    )
                                                                }
                                                                style={({
                                                                    pressed,
                                                                }) => [
                                                                    styles.direction,
                                                                    selected &&
                                                                        styles.directionSelected,
                                                                    pressed &&
                                                                        styles.pressed,
                                                                ]}
                                                            >
                                                                <Ionicons
                                                                    name={icon}
                                                                    size={25}
                                                                    color={
                                                                        selected
                                                                            ? colors.white
                                                                            : colors.maroon
                                                                    }
                                                                />
                                                                <Text
                                                                    style={[
                                                                        styles.directionLabel,
                                                                        selected &&
                                                                            styles.white,
                                                                    ]}
                                                                >
                                                                    {label}
                                                                </Text>
                                                            </Pressable>
                                                        </View>
                                                    );
                                                },
                                            )}
                                        </View>
                                        <Text style={styles.sortBy}>
                                            sort by
                                        </Text>
                                        <View
                                            accessibilityRole="radiogroup"
                                            accessibilityLabel="Sort by"
                                            accessibilityState={{
                                                disabled: unordered,
                                            }}
                                            style={styles.notebook}
                                        >
                                            {fields.map(
                                                ([field, label, asc, desc]) => {
                                                    const selected =
                                                        !unordered &&
                                                        sort.field === field;
                                                    return (
                                                        <Pressable
                                                            key={field}
                                                            accessibilityRole="radio"
                                                            accessibilityState={{
                                                                checked:
                                                                    selected,
                                                                disabled:
                                                                    unordered,
                                                            }}
                                                            disabled={unordered}
                                                            onPress={() =>
                                                                setSort(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        field,
                                                                    }),
                                                                )
                                                            }
                                                            style={({
                                                                pressed,
                                                            }) => [
                                                                styles.field,
                                                                selected &&
                                                                    styles.fieldSelected,
                                                                pressed &&
                                                                    styles.pressed,
                                                            ]}
                                                        >
                                                            <Check
                                                                selected={
                                                                    selected
                                                                }
                                                            />
                                                            <Text
                                                                style={
                                                                    styles.fieldLabel
                                                                }
                                                            >
                                                                {label}
                                                            </Text>
                                                            {!unordered && (
                                                                <Text
                                                                    style={
                                                                        styles.hint
                                                                    }
                                                                >
                                                                    {sort.direction ===
                                                                    "Ascending"
                                                                        ? asc
                                                                        : desc}
                                                                </Text>
                                                            )}
                                                        </Pressable>
                                                    );
                                                },
                                            )}
                                            <View
                                                pointerEvents="none"
                                                style={StyleSheet.absoluteFill}
                                            >
                                                <FormColorFade
                                                    visible={unordered}
                                                    style={styles.dim}
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}
                            </ScrollView>
                            <View style={styles.footer}>
                                <Pressable
                                    accessibilityRole="button"
                                    style={[styles.action, styles.apply]}
                                    onPress={() => {
                                        if (filter)
                                            onApplyFilters(draftFilters);
                                        else onApplySort(sort);
                                        close();
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.actionText,
                                            styles.white,
                                        ]}
                                    >
                                        Apply changes
                                    </Text>
                                </Pressable>
                                <Pressable
                                    accessibilityRole="button"
                                    style={[styles.action, styles.reset]}
                                    onPress={() => {
                                        if (filter)
                                            setDraftFilters(
                                                Object.fromEntries(
                                                    filters.map(([name]) => [
                                                        name,
                                                        false,
                                                    ]),
                                                ),
                                            );
                                        else setSort(defaultSort);
                                    }}
                                >
                                    <Text style={styles.actionText}>
                                        Reset changes
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </FormMotionProvider>
            )}
        </OptionsOverlay>
    );
}

const styles = StyleSheet.create({
    board: { flex: 1, padding: 9, paddingTop: 20, backgroundColor: "#C9AC84" },
    paper: {
        flex: 1,
        padding: 14,
        paddingTop: 23,
        backgroundColor: colors.cream,
        borderWidth: 1,
        borderColor: "#D3C4B2",
    },
    texture: { ...StyleSheet.absoluteFill, opacity: 0.38 },
    clip: {
        position: "absolute",
        top: -13,
        alignSelf: "center",
        width: 102,
        height: 27,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#74726F",
        backgroundColor: "#AAA8A3",
        alignItems: "center",
        justifyContent: "center",
    },
    clipSlot: {
        width: 46,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#74726F",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontFamily: "Outfit",
        fontWeight: "800",
        fontSize: 46,
        color: colors.maroon,
        letterSpacing: -1,
    },
    close: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: colors.cream,
        borderWidth: 1,
        borderColor: "#D3C4B2",
    },
    subtitle: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 22,
        color: colors.ink,
        marginBottom: 12,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 2, paddingBottom: 10 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
    tileColumn: { width: "48%", flexGrow: 1, flexBasis: "45%" },
    tile: {
        minHeight: 82,
        padding: 5,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#E3D8D8",
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    tileSelected: {
        backgroundColor: colors.goldLight,
        borderColor: colors.maroon,
    },
    unavailable: { opacity: 0.55 },
    tileLabel: {
        fontFamily: "Caveat",
        fontWeight: "700",
        fontSize: 24,
        lineHeight: 26,
        color: colors.ink,
        textAlign: "center",
    },
    check: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 6,
        borderColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.white,
    },
    checkSelected: { backgroundColor: colors.maroon },
    badge: { position: "absolute", top: 5, right: 5, width: 21, height: 21 },
    directions: { flexDirection: "row", gap: 6 },
    directionColumn: { flex: 1, minWidth: 0 },
    direction: {
        minHeight: 76,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.maroon,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    },
    directionSelected: { backgroundColor: colors.maroon },
    directionLabel: {
        fontFamily: "Caveat",
        fontSize: 19,
        fontWeight: "700",
        color: colors.maroon,
        textAlign: "center",
    },
    pressed: { opacity: 0.82 },
    sortBy: {
        fontFamily: "Caveat",
        fontSize: 26,
        fontWeight: "700",
        color: colors.maroon,
        marginTop: 14,
        marginBottom: 4,
    },
    notebook: {
        backgroundColor: "#FFFCF5",
        borderWidth: 1,
        borderColor: "#E3D8D8",
    },
    field: {
        minHeight: 49,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#CBD9EC",
        borderLeftWidth: 5,
        borderLeftColor: "transparent",
        paddingHorizontal: 7,
    },
    fieldSelected: {
        backgroundColor: colors.goldLight,
        borderLeftColor: colors.maroon,
    },
    fieldLabel: {
        flex: 1,
        fontFamily: "Outfit",
        color: colors.ink,
        fontSize: 15,
        fontWeight: "700",
    },
    hint: {
        maxWidth: "43%",
        fontFamily: "Caveat",
        fontSize: 17,
        fontWeight: "700",
        color: colors.maroon,
        textAlign: "right",
    },
    dim: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(255,252,245,.6)",
    },
    footer: { gap: 8, paddingTop: 8 },
    action: {
        minHeight: 48,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },
    apply: { backgroundColor: colors.maroon },
    reset: { backgroundColor: colors.blush },
    actionText: {
        fontFamily: "Outfit",
        fontSize: 17,
        fontWeight: "800",
        color: colors.maroon,
    },
    white: { color: colors.white },
});
