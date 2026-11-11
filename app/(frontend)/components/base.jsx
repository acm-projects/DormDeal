import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PaperBackground from '../../../assets/images/paper_bg.png';

const Base = ({style = {}, children}) => {
    const insets = useSafeAreaInsets();
    return (
        <ImageBackground source={PaperBackground} resizeMode="cover" style={styles.base_container}>
            <View style={[styles.actual_container, { paddingTop: Math.max(insets.top + 16, 24), paddingBottom: insets.bottom + 16 }, style]}>
                { children }
            </View>
        </ImageBackground>
    );
}

export default Base;

const styles = StyleSheet.create({
    base_container: {
        flex: 1,
        backgroundColor: '#EDEAE4',
    },
    actual_container: {
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1,
        width: '100%',
    },
});
