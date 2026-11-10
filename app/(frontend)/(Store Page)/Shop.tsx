import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import { Header1 } from '../components/text_styles';
import Base from '../components/base';
import TabBar from '../components/tab_bar';

type ChoiceProps = {
    title: string;
    blurb: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    tilt: string;
    boxColor: string;
    textColor: string;
    onPress: () => void;
};

// one big tappable box, squishes a little when pressed
const Choice = (props: ChoiceProps) => {
    const scale = useRef(new Animated.Value(1)).current;

    const squish = (to: number) => {
        Animated.spring(scale, { toValue: to, useNativeDriver: false, speed: 40, bounciness: 8 }).start();
    };

    return (
        <Animated.View style={[shop.choiceWrap, { transform: [{ rotate: props.tilt }, { scale }] }]}>
            <Pressable
                style={[shop.choice, { backgroundColor: props.boxColor }]}
                onPress={props.onPress}
                onPressIn={() => squish(0.95)}
                onPressOut={() => squish(1)}
                accessibilityRole="button"
                accessibilityLabel={`Go to ${props.title}`}
            >
                <View style={shop.iconBubble}>
                    <Ionicons name={props.icon} size={40} color={colors.maroon} />
                </View>
                <View style={shop.choiceText}>
                    <Text style={[shop.choiceTitle, { color: props.textColor }]}>{props.title}</Text>
                    <Text style={[shop.choiceBlurb, { color: props.textColor }]}>{props.blurb}</Text>
                </View>
                <View style={shop.goRow}>
                    <Text style={[shop.goText, { color: props.textColor }]}>let's go</Text>
                    <Ionicons name="arrow-forward" size={18} color={props.textColor} />
                </View>
            </Pressable>
        </Animated.View>
    );
};

// pick where to shop: stuff (marketplace) or help (services)
const Shop = () => {
    const router = useRouter();

    return (
        <Base style={{}}>
            <Header1 style={{ marginBottom: 0 }}>shop</Header1>
            <Text style={shop.subtitle}>what are you after today?</Text>

            <View style={shop.choices}>
                <Choice
                    title="Marketplace"
                    blurb="Furniture, textbooks, electronics and more from students near you."
                    icon="bag-handle-outline"
                    tilt="-2deg"
                    boxColor={colors.maroon}
                    textColor={colors.white}
                    onPress={() => router.push('/Store')}
                />
                <Choice
                    title="Services"
                    blurb="Tutoring, moving help, tech fixes and more from other students."
                    icon="people-outline"
                    tilt="2deg"
                    boxColor={colors.goldLight}
                    textColor={colors.maroonDark}
                    onPress={() => router.push('/Services')}
                />
            </View>

            <TabBar active="catalog" />
        </Base>
    );
};

const shop = StyleSheet.create({
    subtitle: {
        fontFamily: 'Caveat',
        fontSize: 26,
        color: colors.maroon,
        marginTop: 2,
        transform: [{ rotate: '-2deg' }], // little tilt like handwriting
    },
    choices: {
        flexDirection: 'row',
        gap: 14,
        marginTop: 36,
    },
    choiceWrap: {
        flex: 1,
    },
    choice: {
        height: 360,
        borderRadius: 30,
        padding: 18,
        justifyContent: 'space-between',
        borderWidth: 6,
        borderColor: colors.white, // thick white border, polaroid style
        shadowColor: colors.ink,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    iconBubble: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceText: {
        gap: 8,
    },
    choiceTitle: {
        fontFamily: 'Outfit',
        fontSize: 24,
        fontWeight: '700',
    },
    choiceBlurb: {
        fontFamily: 'Outfit',
        fontSize: 14,
        lineHeight: 19,
        opacity: 0.9,
    },
    goRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    goText: {
        fontFamily: 'Caveat',
        fontSize: 24,
    },
});

export default Shop;
