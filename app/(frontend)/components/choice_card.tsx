import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../root_styles';
import Doodle, { type DoodleName } from './doodles';

type ChoiceCardProps = {
    title: string;
    blurb: string;
    doodle: DoodleName;  // hand-drawn icon shown big in the middle
    tilt: string;        // like '-2deg', makes the pair look hand-placed
    boxColor: string;
    textColor: string;
    onPress: () => void;
    fill?: boolean;      // stretch to fill the space it's given (stacked layout) instead of a fixed height
};

// one big tappable polaroid for the chooser pages (shop, post). squishes a little when pressed
const ChoiceCard = (props: ChoiceCardProps) => {
    const scale = useRef(new Animated.Value(1)).current;

    const squish = (to: number) => {
        Animated.spring(scale, { toValue: to, useNativeDriver: false, speed: 40, bounciness: 8 }).start();
    };

    return (
        <Animated.View style={[card.wrap, { transform: [{ rotate: props.tilt }, { scale }] }]}>
            <Pressable
                style={[card.frame, props.fill && card.frameFill]}
                onPress={props.onPress}
                onPressIn={() => squish(0.95)}
                onPressOut={() => squish(1)}
                accessibilityRole="button"
                accessibilityLabel={props.title}
            >
                {/* the "photo" part of the polaroid */}
                <View style={[card.photo, { backgroundColor: props.boxColor }]}>
                    {/* doodle sits in the middle of the card */}
                    <View style={card.doodleArea}>
                        <Doodle name={props.doodle} color={props.textColor} size={props.fill ? 128 : 104} />
                    </View>
                    <View style={card.text}>
                        <Text style={[card.title, { color: props.textColor }]}>{props.title}</Text>
                        <Text style={[card.blurb, { color: props.textColor }]}>{props.blurb}</Text>
                    </View>
                </View>
                {/* handwritten caption on the white strip at the bottom */}
                <View style={card.goRow}>
                    <Text style={card.goText}>let's go</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.maroon} />
                </View>
            </Pressable>
        </Animated.View>
    );
};

const card = StyleSheet.create({
    wrap: {
        flex: 1,
    },
    frame: {
        height: 360,
        borderRadius: 4,          // square-ish corners, like a real polaroid
        padding: 9,
        paddingBottom: 6,
        backgroundColor: colors.white,
        shadowColor: colors.ink,
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    frameFill: {
        height: 'auto',
        flex: 1,
    },
    photo: {
        flex: 1,
        borderRadius: 2,
        padding: 14,
        justifyContent: 'space-between',
    },
    doodleArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        gap: 8,
    },
    title: {
        fontFamily: 'Outfit',
        fontSize: 24,
        fontWeight: '700',
    },
    blurb: {
        fontFamily: 'Outfit',
        fontSize: 14,
        lineHeight: 19,
        opacity: 0.9,
    },
    goRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 6,
        paddingTop: 8,
        paddingBottom: 4,
    },
    goText: {
        fontFamily: 'Caveat',
        fontSize: 24,
        color: colors.maroon,
    },
});

export default ChoiceCard;
