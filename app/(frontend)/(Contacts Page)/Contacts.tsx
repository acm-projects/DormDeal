import { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Header1 } from '../components/text_styles'
import Text from '../components/text_styles'
import { useRouter, useFocusEffect } from 'expo-router';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { supabase } from '../../../lib/supabase';
import Search_Bar from '../components/search_bar';
import Svg, { Path } from 'react-native-svg';

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
        <View style={contacts.screen}>
            <ScrollView contentContainerStyle={contacts.content}>

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
                    <Pressable style={contacts.editButton}>
                        <Text style={contacts.editText}>Edit</Text>
                    </Pressable>
                </View>

                {/* recent people, scroll sideways */}
                <Text style={contacts.recentLabel}>recent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={contacts.recentRow}>
                    {chats.slice(0, 4).map((c, index) => (
                        <Pressable key={c.id} style={contacts.recentPerson} onPress={() => router.push(`/Messages/${c.id}`)}>
                            <View style={contacts.recentAvatarWrap}>
                                <View style={contacts.recentAvatar}>
                                    <Text style={contacts.recentInitials}>{c.initials}</Text>
                                </View>
                                {index === 0 && <View style={contacts.recentNotification} />}
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
        </View>
    );
};

const contacts = StyleSheet.create({
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
