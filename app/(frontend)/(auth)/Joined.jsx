import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import { Animated, Dimensions, StyleSheet, View, TextInput, Pressable, Image, ScrollView } from 'react-native'
import { Header1, Header2, ErrorText } from '../components/text_styles'
import Text from '../components/text_styles'
import Nav_Button from '../components/nav_button'
import Base from '../components/base'
import Button from '../components/button'
import styles from '../../root_styles'
import earth from '../../../assets/images/earth.png'
import box from '../../../assets/images/box.png'
import submit_line from '../../../assets/images/submit_line.png'

const PAGES = {
    START: 1,
    LEARN: 2,
    QUESTION_1: 3,
    QUESTION_2: 4,
    QUESTION_3: 5,
    READY: 6,
}; 

const Select_One_Options = () => {
    const OPTION_DEFINITIONS = [
        { key: "Option_1", text: "Options...1" },
        { key: "Option_2", text: "Options...2" },
        { key: "Option_3", text: "Options...3" },
        { key: "Option_4", text: "Options...4" },
        { key: "Option_5", text: "Options...5" },
        { key: "Option_6", text: "Options...6" },
        { key: "Option_7", text: "Options...7" },
    ];

    const [options, setOptions] = useState(
        Object.fromEntries(OPTION_DEFINITIONS.map(({ key }) => [key, false]))
    );

    const all_options = OPTION_DEFINITIONS.map(({ key, text }) => ({
        key,
        text,
        enabled: options[key],
    }));

    return (
        <View>
            {all_options.map((data) => {
                return <Pressable
                    key={data.key}
                    style={[join_styles.card_choice, data.enabled && join_styles.card_choice_clicked]}
                    onPress={() => setOptions((current) =>
                        Object.keys(current).reduce((next, key) => ({
                            ...next,
                            [key]: key === data.key,
                        }), {})
                    )}
                >
                    <Text style={[join_styles.card_t_choice, data.enabled && join_styles.card_t_choice_clicked]}>
                        {data.text}
                    </Text>
                </Pressable>
            })}
        </View>
    );
}

const Select_Max_Options = ({max = 3}) => {
    const OPTION_DEFINITIONS = [
        { key: "Option_1", text: "Options...1" },
        { key: "Option_2", text: "Options...2" },
        { key: "Option_3", text: "Options...3" },
        { key: "Option_4", text: "Options...4" },
        { key: "Option_5", text: "Options...5" },
        { key: "Option_6", text: "Options...6" },
        { key: "Option_7", text: "Options...7" },
    ];

    const [options, setOptions] = useState(
        Object.fromEntries(OPTION_DEFINITIONS.map(({ key }) => [key, false]))
    );

    const all_options = OPTION_DEFINITIONS.map(({ key, text }) => ({
        key,
        text,
        enabled: options[key],
    }));

    return (
        <View>
            {all_options.map((data) => {
                return <Pressable
                    key={data.key}
                    style={[join_styles.card_choice, data.enabled && join_styles.card_choice_clicked]}
                    onPress={() => setOptions((current) => {
                        const selectedCount = Object.values(current).filter(Boolean).length;

                        if (!current[data.key] && selectedCount >= max) {
                            return current;
                        }

                        return {
                            ...current,
                            [data.key]: !current[data.key],
                        };
                    })}
                >
                    <Text style={[join_styles.card_t_choice, data.enabled && join_styles.card_t_choice_clicked]}>
                        {data.text}
                    </Text>
                </Pressable>
            })}
        </View>
    );
}

