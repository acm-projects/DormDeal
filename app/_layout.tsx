import { Slot, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

const RootLayout = () => {
    return (
        <View style={{flex: 1}}>
            <Stack screenOptions={{
                headerStyle: { backgroundColor: '#ddd' },
                headerTintColor: '#0000FF',
            }}>
                <Stack.Screen name="index" options={{ title: 'INDEX THIS', headerShown: false }}/>
                <Slot />
            </Stack>
            <Text style={styles.footer}>Footer</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        fontSize: 35,
    }
})

export default RootLayout