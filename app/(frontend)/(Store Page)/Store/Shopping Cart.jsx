import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router'
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { colors } from '../../../root_styles';
import { Header1, Header3 } from '../../components/text_styles';
import Text from '../../components/text_styles';
import Button from '../../components/button';
import Base from '../../components/base';
import { Squiggle } from '../../components/design';

const Cart_Listing = ({
    image = null,
    initials = 'ID',
    name = 'Name',
    quantity = 1,
    price = 0,
    title = 'Title',
    onDelete = () => {},
    onIncrease = () => {},
    onDecrease = () => {},
}) => {
    return (
        <View style={styles.cart_listing_container}>
            {image ? (
                <Image source={image} style={styles.listing_photo} />
            ) : (
                <View style={styles.listing_photo} />
            )}
            <View>
                <Header3 style={styles.header3_custom}>{title}</Header3>
                <View style={styles.sellerRow}>
                    <View style={styles.sellerDot}>
                        <Text style={styles.sellerInitials}>{initials}</Text>
                    </View>
                    <Text style={styles.sellerName}>{name}</Text>
                </View>
                <View style={styles.price_container}>
                    <Header3 style={styles.main_price_style}>
                        {quantity}
                        <Header3 style={styles.other_price_style}> X $ {price.toFixed(2)}</Header3>
                    </Header3>
                </View>
            </View>
            <View style={styles.listing_buttons_container}>
                <View style={styles.delete_listing_container}>
                    <Button style={styles.delete_listing_button} onPress={onDelete}>
                        <Text selectable={false}>X</Text>
                    </Button>
                </View>
                
                <View style={styles.listing_quantity_container}>
                    <Button
                        style={styles.add_minus_quantity}
                        onPress={onIncrease}
                        disabled={quantity >= 99}
                    >
                        <Text selectable={false} style={styles.white_text}>+</Text>
                    </Button>
                    <Button style={styles.add_minus_quantity} onPress={onDecrease}>
                        <Text selectable={false} style={styles.white_text}>-</Text>
                    </Button>
                </View>
            </View>
        </View>
    );
}

const Shopping_Cart = () => {
    const router = useRouter();
    const [carted_items, setCartedItems] = useState([
        { image: null, initials: 'AR', name: 'Alex R. · Helix Hall', quantity: 1, price: 60, title: 'Mini fridge, 3.1 cu ft' },
        { image: null, initials: 'PN', name: 'Priya N. · Sciences', quantity: 1, price: 25, title: 'Calc II textbook' },
        { image: null, initials: 'SK', name: 'Sam K. · Oak Hall', quantity: 1, price: 12, title: 'Desk lamp' },
    ]);
    const subtotal = carted_items.reduce((total, item) => total + item.price * item.quantity, 0);
    const item_count = carted_items.reduce((total, item) => total + item.quantity, 0);

    const deleteItem = (index) => {
        setCartedItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
    };

    const increaseQuantity = (index) => {
        setCartedItems((items) => items.map((item, itemIndex) => (
            itemIndex === index
                ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
                : item
        )));
    };

    const decreaseQuantity = (index) => {
        setCartedItems((items) => items.flatMap((item, itemIndex) => {
            if (itemIndex !== index) {
                return [item];
            }

            const quantity = item.quantity - 1;
            return quantity > 0 ? [{ ...item, quantity }] : [];
        }));
    };

    return (
        <Base>
            <View style={styles.header_container}>
                <View style={styles.top_row}>
                    <Button style={styles.back_button} onPress={() => router.push('/Store')}>
                        <Text>X</Text>
                    </Button>
                </View>
                <Header1 style={styles.header1_custom}>your cart</Header1>
                <View style={styles.squiggle} />
            </View>
            <Text selectable={false} style={styles.reference_guide}>
                ${subtotal.toFixed(2)} subtotal • {item_count} items
            </Text>
            <ScrollView contentContainerStyle={styles.list_of_listings_container}>
                {carted_items.map((item, index) => (
                    <Cart_Listing
                        key={index}
                        {...item}
                        onDelete={() => deleteItem(index)}
                        onIncrease={() => increaseQuantity(index)}
                        onDecrease={() => decreaseQuantity(index)}
                    />
                ))}
            </ScrollView>
            {item_count > 0 && <><View style={styles.summary}><Text style={styles.summaryTitle}>Order summary</Text><View style={styles.summaryRow}><Text>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text></View><View style={styles.summaryRow}><Text>Campus pickup</Text><Text>Free</Text></View><View style={styles.dash}/><View style={styles.summaryRow}><Text style={styles.total}>Total</Text><Text style={styles.total}>${subtotal.toFixed(2)}</Text></View></View><Button style={styles.checkout_button} onPress={() => router.push('/Store/Checkout')}><Text selectable={false} style={styles.checkout_button_text}>Checkout</Text></Button></>}
        </Base> 
    );
}

