import { useCallback, useState } from 'react';
import { Text, View, ImageBackground, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { supabase } from '../../../lib/supabase';

import PaperBg from '../../../assets/images/paper_bg.png';

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
const ChatRow = (props: { chat: Chat; onPress: () => void }) => {
    const c = props.chat;

    return (
        <Pressable style={contacts.row} onPress={props.onPress}>
            <View style={contacts.rowAvatar}>
                <Text style={contacts.rowInitials}>{c.initials}</Text>
            </View>

            <View style={contacts.rowMiddle}>
                <View style={contacts.rowTop}>
                    <Text style={[contacts.rowName, c.unread && contacts.bold]}>{c.name}</Text>
                    {c.unread && <View style={contacts.unreadDot} />}
                </View>
                <Text style={contacts.rowItem}>re: {c.item}</Text>
                <Text
                    style={[contacts.rowMessage, c.unread && contacts.rowMessageUnread]}
                    numberOfLines={1}
                >
                    {c.lastMessage}
                </Text>
            </View>

            <Text style={contacts.rowTime}>{c.time}</Text>
        </Pressable>
    );
};

const Contacts = () => {
    const router = useRouter();
    const [query, setQuery] = useState(''); // what's typed in the search bar
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    // load real conversations every time this screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const { data: auth } = await supabase.auth.getUser();
                const me = auth.user?.id;

                const { data: convos, error } = await supabase
                    .from('conversations')
                    .select('conversation_id, last_message_at, buyer_id, seller_id, listings(title)')
                    .order('last_message_at', { ascending: false, nullsFirst: false });

                if (error || !convos) {
                    console.error(error);
                    setLoading(false);
                    return;
                }

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
        }, [])
    );

    // only chats whose name matches the search
    const shown = chats.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <ImageBackground source={PaperBg} style={contacts.screen}>
            <ScrollView contentContainerStyle={contacts.content}>

                <Text style={contacts.title}>Messages</Text>

                {/* search bar + edit */}
                <View style={contacts.searchRow}>
                    <View style={contacts.searchBox}>
                        <Ionicons name="search" size={18} color={colors.muted} />
                        <TextInput
                            style={contacts.searchInput}
                            placeholder="Search"
                            placeholderTextColor={colors.muted}
                            value={query}
                            onChangeText={setQuery}
                        />
                    </View>
                    <Pressable style={contacts.editButton}>
                        <Text style={contacts.editText}>Edit</Text>
                    </Pressable>
                </View>

                {/* recent people, scroll sideways */}
                <Text style={contacts.recentLabel}>recent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={contacts.recentRow}>
                    {chats.map((c) => (
                        <Pressable key={c.id} style={contacts.recentPerson} onPress={() => router.push(`/Messages/${c.id}`)}>
                            <View style={contacts.recentAvatar}>
                                <Text style={contacts.recentInitials}>{c.initials}</Text>
                            </View>
                            <Text style={contacts.recentName} numberOfLines={1}>{c.name.split(' ')[0]}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* chat list */}
                <View style={contacts.list}>
                    {shown.map((c) => (
                        <ChatRow key={c.id} chat={c} onPress={() => router.push(`/Messages/${c.id}`)} />
                    ))}
                </View>

                {/* end of list / no matches */}
                <Text style={contacts.endNote}>
                    {loading
                        ? 'Loading...'
                        : shown.length === 0
                        ? query
                            ? `No one named "${query}"`
                            : 'No conversations yet'
                        : 'Hooray! No more messages!'}
                </Text>

            </ScrollView>

            <TabBar active="inbox" />
        </ImageBackground>
    );
};

const contacts = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.cream,
    },
    content: {
        paddingTop: 70,
        paddingHorizontal: 20,
        paddingBottom: 130, // room for the tab bar
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
        marginBottom: 14,
    },

    // search
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        height: 46,
        paddingHorizontal: 14,
        borderRadius: 23,
        backgroundColor: colors.white,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    editButton: {
        height: 46,
        paddingHorizontal: 16,
        borderRadius: 23,
        backgroundColor: colors.white,
        justifyContent: 'center',
    },
    editText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },

    // recent people row
    recentLabel: {
        fontSize: 22,
        color: colors.maroon,
        fontFamily: 'Caveat',
        marginTop: 20,
        marginBottom: 8,
    },
    recentRow: {
        gap: 16,
    },
    recentPerson: {
        alignItems: 'center',
        width: 70,
        gap: 6,
    },
    recentAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.maroon,
        borderWidth: 3,
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
    recentName: {
        fontSize: 12,
        color: colors.ink,
        fontFamily: 'Outfit',
    },

    // chat list
    list: {
        marginTop: 20,
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 20,
        backgroundColor: colors.white,
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
        gap: 1,
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rowName: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.ink,
        fontFamily: 'Outfit',
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
    },
    rowMessage: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    rowMessageUnread: {
        color: colors.ink,
        fontWeight: '600',
    },
    rowTime: {
        fontSize: 12,
        color: colors.muted,
        fontFamily: 'Outfit',
        alignSelf: 'flex-start',
    },
    endNote: {
        fontSize: 20,
        color: colors.muted,
        fontFamily: 'Caveat',
        textAlign: 'center',
        marginTop: 18,
    },
});

export default Contacts;