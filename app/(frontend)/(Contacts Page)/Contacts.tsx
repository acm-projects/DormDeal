import { useCallback, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, Text as NativeText, View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text, { Header1 } from '../components/text_styles';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { supabase } from '../../../lib/supabase';
import Search_Bar from '../components/search_bar';
import Svg, { Path } from 'react-native-svg';
import OptionsOverlay from '../../../components/options-overlay';
import { hideConversations, readHiddenConversations } from '../../../components/inbox-removal';

type Chat = {
    id: number;
    name: string;
    initials: string;
    item: string;
    lastMessage: string;
    time: string;
    unread: boolean;
};

const time_ago = (iso: string) => {
    // DB timestamps have no timezone but are UTC
    const t = /Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z';
    const s = Math.max(0, Math.floor((Date.now() - new Date(t).getTime()) / 1000));
    if (s < 60) return 'now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
};

const get_initials = (name: string) =>
    name
        .split(/[\s._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || '?';

// one row in the chat list
const ChatRow = (props: { chat: Chat; onPress: () => void; editing: boolean; selected: boolean }) => {
    const c = props.chat;

    return (
        <Pressable style={[contacts.row, props.selected && contacts.selectedRow]} onPress={props.onPress}
            accessibilityRole={props.editing ? 'checkbox' : 'button'}
            accessibilityState={props.editing ? { checked: props.selected } : undefined}
            accessibilityLabel={props.editing ? c.name + ', ' + c.item : undefined}>
            <Svg style={contacts.paperclip} width={30} height={43} viewBox="0 0 30 43" accessibilityLabel="Pinned message">
                <Path
                    d="M7 17.5 3.8 14a5 5 0 0 1 7.4-6.8l14.2 15.4a7 7 0 0 1-10.3 9.5L4.3 17.4a4.8 4.8 0 0 1 7-6.5l12.2 13.2"
                    fill="none"
                    stroke="#8f969e"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
            {props.editing && <View style={[contacts.checkbox, props.selected && contacts.checked]}>
                {props.selected && <Ionicons name="checkmark" color={colors.white} size={18} />}
            </View>}
            <View style={contacts.rowAvatar}>
                <Text style={contacts.rowInitials}>{c.initials}</Text>
            </View>

            <View style={contacts.rowMiddle}>
                <View style={contacts.rowTop}>
                    <Text style={[contacts.rowName, c.unread && contacts.bold]}>{c.name}</Text>
                    {c.unread && <View style={contacts.unreadDot} />}
                </View>
                <NativeText style={contacts.rowItem} numberOfLines={1}>re: {c.item}</NativeText>
                <NativeText
                    style={[contacts.rowMessage, c.unread && contacts.rowMessageUnread]}
                    numberOfLines={1}
                >
                    {c.lastMessage}
                </NativeText>
            </View>

            <Text style={contacts.rowTime}>{c.time}</Text>
        </Pressable>
    );
};

const Contacts = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState(''); // what's typed in the search bar
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState<string>();
    const [hidden, setHidden] = useState<string[]>([]);
    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [confirm, setConfirm] = useState(false);
    const [removing, setRemoving] = useState<number[]>([]);
    const [notice, setNotice] = useState('');
    const [undoAvailable, setUndoAvailable] = useState(false);
    const [motion] = useState(() => new Animated.Value(0));
    const pending = useRef<{ account: string; ids: number[]; timer?: ReturnType<typeof setTimeout> } | null>(null);
    const dismissConfirm = useCallback(() => setConfirm(false), []);

    const flush = useCallback(() => {
        const deletion = pending.current;
        if (!deletion) return;
        pending.current = null;
        clearTimeout(deletion.timer);
        setUndoAvailable(false);
        try {
            const next = hideConversations(deletion.account, deletion.ids.map(String));
            setHidden(next);
            setNotice('');
        } catch {
            setHidden((current) => current.filter((id) => !deletion.ids.some((item) => String(item) === id)));
            setNotice('Could not remove conversations. They have been restored.');
        }
    }, []);

    function undo() {
        const deletion = pending.current;
        if (!deletion) return;
        pending.current = null;
        clearTimeout(deletion.timer);
        setHidden((current) => current.filter((id) => !deletion.ids.some((item) => String(item) === id)));
        setUndoAvailable(false);
        setNotice('');
    }

    function removeSelected() {
        if (!account || !selected.length || removing.length) return;
        flush();
        const deletion = { account, ids: selected, timer: undefined as ReturnType<typeof setTimeout> | undefined };
        pending.current = deletion;
        setConfirm(false);
        setRemoving(selected);
        motion.setValue(0);
        const finish = () => {
            if (pending.current !== deletion) return;
            setHidden((current) => [...current, ...deletion.ids.map(String)]);
            setRemoving([]);
            setSelected([]);
            setEditing(false);
            setNotice(deletion.ids.length === 1 ? 'Conversation removed' : 'Conversations removed');
            setUndoAvailable(true);
            deletion.timer = setTimeout(() => flush(), 5000);
        };
        void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (pending.current !== deletion) return;
            if (reduced) finish();
            else Animated.timing(motion, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' })
                .start(({ finished }) => { if (finished) finish(); });
        }, finish);
    }

    // load real conversations every time this screen comes into focus
    useFocusEffect(
        useCallback(() => {
            let active = true;
            const load = async () => {
                const { data: auth } = await supabase.auth.getUser();
                const me = auth.user?.id;
                if (!active) return;
                setAccount(me);
                setHidden(me ? readHiddenConversations(me) : []);

                const { data: convos, error } = await supabase
                    .from('conversations')
                    .select('conversation_id, last_message_at, buyer_id, seller_id, listings(title)')
                    .order('last_message_at', { ascending: false, nullsFirst: false });

                if (error || !convos) {
                    if (!active) return;
                    console.error(error);
                    setLoading(false);
                    return;
                }
                if (!active) return;

                const rows: any[] = convos;
                if (rows.length === 0) {
                    setChats([]);
                    setLoading(false);
                    return;
                }

                const other_of = (r: any) => (r.buyer_id === me ? r.seller_id : r.buyer_id);
                const other_ids = rows.map(other_of);
                const convo_ids = rows.map((r) => r.conversation_id);

                const [{ data: users }, { data: msgs }] = await Promise.all([
                    supabase.from('app-users').select('user_id, name').in('user_id', other_ids),
                    supabase
                        .from('messages')
                        .select('conversation_id, content, sent_at')
                        .in('conversation_id', convo_ids)
                        .order('sent_at', { ascending: false }),
                ]);
                if (!active) return;

                const names = new Map((users ?? []).map((u: any) => [u.user_id, u.name]));

                // newest message per conversation (messages arrive newest first)
                const last_msg = new Map<number, any>();
                (msgs ?? []).forEach((m: any) => {
                    if (!last_msg.has(m.conversation_id)) last_msg.set(m.conversation_id, m);
                });

                setChats(
                    rows.map((r) => {
                        const name = names.get(other_of(r)) ?? 'Unknown user';
                        const last = last_msg.get(r.conversation_id);
                        const stamp = last?.sent_at ?? r.last_message_at;
                        return {
                            id: r.conversation_id,
                            name,
                            initials: get_initials(name),
                            item: r.listings?.title ?? 'a listing',
                            lastMessage: last?.content ?? 'No messages yet',
                            time: stamp ? time_ago(stamp) : '',
                            unread: false, // no read column in the database yet
                        };
                    })
                );
                setLoading(false);
            };
            load();
            return () => {
                active = false;
                flush();
                motion.stopAnimation();
                setRemoving([]);
                setSelected([]);
                setEditing(false);
                setConfirm(false);
            };
        }, [flush, motion])
    );

    // only chats whose name matches the search
    const inbox = chats.filter((chat) => !hidden.includes(String(chat.id)));
    const shown = inbox.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <View style={contacts.screen}>
            <ScrollView contentContainerStyle={contacts.content} keyboardShouldPersistTaps="handled">

                <View style={contacts.titleBlock}>
                    <Header1 style={contacts.title}>messages</Header1>
                    <Svg width={154} height={13} viewBox="0 0 154 13" style={contacts.titleUnderline}>
                        <Path
                            d="M2 5c12-6 21 5 34 1s21-5 34 0 20 4 32 0 21-4 49 1"
                            fill="none"
                            stroke={colors.maroon}
                            strokeWidth={2.2}
                            strokeLinecap="round"
                        />
                    </Svg>
                </View>

                {/* search bar + edit */}
                <View style={contacts.searchRow}>
                    <Search_Bar
                        style={contacts.searchBox}
                        placeholder="Search"
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                        accessibilityLabel="Search messages"
                    />
                    <Pressable accessibilityRole="button" style={[contacts.editButton, editing && contacts.editActive]} disabled={removing.length > 0}
                        onPress={() => { setEditing(!editing); setSelected([]); }}>
                        <Text style={[contacts.editText, editing && contacts.onMaroon]}>{editing ? 'Done' : 'Edit'}</Text>
                    </Pressable>
                </View>

                {/* recent people, scroll sideways */}
                <View style={editing && contacts.recentMuted} pointerEvents={editing ? 'none' : 'auto'} aria-hidden={editing}>
                <Text style={contacts.recentLabel}>recent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={contacts.recentRow}>
                    {inbox.slice(0, 4).map((c, index) => (
                        <Pressable key={c.id} style={contacts.recentPerson} onPress={() => router.push(`/Messages/${c.id}`)}>
                            <View style={contacts.recentAvatarWrap}>
                                <View style={contacts.recentAvatar}>
                                    <Text style={contacts.recentInitials}>{c.initials}</Text>
                                </View>
                                {index === 0 && <View style={contacts.recentNotification} />}
                            </View>
                            <NativeText style={contacts.recentName} numberOfLines={1}>{c.name.split(' ')[0]}</NativeText>
                        </Pressable>
                    ))}
                </ScrollView>
                </View>

                {/* chat list */}
                <View style={contacts.list}>
                    {shown.map((c) => (
                        <Animated.View key={c.id} style={removing.includes(c.id) && {
                            opacity: motion.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                            transform: [{ translateX: motion.interpolate({ inputRange: [0, 1], outputRange: [0, 180] }) }],
                        }}>
                            <ChatRow chat={c} editing={editing} selected={selected.includes(c.id)} onPress={() => {
                                if (removing.length) return;
                                if (!editing) router.push(`/Messages/${c.id}`);
                                else setSelected((current) => current.includes(c.id) ? current.filter((id) => id !== c.id) : [...current, c.id]);
                            }} />
                        </Animated.View>
                    ))}
                </View>

                {/* end of list / no matches */}
                <Text style={contacts.endNote}>
                    {loading
                        ? 'Loading...'
                        : shown.length === 0
                        ? query
                            ? `No one named "${query}"`
                            : 'Hooray! No more messages!'
                        : 'Hooray! No more messages!'}
                </Text>

            </ScrollView>

            {!!notice && <View style={[contacts.toast, { bottom: Math.max(insets.bottom, 10) + 76 }]}>
                <NativeText accessibilityRole="alert" style={contacts.toastText}>{notice}</NativeText>
                <Pressable accessibilityRole="button" onPress={undoAvailable ? undo : () => setNotice('')}>
                    <NativeText style={contacts.toastAction}>{undoAvailable ? 'Undo' : 'Dismiss'}</NativeText>
                </Pressable>
            </View>}
            {editing ? <View style={[contacts.editBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={contacts.editSummary}>
                    <NativeText style={contacts.selection}>{selected.length} selected</NativeText>
                    <NativeText style={contacts.onMaroon}>Deleting only removes the chat from this inbox</NativeText>
                </View>
                <Pressable accessibilityRole="button" disabled={!selected.length || removing.length > 0}
                    onPress={() => setConfirm(true)} style={[contacts.deleteButton, (!selected.length || removing.length > 0) && contacts.recentMuted]}>
                    <Ionicons name="trash-outline" size={19} color={colors.maroon} />
                    <NativeText style={contacts.deleteText}>Delete</NativeText>
                </Pressable>
            </View> : <TabBar active="inbox" />}
            {confirm && <OptionsOverlay anchored title="Delete conversations" onClose={dismissConfirm}>
                {(close: () => void) => <View style={contacts.confirmCard}>
                    <NativeText style={contacts.confirmTitle}>Delete {selected.length} {selected.length === 1 ? 'conversation' : 'conversations'}?</NativeText>
                    <NativeText style={contacts.confirmCopy}>They’ll leave your inbox on this device. Your listings stay up.</NativeText>
                    <View style={contacts.confirmActions}>
                        <Pressable accessibilityRole="button" onPress={close} style={contacts.deleteButton}><NativeText style={contacts.deleteText}>Keep them</NativeText></Pressable>
                        <Pressable accessibilityRole="button" onPress={removeSelected} style={[contacts.deleteButton, contacts.editActive]}><NativeText style={[contacts.deleteText, contacts.onMaroon]}>Delete</NativeText></Pressable>
                    </View>
                </View>}
            </OptionsOverlay>}
        </View>
    );
};

const contacts = StyleSheet.create({
    selectedRow: { backgroundColor: '#F9E8E8', borderColor: colors.maroon, borderWidth: 2 },
    checkbox: { width: 26, height: 26, flexShrink: 0, borderWidth: 2, borderColor: colors.maroon, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
    checked: { backgroundColor: colors.maroon },
    editActive: { backgroundColor: colors.maroon },
    onMaroon: { color: colors.white },
    recentMuted: { opacity: 0.45 },
    editBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.maroon, padding: 16 },
    editSummary: { flex: 1 },
    selection: { fontFamily: 'Caveat', fontWeight: '700', fontSize: 26, color: colors.white },
    deleteButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.goldLight, paddingHorizontal: 12 },
    deleteText: { fontFamily: 'Outfit', fontWeight: '800', color: colors.maroon, fontSize: 15 },
    toast: { position: 'absolute', zIndex: 101, left: 20, right: 20, padding: 12, borderRadius: 8, backgroundColor: colors.maroonDark, flexDirection: 'row', alignItems: 'center', gap: 12 },
    toastText: { flex: 1, color: colors.white, fontFamily: 'Outfit' },
    toastAction: { color: colors.goldLight, fontFamily: 'Outfit', fontWeight: '800', padding: 6 },
    confirmCard: { backgroundColor: colors.white, padding: 16, borderRadius: 12, gap: 12 },
    confirmTitle: { fontFamily: 'Outfit', fontWeight: '800', fontSize: 21, color: colors.maroon },
    confirmCopy: { fontFamily: 'Outfit', color: colors.ink, fontSize: 15 },
    confirmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    screen: {
        flex: 1,
        width: '100%',
    },
    content: {
        paddingTop: 76,
        paddingHorizontal: 28,
        paddingBottom: 130, // room for the tab bar
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
        lineHeight: 44,
        marginBottom: 0,
    },
    titleBlock: {
        height: 74,
        justifyContent: 'flex-start',
    },
    titleUnderline: {
        marginTop: 1,
        marginLeft: 2,
    },

    // search
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchBox: {
        flex: 1,
        width: undefined,
        height: 48,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 0,
        backgroundColor: colors.cream,
        boxShadow: '',
    },
    editButton: {
        height: 48,
        width: 46,
        borderWidth: 2,
        borderColor: colors.maroon,
        backgroundColor: colors.cream,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },

    // recent people row
    recentLabel: {
        fontSize: 27,
        color: colors.maroon,
        fontFamily: 'Caveat',
        textAlign: 'left',
        fontWeight: '700',
        fontStyle: 'italic',
        marginTop: 23,
        marginBottom: 4,
    },
    recentRow: {
        gap: 8,
        paddingHorizontal: 0,
    },
    recentPerson: {
        alignItems: 'center',
        width: 76,
        gap: 4,
    },
    recentAvatarWrap: {
        width: 72,
        height: 72,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    recentAvatar: {
        width: 68,
        height: 68,
        borderRadius: 32,
        backgroundColor: colors.maroon,
        borderWidth: 2,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentInitials: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.white,
        fontFamily: 'Outfit',
    },
    recentNotification: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.gold,
        borderWidth: 1,
        borderColor: colors.white,
    },
    recentName: {
        fontSize: 12,
        color: colors.ink,
        fontFamily: 'Outfit',
    },

    // chat list
    list: {
        marginTop: 31,
        gap: 18,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 80,
        paddingTop: 12,
        paddingRight: 12,
        paddingBottom: 12,
        paddingLeft: 18,
        borderRadius: 0,
        backgroundColor: colors.white,
        borderLeftWidth: 5,
        borderLeftColor: colors.blush,
        shadowColor: colors.ink,
        shadowOpacity: 0.14,
        shadowRadius: 5,
        shadowOffset: {width: 1, height: 3},
        elevation: 3,
        position: 'relative',
    },
    paperclip: {
        position: 'absolute',
        left: -13,
        top: -13,
        zIndex: 2,
    },
    rowAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowInitials: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    rowMiddle: {
        flex: 1, // take the space between avatar and time
        minWidth: 0,
        gap: 2,
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rowName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
        flexShrink: 1,
    },
    bold: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.maroon,
    },
    rowItem: {
        fontSize: 12,
        color: colors.maroon,
        fontFamily: 'Outfit',
        textAlign: 'left',
    },
    rowMessage: {
        fontSize: 13,
        color: colors.ink,
        fontFamily: 'Outfit',
        textAlign: 'left',
    },
    rowMessageUnread: {
        color: colors.ink,
        fontWeight: '600',
    },
    rowTime: {
        fontSize: 12,
        color: colors.ink,
        fontFamily: 'Outfit',
        alignSelf: 'flex-start',
        marginTop: 2,
        minWidth: 20,
        textAlign: 'right',
    },
    endNote: {
        fontSize: 21,
        color: colors.muted,
        fontFamily: 'Caveat',
        textAlign: 'center',
        marginTop: 63,
    },
});

export default Contacts;
