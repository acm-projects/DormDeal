import { View, Image, StyleSheet } from 'react-native';
import { Header1 } from '../components/text_styles'
import TextInput from '../components/text_input'

const Account_Text_Input = ({img_source, placeholder, style={}, children = []}) => {
    return (
        <View style={[styles.container, style]}>
            <TextInput placeholder={placeholder}></TextInput>
            <Image source={img_source} style={[styles.line_bar]}/>
            {children}
        </View>
    );
}

export default Account_Text_Input

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center',
    },

    line_bar: {
        position: 'relative',
        top: 5,
        width: '100%',
    },
})