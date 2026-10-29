import { useState } from 'react';
import { Text, View, ImageBackground, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';
import { items } from '../../../data/items';

import PaperBg from '../../../assets/images/paper_bg.png';

const categories = ['Appliances', 'Dorm decor', 'Bedding', 'Textbooks', 'Other'];
const conditions = ['Like new', 'Good', 'Fair'];

// a row of pill buttons, only one can be picked
const ChipPicker = (props: { options: string[]; picked: string; onPick: (value: string) => void }) => {
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
                        <Text style={[form.chipText, isPicked && form.chipTextPicked]}>{option}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const Create_Listing = () => {
    const router = useRouter();

    // one piece of state per box in the form
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [condition, setCondition] = useState(conditions[0]);
    const [description, setDescription] = useState('');
    const [pickup, setPickup] = useState('');

    // can't post until the must-haves are filled in
    const canPost = title.trim() !== '' && price !== '' && pickup.trim() !== '';

    const postListing = () => {
        if (!canPost) return; // safety check

        const newItem = {
            id: String(items.length + 1),
            title: title.trim(),
            seller: 'Maya R.',  // swap for logged in user later
            initials: 'MR',
            price: `$${price}`,
            condition: condition,
            category: category,
            description: description.trim(),
            pickup: pickup.trim(),
            posted: 'Just now',
        };

        items.push(newItem); // add to the list (only lasts until the app reloads for now)
        router.push(`/Store/Listing/Marketplace/${newItem.id}`); // show the new listing
    };

    return (
        <ImageBackground source={PaperBg} style={form.screen}>
            <ScrollView contentContainerStyle={form.content}>

                <Text style={form.note}>sell something!</Text>
                <Text style={form.title}>New listing</Text>

                {/* photos, placeholder for now */}
                <Pressable style={form.photoBox}>
                    <Ionicons name="camera-outline" size={30} color={colors.maroon} />
                    <Text style={form.photoText}>Add photos</Text>
                </Pressable>

                <Text style={form.label}>Title</Text>
                <TextInput
                    style={form.input}
                    placeholder="What are you selling?"
                    placeholderTextColor={colors.muted}
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={form.label}>Price</Text>
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
                </View>

                <Text style={form.label}>Category</Text>
                <ChipPicker options={categories} picked={category} onPick={setCategory} />

                <Text style={form.label}>Condition</Text>
                <ChipPicker options={conditions} picked={condition} onPick={setCondition} />

                <Text style={form.label}>Description</Text>
                <TextInput
                    style={[form.input, form.textArea]}
                    placeholder="Size, how long you've had it, why you're selling..."
                    placeholderTextColor={colors.muted}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={form.label}>Pickup spot</Text>
                <TextInput
                    style={form.input}
                    placeholder="e.g. West Hall lobby"
                    placeholderTextColor={colors.muted}
                    value={pickup}
                    onChangeText={setPickup}
                />

                <Pressable
                    style={[form.postButton, !canPost && form.postButtonOff]}
                    onPress={postListing}
                    disabled={!canPost}
                >
                    <Text style={form.postText}>Post listing</Text>
                </Pressable>
                {!canPost && (
                    <Text style={form.hint}>Add a title, price and pickup spot to post</Text>
                )}

            </ScrollView>

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