import { useRef } from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
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
    const scroll_view_ref = useRef(null);
    const scroll_to_end_func = () => {
        scroll_view_ref.current?.scrollToEnd({
            animated: false,
        });
    }

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

            <ScrollView
                ref={scroll_view_ref}
                onContentSizeChange={scroll_to_end_func}
                style={styles.messages_scroll_view}
                contentContainerStyle={styles.messages_container}
                showsVerticalScrollIndicator={true}
            >
                {/* messages go in here.. */}
                <Other_Message_Box status="1 day ago">In particular, are you patient enough to see that the definitive answer to my word is going to be a considerate amount of considerates?</Other_Message_Box>
                <Other_Message_Box status="1 day ago">In particular, are you patient enough to see that the definitive answer to my word is going to be a considerate amount of considerates?</Other_Message_Box>
                <Other_Message_Box status="1 day ago">In particular, are you patient enough to see that the definitive answer to my word is going to be a considerate amount of considerates?</Other_Message_Box>
                <Other_Message_Box status="25 minutes ago • read">Good morning, how are you?</Other_Message_Box>
                <You_Message_Box status="20 minutes ago • read">I'm okay, what about you?</You_Message_Box>
                <You_Message_Box status="12 minutes ago • read">This is nice.</You_Message_Box>
                <Other_Message_Box status="6 minutes ago • sent">Sure.</Other_Message_Box>
            </ScrollView>

            <View style={styles.messages_functionality}>
                <Button style={{backgroundColor: "#5B0000",}}>
                    <Image source={plus_icon} style={{opacity: 0.85}}></Image>
                </Button>
                <View style={styles.text_input_container}>
                    <Text_Input placeholder="Message..." style={styles.text_input}/>
                    <Button style={styles.upload_button}>
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
        flexGrow: 1,
        justifyContent: 'flex-end',
        gap: 5,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 106,
    },
    messages_scroll_view: {
        flex: 1,
        minHeight: 0,
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
    upload_button: {
        flexShrink: 0,
        backgroundColor: "#6b0000", 
        maxWidth: 40, 
        maxHeight: 40,
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
        alignItems: 'center',
        marginLeft: 10,
        backgroundColor: "#5B0000",
        borderRadius: 25,
        paddingLeft: 20,
        paddingRight: 20,
        height: 50,
    },
    text_input: {
        flex: 1,
        color: "#FFFFFF",
        opacity: 0.65,
        height: '100%',
        borderRadius: 25,
    }
})