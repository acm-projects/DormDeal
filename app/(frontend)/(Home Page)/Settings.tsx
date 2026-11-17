import { useEffect, useRef, useState, type ReactNode } from "react";
import {
    Animated,
    Modal,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Base from "../../../src/components/base";
import TabBar from "../../../src/components/tab_bar";
import {
    BackButton,
    PageTitle,
    Squiggle,
} from "../../../src/components/design";
import { colors } from "../../root_styles";
import { supabase } from "../../../lib/supabase";
const groups = [
    {
        title: "Marketplace & Orders",
        rows: [
            ["Saved Listings", "heart"],
            ["Order History", "receipt"],
            ["Purchase Notifications", "notifications"],
            ["Payment Methods", "card"],
            ["Recommendation quiz", "sparkles"],
        ],
    },
    {
        title: "Selling & Store",
        rows: [
            ["Seller Profile", "person"],
            ["Listing Defaults", "pricetag"],
            ["Pickup Preferences", "location"],
            ["Sales Notifications", "notifications"],
        ],
    },
    {
        title: "Account & Safety",
        rows: [
            ["Account Details", "person"],
            ["Privacy & Blocked Users", "lock-closed"],
            ["Help & Safety", "shield-checkmark"],
        ],
    },
] as const;

const SettingsScene = ({ children }: { children: ReactNode }) => {
    const reveal = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(reveal, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
        }).start();
    }, [reveal]);
    return (
        <Animated.View
            style={{
                flex: 1,
                opacity: reveal,
                transform: [
                    {
                        translateY: reveal.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        }),
                    },
                ],
            }}
        >
            {children}
        </Animated.View>
    );
};

