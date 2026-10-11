/*
import { StyleSheet, Text, View, Image } from 'react-native';
import Nav_Button from '../components/nav_button'
import styles from '../../styles'
import Logo from '../../../assets/icon.png'

const Contacts = () => {
    return (
        <View style={styles.container}>
            <Image source={Logo} style={styles.img}/>
            <Text style={styles.title}>Contacts Page.</Text>
            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
                <Nav_Button href="/Messages/1" text="Messages Page"></Nav_Button>
                <Nav_Button href="/Store/Listing/Service/2" text="Listing from Person"></Nav_Button>
            </View>
        </View>
    );
}

export default Contacts
*/
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';

type Conversation = {
  conversation_id: number;
  last_message_at: string | null;
  listings: { title: string } | null;
};

export default function Contacts() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('conversation_id, last_message_at, listings(title)')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setConversations((data as unknown as Conversation[]) ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.conversation_id.toString()}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No conversations yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push(`/(frontend)/(Contacts Page)/Messages/${item.conversation_id}`)
          }
        >
          <Text style={styles.title}>{item.listings?.title ?? 'Listing'}</Text>
          <Text style={styles.subtitle}>
            {item.last_message_at
              ? new Date(item.last_message_at).toLocaleString()
              : 'No messages yet'}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontWeight: 'bold', fontSize: 16 },
  subtitle: { color: '#666', marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});