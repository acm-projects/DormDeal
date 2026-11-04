import { useState } from 'react';
import {
    ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable,
    ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../root_styles';
import { createListing, deleteListing, uploadListingImage } from '../../../lib/api/listings';
import { LISTING_CATEGORIES, type ListingCategory } from '../../../lib/api/types';
import { formatCategory } from '../../../lib/recommendations';

const CreateListing = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<ListingCategory>('other');
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) setSelectedImage(result.assets[0]);
    };

    const submit = async () => {
        const numericPrice = price.trim() === '' ? Number.NaN : Number(price);
        setSubmitting(true);
        try {
            const listing = await createListing({ title, description, price: numericPrice, category });
            if (selectedImage) {
                try {
                    await uploadListingImage(listing.listing_id, selectedImage);
                } catch (imageError) {
                    await deleteListing(listing.listing_id);
                    throw imageError;
                }
            }
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

                <Text style={styles.label}>Photo</Text>
                {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                        <View style={styles.imageActions}>
                            <Pressable onPress={pickImage} style={styles.imageActionButton} disabled={submitting}>
                                <Ionicons name="image-outline" size={18} color={colors.maroon} />
                                <Text style={styles.imageActionText}>Change photo</Text>
                            </Pressable>
                            <Pressable onPress={() => setSelectedImage(null)} style={styles.removeImageButton} disabled={submitting}>
                                <Ionicons name="trash-outline" size={18} color={colors.maroon} />
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <Pressable onPress={pickImage} style={styles.imagePickerButton} disabled={submitting}>
                        <Ionicons name="image-outline" size={25} color={colors.maroon} />
                        <Text style={styles.imagePickerTitle}>Add a photo</Text>
                        <Text style={styles.imagePickerHint}>Choose one image from your library</Text>
                    </Pressable>
                )}

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
    imagePickerButton: { minHeight: 130, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.maroon, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 5 },
    imagePickerTitle: { color: colors.maroon, fontFamily: 'Outfit', fontSize: 16, fontWeight: '700' },
    imagePickerHint: { color: colors.muted, fontFamily: 'Outfit', fontSize: 13 },
    imagePreviewContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 1, borderColor: '#E5DDDA' },
    imagePreview: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.blush },
    imageActions: { minHeight: 50, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    imageActionButton: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 8 },
    imageActionText: { color: colors.maroon, fontFamily: 'Outfit', fontSize: 14, fontWeight: '700' },
    removeImageButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
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
