import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../components/text_styles'

const Settings_Button = ({text, style, children=[]}) => {
    return (
        <TouchableOpacity style={styles.button_container}>
            <View style={[styles.image, style]}>{children}</View>
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    );
}

export default Settings_Button;

const styles = StyleSheet.create({
    button_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        height: 35,
    },

    image: {
        width: 33,
        height: 33,
        borderRadius: '100%',
    },

    text: {
        marginLeft: 10,
        textAlign: 'left',
    },
})