import { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import Base from '../components/base';
import Text from '../components/text_styles';
import Back_Button from '../components/back_button';

type Conversation = {
  conversation_id: number;
  last_message_at: string | null;
  listing_title: string | null;
  other_name: string;
};

const time_ago = (iso: string) => {
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

export default function Contacts() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState('');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { data: auth } = await supabase.auth.getUser();
        const me = auth.user?.id;

        const { data, error } = await supabase
          .from('conversations')
          .select('conversation_id, last_message_at, buyer_id, seller_id, listings(title)')
          .order('last_message_at', { ascending: false, nullsFirst: false });

        setDebug(
          `${auth.user?.email ?? 'not logged in'} | rows: ${data?.length ?? 0}${error ? ' | ' + error.message : ''}`
        );

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

        const rows: any[] = data ?? [];
        const other_ids = rows.map((r) => (r.buyer_id === me ? r.seller_id : r.buyer_id));

        const { data: users } = await supabase
          .from('app-users')
          .select('user_id, name')
          .in('user_id', other_ids);
        const names = new Map((users ?? []).map((u: any) => [u.user_id, u.name]));

        setConversations(
          rows.map((r) => ({
            conversation_id: r.conversation_id,
            last_message_at: r.last_message_at,
            listing_title: r.listings?.title ?? null,
            other_name: names.get(r.buyer_id === me ? r.seller_id : r.buyer_id) ?? 'Unknown user',
          }))
        );
        setLoading(false);
      };
      load();
    }, [])
  );

  return (
    <Base style={{}}>
      <View style={styles.header}>
        <Back_Button href="/" />
        <Text style={styles.header_title}>Contacts</Text>
      </View>

      <Text style={{ fontSize: 11, opacity: 0.5, paddingHorizontal: 20 }}>{debug}</Text>

      {loading ? (
        <View style={styles.center}><Text style={{}}>Loading...</Text></View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversation_id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}><Text style={{}}>No conversations yet</Text></View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                router.push(`/(frontend)/(Contacts Page)/Messages/${item.conversation_id}`)
              }
            >
              <Text style={styles.title}>{item.other_name}</Text>
              <Text style={styles.subtitle}>
                {item.listing_title ? `${item.listing_title} • ` : ''}
                {item.last_message_at ? time_ago(item.last_message_at) : 'No messages yet'}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </Base>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 10 },
  header_title: { fontSize: 22, fontWeight: 'bold' },
  list: { paddingHorizontal: 20, gap: 10 },
  row: { backgroundColor: '#E4E4E4', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 18 },
  title: { fontWeight: 'bold', fontSize: 16 },
  subtitle: { fontSize: 12, opacity: 0.5, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});