const cartItems = [
    { title: 'Mini fridge, 3.1 cu ft', seller: 'Alex R. · Helix Hall', price: 60, color: colors.maroon },
    { title: 'Calc II textbook', seller: 'Priya N. · Sciences', price: 25, color: colors.tileRed },
    { title: 'Desk lamp', seller: 'Sam K. · Oak Hall', price: 12, color: '#6B2A2A' },
];

function RedesignedCart() {
    const router = useRouter();
    const [items, setItems] = useState(cartItems.map((item) => ({ ...item, quantity: 1 })));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const update = (index, amount) => setItems((current) => current.flatMap((item, i) => i !== index ? [item] : item.quantity + amount <= 0 ? [] : [{ ...item, quantity: item.quantity + amount }]));
    return <Base><View style={modern.top}><Pressable accessibilityLabel="Back to catalog" onPress={() => router.back()} style={modern.back}><Ionicons name="chevron-back" size={30} color={colors.maroon}/></Pressable><Text style={modern.title}>your cart</Text><Squiggle/><Text style={modern.subtitle}>{items.length} items from your campus</Text></View><ScrollView style={modern.list} contentContainerStyle={modern.listContent}>{items.map((item,index)=><View key={item.title} style={modern.item}><View style={[modern.photo,{backgroundColor:item.color}]}><Text selectable={false} style={modern.photoText}>[photo]</Text></View><View style={modern.itemCopy}><Text style={modern.itemTitle}>{item.title}</Text><Text style={modern.seller}>{item.seller}</Text><Text style={modern.price}>${item.price.toFixed(2)}</Text></View><View style={modern.itemActions}><Pressable accessibilityLabel="Remove from cart" onPress={()=>update(index,-item.quantity)} style={modern.remove}><Ionicons name="trash-outline" size={24} color={colors.maroon}/></Pressable><View style={modern.quantity}><Pressable accessibilityLabel="Increase quantity" hitSlop={6} onPress={()=>update(index,1)} style={modern.quantityButton}><Text selectable={false} style={modern.quantityText}>+</Text></Pressable><Text selectable={false} style={modern.quantityText}>{item.quantity}</Text><Pressable accessibilityLabel="Decrease quantity" hitSlop={6} onPress={()=>update(index,-1)} style={modern.quantityButton}><Text selectable={false} style={modern.quantityText}>−</Text></Pressable></View></View></View>)}</ScrollView><View style={modern.summary}><Text style={modern.summaryTitle}>Order summary</Text><View style={modern.row}><Text>Subtotal</Text><Text>${total.toFixed(2)}</Text></View><View style={modern.row}><Text>Campus pickup</Text><Text>Free</Text></View><View style={modern.dash}/><View style={modern.row}><Text style={modern.total}>Total</Text><Text style={modern.total}>${total.toFixed(2)}</Text></View></View><Pressable onPress={()=>router.push('/Store/Checkout')} style={modern.checkout}><Text selectable={false} style={modern.checkoutText}>Checkout</Text></Pressable></Base>;
}
const modern=StyleSheet.create({top:{gap:4},back:{width:56,height:56,backgroundColor:colors.cream,alignItems:'center',justifyContent:'center',borderRadius:6,shadowColor:'#000',shadowOpacity:.15,shadowRadius:4,elevation:3},title:{fontFamily:'Outfit',fontWeight:'700',fontSize:52,color:colors.maroon,letterSpacing:-1.5,marginTop:22},wave:{width:155,height:8,borderTopWidth:4,borderColor:colors.maroon,borderRadius:20},subtitle:{fontFamily:'Caveat',fontWeight:'700',fontSize:24,color:colors.muted},list:{flex:1,marginTop:18},listContent:{gap:14,paddingBottom:12},item:{minHeight:98,backgroundColor:colors.white,borderRadius:5,flexDirection:'row',padding:12,gap:12,shadowColor:'#000',shadowOpacity:.14,shadowRadius:4,elevation:3},photo:{width:74,height:74,borderRadius:4,alignItems:'center',justifyContent:'center'},photoText:{fontFamily:'Caveat',fontSize:18,color:colors.rose},itemCopy:{flex:1},itemTitle:{fontFamily:'Outfit',fontWeight:'700',fontSize:17,color:colors.ink},seller:{fontFamily:'Outfit',fontSize:13,color:colors.muted,marginTop:3},price:{fontFamily:'Outfit',fontWeight:'800',fontSize:18,color:colors.maroon,marginTop:4},itemActions:{alignItems:'flex-end',justifyContent:'space-between'},remove:{width:40,height:40,borderRadius:4,alignItems:'center',justifyContent:'center',backgroundColor:colors.rose},quantity:{height:28,minWidth:70,paddingHorizontal:2,borderRadius:5,backgroundColor:colors.maroon,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},quantityButton:{width:22,height:24,alignItems:'center',justifyContent:'center'},quantityText:{fontFamily:'Outfit',fontWeight:'700',color:colors.white,fontSize:15},summary:{backgroundColor:colors.white,borderRadius:5,padding:16,gap:9,shadowColor:'#000',shadowOpacity:.15,shadowRadius:4,elevation:3},summaryTitle:{fontFamily:'Caveat',fontWeight:'700',fontSize:26,color:colors.maroon},row:{flexDirection:'row',justifyContent:'space-between'},dash:{borderTopWidth:2,borderStyle:'dashed',borderColor:'#C58C8C'},total:{fontFamily:'Outfit',fontWeight:'800',fontSize:19},checkout:{height:52,marginTop:16,backgroundColor:colors.maroon,alignItems:'center',justifyContent:'center'},checkoutText:{fontFamily:'Outfit',fontWeight:'700',fontSize:19,color:colors.white}});
export default RedesignedCart

