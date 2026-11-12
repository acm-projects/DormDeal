import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../../root_styles';
import Text from '../../components/text_styles';
import Base from '../../components/base';
import VisaImage from '../../../../assets/images/visa.png';

const orderedItems = [
    { image: null, title: 'Mini fridge', price: '$60' },
    { image: null, title: 'Calc II textbook', price: '$25' },
    { image: null, title: 'Desk lamp', price: '$12' },
];

const PaymentIcon = ({ method }) => method === 'Visa *6767'
    ? <Image source={VisaImage} style={checkoutUI.paymentIcon} resizeMode="contain"/>
    : <Ionicons name={method === 'Zelle' ? 'send-outline' : 'cash-outline'} size={30} color={colors.maroon}/>;

function RedesignedCheckout() {
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const [payment, setPayment] = useState('Visa *6767');
    const methods = ['Visa *6767', 'Zelle', 'Cash at pickup'];
    return <Base><Pressable onPress={() => router.back()} style={checkoutUI.close}><Ionicons name="close" size={30} color={colors.maroon}/></Pressable><Text style={checkoutUI.title}>checkout</Text><Text style={checkoutUI.sub}>just one more step!</Text><ScrollView contentContainerStyle={checkoutUI.content}><View style={checkoutUI.card}><Pressable onPress={() => setOpen(!open)} style={checkoutUI.cardHeader}><Ionicons name="cart-outline" size={34} color={colors.ink}/><Text style={checkoutUI.cardHeading}>3 items</Text><Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={28} color={colors.ink}/></Pressable>{open && <View style={checkoutUI.tiles}>{orderedItems.map((item) => <View key={item.title} style={checkoutUI.tile}><View style={checkoutUI.tilePhoto}/><Text style={checkoutUI.tileName}>{item.title}</Text><Text style={checkoutUI.tilePrice}>{item.price}</Text></View>)}</View>}</View><View style={checkoutUI.card}><Text style={checkoutUI.paymentHeading}>Payment Option</Text>{methods.map((method) => <Pressable key={method} onPress={() => setPayment(method)} style={[checkoutUI.payRow, payment === method && checkoutUI.paySelected]}><PaymentIcon method={method}/><Text style={checkoutUI.payLabel}>{method}</Text><View style={checkoutUI.radio}>{payment === method && <View style={checkoutUI.radioDot}/>}</View></Pressable>)}</View><View style={checkoutUI.card}><Text style={checkoutUI.paymentHeading}>Order Summary</Text><View style={checkoutUI.sumRow}><Text>Subtotal</Text><Text>$97.00</Text></View><View style={checkoutUI.sumRow}><Text>Campus pickup</Text><Text>Free</Text></View><View style={checkoutUI.rule}/><View style={checkoutUI.sumRow}><Text style={checkoutUI.total}>Total</Text><Text style={checkoutUI.total}>$97.00</Text></View></View></ScrollView><Pressable onPress={() => router.push('/Store/Confirmation')} style={checkoutUI.checkout}><Text style={checkoutUI.checkoutText}>Confirm Purchase</Text></Pressable></Base>;
}

const checkoutUI = StyleSheet.create({ close: { width: 56, height: 56, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: .15, shadowRadius: 4, elevation: 3 }, title: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 56, color: colors.maroon, letterSpacing: -2, marginTop: 22 }, sub: { fontFamily: 'Caveat', fontWeight: '700', fontSize: 24, color: colors.muted }, content: { gap: 16, paddingTop: 16, paddingBottom: 82 }, card: { backgroundColor: colors.white, padding: 16, shadowColor: '#000', shadowOpacity: .15, shadowRadius: 4, elevation: 3 }, cardHeader: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 14 }, cardHeading: { flex: 1, fontFamily: 'Outfit', fontWeight: '700', fontSize: 23 }, tiles: { flexDirection: 'row', justifyContent: 'flex-start', gap: 12, marginTop: 18 }, tile: { width: 80, alignItems: 'flex-start' }, tilePhoto: { width: 68, height: 68, backgroundColor: colors.maroon }, tileName: { fontFamily: 'Caveat', fontWeight: '700', fontSize: 16, textAlign: 'left' }, tilePrice: { fontFamily: 'Outfit', fontWeight: '800', color: colors.maroon }, paymentHeading: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 25, marginBottom: 10 }, paymentIcon: { width: 45, height: 30 }, payRow: { minHeight: 54, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }, paySelected: { backgroundColor: colors.roseSelected }, payLabel: { flex: 1, fontFamily: 'Outfit', fontSize: 18 }, radio: { width: 23, height: 23, borderWidth: 2, borderColor: colors.maroon, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.maroon }, helper: { fontFamily: 'Caveat', fontSize: 21, color: colors.muted, marginTop: 8 }, sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }, rule: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#C58C8C', marginVertical: 10 }, total: { fontFamily: 'Outfit', fontWeight: '800', fontSize: 19 }, checkout: { position: 'absolute', left: 20, right: 20, bottom: 16, height: 52, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' }, checkoutText: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 19, color: colors.white } });

export default RedesignedCheckout;
