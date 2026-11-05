import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router'

const App = () => {
    const router = useRouter();
    router.push("/Landing");

    return (
        <View>

        </View>
    );
}

export default App
