import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Base from '../components/base';
import TabBar from '../components/tab_bar';
import { BackButton, PageTitle, Squiggle } from '../components/design';
import { colors } from '../../root_styles';
import { supabase } from '../../../lib/supabase';
const groups = [{
    title: 'Marketplace & Orders',
    rows: [['Saved Listings', 'heart'], ['Order History', 'receipt'], ['Purchase Notifications', 'notifications'], ['Payment Methods', 'card'], ['Recommendation quiz', 'sparkles']]
}, {
    title: 'Selling & Store',
    rows: [['Seller Profile', 'person'], ['Listing Defaults', 'pricetag'], ['Pickup Preferences', 'location'], ['Sales Notifications', 'notifications']]
}, {
    title: 'Account & Safety',
    rows: [['Account Details', 'person'], ['Privacy & Blocked Users', 'lock-closed'], ['Help & Safety', 'shield-checkmark']]
}] as const;
const SavedListings = ({
    onBack
}: {
    onBack: () => void;
}) => {
    const [notify, setNotify] = useState(true);
    const [unavailable, setUnavailable] = useState(false);
    const [sort, setSort] = useState(0);
    const [sortPickerVisible, setSortPickerVisible] = useState(false);
    const sorts = ['Recently saved', 'Price: low to high', 'Price: high to low'];
    return <Base><ScrollView contentContainerStyle={styles.savedContent} showsVerticalScrollIndicator={false}><BackButton onPress={onBack} /><View style={styles.savedHeader}><View style={styles.highlighter} /><Text style={styles.savedTitle}>Saved Listings</Text></View><View style={styles.savedCard}>
                <SettingRow label="Notify me when saved items change price"><Toggle value={notify} onChange={setNotify} /></SettingRow>
                <SettingRow label="Sort saved listings by"><Pressable onPress={() => setSortPickerVisible(true)} style={styles.sort}><Text style={styles.sortText}>{sorts[sort]}</Text><Ionicons name="chevron-down" size={18} color={colors.white} /></Pressable></SettingRow>
                <SettingRow label="Show unavailable listings"><Toggle value={unavailable} onChange={setUnavailable} /></SettingRow>
        </View></ScrollView><OptionSheet visible={sortPickerVisible} title="Sort saved listings" options={sorts} selected={sort} onClose={() => setSortPickerVisible(false)} onSelect={index => setSort(index)} /></Base>;
};
const OptionSheet = ({
    visible,
    title,
    options,
    selected,
    onClose,
    onSelect
}: {
    visible: boolean;
    title: string;
    options: string[];
    selected: number;
    onClose: () => void;
    onSelect: (index: number) => void;
}) => {
    const position = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        if (!visible) {
            position.setValue(1);
            return;
        }
        Animated.timing(position, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true
        }).start();
    }, [position, visible]);
    const dismiss = () => Animated.timing(position, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true
    }).start(({
        finished
    }) => {
        if (finished) onClose();
    });
    const select = (index: number) => {
        onSelect(index);
        dismiss();
    };
    return <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}><Pressable style={styles.sheetScrim} onPress={dismiss}><Animated.View style={[styles.sortSheet, {
                transform: [{
                    translateY: position.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 520]
                    })
                }]
            }]}><Pressable onPress={event => event.stopPropagation()}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>{title}</Text>{options.map((option, index) => <Pressable key={option} style={[styles.sheetOption, index > 0 && styles.sheetDivider]} onPress={() => select(index)}><Text style={styles.sheetOptionText}>{option}</Text>{selected === index && <Ionicons name="checkmark" size={22} color={colors.maroon} />}</Pressable>)}</Pressable></Animated.View></Pressable></Modal>;
};
const DetailSettings = ({
    title,
    onBack
}: {
    title: string;
    onBack: () => void;
}) => {
    const [enabled, setEnabled] = useState(true);
    const [secondary, setSecondary] = useState(false);
    const details: Record<string, {
        toggle: string;
        secondary: string;
        selection: string;
        options: string[];
    }> = {
        'Order History': {
            toggle: 'Include completed orders',
            secondary: 'Show pickup reminders',
            selection: 'Default order view',
            options: ['Recent orders', 'Purchases', 'Sales']
        },
        'Purchase Notifications': {
            toggle: 'Price drop alerts',
            secondary: 'Pickup reminders',
            selection: 'Notification frequency',
            options: ['Instantly', 'Daily', 'Weekly']
        },
        'Payment Methods': {
            toggle: 'Use saved payment by default',
            secondary: 'Require confirmation',
            selection: 'Preferred payment method',
            options: ['Visa •6767', 'Zelle', 'Cash at pickup']
        },
        'Seller Profile': {
            toggle: 'Show seller activity',
            secondary: 'Accept new messages',
            selection: 'Profile visibility',
            options: ['Campus only', 'Verified students', 'Everyone']
        },
        'Listing Defaults': {
            toggle: 'Save item drafts',
            secondary: 'Use pickup reminders',
            selection: 'Default listing type',
            options: ['Item', 'Service', 'Wanted']
        },
        'Pickup Preferences': {
            toggle: 'Offer campus pickup',
            secondary: 'Send arrival reminders',
            selection: 'Preferred pickup spot',
            options: ['Library lobby', 'Student union', 'Residence hall']
        },
        'Sales Notifications': {
            toggle: 'New message alerts',
            secondary: 'Sold item alerts',
            selection: 'Sales digest',
            options: ['Instantly', 'Daily', 'Weekly']
        },
        'Account Details': {
            toggle: 'Show school year',
            secondary: 'Display campus affiliation',
            selection: 'Profile audience',
            options: ['Only me', 'Students', 'Everyone']
        },
        'Privacy & Blocked Users': {
            toggle: 'Hide activity status',
            secondary: 'Filter unknown messages',
            selection: 'Message permissions',
            options: ['Everyone', 'Verified students', 'Nobody']
        },
        'Help & Safety': {
            toggle: 'Safety check-in reminders',
            secondary: 'Show safety resources',
            selection: 'Support contact method',
            options: ['In app', 'Email', 'Phone']
        }
    };
    const config = details[title] ?? {
        toggle: 'Enable updates',
        secondary: 'Send me reminders',
        selection: 'Preference',
        options: ['Option one', 'Option two', 'Option three']
    };
    const [choice, setChoice] = useState(0);
    const [choicePickerVisible, setChoicePickerVisible] = useState(false);
    return <Base><ScrollView contentContainerStyle={styles.savedContent} showsVerticalScrollIndicator={false}><BackButton onPress={onBack} /><View style={styles.savedHeader}><View style={styles.highlighter} /><Text style={styles.savedTitle}>{title}</Text></View><View style={styles.savedCard}><SettingRow label={config.toggle}><Toggle value={enabled} onChange={setEnabled} /></SettingRow><SettingRow label={config.secondary}><Toggle value={secondary} onChange={setSecondary} /></SettingRow><SettingRow label={config.selection}><Pressable onPress={() => setChoicePickerVisible(true)} style={styles.sort}><Text style={styles.sortText}>{config.options[choice]}</Text><Ionicons name="chevron-down" size={18} color={colors.white} /></Pressable></SettingRow></View></ScrollView><OptionSheet visible={choicePickerVisible} title={config.selection} options={config.options} selected={choice} onClose={() => setChoicePickerVisible(false)} onSelect={index => setChoice(index)} /></Base>;
};
const Settings = () => {
    const router = useRouter();
    const [saved, setSaved] = useState(false);
    const [detail, setDetail] = useState<string | null>(null);
    const [logoutVisible, setLogoutVisible] = useState(false);
    if (saved) return <SavedListings onBack={() => setSaved(false)} />;
    if (detail) return <DetailSettings title={detail} onBack={() => setDetail(null)} />;
    return <Base style={{
        paddingBottom: 0
    }}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <BackButton onPress={() => router.back()} /><PageTitle>settings</PageTitle><Squiggle />
                <View style={styles.search}><Ionicons name="search" size={28} color={colors.maroon} /><TextInput placeholder="Search" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
                {groups.map(group => <View key={group.title} style={styles.group}><Text style={styles.groupTitle}>{group.title}</Text><View style={styles.settingsCard}>{group.rows.map(([label, icon], index) => <Pressable key={label} onPress={() => {
                            if (label === 'Recommendation quiz') router.push({ pathname: '/Joined', params: { from: 'settings' } });
                            else if (label === 'Saved Listings') setSaved(true);
                            else setDetail(label);
                        }} style={[styles.settingRow, index > 0 && styles.divider]}><View style={[styles.iconTile, {
                            backgroundColor: [colors.tileRed, colors.mustard, colors.sage, colors.maroon][index % 4]
                        }]}><Ionicons name={icon as any} size={24} color={colors.white} /></View><Text style={styles.rowLabel}>{label}</Text><Ionicons name="chevron-forward" size={28} color={colors.mutedLight} /></Pressable>)}</View></View>)}
                <Pressable style={styles.logoutButton} onPress={() => setLogoutVisible(true)}><Ionicons name="log-out-outline" size={22} color={colors.white} /><Text style={styles.logoutText}>Log out</Text></Pressable>
        </ScrollView><OptionSheet visible={logoutVisible} title="Log out of DormDeal?" options={['Cancel', 'Log out']} selected={-1} onClose={() => setLogoutVisible(false)} onSelect={async index => {
            if (index === 1) {
                await supabase.auth.signOut();
                router.replace('/Landing');
            }
        }} /><TabBar active="profile" /></Base>;
};
const SettingRow = ({
    label,
    children
}: any) => <View style={styles.settingRow}><Text style={styles.rowLabel}>{label}</Text>{children}</View>;
const Toggle = ({
    value,
    onChange
}: {
    value: boolean;
    onChange: (next: boolean) => void;
}) => <Pressable accessibilityRole="switch" accessibilityState={{
    checked: value
}} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn]}><View style={[styles.toggleThumb, value && styles.toggleThumbOn]} /></Pressable>;
const styles = StyleSheet.create({
    content: {
        paddingTop: 8,
        paddingBottom: 110
    },
    savedContent: {
        paddingTop: 8,
        paddingBottom: 110
    },
    group: {
        marginTop: 22
    },
    groupTitle: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 4,
        marginBottom: 7
    },
    settingsCard: {
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2
        },
        elevation: 3
    },
    savedCard: {
        marginTop: 48,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3
        },
        elevation: 4
    },
    settingRow: {
        minHeight: 76,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14
    },
    divider: {
        borderTopWidth: 1,
        borderColor: colors.divider
    },
    iconTile: {
        width: 42,
        height: 42,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rowLabel: {
        flex: 1,
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 17
    },
    search: {
        height: 52,
        backgroundColor: colors.white,
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 2
        },
        elevation: 3
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Outfit',
        fontSize: 17,
        color: colors.ink
    },
    logoutButton: {
        height: 54,
        marginTop: 32,
        backgroundColor: colors.maroonLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    logoutText: {
        color: colors.white,
        fontFamily: 'Outfit',
        fontWeight: '700',
        fontSize: 17
    },
    savedHeader: {
        marginTop: 58,
        alignSelf: 'flex-start',
        position: 'relative',
        justifyContent: 'center'
    },
    highlighter: {
        position: 'absolute',
        left: 0,
        right: 14,
        bottom: 1,
        height: 18,
        backgroundColor: colors.gold
    },
    savedTitle: {
        color: colors.maroon,
        fontFamily: 'Outfit',
        fontSize: 44,
        fontWeight: '800',
        zIndex: 1
    },
    sort: {
        minHeight: 44,
        borderRadius: 8,
        paddingHorizontal: 14,
        backgroundColor: colors.tileRed,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    sortText: {
        color: colors.white,
        fontFamily: 'Outfit',
        fontWeight: '700',
        fontSize: 13
    },
    toggle: {
        width: 54,
        height: 30,
        borderRadius: 6,
        padding: 4,
        backgroundColor: colors.switchOff,
        justifyContent: 'center'
    },
    toggleOn: {
        backgroundColor: colors.sage
    },
    toggleThumb: {
        width: 22,
        height: 22,
        borderRadius: 5,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOpacity: .18,
        shadowRadius: 2,
        elevation: 2
    },
    toggleThumbOn: {
        alignSelf: 'flex-end'
    },
    sheetScrim: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.28)',
        justifyContent: 'flex-end'
    },
    sortSheet: {
        width: '100%',
        alignSelf: 'stretch',
        backgroundColor: colors.white,
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        gap: 0,
        shadowColor: '#000',
        shadowOpacity: .2,
        shadowRadius: 8,
        elevation: 8
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.mutedLight,
        marginBottom: 14
    },
    sheetTitle: {
        color: colors.ink,
        fontFamily: 'Outfit',
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 8
    },
    sheetOption: {
        minHeight: 54,
        backgroundColor: colors.white,
        paddingHorizontal: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    sheetDivider: {
        borderTopWidth: 1,
        borderColor: colors.divider
    },
    sheetOptionText: {
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 16
    }
});
export default Settings;
