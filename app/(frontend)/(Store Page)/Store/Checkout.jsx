import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router'
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../root_styles';
import { Header1, Header4 } from '../../components/text_styles';
import Text from '../../components/text_styles';
import Button from '../../components/button';
import Base from '../../components/base';
import { navigateWithTransition } from '../../../../components/transitions/pageTransitions';
import Visa_Img_Test from '../../../../assets/images/visa.png'
import Location_Dot from '../../../../assets/images/location_dot.png'
import Shopping_Cart_Img from '../../../../assets/images/shopping_cart.png'
import Arrow_Img from '../../../../assets/images/arrow.png'

const End_Row = () => {
    return (
        <View style={{
            height: 72,
        }}>
        </View>
    )
}

const Order_Summary_Info = ({text, value, t_style=false, v_style=false}) => {
    return (
        <View style={{flexDirection: 'row', marginBottom: 10}}>
            <Text style={[{flex: 1, textAlign: 'left'}, t_style]}>{text}</Text>
            <Text style={[{flex: 1, textAlign: 'right', fontWeight: 350}, v_style]}>{value}</Text>
        </View>
    );
}

const ordered_items = [
    { image: null, title: 'Mini fridge', price: '$60' },
    { image: null, title: 'Calc II textbook', price: '$25' },
    { image: null, title: 'Desk lamp', price: '$12' },
];

const Payment_Icon = ({method}) => {
    if (method === 'Visa *6767') {
        return <Image source={Visa_Img_Test} style={styles.payment_method_image} resizeMode='contain'/>;
    }

    return (
        <Ionicons
            name={method === 'Zelle' ? 'send-outline' : 'cash-outline'}
            size={30}
            color={colors.maroon}
        />
    );
};

