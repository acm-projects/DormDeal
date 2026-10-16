import { StyleSheet, TextInput } from 'react-native'
import component_root_styles from '../../root_styles'

const TextInput_Default = ({placeholder, style=[]}) => {
    return (
        <TextInput style={[component_root_styles.default_text, style, styles.text_input]} placeholder={placeholder}>
        </TextInput>
    )
}

export default TextInput_Default;

const styles = StyleSheet.create({
    text_input: {
        minWidth: 0,
        fontSize: 17,
        fontWeight: 'regular',
        textAlign: 'left',
        height: 'auto',
    }
})