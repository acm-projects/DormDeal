import { StyleSheet, Text, Image, View, TextInput, TouchableOpacity } from 'react-native';
import paper_bg from '../../../assets/images/paper_bg.png'

const Base = ({style, children}) => {
    return (
        <View style={styles.base_container}>
            <Image source={paper_bg} style={styles.image_bg}/>
            <View style={[styles.actual_container, style]}>
                { children }
            </View>
        </View>
    );
}

export default Base;

const styles = StyleSheet.create({
    base_container: {
        flex: 1,
        backgroundColor: '#F1EEEA',
        alignItems: 'center',
        justifyContent: 'center',
        /* this is meant to be the basic page setup */
    },
    actual_container: {
        paddingTop: 50,
        paddingBottom: 50,
        paddingLeft: 20,
        paddingRight: 20,
        height: '100%',
        width: '100%',
    },
    image_bg: {
        position: 'absolute',
        opacity: 0.5,
        width: '100%',
        height: '100%',
    },
})