import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/text_styles'
import { Header2 } from '../../components/text_styles'
import Base from '../../components/base'
import { colors } from '../../../root_styles';

import Big_Circle from '../../../../assets/images/big_circle.png'
import Check_Mark from '../../../../assets/images/check_mark.png'

const Confirmation = () => {
    const router = useRouter();
    return (
        <Base>
            <View style={{justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <Image source={Big_Circle} style={{position: 'absolute', width: 400, height: 400, resizeMode: "cover"}}/>
                <Image source={Check_Mark} style={{width: 75, height: 75, resizeMode: "cover"}}/>
                <Header2 style={{fontSize: 40, marginTop: 15, marginBottom: 15, fontFamily: 'Caveat'}}>Order confirmed!</Header2>
                <Text>Your order number: #19</Text>
                <Text style={{fontFamily: 'Caveat', marginTop: 5, fontSize: 22,}}>What's next?</Text>
            </View>
            <View style={{position: 'absolute', flexDirection: 'row', gap: 15, right: 0, bottom: 35, left: 0, alignItems: 'center', justifyContent: 'center'}}>
                <Pressable style={[styles.nav_button, {backgroundColor: '#800000'}]} onPress={() => router.push('/home')}>
                    <Ionicons name="home-outline" size={30} color={colors.white} />
                </Pressable>
                <Pressable style={styles.nav_button} onPress={() => router.push('/Messages/1')}>
                    <Ionicons name="chatbubble-outline" size={30} color={colors.ink} />
                </Pressable>
                <Pressable style={styles.nav_button} onPress={() => router.push('/Store')}>
                    <Ionicons name="storefront-outline" size={30} color={colors.ink} />
                </Pressable>
            </View>
        </Base>
    );
}

const styles = StyleSheet.create({
    nav_button: {
        padding: 15,
        borderRadius: '50%',
        backgroundColor: colors.white,
    },
});

export default Confirmation