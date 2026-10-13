import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import paper_bg from '../../../assets/images/paper_bg.png'

const Base = ({children}) => {
    return (
        <View style={styles.base_container}>
            <Image source={paper_bg} style={styles.image_bg}/>
            { children }
        </View>
    );
}

export default Base;

const styles = StyleSheet.create({
    base_container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        /* this is meant to be the basic page setup */
    },
    image_bg: {
        position: 'absolute',
        opacity: 0.35,
        width: '100%',
        height: '100%',
    },
})