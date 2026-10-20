import { StyleSheet, Image, View, TextInput, TouchableOpacity } from 'react-native';
import Text from './text_styles'
import message_arrow_1 from '../../../assets/svgs/message_arrow_1.svg'

const Message_Box = ({status="no status", children=[]}) => {
    return (
        <View style={styles.message_container}>
            <Text style={styles.status}>{status}</Text>
            <View style={styles.message_box}>
                <Text style={styles.message_text}>
                    {children}
                </Text>
            </View>
            <View style={{width: '100%', alignItems: 'flex-end'}}>
                <Image style={styles.message_img} source={message_arrow_1}/>
            </View>
        </View>
    ); 
};

export default Message_Box;

const styles = StyleSheet.create({
    message_container: {
        alignItems: 'flex-end',
    },
    message_box: {
        padding: 10,
        maxWidth: 250,
        minHeight: 41,
        minWidth: 41,
        backgroundColor: '#800000',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    message_text: {
        color: '#FFF',
        textAlign: 'left',
    },
    status: {
        fontWeight: 'light',
        opacity: 0.75,
        color: '#242424',
        fontSize: 12,
    },
    message_img: {
        marginTop: -2,
    }
});
