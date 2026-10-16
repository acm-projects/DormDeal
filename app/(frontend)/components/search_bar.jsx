import { View, Image, StyleSheet, TextInput } from 'react-native';
import component_root_styles from '../../root_styles'
import search_icon from '../../../assets/images/search_icon.png'

const Search_Bar = ({placeholder = "", style = {}}) => {
    return (
        <View style={[styles.search_bar_container, style]}>
            <TextInput style={[component_root_styles.default_text, styles.search_bar_txt]} placeholder={placeholder}></TextInput>
            <Image source={search_icon} style={styles.search_icon}/>
        </View>
    );
}

export default Search_Bar;

const styles = StyleSheet.create({
    search_bar_container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#E4E4E4',
        width: '100%',
        height: 45,
        borderRadius: 24,
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
    },
    search_bar_txt: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 20,
        marginRight: 15,
        borderRadius: 24,
        height: '100%',
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#7D7D7D',
    },
    search_icon: {
        filter: 'brightness(0)',
        opacity: 0.45,
        width: 22,
        height: 22,
        marginRight: 20,
    }
})