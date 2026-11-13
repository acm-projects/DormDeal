import {
    StyleSheet,
    ScrollView,
    View,
    Pressable,
    TextInput,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Other_Message_Box from "../../../../src/components/message_box_pink";
import You_Message_Box from "../../../../src/components/message_box_red";
import Back_Button from "../../../../src/components/back_button";
import Button from "../../../../src/components/button";
import Base from "../../../../src/components/base";
import Text from "../../../../src/components/text_styles";
import { colors } from "../../../root_styles";
import { supabase } from "../../../../lib/supabase";

const PaperclipIcon = ({ color = "#8F969E", size = 28 }) => (
    <Svg width={size} height={size * 1.4} viewBox="0 0 24 34">
        <Path
            d="M7 13 4.5 10.3a4.2 4.2 0 0 1 6.2-5.7l9.1 9.9a5.8 5.8 0 0 1-8.5 7.9L3.8 13.2a3.8 3.8 0 0 1 5.6-5.2l8.4 9.1"
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const time_ago = (iso) => {
    // DB timestamps have no timezone but are UTC, so mark them as UTC
    const t = /Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + "Z";
    const s = Math.max(
        0,
        Math.floor((Date.now() - new Date(t).getTime()) / 1000),
    );
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
};

const Messages = () => {
    const { messages_id } = useLocalSearchParams();
    const conversation_id = Number(messages_id);

    const [user_id, set_user_id] = useState(null);
    const [messages, set_messages] = useState([]);
    const [text, set_text] = useState("");
    const [chat_title, set_chat_title] = useState("Chat");
    const [listing_title, set_listing_title] = useState("Starbucks Cup");
    const [send_error, set_send_error] = useState("");

    const scroll_view_ref = useRef(null);
    const scroll_to_end_func = () => {
        scroll_view_ref.current?.scrollToEnd({ animated: false });
    };

    // who am I?
    useEffect(() => {
        supabase.auth
            .getUser()
            .then(({ data }) => set_user_id(data.user?.id ?? null));
    }, []);

    // header title (the other person's name)
    useEffect(() => {
        if (!user_id || Number.isNaN(conversation_id)) return;
        const load_title = async () => {
            const { data: convo } = await supabase
                .from("conversations")
                .select("buyer_id, seller_id, listings(title)")
                .eq("conversation_id", conversation_id)
                .maybeSingle();
            if (!convo) return;
            const other_id =
                convo.buyer_id === user_id ? convo.seller_id : convo.buyer_id;
            const { data: other } = await supabase
                .from("app-users")
                .select("name")
                .eq("user_id", other_id)
                .maybeSingle();
            set_chat_title(other?.name ?? `Chat ${conversation_id}`);
            set_listing_title(convo.listings?.title ?? "Starbucks Cup");
        };
        load_title();
    }, [user_id, conversation_id]);

    // load history + subscribe to new messages
    useEffect(() => {
        if (!user_id || Number.isNaN(conversation_id)) return;

        const load = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("sent_at", { ascending: true });
            if (error) console.error(error);
            set_messages(data ?? []);
        };
        load();

        const channel = supabase
            .channel(`conversation-${conversation_id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversation_id}`,
                },
                (payload) => {
                    const msg = payload.new;
                    set_messages((prev) =>
                        prev.some((m) => m.message_id === msg.message_id)
                            ? prev
                            : [...prev, msg],
                    );
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user_id, conversation_id]);

    const send_message = async () => {
        if (!text.trim() || !user_id) return;
        const content = text;
        set_text("");
        const { data, error } = await supabase
            .from("messages")
            .insert({ conversation_id, sender_id: user_id, content })
            .select()
            .single();
        if (error) {
            console.error(error);
            set_send_error(error.message);
            set_text(content);
            return;
        }
        set_send_error("");
        set_messages((prev) =>
            prev.some((m) => m.message_id === data.message_id)
                ? prev
                : [...prev, data],
        );
    };

    return (
        <Base style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <View style={styles.header_container}>
                <Back_Button href="/Contacts" style={styles.back_button} />
                <View style={styles.header_quick_info}>
                    <View style={styles.profile_avatar}>
                        <Ionicons
                            name="person"
                            size={22}
                            color={colors.white}
                        />
                    </View>
                    <View style={styles.text_info}>
                        <Text style={styles.header_name}>{chat_title}</Text>
                        <Text style={styles.header_subtitle}>
                            Verified student · Helix Hall
                        </Text>
                    </View>
                </View>
                <Button
                    style={styles.menu_button}
                    accessibilityLabel="Conversation options"
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={25}
                        color={colors.maroon}
                    />
                </Button>
            </View>

            <View style={styles.listing_card}>
                <View style={styles.paperclip}>
                    <PaperclipIcon />
                </View>
                <View style={styles.listing_thumbnail} />
                <View style={styles.listing_info}>
                    <Text
                        style={styles.listing_subject}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        re: {listing_title}
                    </Text>
                    <Text style={styles.listing_detail}>
                        $8 · pickup at Library lobby
                    </Text>
                </View>
                <Pressable style={styles.listing_view}>
                    <Text style={styles.listing_view_text}>View</Text>
                </Pressable>
            </View>

            <ScrollView
                ref={scroll_view_ref}
                onContentSizeChange={scroll_to_end_func}
                style={styles.messages_scroll_view}
                contentContainerStyle={styles.messages_container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.tip_note}>
                    <View style={styles.tip_top} />
                    <Text style={styles.tip_text}>
                        Tip: meet in a busy campus spot, like the Library lobby.
                    </Text>
                </View>
                {messages.map((m) =>
                    m.sender_id === user_id ? (
                        <You_Message_Box
                            key={m.message_id}
                            status={time_ago(m.sent_at)}
                        >
                            {m.content}
                        </You_Message_Box>
                    ) : (
                        <Other_Message_Box
                            key={m.message_id}
                            status={time_ago(m.sent_at)}
                        >
                            {m.content}
                        </Other_Message_Box>
                    ),
                )}
            </ScrollView>

            {send_error ? (
                <Text style={styles.send_error}>{send_error}</Text>
            ) : null}

            <View style={styles.messages_functionality}>
                <Button style={styles.attachment_button}>
                    <PaperclipIcon color={colors.maroon} size={24} />
                </Button>
                <View style={styles.text_input_container}>
                    <TextInput
                        placeholder="{ draft }"
                        placeholderTextColor="#6B5E5E"
                        style={styles.text_input}
                        value={text}
                        onChangeText={set_text}
                        onSubmitEditing={send_message}
                    />
                    <Pressable
                        onPress={send_message}
                        style={styles.upload_button}
                        accessibilityLabel="Send message"
                    >
                        <Ionicons
                            name="arrow-up"
                            size={28}
                            color={colors.white}
                        />
                    </Pressable>
                </View>
            </View>
        </Base>
    );
};

export default Messages;

const styles = StyleSheet.create({
    header_container: {
        flexDirection: "row",
        paddingHorizontal: 14,
        gap: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    back_button: {
        width: 56,
        height: 56,
        backgroundColor: colors.cream,
        borderRadius: 0,
        boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.08)`,
    },
    messages_container: {
        flexGrow: 1,
        justifyContent: "flex-end",
        gap: 5,
        paddingLeft: 20,
        paddingRight: 20,
        paddingHorizontal: 20,
        paddingBottom: 106,
    },
    messages_scroll_view: {
        flex: 1,
        minHeight: 0,
    },
    header_quick_info: {
        flex: 1,
        paddingHorizontal: 12,
        backgroundColor: colors.cream,
        alignItems: "center",
        flexDirection: "row",
        width: "100%",
        borderRadius: 0,
        height: 56,
        boxShadow: "0px 3px 8px rgba(31,20,20,0.12)",
    },
    profile_avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.maroon,
    },
    text_info: {
        flex: 1,
        textAlign: "left",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        marginLeft: 8,
    },
    header_name: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.ink,
        fontFamily: "Outfit",
    },
    header_subtitle: {
        fontSize: 11,
        color: colors.muted,
        fontFamily: "Outfit",
    },
    menu_button: {
        width: 56,
        height: 56,
        backgroundColor: colors.cream,
        borderRadius: 0,
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 3px 8px rgba(31,20,20,0.12)",
    },
    listing_card: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 64,
        marginHorizontal: 18,
        marginBottom: 4,
        paddingVertical: 10,
        paddingLeft: 12,
        paddingRight: 12,
        backgroundColor: colors.cream,
        boxShadow: "0px 3px 8px rgba(31,20,20,0.12)",
    },
    paperclip: {
        position: "absolute",
        left: -15,
        top: -18,
        zIndex: 2,
    },
    listing_thumbnail: {
        width: 44,
        height: 44,
        backgroundColor: colors.maroon,
        marginRight: 10,
    },
    listing_info: {
        flex: 1,
        minWidth: 0,
    },
    listing_subject: {
        color: colors.maroon,
        fontWeight: "700",
        fontFamily: "Outfit",
        fontSize: 14,
        textAlign: "left",
    },
    listing_detail: {
        color: colors.ink,
        fontFamily: "Outfit",
        fontSize: 12,
        textAlign: "left",
    },
    listing_view: {
        paddingLeft: 8,
        paddingVertical: 6,
    },
    listing_view_text: {
        color: colors.maroon,
        fontFamily: "Outfit",
        fontWeight: "700",
        textDecorationLine: "underline",
    },
    tip_note: {
        alignSelf: "center",
        width: 250,
        minHeight: 88,
        marginTop: 220,
        marginBottom: 12,
        padding: 18,
        paddingTop: 24,
        paddingRight: 24,
        backgroundColor: "#FFE45E",
        boxShadow: "0px 4px 8px rgba(31,20,20,0.18)",
    },
    tip_top: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 9,
        backgroundColor: "#F7D83F",
    },
    tip_text: {
        color: colors.ink,
        fontFamily: "Caveat",
        fontSize: 18,
        lineHeight: 24,
    },
    send_error: {
        color: colors.maroon,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    upload_button: {
        flexShrink: 0,
        width: 46,
        height: 46,
        backgroundColor: colors.maroon,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 0,
    },
    messages_functionality: {
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        alignContent: "flex-end",
        backgroundColor: colors.blush,
        width: "100%",
        height: 86,
        borderTopWidth: 2,
        borderTopColor: colors.maroon,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    attachment_button: {
        width: 38,
        height: 46,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "none",
    },
    attachment_icon: {
        opacity: 1,
    },
    text_input_container: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 10,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.maroon,
        borderRadius: 0,
        paddingLeft: 12,
        paddingRight: 0,
        height: 46,
    },
    text_input: {
        flex: 1,
        minWidth: 0,
        color: colors.ink,
        height: "100%",
        borderWidth: 0,
        outlineStyle: "none",
        fontFamily: "Outfit",
        fontSize: 16,
    },
});