const SettingReveal = ({
    children,
    delay,
}: {
    children: ReactNode;
    delay: number;
}) => {
    const reveal = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(reveal, {
            toValue: 1,
            duration: 220,
            delay,
            useNativeDriver: true,
        }).start();
    }, [delay, reveal]);
    return (
        <Animated.View
            style={{
                opacity: reveal,
                transform: [
                    {
                        translateY: reveal.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, 0],
                        }),
                    },
                ],
            }}
        >
            {children}
        </Animated.View>
    );
};
const SavedListings = ({ onBack }: { onBack: () => void }) => {
    const [notify, setNotify] = useState(true);
    const [unavailable, setUnavailable] = useState(false);
    const [sort, setSort] = useState(0);
    const [sortPickerVisible, setSortPickerVisible] = useState(false);
    const sorts = [
        "Recently saved",
        "Price: low to high",
        "Price: high to low",
    ];
    return (
        <Base style={styles.screen}>
            <SettingsScene>
            <ScrollView
                contentContainerStyle={styles.savedContent}
                showsVerticalScrollIndicator={false}
            >
                <SettingReveal delay={0}>
                <View style={styles.backInset}>
                    <BackButton onPress={onBack} />
                </View>
                </SettingReveal>
                <SettingReveal delay={90}>
                <View style={styles.savedHeader}>
                    <View style={styles.highlighter} />
                    <Text style={styles.savedTitle}>Saved Listings</Text>
                </View>
                </SettingReveal>
                <SettingReveal delay={180}>
                <View style={styles.savedCard}>
                    <SettingRow label="Notify me when saved items change price">
                        <Toggle value={notify} onChange={setNotify} />
                    </SettingRow>
                    <SettingRow label="Sort saved listings by">
                        <Pressable
                            onPress={() => setSortPickerVisible(true)}
                            style={styles.sort}
                        >
                            <Text style={styles.sortText}>{sorts[sort]}</Text>
                            <Ionicons
                                name="chevron-down"
                                size={18}
                                color={colors.white}
                            />
                        </Pressable>
                    </SettingRow>
                    <SettingRow label="Show unavailable listings">
                        <Toggle value={unavailable} onChange={setUnavailable} />
                    </SettingRow>
                </View>
                </SettingReveal>
            </ScrollView>
            </SettingsScene>
            <OptionSheet
                visible={sortPickerVisible}
                title="Sort saved listings"
                options={sorts}
                selected={sort}
                onClose={() => setSortPickerVisible(false)}
                onSelect={(index) => setSort(index)}
            />
        </Base>
    );
};
const OptionSheet = ({
    visible,
    title,
    options,
    selected,
    onClose,
    onSelect,
}: {
    visible: boolean;
    title: string;
    options: string[];
    selected: number;
    onClose: () => void;
    onSelect: (index: number) => void;
}) => {
    const [position] = useState(() => new Animated.Value(1));
    const [dragOffset] = useState(() => new Animated.Value(0));
    useEffect(() => {
        if (!visible) {
            position.setValue(1);
            dragOffset.setValue(0);
            return;
        }
        Animated.timing(position, {
            toValue: 0,
            duration: 260,
            useNativeDriver: false,
        }).start();
    }, [dragOffset, position, visible]);
    const dismiss = () =>
        Animated.parallel([
            Animated.timing(position, {
                toValue: 1,
                duration: 260,
                useNativeDriver: false,
            }),
            Animated.timing(dragOffset, {
                toValue: 0,
                duration: 180,
                useNativeDriver: false,
            }),
        ]).start(({ finished }) => {
            if (finished) onClose();
        });
    const dismissByDrag = () =>
        Animated.timing(dragOffset, {
            toValue: 520,
            duration: 180,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) onClose();
        });
    const sheetPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
            gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
            dragOffset.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dy > 100 || gesture.vy > 0.7) {
                dismissByDrag();
                return;
            }
            Animated.spring(dragOffset, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
        },
        onPanResponderTerminate: () => {
            Animated.spring(dragOffset, {
                toValue: 0,
                useNativeDriver: false,
            }).start();
        },
    });
    const select = (index: number) => {
        onSelect(index);
        dismiss();
    };
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={dismiss}
        >
            <Pressable style={styles.sheetScrim} onPress={dismiss}>
                <Animated.View
                    style={[
                        styles.sortSheet,
                        {
                            transform: [
                                {
                                    translateY: Animated.add(
                                        position.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 520],
                                        }),
                                        dragOffset,
                                    ),
                                },
                            ],
                        },
                    ]}
                >
                    <Pressable onPress={(event) => event.stopPropagation()}>
                        <View
                            {...sheetPanResponder.panHandlers}
                            style={styles.sheetHandleTouchTarget}
                            accessibilityLabel="Drag down to close options"
                        >
                            <View style={styles.sheetHandle} />
                        </View>
                        <View style={styles.sheetTitleRow}>
                            <Text style={styles.sheetTitle}>{title}</Text>
                            <Pressable
                                onPress={dismiss}
                                hitSlop={10}
                                accessibilityLabel="Close options"
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={colors.ink}
                                />
                            </Pressable>
                        </View>
                        {options.map((option, index) => (
                            <Pressable
                                key={option}
                                style={[
                                    styles.sheetOption,
                                    index > 0 && styles.sheetDivider,
                                ]}
                                onPress={() => select(index)}
                            >
                                <Text style={styles.sheetOptionText}>
                                    {option}
                                </Text>
                                {selected === index && (
                                    <Ionicons
                                        name="checkmark"
                                        size={22}
                                        color={colors.maroon}
                                    />
                                )}
                            </Pressable>
                        ))}
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};
const DetailSettings = ({
    title,
    onBack,
}: {
    title: string;
    onBack: () => void;
}) => {
    const [enabled, setEnabled] = useState(true);
    const [secondary, setSecondary] = useState(false);
    const details: Record<
        string,
        {
            toggle: string;
            secondary: string;
            selection: string;
            options: string[];
        }
    > = {
        "Order History": {
            toggle: "Include completed orders",
            secondary: "Show pickup reminders",
            selection: "Default order view",
            options: ["Recent orders", "Purchases", "Sales"],
        },
        "Purchase Notifications": {
            toggle: "Price drop alerts",
            secondary: "Pickup reminders",
            selection: "Notification frequency",
            options: ["Instantly", "Daily", "Weekly"],
        },
        "Payment Methods": {
            toggle: "Use saved payment by default",
            secondary: "Require confirmation",
            selection: "Preferred payment method",
            options: ["Visa •6767", "Zelle", "Cash at pickup"],
        },
        "Seller Profile": {
            toggle: "Show seller activity",
            secondary: "Accept new messages",
            selection: "Profile visibility",
            options: ["Campus only", "Verified students", "Everyone"],
        },
        "Listing Defaults": {
            toggle: "Save item drafts",
            secondary: "Use pickup reminders",
            selection: "Default listing type",
            options: ["Item", "Service", "Wanted"],
        },
        "Pickup Preferences": {
            toggle: "Offer campus pickup",
            secondary: "Send arrival reminders",
            selection: "Preferred pickup spot",
            options: ["Library lobby", "Student union", "Residence hall"],
        },
        "Sales Notifications": {
            toggle: "New message alerts",
            secondary: "Sold item alerts",
            selection: "Sales digest",
            options: ["Instantly", "Daily", "Weekly"],
        },
        "Account Details": {
            toggle: "Show school year",
            secondary: "Display campus affiliation",
            selection: "Profile audience",
            options: ["Only me", "Students", "Everyone"],
        },
        "Privacy & Blocked Users": {
            toggle: "Hide activity status",
            secondary: "Filter unknown messages",
            selection: "Message permissions",
            options: ["Everyone", "Verified students", "Nobody"],
        },
        "Help & Safety": {
            toggle: "Safety check-in reminders",
            secondary: "Show safety resources",
            selection: "Support contact method",
            options: ["In app", "Email", "Phone"],
        },
    };
    const config = details[title] ?? {
        toggle: "Enable updates",
        secondary: "Send me reminders",
        selection: "Preference",
        options: ["Option one", "Option two", "Option three"],
    };
    const [choice, setChoice] = useState(0);
    const [choicePickerVisible, setChoicePickerVisible] = useState(false);
    return (
        <Base style={styles.screen}>
            <SettingsScene>
            <ScrollView
                contentContainerStyle={styles.savedContent}
                showsVerticalScrollIndicator={false}
            >
                <SettingReveal delay={0}>
                <View style={styles.backInset}>
                    <BackButton onPress={onBack} />
                </View>
                </SettingReveal>
                <SettingReveal delay={90}>
                <View style={styles.savedHeader}>
                    <View style={styles.highlighter} />
                    <Text style={styles.savedTitle}>{title}</Text>
                </View>
                </SettingReveal>
                <SettingReveal delay={180}>
                <View style={styles.savedCard}>
                    <SettingRow label={config.toggle}>
                        <Toggle value={enabled} onChange={setEnabled} />
                    </SettingRow>
                    <SettingRow label={config.secondary}>
                        <Toggle value={secondary} onChange={setSecondary} />
                    </SettingRow>
                    <SettingRow label={config.selection}>
                        <Pressable
                            onPress={() => setChoicePickerVisible(true)}
                            style={styles.sort}
                        >
                            <Text style={styles.sortText}>
                                {config.options[choice]}
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                size={18}
                                color={colors.white}
                            />
                        </Pressable>
                    </SettingRow>
                </View>
                </SettingReveal>
            </ScrollView>
            </SettingsScene>
            <OptionSheet
                visible={choicePickerVisible}
                title={config.selection}
                options={config.options}
                selected={choice}
                onClose={() => setChoicePickerVisible(false)}
                onSelect={(index) => setChoice(index)}
            />
        </Base>
    );
};
const Settings = () => {
    const router = useRouter();
    const [saved, setSaved] = useState(false);
    const [detail, setDetail] = useState<string | null>(null);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
    const filteredGroups = groups
        .map((group) => ({
            ...group,
            rows: group.rows.filter(([label]) =>
                !normalizedSearch ||
                `${group.title} ${label}`
                    .toLocaleLowerCase()
                    .includes(normalizedSearch),
            ),
        }))
        .filter((group) => group.rows.length > 0);
    if (saved) return <SavedListings onBack={() => setSaved(false)} />;
    if (detail)
        return <DetailSettings title={detail} onBack={() => setDetail(null)} />;
    return (
        <Base
            style={{
                paddingBottom: 0,
            }}
        >
            <SettingsScene>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <SettingReveal delay={0}>
                <View style={styles.backInset}>
                    <BackButton onPress={() => router.back()} />
                </View>
                </SettingReveal>
                <SettingReveal delay={90}>
                <PageTitle>settings</PageTitle>
                <Squiggle />
                </SettingReveal>
                <SettingReveal delay={180}>
                <View style={styles.search}>
                    <Ionicons name="search" size={28} color={colors.maroon} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={colors.muted}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                </View>
                </SettingReveal>
                {filteredGroups.map((group, groupIndex) => (
                    <SettingReveal key={group.title} delay={270 + groupIndex * 75}>
                    <View key={group.title} style={styles.group}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <View style={styles.settingsCard}>
                            {group.rows.map(([label, icon], index) => (
                                <Pressable
                                    key={label}
                                    onPress={() => {
                                        if (label === "Recommendation quiz")
                                            router.push({
                                                pathname: "/Joined",
                                                params: { from: "settings" },
                                            });
                                        else if (label === "Saved Listings")
                                            setSaved(true);
                                        else setDetail(label);
                                    }}
                                    style={[
                                        styles.settingRow,
                                        index > 0 && styles.divider,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.iconTile,
                                            {
                                                backgroundColor: [
                                                    colors.tileRed,
                                                    colors.mustard,
                                                    colors.sage,
                                                    colors.maroon,
                                                ][index % 4],
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={icon as any}
                                            size={24}
                                            color={colors.white}
                                        />
                                    </View>
                                    <Text style={styles.rowLabel}>{label}</Text>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={28}
                                        color={colors.mutedLight}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    </SettingReveal>
                ))}
                {normalizedSearch && filteredGroups.length === 0 ? (
                    <Text style={styles.searchEmpty}>
                        No settings match “{searchQuery.trim()}”.
                    </Text>
                ) : null}
                <Pressable
                    style={styles.logoutButton}
                    onPress={() => setLogoutVisible(true)}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={22}
                        color={colors.white}
                    />
                    <Text style={styles.logoutText}>Log out</Text>
                </Pressable>
            </ScrollView>
            </SettingsScene>
            <OptionSheet
                visible={logoutVisible}
                title="Log out of DormDeal?"
                options={["Cancel", "Log out"]}
                selected={-1}
                onClose={() => setLogoutVisible(false)}
                onSelect={async (index) => {
                    if (index === 1) {
                        await supabase.auth.signOut();
                        router.replace("/Landing");
                    }
                }}
            />
            <TabBar active="profile" />
        </Base>
    );
};
const SettingRow = ({ label, children }: any) => (
    <View style={styles.settingRow}>
        <Text style={styles.rowLabel}>{label}</Text>
        {children}
    </View>
);
const Toggle = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (next: boolean) => void;
}) => (
    <Pressable
        accessibilityRole="switch"
        accessibilityState={{
            checked: value,
        }}
        onPress={() => onChange(!value)}
        style={[styles.toggle, value && styles.toggleOn]}
    >
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
);
const styles = StyleSheet.create({
    screen: { paddingLeft: 20, paddingRight: 20 },
    backInset: { marginLeft: 0 },
    content: {
        paddingTop: 0,
        paddingHorizontal: 0,
        marginHorizontal: 0,
        paddingBottom: 110,
    },
    savedContent: {
        paddingTop: 0,
        paddingHorizontal: 0,
        marginHorizontal: 0,
        paddingBottom: 110,
    },
    group: {
        marginTop: 22,
    },
    groupTitle: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 4,
        marginBottom: 7,
    },
    settingsCard: {
        marginHorizontal: 0,
        backgroundColor: colors.white,
        filter: `drop-shadow(0px 3px 2px rgba(0, 0, 0, 0.14))`,
    },
    savedCard: {
        marginHorizontal: 0,
        marginTop: 48,
        backgroundColor: colors.white,
        filter: `drop-shadow(0px 3px 2px rgba(0, 0, 0, 0.14))`,
    },
    settingRow: {
        minHeight: 76,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    divider: {
        borderTopWidth: 1,
        borderColor: colors.divider,
    },
    iconTile: {
        width: 42,
        height: 42,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    rowLabel: {
        flex: 1,
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 17,
    },
    search: {
        height: 52,
        backgroundColor: colors.white,
        marginTop: 22,
        marginHorizontal: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        gap: 12,
        filter: `drop-shadow(0px 3px 2px rgba(0, 0, 0, 0.14))`,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Outfit",
        fontSize: 17,
        color: colors.ink,
    },
    logoutButton: {
        height: 54,
        marginTop: 32,
        backgroundColor: colors.maroonLight,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    logoutText: {
        color: colors.white,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 17,
    },
    savedHeader: {
        marginTop: 58,
        alignSelf: "flex-start",
        position: "relative",
        justifyContent: "center",
    },
    highlighter: {
        position: "absolute",
        left: 0,
        right: 14,
        bottom: 1,
        height: 18,
        backgroundColor: colors.gold,
    },
    savedTitle: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontSize: 44,
        fontWeight: "800",
        zIndex: 1,
    },
    sort: {
        minHeight: 44,
        borderRadius: 8,
        paddingHorizontal: 14,
        backgroundColor: colors.tileRed,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sortText: {
        color: colors.white,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 13,
    },
    toggle: {
        width: 54,
        height: 30,
        borderRadius: 6,
        padding: 4,
        backgroundColor: colors.switchOff,
        justifyContent: "center",
    },
    toggleOn: {
        backgroundColor: colors.sage,
    },
    toggleThumb: {
        width: 22,
        height: 22,
        borderRadius: 5,
        backgroundColor: colors.white,
    },
    toggleThumbOn: {
        alignSelf: "flex-end",
    },
    sheetScrim: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,.28)",
        justifyContent: "flex-end",
    },
    sortSheet: {
        width: "100%",
        alignSelf: "stretch",
        backgroundColor: colors.white,
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        gap: 0,
    },
    sheetHandle: {
        alignSelf: "center",
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.mutedLight,
        marginBottom: 14,
    },
    sheetHandleTouchTarget: {
        height: 32,
        marginTop: -16,
        alignSelf: "stretch",
        justifyContent: "flex-end",
    },
    sheetTitle: {
        flex: 1,
        color: colors.ink,
        fontFamily: "Outfit",
        fontWeight: "700",
        fontSize: 20,
        marginBottom: 8,
    },
    sheetTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    sheetOption: {
        minHeight: 54,
        backgroundColor: colors.white,
        paddingHorizontal: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sheetDivider: {
        borderTopWidth: 1,
        borderColor: colors.divider,
    },
    sheetOptionText: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 16,
    },
    searchEmpty: {
        color: colors.muted,
        fontFamily: "Outfit",
        fontSize: 16,
        paddingVertical: 24,
        textAlign: "center",
    },
});
export default Settings;
