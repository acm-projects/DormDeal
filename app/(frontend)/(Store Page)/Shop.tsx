import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../root_styles';
import { Header1 } from '../components/text_styles';
import Base from '../components/base';
import ChoiceCard from '../components/choice_card';
import TabBar from '../components/tab_bar';

// pick where to shop: stuff (marketplace) or help (services)
const Shop = () => {
    const router = useRouter();

    return (
        <Base style={{}}>
            <Header1 style={{ marginBottom: 0 }}>shop</Header1>
            <Text style={shop.subtitle}>what are you after today?</Text>

            <View style={shop.choices}>
                <ChoiceCard
                    title="Marketplace"
                    blurb="Furniture, textbooks, electronics and more from students near you."
                    doodle="bag"
                    tilt="-1deg"
                    fill
                    boxColor={colors.maroon}
                    textColor={colors.white}
                    onPress={() => router.push('/Store')}
                />
                <ChoiceCard
                    title="Services"
                    blurb="Tutoring, moving help, tech fixes and more from other students."
                    doodle="people"
                    tilt="1deg"
                    fill
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
        flex: 1,              // the two polaroids share the rest of the screen
        gap: 22,
        marginTop: 28,
        marginBottom: 72,     // room so the tab bar doesn't cover the bottom one
    },
});

export default Shop;
