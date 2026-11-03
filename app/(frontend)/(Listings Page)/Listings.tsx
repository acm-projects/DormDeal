import { Text, View, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import TabBar from '../components/tab_bar';

import PaperBg from '../../../assets/images/paper_bg.png';

// the two choices, each one opens its own form
type Option = {
    title: string;
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
};

const options: Option[] = [
    {
        title: 'Sell an item',
        desc: 'Furniture, decor, textbooks, anything you no longer need',
        icon: 'pricetag-outline',
        route: '/Create%20Listing',
    },
    {
        title: 'Offer a service',
        desc: 'Tutoring, moving help, photography, anything you can do',
        icon: 'construct-outline',
        route: '/Create%20Service',
    },
];

const Listings = () => {
    const router = useRouter();

    return (
        <ImageBackground source={PaperBg} style={styles.screen}>
            <View style={styles.content}>

                <Text style={styles.note}>what are you posting?</Text>
                <Text style={styles.title}>New post</Text>

                {options.map((o) => (
                    <Pressable
                        key={o.title}
                        style={styles.card}
                        onPress={() => router.push(o.route)}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name={o.icon} size={26} color={colors.maroon} />
                        </View>
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>{o.title}</Text>
                            <Text style={styles.cardDesc}>{o.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                    </Pressable>
                ))}

            </View>

            <TabBar active="post" />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.cream,
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 20,
        gap: 14,
    },
    note: {
        fontSize: 26,
        color: colors.maroon,
        fontFamily: 'Caveat',
    },
    title: {
        fontSize: 34,
        color: colors.ink,
        fontFamily: 'Outfit',
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 18,
        borderRadius: 22,
        backgroundColor: colors.white,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    cardDesc: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
        marginTop: 2,
    },
});

export default Listings;