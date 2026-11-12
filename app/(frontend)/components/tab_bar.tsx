import { View, Pressable, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabTransition, navigateWithTransition } from '../../../components/transitions/pageTransitions';

type TabName = 'home' | 'catalog' | 'post' | 'inbox' | 'profile';

// each tab: its name, icon when off, icon when on, and where it goes
const tabs = [
    { name: 'home', icon: 'home-outline', iconActive: 'home', href: '/home' },
    { name: 'catalog', icon: 'bag-outline', iconActive: 'bag', href: '/Store' },
    { name: 'post', icon: 'add', iconActive: 'add', href: '/Listings' },
    { name: 'inbox', icon: 'mail-outline', iconActive: 'mail', href: '/Contacts' },
    { name: 'profile', icon: 'person-circle-outline', iconActive: 'person-circle', href: '/Profile/1' },
] as const;

const TabBar = (props: { active?: TabName }) => {
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const stageBottom = Math.max(82, 58 + Math.max(insets.bottom, 10));

    return (
        <View style={bar.wrap}>
            <View style={[bar.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                {tabs.map((tab) => {
                    const isActive = tab.name === props.active;
                    const isPost = tab.name === 'post';

                    return (
                        <View key={tab.name} style={bar.tab}>
                            <Pressable
                                onPress={() => {
                                    void navigateWithTransition({ pathname, stageBottom }, tab.href, getTabTransition(tab.href));
                                }}
                                style={isPost ? bar.postVisual : bar.tabButton}
                                accessibilityLabel={tab.name}
                            >
                                <Ionicons
                                    name={isActive ? tab.iconActive : tab.icon}
                                    size={isPost ? 32 : 25}
                                    color={isPost ? colors.maroon : colors.white}
                                />
                                {isActive && !isPost && <View style={bar.dot} />}
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const bar = StyleSheet.create({
    wrap: {
        position: 'absolute', // float on top of the screen
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        elevation: 20,
    },
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        minHeight: 82,
        paddingTop: 8,
        backgroundColor: colors.maroon,
        shadowColor: colors.ink,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    tab: {
        flex: 1,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButton: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postVisual: {
        width: 50,
        height: 50,
        backgroundColor: colors.goldLight,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        position: 'absolute',
        bottom: 1,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.gold,
    },
});

export default TabBar;
