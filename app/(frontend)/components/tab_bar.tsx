import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles';

type TabName = 'home' | 'market' | 'post' | 'inbox' | 'profile';

// each tab: its name, icon when off, icon when on, and where it goes
const tabs = [
    { name: 'home', icon: 'home-outline', iconActive: 'home', href: '/home' },
    { name: 'market', icon: 'storefront-outline', iconActive: 'storefront', href: '/Store' },
    { name: 'post', icon: 'add', iconActive: 'add', href: '/Listings' },
    { name: 'inbox', icon: 'mail-outline', iconActive: 'mail', href: '/Contacts' },
    { name: 'profile', icon: 'person-circle-outline', iconActive: 'person-circle', href: '/Profile/1' },
] as const;

const TabBar = (props: { active: TabName }) => {
    const router = useRouter();

    return (
        <View style={bar.wrap}>
            <View style={bar.bar}>
                {tabs.map((tab) => {
                    const isActive = tab.name === props.active;
                    const isPost = tab.name === 'post';

                    return (
                        <Pressable
                            key={tab.name}
                            onPress={() => router.push(tab.href)}
                            style={[bar.tab, isPost && bar.postButton]}
                            accessibilityLabel={tab.name}
                        >
                            <Ionicons
                                name={isActive ? tab.iconActive : tab.icon}
                                size={isPost ? 30 : 25}
                                color={colors.white}
                            />
                            {isActive && <View style={bar.dot} />}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const bar = StyleSheet.create({
    wrap: {
        position: 'absolute', // float on top of the screen
        left: 16,
        right: 16,
        bottom: 24,
    },
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.maroon,
        shadowColor: colors.ink,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    tab: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.maroonLight,
    },
    dot: {
        position: 'absolute',
        bottom: 0,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.gold, // little gold dot under the current tab
    },
});

export default TabBar;