const Join_Page = () => {
    const [page_number, set_page_number] = useState(PAGES.START);
    const [startTransitioning, set_start_transitioning] = useState(false);
    const [error_name_state, set_error_name_state] = useState(false);
    const [hello_layout_ready, set_hello_layout_ready] = useState(false);
    const [show_questions_before, set_show_questions_before] = useState(true);
    const [show_questions_learn, set_show_questions_learn] = useState(false);
    const [name, set_name] = useState("");
    const router = useRouter();
    const screen_width = Dimensions.get('window').width;
    const screen_height = Dimensions.get('window').height;
    const hello_opacity = useRef(new Animated.Value(0)).current;
    const hello_translate_y = useRef(new Animated.Value(0)).current;
    const name_prompt_opacity = useRef(new Animated.Value(0)).current;
    const name_input_opacity = useRef(new Animated.Value(0)).current;
    const submit_opacity = useRef(new Animated.Value(0)).current;
    const start_translate_x = useRef(new Animated.Value(0)).current;
    const questions_opacity = useRef(new Animated.Value(0)).current;
    const questions_translate_x = useRef(new Animated.Value(screen_width)).current;
    const questions_title_opacity = useRef(new Animated.Value(0)).current;
    const questions_before_opacity = useRef(new Animated.Value(0)).current;
    const questions_learn_opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!hello_layout_ready) {
            return;
        }

        Animated.parallel([
            Animated.timing(hello_opacity, {
                toValue: 1,
                duration: 450,
                delay: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(hello_translate_y, {
                toValue: 0,
                duration: 450,
                delay: 2000,
                useNativeDriver: true,
            }),
            Animated.timing(name_prompt_opacity, {
                toValue: 1,
                duration: 450,
                delay: 2700,
                useNativeDriver: true,
            }),
            Animated.timing(name_input_opacity, {
                toValue: 1,
                duration: 450,
                delay: 2800,
                useNativeDriver: true,
            }),
            Animated.timing(submit_opacity, {
                toValue: 1,
                duration: 450,
                delay: 2900,
                useNativeDriver: true,
            }),
        ]).start();
    }, [
        hello_layout_ready,
        hello_opacity,
        hello_translate_y,
        name_prompt_opacity,
        name_input_opacity,
        submit_opacity,
    ]);

    const go_to_question_one = () => {
        Animated.timing(questions_translate_x, {
            toValue: -screen_width,
            duration: 500,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                set_page_number(PAGES.QUESTION_1);
                set_start_transitioning(false);
            }
        });
    };

    const start_questions_intro = () => {
        Animated.sequence([
            Animated.timing(questions_title_opacity, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.timing(questions_before_opacity, {
                toValue: 1,
                duration: 450,
                delay: 500,
                useNativeDriver: true,
            }),
            Animated.delay(500),
            Animated.timing(questions_before_opacity, {
                toValue: 0,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.delay(500),
        ]).start(({ finished }) => {
            if (finished) {
                set_show_questions_before(false);
                set_show_questions_learn(true);
                Animated.sequence([
                    Animated.timing(questions_learn_opacity, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                    Animated.delay(500),
                ]).start(({ finished: learn_finished }) => {
                    if (learn_finished) {
                        go_to_question_one();
                    }
                });
            }
        });
    };

    const submit_start_page = () => {
        if (name == "") {
            set_error_name_state(true);
            return;
        }

        set_start_transitioning(true);
        Animated.parallel([
            Animated.timing(start_translate_x, {
                toValue: -screen_width,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(questions_opacity, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.timing(questions_translate_x, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                set_page_number(PAGES.QUESTIONS);
                start_questions_intro();
            }
        });
    };

    const on_change_text = (text) => {
        if (error_name_state && text != "")
        {
            set_error_name_state(false);
        }
        set_name(text);
    }

    return (
        <Base>
            {(page_number == PAGES.START || startTransitioning) && <Animated.View style={[join_styles.full_page, {transform: [{translateX: start_translate_x}]}]}>
                <Animated.View
                    onLayout={({ nativeEvent: { layout } }) => {
                        if (!hello_layout_ready) {
                            hello_translate_y.setValue(
                                screen_height / 2 - (layout.y + layout.height / 2)
                            );
                            set_hello_layout_ready(true);
                        }
                    }}
                    style={{opacity: hello_opacity, transform: [{translateY: hello_translate_y}]}}
                >
                    <Header1 style={{marginBottom: 15}}>Hello!</Header1>
                </Animated.View>
                <Animated.View style={{opacity: name_prompt_opacity}}>
                    <Text style={{fontFamily: 'Caveat', fontWeight: 600, fontSize: 25, marginBottom: 25}}>What's your name?</Text>
                </Animated.View>
                <Animated.View style={{opacity: name_input_opacity}}>
                    <View style={{marginBottom: 15}}>
                        <View>
                            <TextInput value={name} onChangeText={on_change_text} style={join_styles.text_input}></TextInput>
                            <Image resizeMode='contain' source={box} style={{position: 'absolute', width: '100%', height: '100%', pointerEvents: "none"}} />
                        </View>
                        { error_name_state && <ErrorText style={{ textAlign: 'left', width: '100%', marginTop: 5, }}>Provide a Name.</ErrorText> }
                    </View>
                </Animated.View>
                <Animated.View style={{opacity: submit_opacity}}>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Button onPress={submit_start_page} style={join_styles.submit_button}><Text style={join_styles.submit_button_t}>Submit</Text></Button> 
                        <Image resizeMode='contain' source={submit_line} style={{height: 7}}></Image>
                    </View>
                </Animated.View>
            </Animated.View>}
            {(page_number == PAGES.QUESTIONS || startTransitioning) && <Animated.View style={[join_styles.full_page, {opacity: questions_opacity, transform: [{translateX: questions_translate_x}]}]}>
                <Animated.View style={{opacity: questions_title_opacity}}>
                    <Header1 style={{marginBottom: 30}}>Okay, {name}!</Header1>
                </Animated.View>
                {show_questions_before && <Animated.View style={{opacity: questions_before_opacity}}>
                    <Header2 style={{fontFamily: 'Caveat', color: "#000"}}>Before getting started...</Header2>
                </Animated.View>}
                {show_questions_learn && <Animated.View style={{opacity: questions_learn_opacity}}>
                    <Header2 style={{fontFamily: 'Caveat', color: "#000"}}>Let's learn a bit about you!</Header2>
                </Animated.View>}
            </Animated.View>}
            {page_number == PAGES.QUESTION_1 && 
                <ScrollView contentContainerStyle={{justifyContent: 'center'}}>
                    <Header2>Question 1 test...</Header2>
                    <Text style={{fontFamily: 'Caveat', fontWeight: 650, fontSize: 24, marginBottom: 30}}>Select all that apply.</Text>
                    <Select_Max_Options max={7}/>

                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Button onPress={() => {set_page_number(PAGES.QUESTION_2)}} style={join_styles.submit_button}><Text style={[join_styles.submit_button_t]}>Submit</Text></Button> 
                        <Image resizeMode='contain' source={submit_line} style={{height: 7}}></Image>
                    </View>
                </ScrollView>}
            {page_number == PAGES.QUESTION_2 && 
                <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
                    <Header2>Question 2 test...</Header2>
                    <Text style={{fontFamily: 'Caveat', fontWeight: 650, fontSize: 24, marginBottom: 30}}>Choose One.</Text>
                    <Select_One_Options/>

                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Button onPress={() => {set_page_number(PAGES.QUESTION_3)}} style={join_styles.submit_button}><Text style={[join_styles.submit_button_t]}>Submit</Text></Button> 
                        <Image resizeMode='contain' source={submit_line} style={{height: 7}}></Image>
                    </View>
                </ScrollView>}
            {page_number == PAGES.QUESTION_3 && 
                <ScrollView contentContainerStyle={{flex: 1, justifyContent: 'center'}}>
                    <Header2>Question 3 test...</Header2>
                    <Text style={{fontFamily: 'Caveat', fontWeight: 650, fontSize: 24, marginBottom: 30}}>Select at max, 3.</Text>
                    <Select_Max_Options/>

                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Button onPress={() => {set_page_number(PAGES.READY)}} style={join_styles.submit_button}><Text style={[join_styles.submit_button_t]}>Submit</Text></Button> 
                        <Image resizeMode='contain' source={submit_line} style={{height: 7}}></Image>
                    </View>
                </ScrollView>}
            {page_number == PAGES.READY && <View>
                <Header2 style={{marginBottom: 15}}>Ready {name}?</Header2>
                <Text>Be a part of a trusted community.</Text> 
                <Button onPress={() => {router.push('/home')}}><Text>Let's Go!</Text></Button>
            </View>}
        </Base>
    );
}

export default Join_Page;

const join_styles = StyleSheet.create({ 
    full_page: {
        position: 'absolute',
        left: 0,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    text_input: {
        fontSize: 22,
        width: '100%',
        fontFamily: 'Outfit',
        fontWeight: 'regular',
        textAlign: 'left',
        height: 'auto',
        padding: 10,
    },
    submit_button: {
        backgroundColor: '',
        boxShadow: '',
        marginBottom: -8,
    },  
    submit_button_t: {
        fontFamily: "Caveat",
        fontSize: 25,
        fontWeight: 'bold',
        color: "#800000",
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
