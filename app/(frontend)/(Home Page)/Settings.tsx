import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Header1 } from '../components/text_styles'
import Search_Bar from '../components/search_bar'
import Back_Button from '../components/back_button'
import Base from '../components/base'
import Text from '../components/text_styles'
import { colors } from '../../root_styles'

type SettingsButtonProps = {
    text: string;
    style?: StyleProp<ViewStyle>;
    onPress: () => void;
};

type SettingsHolderProps = {
    title: string;
    children: ReactNode;
};

type SettingsPageProps = {
    title: string;
    onBack: () => void;
    children: ReactNode;
};

type SettingsInteractiveProps = {
    setting_name: string;
    type?: 0 | 1;
    enabled_initial?: boolean;
    options_list?: string[];
};

type SettingsPageTitle =
    | 'Saved Listings'
    | 'Order History'
    | 'Purchase Notifications'
    | 'Payment Methods'
    | 'Seller Profile'
    | 'Listing Defaults'
    | 'Pickup Preferences'
    | 'Sales Notifications'
    | 'Profile Visibility'
    | 'Blocked Users'
    | 'Privacy Controls'
    | 'Help & Support';
type SettingsControl = {
    setting_name: string;
    type?: 0 | 1;
    enabled_initial?: boolean;
    options_list?: string[];
};

const settingsPageControls: Record<SettingsPageTitle, SettingsControl[]> = {
    'Saved Listings': [
        { setting_name: 'Notify me when saved items change price', enabled_initial: true },
        { setting_name: 'Sort saved listings by', type: 1, options_list: ['Recently saved', 'Lowest price', 'Closest pickup'] },
        { setting_name: 'Show unavailable listings', enabled_initial: false },
    ],
    'Order History': [
        { setting_name: 'Include digital receipts', enabled_initial: true },
        { setting_name: 'Default order filter', type: 1, options_list: ['All orders', 'Completed', 'Cancelled'] },
        { setting_name: 'Show pickup details', enabled_initial: true },
    ],
    'Purchase Notifications': [
        { setting_name: 'New order updates', enabled_initial: true },
        { setting_name: 'Notification timing', type: 1, options_list: ['Immediately', 'Daily summary', 'Never'] },
        { setting_name: 'Pickup reminders', enabled_initial: true },
    ],
    'Payment Methods': [
        { setting_name: 'Use saved payment method', enabled_initial: true },
        { setting_name: 'Default payment method', type: 1, options_list: ['Visa ending in 4242', 'Campus card', 'Ask every time'] },
        { setting_name: 'Confirm purchases before paying', enabled_initial: true },
    ],
    'Seller Profile': [
        { setting_name: 'Show my seller profile', enabled_initial: true },
        { setting_name: 'Seller response time', type: 1, options_list: ['Under 1 hour', 'Same day', 'Within 2 days'] },
        { setting_name: 'Accept buyer questions', enabled_initial: true },
    ],
    'Listing Defaults': [
        { setting_name: 'Automatically renew listings', enabled_initial: false },
        { setting_name: 'Default item condition', type: 1, options_list: ['New', 'Like new', 'Good', 'Fair'] },
        { setting_name: 'Allow offers on new listings', enabled_initial: true },
    ],
    'Pickup Preferences': [
        { setting_name: 'Use preferred pickup settings', enabled_initial: true },
        { setting_name: 'Preferred pickup location', type: 1, options_list: ['Student Union', 'Library entrance', 'Residence hall'] },
        { setting_name: 'Send arrival reminders', enabled_initial: true },
    ],
    'Sales Notifications': [
        { setting_name: 'New sale alerts', enabled_initial: true },
        { setting_name: 'Sales summary frequency', type: 1, options_list: ['Every sale', 'Daily', 'Weekly'] },
        { setting_name: 'Buyer message alerts', enabled_initial: true },
    ],
    'Profile Visibility': [
        { setting_name: 'Show my profile to buyers', enabled_initial: true },
        { setting_name: 'Profile visibility', type: 1, options_list: ['Everyone on campus', 'Verified users', 'Only people I contact'] },
        { setting_name: 'Show completed sales', enabled_initial: false },
    ],
    'Blocked Users': [
        { setting_name: 'Hide blocked users from search', enabled_initial: true },
        { setting_name: 'Block new message requests', enabled_initial: true },
        { setting_name: 'Show blocked listing warnings', type: 1, options_list: ['Always', 'Only when viewing', 'Never'] },
    ],
    'Privacy Controls': [
        { setting_name: 'Personalize recommendations', enabled_initial: true },
        { setting_name: 'Data sharing level', type: 1, options_list: ['Essential only', 'Helpful extras', 'All improvements'] },
        { setting_name: 'Allow usage analytics', enabled_initial: false },
    ],
    'Help & Support': [
        { setting_name: 'Email support updates', enabled_initial: true },
        { setting_name: 'Preferred support channel', type: 1, options_list: ['In-app chat', 'Email', 'Phone'] },
        { setting_name: 'Show help tips', enabled_initial: true },
        { setting_name: 'Contact response preference', type: 1, options_list: ['Fastest available', 'Email reply', 'Chat reply'] },
        { setting_name: 'Show setup checklist', enabled_initial: true },
        { setting_name: 'Default help section', type: 1, options_list: ['Getting started', 'Buying', 'Selling', 'Account'] },
        { setting_name: 'Include screenshots in tips', enabled_initial: true },
        { setting_name: 'Support language', type: 1, options_list: ['English', 'Spanish', 'French'] },
        { setting_name: 'Remember expanded answers', enabled_initial: false },
    ],
};

