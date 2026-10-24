import { StyleSheet, ScrollView, View, Image, Pressable, TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import Other_Message_Box from '../../components/message_box_pink'
import You_Message_Box from '../../components/message_box_red'
import Back_Button from '../../components/back_button'
import Button from '../../components/button'
import Base from '../../components/base'
import Text from '../../components/text_styles'
import avatar_test from '../../../../assets/svgs/avatar_sample.svg'
import menu_icon from '../../../../assets/svgs/menu.svg'
import arrow from '../../../../assets/svgs/white_arrow.svg'
import plus_icon from '../../../../assets/svgs/plus.svg'
import { supabase } from '../../../../lib/supabase';

const time_ago = (iso) => {
    // DB timestamps have no timezone but are UTC, so mark them as UTC
    const t = /Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z';
    const s = Math.max(0, Math.floor((Date.now() - new Date(t).getTime()) / 1000));
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? '' : 's'} ago`;
};

const Messages = () => {
    const { messages_id } = useLocalSearchParams();
    const conversation_id = Number(messages_id);

    const [user_id, set_user_id] = useState(null);
    const [messages, set_messages] = useState([]);
    const [text, set_text] = useState('');
    const [chat_title, set_chat_title] = useState('Chat');
    const [send_error, set_send_error] = useState('');

    const scroll_view_ref = useRef(null);
    const scroll_to_end_func = () => {
        scroll_view_ref.current?.scrollToEnd({ animated: false });
    };

    // who am I?
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => set_user_id(data.user?.id ?? null));
    }, []);

    // header title (the other person's name)
    useEffect(() => {
        if (!user_id || Number.isNaN(conversation_id)) return;
        const load_title = async () => {
            const { data: convo } = await supabase
                .from('conversations')
                .select('buyer_id, seller_id')
                .eq('conversation_id', conversation_id)
                .maybeSingle();
            if (!convo) return;
            const other_id = convo.buyer_id === user_id ? convo.seller_id : convo.buyer_id;
            const { data: other } = await supabase
                .from('app-users')
                .select('name')
                .eq('user_id', other_id)
                .maybeSingle();
            set_chat_title(other?.name ?? `Chat ${conversation_id}`);
        };
        load_title();
    }, [user_id, conversation_id]);

    // load history + subscribe to new messages
    useEffect(() => {
        if (!user_id || Number.isNaN(conversation_id)) return;

        const load = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation_id)
                .order('sent_at', { ascending: true });
            if (error) console.error(error);
            set_messages(data ?? []);
        };
        load();

        const channel = supabase
            .channel(`conversation-${conversation_id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversation_id}`,
                },
                (payload) => {
                    const msg = payload.new;
                    set_messages((prev) =>
                        prev.some((m) => m.message_id === msg.message_id) ? prev : [...prev, msg]
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user_id, conversation_id]);

    const send_message = async () => {
        if (!text.trim() || !user_id) return;
        const content = text;
        set_text('');
        const { data, error } = await supabase
            .from('messages')
            .insert({ conversation_id, sender_id: user_id, content })
            .select()
            .single();
        if (error) {
            console.error(error);
            set_send_error(error.message);
            set_text(content);
            return;
        }
        set_send_error('');
        set_messages((prev) =>
            prev.some((m) => m.message_id === data.message_id) ? prev : [...prev, data]
        );
    };

    return (
        <Base style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}>
            <View style={styles.header_container}>
                <Back_Button href="/Contacts"/>
                <View style={styles.header_quick_info}>
                    <Image source={avatar_test}/>
                    <View style={styles.text_info}>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>{chat_title}</Text>
                    </View>
                </View>
                <Button>
                    <Image source={menu_icon}></Image>
                </Button>
            </View>

            <ScrollView
                ref={scroll_view_ref}
                onContentSizeChange={scroll_to_end_func}
                style={styles.messages_scroll_view}
                contentContainerStyle={styles.messages_container}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((m) =>
                    m.sender_id === user_id ? (
                        <You_Message_Box key={m.message_id} status={time_ago(m.sent_at)}>
                            {m.content}
                        </You_Message_Box>
                    ) : (
                        <Other_Message_Box key={m.message_id} status={time_ago(m.sent_at)}>
                            {m.content}
                        </Other_Message_Box>
                    )
                )}
            </ScrollView>

            {send_error ? (
                <Text style={{ color: 'red', paddingHorizontal: 20, paddingBottom: 100 }}>{send_error}</Text>
            ) : null}

            <View style={styles.messages_functionality}>
                <Button style={{backgroundColor: "#5B0000",}}>
                    <Image source={plus_icon} style={{opacity: 0.85}}></Image>
                </Button>
                <View style={styles.text_input_container}>
                    <TextInput
                        placeholder="Message..."
                        placeholderTextColor="rgba(255,255,255,0.65)"
                        style={styles.text_input}
                        value={text}
                        onChangeText={set_text}
                        onSubmitEditing={send_message}
                    />
                    <Pressable
                        onPress={send_message}
                        style={[styles.upload_button, { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }]}
                    >
                        <Image source={arrow} style={{opacity: 0.85, transform: [{rotate: '90deg'}]}}></Image>
                    </Pressable>
                </View>
            </View>
        </Base>
    );
}

export default Messages

const styles = StyleSheet.create({
    header_container: {
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        gap: 10,
    },
    messages_container: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        gap: 5,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 106,
    },
    messages_scroll_view: {
        flex: 1,
        minHeight: 0,
    },
    header_quick_info: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#E4E4E4",
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        borderRadius: 25,
        height: 50,
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
    },
    text_info: {
        flex: 1,
        textAlign: 'left',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginLeft: 10,
    },
    upload_button: {
        flexShrink: 0,
        backgroundColor: "#6b0000",
        maxWidth: 40,
        maxHeight: 40,
    },
    messages_functionality: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        alignContent: 'flex-end',
        backgroundColor: '#800000',
        width: '100%',
        height: 86,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,
    },
    text_input_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        backgroundColor: "#5B0000",
        borderRadius: 25,
        paddingLeft: 20,
        paddingRight: 20,
        height: 50,
    },
    text_input: {
        flex: 1,
        color: "#FFFFFF",
        height: '100%',
        borderRadius: 25,
    }
})