const styles = StyleSheet.create({
    cart_listing_container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        flexDirection: 'row',
        padding: 10,
        gap: 16,
    },
    listing_photo: {
        width: 100,
        height: 100,
        backgroundColor: '#800000',
        borderRadius: 22,
    },
    header3_custom: {
        marginBottom: 3,
    },
    price_container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    main_price_style: {
        color: '#800000',
        textAlign: 'left',
        fontSize: 20,
        marginBottom: 0,
    },
    other_price_style: {
        color: '#800000',
        fontSize: 16,
    },
    listing_buttons_container: {
        flex: 1,
        alignItems: 'flex-end',
    },
    delete_listing_container: {
        flex: 1,
    },
    listing_quantity_container: {
        backgroundColor: '#800000',
        width: 50,
        height: 30,
        borderRadius: 20,
        flexDirection: 'row',
        paddingHorizontal: 3,
    },
    white_text: {
        color: colors.white,
    },
    header_container: {
        width: '100%',
    },
    top_row: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    header1_custom: {
        marginBottom: 0,
    },
    list_of_listings_container: {
        gap: 20,
    },
    checkout_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
    },
    checkout_text: {
        fontWeight: '650',
        color: "#9C0000",
    },
    checkout_button: {
        width: '100%',
        height: 52,
        backgroundColor: '#800000',
        borderRadius: 0,
        marginTop: 18,
    },
    back_button: {
        width: 40,
        height: 40,
        backgroundColor: colors.white,
    },
    checkout_button_text: {
        color: 'white',
        fontFamily: 'Outfit',
        fontSize: 18,
        fontWeight: '700',
    },
    delete_listing_button: {
        width: 30,
        height: 30,
        backgroundColor: "#E4E4E4",
        boxShadow: '',
    },
    add_minus_quantity: {
        flex: 1,
        backgroundColor: '',
        width: 'auto',
        height: 'auto',
    },
    reference_guide: {
        textAlign: 'left',
        fontWeight: 'light',
        fontSize: 14,
        marginBottom: 30,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sellerDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.blush,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sellerInitials: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.maroon,
        fontFamily: 'Outfit',
    },
    sellerName: {
        fontSize: 13,
        color: colors.muted,
        fontFamily: 'Outfit',
    },
    squiggle: { width: 150, borderTopWidth: 4, borderColor: colors.maroon, borderRadius: 100, marginTop: 2, marginBottom: 10 },
    summary: { backgroundColor: colors.white, padding: 16, marginTop: 16, shadowColor: '#000', shadowOpacity: .16, shadowRadius: 5, elevation: 3, gap: 10 },
    summaryTitle: { color: colors.maroon, fontFamily: 'Caveat', fontSize: 26, fontWeight: '700' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dash: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(128,0,0,.45)' }, total: { fontWeight: '800', fontFamily: 'Outfit', fontSize: 19 },
});
