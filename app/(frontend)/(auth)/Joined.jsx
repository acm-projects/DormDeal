import { useEffect, useState, useRef } from 'react'
import { StyleSheet, View, TextInput, Pressable } from 'react-native'
import { Header1, Header2 } from '../components/text_styles'
import Text from '../components/text_styles'
import Nav_Button from '../components/nav_button'
import Base from '../components/base'
import Button from '../components/button'
import styles from '../../root_styles'
import earth from '../../../assets/images/earth.png'

const PAGES = {
    START: 1,
    LEARN: 2,
    QUESTION_1: 3,
    QUESTION_2: 4,
    QUESTION_3: 5,
    READY: 6,
}; 

const Basic_Card_Choice = ({selection_id = -1, text = "", children = []}) => {
    const [enabled, set_enabled] = useState(false);

    return (
        <Pressable style={[join_styles.card_choice, enabled && join_styles.card_choice_clicked]} onPress={() => set_enabled(!enabled)}>
            <Text style={[join_styles.card_t_choice, enabled && join_styles.card_t_choice_clicked]}>{ text }</Text>
            { children }
        </Pressable>
    );
}

const Join_Page = () => {
    const [page_number, set_page_number] = useState(PAGES.START);
    const [name, set_name] = useState("");

    return (
        <Base>
            {page_number == PAGES.START && <View style={{alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                <Header1 style={{marginBottom: 15}}>Hello!</Header1>
                <Text style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 22, marginBottom: 25}}>What's your name?</Text>
                <TextInput style={join_styles.text_input}></TextInput>
                <Button onPress={() => {set_page_number(PAGES.QUESTIONS), set_name("cyka")}}><Text>Submit</Text></Button>
            </View>}
            {page_number == PAGES.QUESTIONS && <View>
                <Header1 style={{marginBottom: 15}}>Okay, {name}!</Header1>
                <Text>Before getting started...</Text> 
                <Text>Let's learn a bit about you!</Text> 
                <Button onPress={() => {set_page_number(PAGES.QUESTION_1)}}><Text>Submit</Text></Button>
            </View>}
            {page_number == PAGES.QUESTION_1 && <View>
                <Header2>Question 1.</Header2>
                <Text>Requirements, Stated</Text>
                <View>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                </View>
                <Button onPress={() => {set_page_number(PAGES.QUESTION_2)}}><Text>Submit</Text></Button>
            </View>}
            {page_number == PAGES.QUESTION_2 && <View>
                <Header2>Question 2.</Header2>
                <Text>Requirements, Stated</Text>
                <View>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                </View>
                <Button onPress={() => {set_page_number(PAGES.QUESTION_3)}}><Text>Submit</Text></Button>
            </View>}
            {page_number == PAGES.QUESTION_3 && <View>
                <Header2>Question 3.</Header2>
                <Text>Requirements, Stated</Text>
                <View>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                    <Basic_Card_Choice text="So much love in your eyes"></Basic_Card_Choice>
                </View>
                <Button onPress={() => {set_page_number(PAGES.READY)}}><Text>Submit</Text></Button>
            </View>}
            
        </Base>
    );
}

export default Join_Page;

const join_styles = StyleSheet.create({ 
    text_input: {
        fontSize: 22,
        width: '100%',
        fontFamily: 'Outfit',
        fontWeight: 'regular',
        border: '1px solid black',
        textAlign: 'left',
        height: 'auto',
    },
    card_choice: {
        backgroundColor: '#DADADA',
        borderRadius: 22,
        padding: 10,
        marginBottom: 15,
    },
    card_t_choice: {
        color: '#000',
    },
    card_choice_clicked: {
        backgroundColor: '#800000',
        borderRadius: 22,
        padding: 10,
    },
    card_t_choice_clicked: {
        color: '#FFFFFF',
    }
})
