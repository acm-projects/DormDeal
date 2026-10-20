import { StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router'
import Arrow_Up from '../../../assets/svgs/black_arrow.svg'
import Button from './button'

const Back_Button = ({href}) => {
    const router = useRouter();

    return (
        <Button onPress={() => router.push(href)}>
            <Image source={Arrow_Up} style={styles.image}/>
        </Button>
    );
}

export default Back_Button;

const styles = StyleSheet.create({
    image: {
        opacity: 0.45
    },
})