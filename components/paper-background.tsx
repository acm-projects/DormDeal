import { Image, Platform, StyleSheet, View } from 'react-native';

// The PNG preserves the SVG's turbulence and lighting filters on native.
const paperBackground = Platform.OS === 'web'
    ? require('../assets/images/paper_bg_new.svg')
    : require('../assets/images/paper_bg_new_backup.png');

export default function PaperBackground() {
    return (
        <View style={styles.background}>
            <Image accessible={false} resizeMode="cover" source={paperBackground} style={styles.image} />
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        ...StyleSheet.absoluteFill,
        pointerEvents: 'none',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
