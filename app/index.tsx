import { Redirect } from 'expo-router'

const App = () => {
    return <Redirect href="/home" />;
}

export default App
/*import { StyleSheet, Text, View, Image } from 'react-native';
import { useRouter } from 'expo-router'

const App = () => {
    const router = useRouter();
    router.push("/home");

    return (
        <View>

        </View>
    );
}

export default App*/
