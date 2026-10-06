import { Slot, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

const LoadFonts = () => {
    const [loaded, error] = useFonts({
        'Gloria Hallelujah': require('../assets/fonts/GloriaHallelujah.ttf'),
        'Bricolage Grotesque': require('../assets/fonts/BricolageGrotesque-VariableFont.ttf'),
        'Outfit': require('../assets/fonts/Outfit-VariableFont.ttf'),
    });

    useEffect(() => {
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }
}

const RootLayout = () => {
    LoadFonts();
    
    return (
        <View style={{flex: 1}}>
            <Stack screenOptions={{
                headerStyle: { backgroundColor: '#ddd' },
                headerTintColor: '#0000FF',
            }}>
                <Stack.Screen name="index" options={{ title: 'INDEX THIS', headerShown: false }}/>
                <Stack.Screen name="(frontend)/Landing" options={{ headerShown: false }}/>
                {/* <Slot /> */ }
            </Stack>
            {/* <Text style={styles.footer}>Footer</Text> */ }
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        fontSize: 35,
    }
})

export default RootLayout