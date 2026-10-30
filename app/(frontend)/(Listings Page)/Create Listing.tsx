import { useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable,
    ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../root_styles';
import { createListing } from '../../../lib/api/listings';
import { LISTING_CATEGORIES, type ListingCategory } from '../../../lib/api/types';
import { formatCategory } from '../../../lib/recommendations';

const CreateListing = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<ListingCategory>('other');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        const numericPrice = price.trim() === '' ? Number.NaN : Number(price);
        setSubmitting(true);
        try {
            await createListing({ title, description, price: numericPrice, category });
            Alert.alert('Listing published', 'Your listing is now available in the marketplace.');
            router.replace('/Listings');
        } catch (error) {
            Alert.alert('Could not publish listing', error instanceof Error ? error.message : 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
                        <Ionicons name="chevron-back" size={22} color={colors.ink} />
                    </Pressable>
                    <View>
                        <Text style={styles.eyebrow}>SELL ON CAMPUS</Text>
                        <Text style={styles.heading}>Create a listing</Text>
                    </View>
                </View>

                <Text style={styles.label}>Title</Text>
                <TextInput value={title} onChangeText={setTitle} placeholder="Mini fridge, 3.1 cu ft" placeholderTextColor={colors.muted} maxLength={120} style={styles.input} />

                <Text style={styles.label}>Description</Text>
                <TextInput value={description} onChangeText={setDescription} placeholder="Condition, what is included, and pickup details" placeholderTextColor={colors.muted} maxLength={5000} multiline textAlignVertical="top" style={[styles.input, styles.description]} />

                <Text style={styles.label}>Price</Text>
                <View style={styles.priceInput}>
                    <Text style={styles.currency}>$</Text>
                    <TextInput value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={colors.muted} keyboardType="decimal-pad" style={styles.priceTextInput} />
                </View>

                <Text style={styles.label}>Category</Text>
                <View style={styles.categories}>
                    {LISTING_CATEGORIES.map((value) => (
                        <Pressable key={value} onPress={() => setCategory(value)} style={[styles.category, category === value && styles.categorySelected]}>
                            <Text style={[styles.categoryText, category === value && styles.categoryTextSelected]}>{formatCategory(value)}</Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable onPress={submit} disabled={submitting} style={[styles.publishButton, submitting && styles.disabled]}>
                    {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.publishText}>Publish listing</Text>}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.cream },
    content: { padding: 20, paddingTop: 58, paddingBottom: 60 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
    backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
    eyebrow: { color: colors.maroon, fontFamily: 'Outfit', fontWeight: '700', fontSize: 11, letterSpacing: 1.2 },
    heading: { color: colors.ink, fontFamily: 'Outfit', fontWeight: '700', fontSize: 30 },
    label: { color: colors.ink, fontFamily: 'Outfit', fontWeight: '700', fontSize: 15, marginTop: 18, marginBottom: 7 },
    input: { minHeight: 52, borderRadius: 16, backgroundColor: colors.white, paddingHorizontal: 16, color: colors.ink, fontFamily: 'Outfit', fontSize: 16, borderWidth: 1, borderColor: '#E5DDDA' },
    description: { minHeight: 130, paddingTop: 14 },
    priceInput: { minHeight: 52, borderRadius: 16, backgroundColor: colors.white, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5DDDA' },
    currency: { color: colors.maroon, fontFamily: 'Outfit', fontWeight: '700', fontSize: 19 },
    priceTextInput: { flex: 1, color: colors.ink, fontFamily: 'Outfit', fontSize: 16, paddingHorizontal: 8 },
    categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    category: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.white, borderWidth: 1, borderColor: '#E5DDDA' },
    categorySelected: { backgroundColor: colors.maroon, borderColor: colors.maroon },
    categoryText: { color: colors.ink, fontFamily: 'Outfit', fontSize: 13, fontWeight: '600' },
    categoryTextSelected: { color: colors.white },
    publishButton: { height: 56, borderRadius: 18, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
    publishText: { color: colors.white, fontFamily: 'Outfit', fontSize: 17, fontWeight: '700' },
    disabled: { opacity: 0.6 },
});

export default CreateListing;
