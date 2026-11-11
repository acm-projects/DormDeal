import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Base from '../components/base';
import TabBar from '../components/tab_bar';
import { BackButton, PageTitle, Squiggle } from '../components/design';
import { colors } from '../../root_styles';
import { supabase } from '../../../lib/supabase';

const groups = [
    { title: 'Marketplace & Orders', rows: [['Saved Listings', 'heart'], ['Order History', 'receipt'], ['Purchase Notifications', 'notifications'], ['Payment Methods', 'card']] },
    { title: 'Selling & Store', rows: [['Seller Profile', 'person'], ['Listing Defaults', 'pricetag'], ['Pickup Preferences', 'location'], ['Sales Notifications', 'notifications']] },
    { title: 'Account & Safety', rows: [['Account Details', 'person'], ['Privacy & Blocked Users', 'lock-closed'], ['Help & Safety', 'shield-checkmark'], ['Log out', 'log-out']] },
] as const;

const SavedListings = ({ onBack }: { onBack: () => void }) => {
    const [notify, setNotify] = useState(true);
    const [unavailable, setUnavailable] = useState(false);
    const [sort, setSort] = useState(0);
    const [sortPickerVisible, setSortPickerVisible] = useState(false);
    const sorts = ['Recently saved', 'Price: low to high', 'Price: high to low'];
    return <Base><ScrollView contentContainerStyle={styles.savedContent} showsVerticalScrollIndicator={false}><BackButton onPress={onBack} /><View style={styles.savedHeader}><View style={styles.highlighter}/><Text style={styles.savedTitle}>Saved Listings</Text></View><View style={styles.savedCard}>
        <SettingRow label="Notify me when saved items change price"><Toggle value={notify} onChange={setNotify} /></SettingRow>
        <SettingRow label="Sort saved listings by"><Pressable onPress={() => setSortPickerVisible(true)} style={styles.sort}><Text style={styles.sortText}>{sorts[sort]}</Text><Ionicons name="chevron-down" size={18} color={colors.white} /></Pressable></SettingRow>
        <SettingRow label="Show unavailable listings"><Toggle value={unavailable} onChange={setUnavailable} /></SettingRow>
    </View></ScrollView><Modal visible={sortPickerVisible} transparent animationType="slide" onRequestClose={() => setSortPickerVisible(false)}><Pressable style={styles.sheetScrim} onPress={() => setSortPickerVisible(false)}><Pressable style={styles.sortSheet} onPress={(event) => event.stopPropagation()}><View style={styles.sheetHandle}/><Text style={styles.sheetTitle}>Sort saved listings</Text>{sorts.map((option, index) => <Pressable key={option} style={styles.sheetOption} onPress={() => { setSort(index); setSortPickerVisible(false); }}><Text style={styles.sheetOptionText}>{option}</Text>{sort === index && <Ionicons name="checkmark" size={22} color={colors.maroon}/>}</Pressable>)}</Pressable></Pressable></Modal></Base>;
};

const Settings = () => {
    const router = useRouter(); const [saved, setSaved] = useState(false);
    if (saved) return <SavedListings onBack={() => setSaved(false)} />;
    const logout = () => Alert.alert('Log out?', 'You will need to sign in again.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: async () => { await supabase.auth.signOut(); router.replace('/Landing'); } }]);
    return <Base style={{ paddingBottom: 0 }}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} /><PageTitle>settings</PageTitle><Squiggle />
        <View style={styles.search}><Ionicons name="search" size={28} color={colors.maroon} /><TextInput placeholder="Search" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
        {groups.map((group) => <View key={group.title} style={styles.group}><Text style={styles.groupTitle}>{group.title}</Text><View style={styles.settingsCard}>{group.rows.map(([label, icon], index) => <Pressable key={label} onPress={() => label === 'Saved Listings' ? setSaved(true) : label === 'Log out' ? logout() : Alert.alert('Coming soon', `${label} will be available in a future update.`)} style={[styles.settingRow, index > 0 && styles.divider]}><View style={[styles.iconTile, { backgroundColor: [colors.tileRed, colors.mustard, colors.sage, colors.maroon][index] }]}><Ionicons name={icon as any} size={24} color={colors.white} /></View><Text style={styles.rowLabel}>{label}</Text><Ionicons name="chevron-forward" size={28} color={colors.mutedLight} /></Pressable>)}</View></View>)}
    </ScrollView><TabBar active="profile" /></Base>;
};
const SettingRow = ({ label, children }: any) => <View style={styles.settingRow}><Text style={styles.rowLabel}>{label}</Text>{children}</View>;
const Toggle = ({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) => <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={[styles.toggle, value && styles.toggleOn]}><View style={[styles.toggleThumb, value && styles.toggleThumbOn]} /></Pressable>;
const styles = StyleSheet.create({ content: { paddingTop: 8, paddingBottom: 110 }, savedContent: { paddingTop: 8, paddingBottom: 110 }, group: { marginTop: 22 }, groupTitle: { color: colors.maroon, fontFamily: 'Outfit', fontSize: 18, fontWeight: '700', marginLeft: 4, marginBottom: 7 }, settingsCard: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }, savedCard: { marginTop: 48, backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 4 }, settingRow: { minHeight: 76, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 14 }, divider: { borderTopWidth: 1, borderColor: colors.divider }, iconTile: { width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, rowLabel: { flex: 1, color: colors.ink, fontFamily: 'Outfit', fontSize: 17 }, search: { height: 52, backgroundColor: colors.white, marginTop: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }, searchInput: { flex: 1, fontFamily: 'Outfit', fontSize: 17, color: colors.ink }, savedHeader: { marginTop: 58, alignSelf: 'flex-start', position: 'relative', justifyContent: 'center' }, highlighter: { position: 'absolute', left: 0, right: 14, bottom: 7, height: 20, backgroundColor: colors.gold }, savedTitle: { color: colors.maroon, fontFamily: 'Outfit', fontSize: 44, fontWeight: '800', zIndex: 1 }, sort: { minHeight: 44, borderRadius: 8, paddingHorizontal: 14, backgroundColor: colors.tileRed, flexDirection: 'row', alignItems: 'center', gap: 10 }, sortText: { color: colors.white, fontFamily: 'Outfit', fontWeight: '700', fontSize: 13 }, toggle: { width: 54, height: 30, borderRadius: 15, padding: 4, backgroundColor: colors.switchOff, justifyContent: 'center' }, toggleOn: { backgroundColor: colors.sage }, toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: .18, shadowRadius: 2, elevation: 2 }, toggleThumbOn: { alignSelf: 'flex-end' }, sheetScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,.28)', justifyContent: 'flex-end' }, sortSheet: { backgroundColor: colors.cream, padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22, gap: 8 }, sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.mutedLight, marginBottom: 8 }, sheetTitle: { color: colors.ink, fontFamily: 'Outfit', fontWeight: '700', fontSize: 20, marginBottom: 8 }, sheetOption: { minHeight: 52, backgroundColor: colors.white, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetOptionText: { color: colors.ink, fontFamily: 'Outfit', fontSize: 16 } });
export default Settings;
