import { StyleSheet, View, Image } from 'react-native';
import Other_Message_Box from '../../components/message_box_pink'
import You_Message_Box from '../../components/message_box_red'
import Back_Button from '../../components/back_button'
import Button from '../../components/button'
import Base from '../../components/base'
import Text from '../../components/text_styles'
import Text_Input from '../../components/text_input'
import avatar_test from '../../../../assets/svgs/avatar_sample.svg'
import menu_icon from '../../../../assets/svgs/menu.svg'
import arrow from '../../../../assets/svgs/white_arrow.svg'
import plus_icon from '../../../../assets/svgs/plus.svg'

const Messages = () => {
    return (
        <Base style={{paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}>
            <View style={styles.header_container}>
                <Back_Button href="/Contacts"/>
                <View style={styles.header_quick_info}>
                    <Image source={avatar_test}/>
                    <View style={styles.text_info}>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>Anthony Simon</Text>
                        <Text style={{fontSize: 12, fontWeight: 'regular', opacity: 0.45}}>Last Online: 32s</Text>
                    </View>
                    <View style={styles.dot}>
                    
                    </View>
                </View>
                <Button>
                    <Image source={menu_icon}></Image>
                </Button>
            </View>

            <View style={styles.messages_container}>
                {/* messages go in here.. */}
                <Other_Message_Box></Other_Message_Box>
                <Other_Message_Box></Other_Message_Box>
                <Other_Message_Box></Other_Message_Box>
                <Other_Message_Box></Other_Message_Box>
            </View>

            <View style={styles.messages_functionality}>
                <Button style={{backgroundColor: "#5B0000",}}>
                    <Image source={plus_icon} style={{opacity: 0.85}}></Image>
                </Button>
                <View style={styles.text_input_container}>
                    <Text_Input placeholder="Message..." style={styles.text_input}/>
                    <Button style={{flex: 1, backgroundColor: "#6b0000", maxWidth: 40, maxHeight: 40}}>
                        <Image source={arrow} style={{opacity: 0.85, transform: [{rotate: '90deg'}]}}></Image>
                    </Button>
                </View>
            </View>
        </Base>
    );
}

export default Messages

const styles = StyleSheet.create({
    header_container: {
        flexDirection: 'row',
        paddingLeft: 20, 
        paddingRight: 20,
        gap: 10,
    },
    messages_container: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 5,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 106,
    },
    header_quick_info: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#E4E4E4",
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        borderRadius: 25,
        height: 50,
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
    },
    text_info: {
        flex: 1,
        textAlign: 'left',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginLeft: 10,
    },
    dot: {
        width: 15,
        height: 15,
        backgroundColor: '#58EF5D',
        borderRadius: '50%',
    },
    messages_functionality: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        alignContent: 'flex-end',
        backgroundColor: '#800000',
        width: '100%',
        height: 86,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,
    },
    text_input_container: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 10,
        alignItems: 'center',
        backgroundColor: "#5B0000",
        height: 50,
        borderRadius: 25,
        gap: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    text_input: {
        flex: 1,
        color: "#FFFFFF",
        opacity: 0.65,
        height: '100%',
        borderRadius: 25,
    }
})