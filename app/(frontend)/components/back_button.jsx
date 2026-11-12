import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'
import Button from './button'

const Back_Button = ({href, onPress, ...buttonProps}) => {
    const router = useRouter();

    return (
        <Button
            {...buttonProps}
            onPress={onPress || (() => router.push(href))}
        >
            <Ionicons name="chevron-back" size={30} color="#800000" />
        </Button>
    );
}

export default Back_Button;

const styles = StyleSheet.create({})
