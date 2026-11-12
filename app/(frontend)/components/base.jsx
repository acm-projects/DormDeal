import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Base = ({style = {}, children}) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.actual_container, { paddingTop: Math.max(insets.top + 16, 24), paddingBottom: insets.bottom + 16 }, style]}>
            { children }
        </View>
    );
}

export default Base;

const styles = StyleSheet.create({
    actual_container: {
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1,
        width: '100%',
    },
});
