import { StyleSheet, Image, View, TextInput, TouchableOpacity } from 'react-native';
import { Svg } from 'react-native-svg'
import Text from '../components/text_styles'
import message_arrow_1 from '../../../assets/svgs/message_arrow_1.svg'
import message_arrow_2 from '../../../assets/svgs/message_arrow_2.svg'

const Message_Box = () => {
    return (
        <View>
            <View style={styles.message_box}>
                <Text style={styles.message_text}>THIS IS A MESSAGE. CONCEPTUALLY, it can be understood in the definition.</Text>
            </View>
            <Image style={styles.message_img} source={message_arrow_2}/>
        </View>
    ); 
};

export default Message_Box;

const styles = StyleSheet.create({
    message_box: {
        padding: 10,
        maxWidth: 250,
        backgroundColor: '#B26666',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    message_text: {
        color: '#FFF',
        textAlign: 'left',
    },
    message_img: {
        marginTop: -2,
    }
});