const Shopping_Cart = () => {
    const router = useRouter();
    const [isCartExpanded, setIsCartExpanded] = useState(true);
    const cartHeight = useState(new Animated.Value(100))[0];
    const arrowRotation = useState(new Animated.Value(0))[0];
    const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);
    const paymentHeight = useState(new Animated.Value(106))[0];
    const paymentArrowRotation = useState(new Animated.Value(0))[0];
    const paymentContentOpacity = useState(new Animated.Value(0))[0];
    const [paymentMethod, setPaymentMethod] = useState('Visa *6767');
    const [paymentOptionsMethod, setPaymentOptionsMethod] = useState('Visa *6767');
    const paymentMethodChangeTimeout = useRef(null);

    useEffect(() => {
        Animated.timing(cartHeight, {
            toValue: isCartExpanded ? 281 : 100,
            duration: 250,
            useNativeDriver: false,
        }).start();
        Animated.timing(arrowRotation, {
            toValue: isCartExpanded ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [arrowRotation, cartHeight, isCartExpanded]);

    useEffect(() => {
        Animated.timing(paymentHeight, {
            toValue: isPaymentExpanded ? 255 : 106,
            duration: 250,
            useNativeDriver: false,
        }).start();
        Animated.timing(paymentArrowRotation, {
            toValue: isPaymentExpanded ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
        Animated.timing(paymentContentOpacity, {
            toValue: isPaymentExpanded ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [isPaymentExpanded, paymentArrowRotation, paymentContentOpacity, paymentHeight]);

    useEffect(() => {
        return () => {
            if (paymentMethodChangeTimeout.current) {
                clearTimeout(paymentMethodChangeTimeout.current);
            }
        };
    }, []);

    const toggleCart = () => {
        setIsCartExpanded((expanded) => !expanded);
    };

    const togglePayment = () => {
        setIsPaymentExpanded((expanded) => {
            if (expanded && paymentMethodChangeTimeout.current) {
                clearTimeout(paymentMethodChangeTimeout.current);
                paymentMethodChangeTimeout.current = null;
            }
            return !expanded;
        });
    };

    return (
        <Base>
            <Button style={styles.back_button} onPress={() => router.push('/Store/Shopping Cart')}>
                <Text>X</Text>
            </Button>
            <ScrollView>
                <Header1 style={styles.header1_custom}>checkout</Header1>
                <Text selectable={false} style={styles.reference_guide}>
                    just one more step!
                </Text>
                <Pressable onPress={toggleCart}>
                    <Animated.View style={[styles.cart_preview, { height: cartHeight }]}>
                        <View style={styles.cart_preview_header}>
                            <Image source={Shopping_Cart_Img} style={styles.cart_image} resizeMode='contain'/>
                            <Text style={styles.itemsTitle}>3 items</Text>
                        </View>
                        <View style={styles.ordered_items}>
                            {ordered_items.map((item, index) => (
                                <View key={index} style={styles.itemTile}>
                                <View style={styles.ordered_item}>
                                    {item.image && (
                                        <Image source={item.image} style={styles.ordered_item_image} resizeMode='contain'/>
                                    )}
                                </View><Text style={styles.itemName}>{item.title}</Text><Text style={styles.itemPrice}>{item.price}</Text></View>
                            ))}
                        </View>
                        <View style={styles.cart_arrow}>
                            <Animated.Image
                                source={Arrow_Img}
                                style={[
                                    styles.arrow_image,
                                    {
                                        transform: [{
                                            rotate: arrowRotation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '90deg'],
                                            }),
                                        }],
                                    },
                                ]}
                                resizeMode='contain'
                            />
                        </View>
                    </Animated.View>
                </Pressable>
                <Pressable onPress={togglePayment}>
                    <Animated.View style={[styles.payment_preview, {height: paymentHeight}]}>
                        <View style={styles.payment_header}>
                            <Header4 style={{fontWeight: 500, textAlign: 'left', marginBottom: 8}}>Payment</Header4>
                            <View style={styles.payment_method_row}>
                                <Payment_Icon method={paymentMethod}/>
                                <Text>{paymentMethod}</Text>
                            </View>
                        </View>
                        <Animated.View style={[styles.payment_options, {
                            opacity: paymentContentOpacity,
                        }]}>
                            {['Visa *6767', 'Zelle', 'Cash']
                                .filter((method) => method !== paymentOptionsMethod)
                                .map((method) => (
                                <Pressable
                                    key={method}
                                    style={[styles.payment_option, paymentOptionsMethod === method && styles.selected_payment_option]}
                                    onPress={(event) => {
                                        event.stopPropagation();
                                        if (!isPaymentExpanded) {
                                            return;
                                        }
                                        setPaymentMethod(method);
                                        setIsPaymentExpanded(false);
                                        if (paymentMethodChangeTimeout.current) {
                                            clearTimeout(paymentMethodChangeTimeout.current);
                                        }
                                        paymentMethodChangeTimeout.current = setTimeout(() => {
                                            setPaymentOptionsMethod(method);
                                            paymentMethodChangeTimeout.current = null;
                                        }, 250);
                                    }}
                                >
                                    <Payment_Icon method={method}/>
                                    <Text>{method}</Text>
                                </Pressable>
                                ))}
                            <Text style={styles.payment_prompt}>Which payment method do you want to use instead?</Text>
                        </Animated.View>
                        <View style={styles.payment_arrow}>
                            <Animated.Image
                                source={Arrow_Img}
                                style={[
                                    styles.arrow_image,
                                    {
                                        transform: [{
                                            rotate: paymentArrowRotation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '90deg'],
                                            }),
                                        }],
                                    },
                                ]}
                                resizeMode='contain'
                            />
                        </View>
                    </Animated.View>
                </Pressable>
                <View style={styles.summaryCard}>
                    <Header4 style={{fontWeight: 500, textAlign: 'left'}}>Order Summary</Header4>
                    <Order_Summary_Info text={"Subtotal"} value={"$97.00"}/>
                    <Order_Summary_Info text={"Campus pickup"} value={"Free"}/>
                    <View style={{height: 2, backgroundColor: "#b2b2b2", marginTop: 5, marginBottom: 15}}/>
                    <Order_Summary_Info text={"Total"} value={"$97.00"} t_style={{fontWeight: 800}} v_style={{fontWeight: 800}}/>
                    <View style={{height: 2, backgroundColor: "#b2b2b2", marginTop: 5, marginBottom: 10}}/>
                </View>
                <End_Row/>
            </ScrollView>
            <View style={{position: 'absolute', left: 20, right: 20, bottom: 24}}>
                <Button style={{backgroundColor: colors.maroon, width: '100%', borderRadius: 0, height: 56}} onPress={() => void navigateWithTransition({ pathname: '/Store/Checkout' }, '/Store/Confirmation', 'stamp')}>
                    <Text selectable={false} style={{color: colors.white}}>Check Out</Text>
                </Button>
            </View>
        </Base> 
    );
}

function RedesignedCheckout() {
 const router=useRouter(); const [open,setOpen]=useState(true); const [payment,setPayment]=useState('Visa *6767'); const methods=['Visa *6767','Zelle','Cash at pickup'];
 return <Base><Pressable onPress={()=>router.back()} style={checkoutUI.close}><Ionicons name="close" size={30} color={colors.maroon}/></Pressable><Text style={checkoutUI.title}>checkout</Text><Text style={checkoutUI.sub}>just one more step!</Text><ScrollView contentContainerStyle={checkoutUI.content}><View style={checkoutUI.card}><Pressable onPress={()=>setOpen(!open)} style={checkoutUI.cardHeader}><Ionicons name="cart-outline" size={34} color={colors.ink}/><Text style={checkoutUI.cardHeading}>3 items</Text><Ionicons name={open?'chevron-up':'chevron-down'} size={28} color={colors.ink}/></Pressable>{open&&<View style={checkoutUI.tiles}>{ordered_items.map(item=><View key={item.title} style={checkoutUI.tile}><View style={checkoutUI.tilePhoto}/><Text style={checkoutUI.tileName}>{item.title}</Text><Text style={checkoutUI.tilePrice}>{item.price}</Text></View>)}</View>}</View><View style={checkoutUI.card}><Text style={checkoutUI.paymentHeading}>Payment</Text>{methods.map(method=><Pressable key={method} onPress={()=>setPayment(method)} style={[checkoutUI.payRow,payment===method&&checkoutUI.paySelected]}><Payment_Icon method={method}/><Text style={checkoutUI.payLabel}>{method}</Text><View style={checkoutUI.radio}>{payment===method&&<View style={checkoutUI.radioDot}/>}</View></Pressable>)}<Text style={checkoutUI.helper}>Pick how you would like to pay.</Text></View><View style={checkoutUI.card}><Text style={checkoutUI.paymentHeading}>Order Summary</Text><View style={checkoutUI.sumRow}><Text>Subtotal</Text><Text>$97.00</Text></View><View style={checkoutUI.sumRow}><Text>Campus pickup</Text><Text>Free</Text></View><View style={checkoutUI.rule}/><View style={checkoutUI.sumRow}><Text style={checkoutUI.total}>Total</Text><Text style={checkoutUI.total}>$97.00</Text></View></View></ScrollView><Pressable onPress={()=>void navigateWithTransition({ pathname: '/Store/Checkout' }, '/Store/Confirmation', 'stamp')} style={checkoutUI.checkout}><Text style={checkoutUI.checkoutText}>Confirm Purchase</Text></Pressable></Base>;
}
const checkoutUI=StyleSheet.create({close:{width:56,height:56,backgroundColor:colors.cream,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:.15,shadowRadius:4,elevation:3},title:{fontFamily:'Outfit',fontWeight:'700',fontSize:56,color:colors.maroon,letterSpacing:-2,marginTop:22},sub:{fontFamily:'Caveat',fontWeight:'700',fontSize:24,color:colors.muted},content:{gap:16,paddingTop:16,paddingBottom:82},card:{backgroundColor:colors.white,padding:16,shadowColor:'#000',shadowOpacity:.15,shadowRadius:4,elevation:3},cardHeader:{minHeight:42,flexDirection:'row',alignItems:'center',gap:14},cardHeading:{flex:1,fontFamily:'Outfit',fontWeight:'700',fontSize:23},tiles:{flexDirection:'row',justifyContent:'flex-start',gap:12,marginTop:18},tile:{width:80,alignItems:'flex-start'},tilePhoto:{width:68,height:68,backgroundColor:colors.maroon},tileName:{fontFamily:'Caveat',fontWeight:'700',fontSize:16,textAlign:'left'},tilePrice:{fontFamily:'Outfit',fontWeight:'800',color:colors.maroon},paymentHeading:{fontFamily:'Outfit',fontWeight:'700',fontSize:25,marginBottom:10},payRow:{minHeight:54,paddingHorizontal:10,flexDirection:'row',alignItems:'center',gap:12},paySelected:{backgroundColor:colors.roseSelected},payLabel:{flex:1,fontFamily:'Outfit',fontSize:18},radio:{width:23,height:23,borderWidth:2,borderColor:colors.maroon,borderRadius:12,alignItems:'center',justifyContent:'center'},radioDot:{width:11,height:11,borderRadius:6,backgroundColor:colors.maroon},helper:{fontFamily:'Caveat',fontSize:21,color:colors.muted,marginTop:8},sumRow:{flexDirection:'row',justifyContent:'space-between',marginTop:7},rule:{borderTopWidth:2,borderStyle:'dashed',borderColor:'#C58C8C',marginVertical:10},total:{fontFamily:'Outfit',fontWeight:'800',fontSize:19},checkout:{position:'absolute',left:20,right:20,bottom:16,height:52,backgroundColor:colors.maroon,alignItems:'center',justifyContent:'center'},checkoutText:{fontFamily:'Outfit',fontWeight:'700',fontSize:19,color:colors.white}});
export default RedesignedCheckout

const styles = StyleSheet.create({
    cart_preview: {
        backgroundColor: colors.white,
        borderRadius: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: .16, shadowRadius: 5, elevation: 3,
    },
    cart_preview_header: {
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cart_image: {
        height: 50,
        width: 50,
        aspectRatio: 1,
    },
    cart_arrow: {
        position: 'absolute',
        top: 0,
        right: 15,
        height: 100,
        justifyContent: 'center',
    },
    payment_preview: {
        backgroundColor: colors.white,
        borderRadius: 0,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 15,
        overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: .16, shadowRadius: 5, elevation: 3,
    },
    payment_header: {
        height: 76,
        justifyContent: 'flex-start',
    },
    payment_method_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 40,
    },
    payment_method_image: {
        height: 30,
        width: 30,
        aspectRatio: 1,
    },
    payment_options: {
        gap: 8,
        marginTop: 0,
    },
    payment_prompt: {
        marginTop: 0,
        width: '100%',
        textAlign: 'left',
    },
    payment_option: {
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFAFA',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 0,
    },
    selected_payment_option: {
        backgroundColor: colors.blush,
    },
    payment_arrow: {
        position: 'absolute',
        top: 0,
        right: 15,
        height: 106,
        justifyContent: 'center',
    },
    arrow_image: {
        height: 25,
        width: 25,
        aspectRatio: 1,
        opacity: 0.75,
    },
    ordered_items: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 15,
    },
    ordered_item: {
        width: 47,
        height: 47,
        borderRadius: 0,
        backgroundColor: '#800000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ordered_item_image: {
        width: '75%',
        height: '75%',
    },
    header1_custom: {
        flex: 1,
        marginBottom: 0,
        color: colors.maroon,
    },
    back_button: {
        width: 40,
        height: 40,
        marginBottom: 10,
        backgroundColor: colors.white,
    },
    reference_guide: {
        textAlign: 'left',
        fontWeight: 'light',
        fontSize: 22,
        fontFamily: 'Caveat',
        color: colors.muted,
        marginBottom: 30,
    },
    itemsTitle: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 23, color: colors.ink },
    itemTile: { width: 76, alignItems: 'center' },
    itemName: { fontFamily: 'Caveat', fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 17, marginTop: 4 },
    itemPrice: { fontFamily: 'Outfit', fontSize: 14, fontWeight: '800', color: colors.maroon },
    summaryCard: { backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 15, marginTop: 15, shadowColor: '#000', shadowOpacity: .16, shadowRadius: 5, elevation: 3 },
});
