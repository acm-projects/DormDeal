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
import { supabase } from '../../lib/supabase';

type Message = {
  message_id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  sent_at: string;
};

export default function ChatTest() {
  const [email, setEmail] = useState('test1@test.com');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationIdInput, setConversationIdInput] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  // --- Step 1: log in as a test user ---
  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      return;
    }
    setUserId(data.user?.id ?? null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setMessages([]);
    setConversationId(null);
  };

  // --- Step 2: once logged in + conversation chosen, load + subscribe ---
  useEffect(() => {
    if (!conversationId || !userId) return;

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });
      if (error) console.error(error);
      setMessages(data ?? []);
    };
    load();

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
  }, [conversationId, userId]);

  const sendMessage = async () => {
    if (!text.trim() || !userId || !conversationId) return;
    const content = text;
    setText('');
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
    });
    if (error) console.error(error);
  };

  // --- Screen 1: login ---
  if (!userId) {
    return (
      <View style={styles.center}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity onPress={login} style={styles.button}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Screen 2: pick a conversation ---
  if (!conversationId) {
    return (
      <View style={styles.center}>
        <Text style={styles.label}>Logged in as: {userId}</Text>
        <Text style={styles.label}>Conversation ID</Text>
        <TextInput
          value={conversationIdInput}
          onChangeText={setConversationIdInput}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setConversationId(Number(conversationIdInput))}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Open chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{ marginTop: 20 }}>
          <Text style={{ color: '#007aff' }}>Log out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Screen 3: the chat itself ---
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Conversation {conversationId} — logged in as {userId.slice(0, 8)}...
        </Text>
        <TouchableOpacity onPress={logout}>
          <Text style={{ color: '#007aff' }}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.message_id.toString()}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => {
          const isMine = item.sender_id === userId;
          return (
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
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
          style={styles.chatInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  label: { marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  bubble: { borderRadius: 16, padding: 10, margin: 6, maxWidth: '75%' },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#007aff' },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#e5e5ea' },
  inputRow: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    justifyContent: 'center',
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});
