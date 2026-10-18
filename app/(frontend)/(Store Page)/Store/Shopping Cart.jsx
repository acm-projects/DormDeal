import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router'
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { colors } from '../../../root_styles';
import { Header1, Header3 } from '../../components/text_styles';
import Text from '../../components/text_styles';
import Button from '../../components/button';
import Base from '../../components/base';

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
        { image: null, initials: 'AR', name: 'Alex R.', quantity: 1, price: 60, title: 'Mini fridge' },
        { image: null, initials: 'AR', name: 'Alex R.', quantity: 1, price: 60, title: 'Mini fridge' },
        { image: null, initials: 'AR', name: 'Alex R.', quantity: 1, price: 60, title: 'Mini fridge' },
        { image: null, initials: 'AR', name: 'Alex R.', quantity: 1, price: 60, title: 'Mini fridge' },
        { image: null, initials: 'AR', name: 'Alex R.', quantity: 1, price: 60, title: 'Mini fridge' },
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
                <Header1 style={styles.header1_custom}>your cart</Header1>
                <Button style={styles.back_button} onPress={() => router.push('/Store')}>
                    <Text>X</Text>
                </Button>
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
            <View style={styles.checkout_container}>
                <Text selectable={false} style={styles.checkout_text}>Proceed to checkout!</Text>
                <Button style={styles.checkout_button} onPress={() => router.push('/Store/Checkout')}>
                    <Text selectable={false} style={styles.checkout_button_text}>{">>>"}</Text>
                </Button>
            </View>
        </Base> 
    );
}

export default Shopping_Cart

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
        flexDirection: 'row',
        alignItems: 'center',
    },
    header1_custom: {
        flex: 1,
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
        width: 60,
        height: 40,
        backgroundColor: '#800000',
        borderRadius: 20,
    },
    back_button: {
        width: 40,
        height: 40,
        backgroundColor: colors.white,
    },
    checkout_button_text: {
        color: 'white',
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
});