import { useState } from 'react';
import {
    ActivityIndicator, Image, ImageBackground, KeyboardAvoidingView, Platform,
    Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { createListing, deleteListing, uploadListingImage } from '../../../lib/api/listings';
import { LISTING_CATEGORIES, type ListingCategory } from '../../../lib/api/types';
import { formatCategory } from '../../../lib/recommendations';

import PaperBg from '../../../assets/images/paper_bg.png';

const conditions = ['Like new', 'Good', 'Fair'];
const serviceCategories = ['Tutoring', 'Moving', 'Tech help', 'Career', 'Repairs', 'Other'];
const rateUnits = ['/hr', '/session', '/job'];

// a row of pill buttons, only one can be picked
const ChipPicker = <T extends string>(props: {
    options: readonly T[];
    picked: T;
    onPick: (value: T) => void;
    label?: (value: T) => string;
}) => {
    return (
        <View style={form.chips}>
            {props.options.map((option) => {
                const isPicked = option === props.picked;
                return (
                    <Pressable
                        key={option}
                        onPress={() => props.onPick(option)}
                        style={[form.chip, isPicked && form.chipPicked]}
                    >
                        <Text style={[form.chipText, isPicked && form.chipTextPicked]}>
                            {props.label ? props.label(option) : option}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const Create_Listing = () => {
    const router = useRouter();
    // '/Create Listing?type=service' opens the service version of the form
    const { type } = useLocalSearchParams<{ type?: string }>();
    const isService = type === 'service';

    // one piece of state per box in the form
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // item-only boxes
    const [category, setCategory] = useState<ListingCategory>('other');
    const [condition, setCondition] = useState(conditions[0]);
    const [pickup, setPickup] = useState('');

    // service-only boxes
    const [serviceCategory, setServiceCategory] = useState(serviceCategories[0]);
    const [rateUnit, setRateUnit] = useState(rateUnits[0]);
    const [availability, setAvailability] = useState('');
    const [where, setWhere] = useState('');

    // can't post until the must-haves are filled in.
    // services can't save yet: there's no services table in the database
    const filledIn = title.trim() !== '' && price !== '' && (isService ? where.trim() !== '' : pickup.trim() !== '');
    const canPost = filledIn && !isService && !submitting;

    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) setPhoto(result.assets[0]);
    };

    const postListing = async () => {
        if (!canPost) return; // safety check
        setError('');
        setSubmitting(true);

        // the database has no condition / pickup columns yet, so they ride along in the description
        const extras = `Condition: ${condition} · Pickup: ${pickup.trim()}`;
        const fullDescription = description.trim() ? `${description.trim()}\n\n${extras}` : extras;

        try {
            const listing = await createListing({
                title,
                description: fullDescription,
                price: Number(price),
                category,
            });

            if (photo) {
                try {
                    await uploadListingImage(listing.listing_id, photo);
                } catch (photoError) {
                    await deleteListing(listing.listing_id); // don't leave a listing without its photo
                    throw photoError;
                }
            }

            router.replace(`/Store/Listing/Marketplace/live-${listing.listing_id}`); // show the new listing
        } catch (postError) {
            setError(postError instanceof Error ? postError.message : 'Could not post your listing. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ImageBackground source={PaperBg} style={form.screen}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={form.content} keyboardShouldPersistTaps="handled">

                    <Pressable style={form.backPill} onPress={() => router.push('/Post')} accessibilityLabel="Back to post">
                        <Ionicons name="chevron-back" size={16} color={colors.white} />
                        <Text style={form.backPillText}>Post</Text>
                    </Pressable>

                    <Text style={form.note}>{isService ? 'offer a service!' : 'sell something!'}</Text>
                    <Text style={form.title}>{isService ? 'New service' : 'New listing'}</Text>

                    {/* photo: tap to pick one, tap again to change it */}
                    {photo ? (
                        <View style={form.photoPicked}>
                            <Image source={{ uri: photo.uri }} style={form.photoImage} />
                            <View style={form.photoActions}>
                                <Pressable onPress={pickPhoto} style={form.photoAction} disabled={submitting}>
                                    <Ionicons name="image-outline" size={18} color={colors.maroon} />
                                    <Text style={form.photoActionText}>Change photo</Text>
                                </Pressable>
                                <Pressable onPress={() => setPhoto(null)} style={form.photoAction} disabled={submitting} accessibilityLabel="Remove photo">
                                    <Ionicons name="trash-outline" size={18} color={colors.maroon} />
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Pressable style={form.photoBox} onPress={pickPhoto} disabled={submitting}>
                            <Ionicons name="camera-outline" size={30} color={colors.maroon} />
                            <Text style={form.photoText}>Add a photo</Text>
                        </Pressable>
                    )}

                    <Text style={form.label}>Title</Text>
                    <TextInput
                        style={form.input}
                        placeholder={isService ? 'What can you help with?' : 'What are you selling?'}
                        placeholderTextColor={colors.muted}
                        maxLength={120}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={form.label}>{isService ? 'Rate' : 'Price'}</Text>
                    <View style={form.priceBox}>
                        <Text style={form.dollar}>$</Text>
                        <TextInput
                            style={form.priceInput}
                            placeholder="0"
                            placeholderTextColor={colors.muted}
                            keyboardType="decimal-pad"
                            value={price}
                            onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))} // numbers only
                        />
                        {isService && <Text style={form.rateUnit}>{rateUnit}</Text>}
                    </View>
                    {isService && (
                        <View style={{ marginTop: 8 }}>
                            <ChipPicker options={rateUnits} picked={rateUnit} onPick={setRateUnit} />
                        </View>
                    )}

                    <Text style={form.label}>Category</Text>
                    {isService ? (
                        <ChipPicker options={serviceCategories} picked={serviceCategory} onPick={setServiceCategory} />
                    ) : (
                        <ChipPicker options={LISTING_CATEGORIES} picked={category} onPick={setCategory} label={formatCategory} />
                    )}

                    {!isService && (
                        <>
                            <Text style={form.label}>Condition</Text>
                            <ChipPicker options={conditions} picked={condition} onPick={setCondition} />
                        </>
                    )}

                    <Text style={form.label}>Description</Text>
                    <TextInput
                        style={[form.input, form.textArea]}
                        placeholder={isService
                            ? "What you offer, your experience, what to bring..."
                            : "Size, how long you've had it, why you're selling..."}
                        placeholderTextColor={colors.muted}
                        multiline
                        maxLength={4000}
                        value={description}
                        onChangeText={setDescription}
                    />

                    {isService ? (
                        <>
                            <Text style={form.label}>Availability</Text>
                            <TextInput
                                style={form.input}
                                placeholder="e.g. Weekday evenings"
                                placeholderTextColor={colors.muted}
                                value={availability}
                                onChangeText={setAvailability}
                            />

                            <Text style={form.label}>Where</Text>
                            <TextInput
                                style={form.input}
                                placeholder="e.g. Library or online"
                                placeholderTextColor={colors.muted}
                                value={where}
                                onChangeText={setWhere}
                            />
                        </>
                    ) : (
                        <>
                            <Text style={form.label}>Pickup spot</Text>
                            <TextInput
                                style={form.input}
                                placeholder="e.g. West Hall lobby"
                                placeholderTextColor={colors.muted}
                                value={pickup}
                                onChangeText={setPickup}
                            />
                        </>
                    )}

                    {error ? <Text style={form.error}>{error}</Text> : null}

                    <Pressable
                        style={[form.postButton, !canPost && form.postButtonOff]}
                        onPress={postListing}
                        disabled={!canPost}
                    >
                        {submitting
                            ? <ActivityIndicator color={colors.white} />
                            : <Text style={form.postText}>{isService ? 'Post service' : 'Post listing'}</Text>}
                    </Pressable>
                    {isService ? (
                        <Text style={form.hint}>services can't be posted yet, coming soon!</Text>
                    ) : !filledIn ? (
                        <Text style={form.hint}>Add a title, price and pickup spot to post</Text>
                    ) : null}

                </ScrollView>
            </KeyboardAvoidingView>

            <TabBar active="post" />
        </ImageBackground>
    );
};

const form = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.cream,
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 140, // room for the tab bar
    },
    backPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.maroonDark,
        marginBottom: 10,
    },
    backPillText: {
        color: colors.white,
        fontFamily: 'Outfit',
        fontSize: 15,
    },
    note: {
        fontSize: 26,
        color: colors.maroon,
        fontFamily: 'Caveat',
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
        marginBottom: 16,
    },
    photoBox: {
        height: 130,
        borderRadius: 22,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.maroon,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    photoText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    photoPicked: {
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: colors.white,
    },
    photoImage: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: colors.blush,
    },
    photoActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    photoAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 10,
    },
    photoActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
        marginTop: 18,
        marginBottom: 8,
    },
    input: {
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        fontSize: 15,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    textArea: {
        height: 110,
        paddingTop: 14,
        textAlignVertical: 'top', // android: start typing at the top
    },
    priceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        gap: 4,
    },
    dollar: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    priceInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    rateUnit: {
        fontSize: 16,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap', // drop to the next line if they don't fit
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: colors.white,
    },
    chipPicked: {
        backgroundColor: colors.maroon,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    chipTextPicked: {
        color: colors.white,
    },
    error: {
        fontSize: 14,
        color: '#B00020',
        fontFamily: 'Outfit',
        textAlign: 'center',
        marginTop: 18,
    },
    postButton: {
        height: 54,
        marginTop: 28,
        borderRadius: 27,
        backgroundColor: colors.maroon,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postButtonOff: {
        opacity: 0.4, // faded until the form is ready
    },
    postText: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.white,
        fontFamily: 'Outfit',
    },
    hint: {
        fontSize: 18,
        color: colors.muted,
        fontFamily: 'Caveat',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default Create_Listing;
