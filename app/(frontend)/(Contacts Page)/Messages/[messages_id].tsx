/*
import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../../components/nav_button'
import styles from '../../../styles'

import Logo from '../../../../assets/icon.png'

const Messages = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Messaging Someone Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Contacts" text="Contacts Page"></Nav_Button>
                <Nav_Button href="/Messages/Reminders" text="Reminders Page"></Nav_Button>
                <Nav_Button href="/Profile" text="Go To Profile Page"></Nav_Button>
            </View>
        </View>
    );
}

export default Messages
*/

import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../lib/supabase';

type Message = {
  message_id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  sent_at: string;
};

export default function MessageThread() {
  // messages_id is the conversation_id — route param name comes from the file name
  const { messages_id } = useLocalSearchParams<{ messages_id: string }>();
  const conversationId = Number(messages_id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!conversationId) return;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) console.error(error);
      setMessages(data ?? []);
    };
    init();

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!text.trim() || !userId) return;
    const content = text;
    setText('');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
    });
    if (error) console.error(error);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.message_id.toString()}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => {
          const isMine = item.sender_id === userId;
          return (
            <View
              style={[
                styles.bubble,
                isMine ? styles.bubbleMine : styles.bubbleTheirs,
              ]}
            >
              <Text style={{ color: isMine ? '#fff' : '#000' }}>{item.content}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 16,
    padding: 10,
    margin: 6,
    maxWidth: '75%',
  },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#007aff' },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#e5e5ea' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sendButton: { marginLeft: 8, justifyContent: 'center' },
  sendText: { color: '#007aff', fontWeight: 'bold' },
});