const Settings_Button = ({ text, style, onPress }: SettingsButtonProps) => {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={text}
            onPress={onPress}
            style={settingsStyles.button_container}
        >
            <View style={[settingsStyles.image, style]} />
            <Text style={settingsStyles.button_text}>{text}</Text>
        </Pressable>
    );
};

const Settings_Interactive = ({
    setting_name,
    type = 0,
    enabled_initial = false,
    options_list = [],
}: SettingsInteractiveProps) => {
    const [enabled, set_enabled] = useState(enabled_initial);
    const [current_option, set_option] = useState(0);
    const [options_open, set_options_open] = useState(false);
    const toggle_progress = useRef(new Animated.Value(enabled_initial ? 1 : 0)).current;
    const options_position = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const screen_height = Dimensions.get('window').height;

    const toggle_enabled = () => {
        const next_enabled = !enabled;
        set_enabled(next_enabled);
        Animated.timing(toggle_progress, {
            toValue: next_enabled ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    };

    const open_options = () => {
        set_options_open(true);
        options_position.setValue(screen_height);
        requestAnimationFrame(() => {
            Animated.timing(options_position, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });
    };

    const close_options = () => {
        Animated.timing(options_position, {
            toValue: screen_height,
            duration: 200,
            useNativeDriver: true,
        }).start(() => set_options_open(false));
    };

    return (
        <View style={settingsStyles.interactive_container}>
            <Text style={[settingsStyles.button_text, settingsStyles.interactive_name]}>
                {setting_name}
            </Text>
            {type === 0 ? (
                <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: enabled }}
                    accessibilityLabel={setting_name}
                    onPress={toggle_enabled}
                >
                    <Animated.View
                        style={settingsStyles.toggle}
                    >
                        <Animated.View
                            style={[
                                settingsStyles.toggle_enabled_overlay,
                                { opacity: toggle_progress },
                            ]}
                        />
                        <Animated.View
                            style={[
                                settingsStyles.toggle_thumb,
                                {
                                    transform: [
                                        {
                                            translateX: toggle_progress.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 24],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    </Animated.View>
                </Pressable>
            ) : (
                <View style={settingsStyles.select_container}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Choose ${setting_name}`}
                        onPress={open_options}
                        style={settingsStyles.select_button}
                    >
                        <Text style={settingsStyles.select_text}>
                            {options_list[current_option] || 'Select'}
                        </Text>
                        <Text style={settingsStyles.select_arrow}>v</Text>
                    </Pressable>
                </View>
            )}
            <Modal
                visible={options_open}
                transparent
                animationType="none"
                onRequestClose={close_options}
            >
                <View style={settingsStyles.options_overlay}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close options"
                        onPress={close_options}
                        style={settingsStyles.options_backdrop}
                    />
                    <Animated.View
                        style={[
                            settingsStyles.options_sheet,
                            { transform: [{ translateY: options_position }] },
                        ]}
                    >
                        <Text style={settingsStyles.options_title}>{setting_name}</Text>
                        {options_list.map((option, index) => (
                            <Pressable
                                key={option}
                                onPress={() => {
                                    set_option(index);
                                    close_options();
                                }}
                                style={settingsStyles.option}
                            >
                                <Text style={settingsStyles.option_text}>{option}</Text>
                            </Pressable>
                        ))}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const Settings_Holder = ({ title, children }: SettingsHolderProps) => {
    return (
        <View style={settingsStyles.holder}>
            <Text style={settingsStyles.category_header}>{title}</Text>
            <View style={settingsStyles.settings_container}>{children}</View>
        </View>
    );
};

const SettingsPage = ({ title, onBack, children }: SettingsPageProps) => {
    return (
        <View style={settingsPageStyles.container}>
            <Back_Button onPress={onBack} />
            <Header1 style={settingsPageStyles.title}>{title}</Header1>
            <ScrollView
                style={settingsPageStyles.scroll}
                showsVerticalScrollIndicator
                indicatorStyle="black"
                persistentScrollbar
                contentContainerStyle={settingsPageStyles.content}
            >
                {children}
            </ScrollView>
        </View>
    );
};

const Settings = () => {
    const router = useRouter();
    const [activePage, setActivePage] = useState<SettingsPageTitle | null>(null);
    const [sign_out_open, set_sign_out_open] = useState(false);
    const pagePosition = useRef(new Animated.Value(0)).current;
    const sign_out_position = useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        if (activePage) {
            Animated.timing(pagePosition, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [activePage, pagePosition]);

    const openPage = (page: SettingsPageTitle) => {
        pagePosition.setValue(screenWidth);
        setActivePage(page);
    };

    const closePage = () => {
        Animated.timing(pagePosition, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setActivePage(null));
    };

    const open_sign_out = () => {
        set_sign_out_open(true);
        sign_out_position.setValue(screenHeight);
        requestAnimationFrame(() => {
            Animated.timing(sign_out_position, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });
    };

    const close_sign_out = () => {
        Animated.timing(sign_out_position, {
            toValue: screenHeight,
            duration: 200,
            useNativeDriver: true,
        }).start(() => set_sign_out_open(false));
    };

    const confirm_sign_out = () => {
        Animated.timing(sign_out_position, {
            toValue: screenHeight,
            duration: 200,
            useNativeDriver: true,
        }).start(() => router.replace('/Landing'));
    };

    return (
        <Base style={{paddingBottom: 0}}>
            <Back_Button style={{marginBottom: 20}} href="/home"/>

            <ScrollView 
                style={settingsStyles.main_scroll}
                contentContainerStyle={{gap: 20, paddingBottom: 50, paddingRight: 20}}
                showsVerticalScrollIndicator
                indicatorStyle="black"
                persistentScrollbar
                >
                <Header1 style={{textAlign: 'left', marginBottom: 0, marginTop: -5}}>
                    settings
                </Header1>
            
                {/* needs button later */}
                <Search_Bar style={{marginTop: 10}} placeholder='Search'/>
                <Settings_Holder title="Marketplace & Orders">
                    <Settings_Button text="Saved Listings" style={{backgroundColor: colors.maroonLight}} onPress={() => openPage('Saved Listings')}/>
                    <Settings_Button text="Order History" style={{backgroundColor: colors.gold}} onPress={() => openPage('Order History')}/>
                    <Settings_Button text="Purchase Notifications" style={{backgroundColor: colors.sage}} onPress={() => openPage('Purchase Notifications')}/>
                    <Settings_Button text="Payment Methods" style={{backgroundColor: colors.maroon}} onPress={() => openPage('Payment Methods')}/>
                </Settings_Holder>
                <Settings_Holder title="Selling & Store">
                    <Settings_Button text="Seller Profile" style={{backgroundColor: colors.maroonLight}} onPress={() => openPage('Seller Profile')}/>
                    <Settings_Button text="Listing Defaults" style={{backgroundColor: colors.gold}} onPress={() => openPage('Listing Defaults')}/>
                    <Settings_Button text="Pickup Preferences" style={{backgroundColor: colors.sage}} onPress={() => openPage('Pickup Preferences')}/>
                    <Settings_Button text="Sales Notifications" style={{backgroundColor: colors.maroon}} onPress={() => openPage('Sales Notifications')}/>
                </Settings_Holder>
                <Settings_Holder title="Account & Safety">
                    <Settings_Button text="Profile Visibility" style={{backgroundColor: colors.maroonLight}} onPress={() => openPage('Profile Visibility')}/>
                    <Settings_Button text="Blocked Users" style={{backgroundColor: colors.gold}} onPress={() => openPage('Blocked Users')}/>
                    <Settings_Button text="Privacy Controls" style={{backgroundColor: colors.sage}} onPress={() => openPage('Privacy Controls')}/>
                    <Settings_Button text="Help & Support" style={{backgroundColor: colors.maroon}} onPress={() => openPage('Help & Support')}/>
                </Settings_Holder>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sign Out"
                    onPress={open_sign_out}
                    style={{backgroundColor: colors.maroon, borderRadius: 22, padding: 10,}}
                >
                    <Text style={{color: colors.white}}>Sign Out</Text>
                </Pressable>
            </ScrollView>
            {activePage && (
                <Animated.View style={[settingsStyles.page, { transform: [{ translateX: pagePosition }] }]}>
                    <SettingsPage title={activePage} onBack={closePage}>
                        <View style={settingsPageStyles.settings_container}>
                            {settingsPageControls[activePage].map((control) => (
                                <Settings_Interactive
                                    key={control.setting_name}
                                    {...control}
                                />
                            ))}
                        </View>
                    </SettingsPage>
                </Animated.View>
            )}
            <Modal
                visible={sign_out_open}
                transparent
                animationType="none"
                onRequestClose={close_sign_out}
            >
                <View style={settingsStyles.options_overlay}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close sign out confirmation"
                        onPress={close_sign_out}
                        style={settingsStyles.options_backdrop}
                    />
                    <Animated.View
                        style={[
                            settingsStyles.options_sheet,
                            { transform: [{ translateY: sign_out_position }] },
                        ]}
                    >
                        <Text style={settingsStyles.options_title}>
                            Are you sure you want to sign out?
                        </Text>
                        <View style={settingsStyles.confirmation_actions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Cancel sign out"
                                onPress={close_sign_out}
                                style={settingsStyles.cancel_button}
                            >
                                <Text style={settingsStyles.cancel_button_text}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Confirm sign out"
                                onPress={confirm_sign_out}
                                style={settingsStyles.confirm_button}
                            >
                                <Text style={settingsStyles.confirm_button_text}>Confirm</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </Base>
    );
}

export default Settings;

const settingsStyles = StyleSheet.create({
    main_scroll: {
        marginRight: -20,
    },
    holder: {
        flexDirection: 'column',
    },
    category_header: {
        marginBottom: 10,
        fontWeight: 'bold',
        color: colors.maroonDark,
    },
    settings_container: {
        backgroundColor: colors.white,
        padding: 10,
        width: '100%',
        borderRadius: 24,
        flexDirection: 'column',
        gap: 10,
    },
    button_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        minHeight: 50,
        paddingHorizontal: 6, // Adjust regular settings button padding here.
    },
    image: {
        width: 35,
        height: 35,
        borderRadius: 21,
    },
    button_text: {
        marginLeft: 10,
        textAlign: 'left',
    },
    interactive_container: {
        minHeight: 56,
        gap: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    interactive_name: {
        flex: 1,
    },
    toggle: {
        width: 56,
        height: 32,
        padding: 3,
        borderRadius: 16,
        backgroundColor: "#d3d3d3",
        justifyContent: 'center',
    },
    toggle_enabled_overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: colors.sage,
    },
    toggle_thumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.white,
    },
    select_container: {
        alignItems: 'flex-end',
        minWidth: 150,
    },
    select_button: {
        minWidth: 150,
        paddingVertical: 10,
        paddingHorizontal: 12, // Adjust select button padding here.
        borderRadius: 18,
        backgroundColor: colors.maroonLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    select_text: {
        color: colors.white,
        fontSize: 14,
    },
    select_arrow: {
        marginLeft: 8,
        color: colors.white,
        lineHeight: 14,
    },
    options_overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    options_backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(31, 20, 20, 0.35)',
    },
    options_sheet: {
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 30,
        paddingLeft: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: colors.white,
        elevation: 8,
    },
    option: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.blush,
    },
    options_title: {
        marginBottom: 8,
        color: colors.maroonDark,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    option_text: {
        textAlign: 'left',
    },
    confirmation_actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    cancel_button: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 18,
        backgroundColor: colors.blush,
    },
    cancel_button_text: {
        color: colors.maroonDark,
    },
    confirm_button: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 18,
        backgroundColor: colors.maroon,
    },
    confirm_button_text: {
        color: colors.white,
    },
    page: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        paddingTop: 50,
        paddingLeft: 20,
        backgroundColor: colors.cream,
    },
});

const settingsPageStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        marginRight: -20,
    },
    title: {
        marginTop: 20,
        marginBottom: 15,
    },
    content: {
        paddingBottom: 50,
        paddingRight: 40,
    },
    settings_container: {
        backgroundColor: colors.white,
        padding: 10,
        width: '100%',
        borderRadius: 24,
        flexDirection: 'column',
        gap: 10,
    },
});