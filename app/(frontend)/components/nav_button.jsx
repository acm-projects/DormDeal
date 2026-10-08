import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router'
import styles from '../../styles'

import Logo from '../../../assets/icon.png'

const Nav_Button = (props) => {
    const router = useRouter();

    return (
        <Pressable onPress={() => router.push(props.href)} style={props.m_style}>
            <Text style={[styles.nav_button, props.txt_style]}>{ props.text }</Text>
        </Pressable>
    );
}

export default Nav_Button;