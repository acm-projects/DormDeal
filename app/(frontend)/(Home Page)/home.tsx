import { Text, View, ImageBackground, StyleSheet } from 'react-native';
import { colors } from '../../styles';

import PaperBg from '../../../assets/paper_bg.png';

const Home = () => {
    const userName = 'Maya'; // swap for real name once login works
    const initials = 'MR';   // same, comes from login later

    return (
        <ImageBackground source={PaperBg} style={home.screen}>
            {/* greeting on the left, avatar on the right */}
            <View style={home.headerRow}>
                <View style={home.greeting}>
                    <Text style={home.hello}>Hello,</Text>
                    <Text style={home.name}>{userName}</Text>
                    <Text style={home.subtitle}>What are you looking for today?</Text>
                </View>

                <View style={home.avatar}>
                    <Text style={home.avatarText}>{initials}</Text>
                </View>
            </View>
        </ImageBackground>
    );
};

const home = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.cream,
        paddingTop: 70,
        paddingHorizontal: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        gap: 2,
    },
    hello: {
        fontSize: 32,
        color: colors.maroon,
        fontFamily: 'Caveat',
    },
    name: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.ink,
        fontFamily: 'Outfit',
    },
    subtitle: {
        fontSize: 15,
        color: colors.muted,
        fontFamily: 'Outfit',
        marginTop: 4,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.maroon,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Outfit',
    },
});

export default Home;