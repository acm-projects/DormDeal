import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import { Header1 } from '../components/text_styles';
import Base from '../components/base';
import ChoiceCard from '../components/choice_card';
import TabBar from '../components/tab_bar';

// what the + button opens: sell a thing or offer a service
const Post = () => {
    const router = useRouter();

    return (
        <Base style={{}}>
            <Header1 style={{ marginBottom: 0 }}>post</Header1>
            <Text style={post.subtitle}>what are you putting up?</Text>

            <View style={post.choices}>
                <ChoiceCard
                    title="Sell an item"
                    blurb="Furniture, textbooks, electronics, anything you don't need anymore."
                    doodle="tag"
                    tilt="-1deg"
                    fill
                    boxColor={colors.maroon}
                    textColor={colors.white}
                    onPress={() => router.push('/Create Listing')}
                />
                <ChoiceCard
                    title="Offer a service"
                    blurb="Tutoring, moving help, tech fixes, whatever you're good at."
                    doodle="hand"
                    tilt="1deg"
                    fill
                    boxColor={colors.goldLight}
                    textColor={colors.maroonDark}
                    onPress={() => router.push('/Create Listing?type=service')}
                />
            </View>

            {/* the + button used to open My listings, so keep a way back there */}
            <Pressable style={post.myListings} onPress={() => router.push('/Listings')}>
                <Ionicons name="list-outline" size={18} color={colors.maroon} />
                <Text style={post.myListingsText}>My listings</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.maroon} />
            </Pressable>

            <TabBar active="post" />
        </Base>
    );
};

const post = StyleSheet.create({
    subtitle: {
        fontFamily: 'Caveat',
        fontSize: 26,
        color: colors.maroon,
        marginTop: 2,
        transform: [{ rotate: '-2deg' }], // little tilt like handwriting
    },
    choices: {
        flex: 1,              // the two polaroids share the rest of the screen
        gap: 22,
        marginTop: 28,
    },
    myListings: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: 6,
        marginTop: 18,
        marginBottom: 64,     // room so the tab bar doesn't cover it
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.white,
    },
    myListingsText: {
        fontFamily: 'Outfit',
        fontSize: 16,
        fontWeight: '600',
        color: colors.maroon,
    },
});

export default Post;
