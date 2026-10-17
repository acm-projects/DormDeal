import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router'

const Button = ({
    href = "/",
    onPress = () => (1),
    disabled = false,
    style = {},
    children = [],
}) => {
    return (
        <Pressable disabled={disabled} onPress={onPress} style={[styles.pressable, style]}>
            { children }
        </Pressable>
    );
}

export default Button;

const styles = StyleSheet.create({
    pressable: {
        width: 50, 
        height: 50, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#E4E4E4", 
        borderRadius: '50%',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
    },
})