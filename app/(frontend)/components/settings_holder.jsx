import { View, Image, StyleSheet, TextInput } from 'react-native';
import { component_root_styles } from '../../root_styles'
import Text from '../components/text_styles'
import search_icon from '../../../assets/images/search_icon.png'

const Settings_Holder = ({id = 1, children = []}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.category_header}>Category {id}</Text>
            <View style={styles.settings_container}>
                {children}
            </View>
        </View>
    );
}

export default Settings_Holder;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    category_header: {
        marginBottom: 10,
    },
    settings_container: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        width: '100%',
        borderRadius: 24,
        flexDirection: 'column',
        gap: 10,
    }
})