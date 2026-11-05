import { useState } from 'react';
import { View, ImageBackground, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Header1 } from '../components/text_styles'
import Text from '../components/text_styles'
import { useRouter } from 'expo-router';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { chats, Chat } from '../../../data/chats';
import Search_Bar from '../components/search_bar';

import PaperBg from '../../../assets/images/paper_bg.png';

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

    // only chats whose name matches the search
    const shown = chats.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <ImageBackground source={PaperBg} style={contacts.screen}>
            <ScrollView contentContainerStyle={contacts.content}>

                <Header1 style={{marginBottom: 30}}>messages</Header1>

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
                    {shown.length === 0 ? `No one named "${query}"` : 'Hooray! No more messages!'}
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
        width: undefined,
    },
    editButton: {
        height: 45,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: '#E4E4E4',
        justifyContent: 'center',
        border: '1px solid #CCCCCC',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
    },
    editText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#7D7D7D',
        fontFamily: 'Outfit',
    },

    // recent people row
    recentLabel: {
        fontSize: 22,
        color: colors.maroon,
        fontFamily: 'Caveat',
        textAlign: 'left',
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
        textAlign: 'left',
    },
    rowMessage: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
        textAlign: 'left',
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