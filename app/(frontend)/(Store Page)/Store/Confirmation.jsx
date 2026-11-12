import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Base from '../../components/base';
import { colors } from '../../../root_styles';
import { isTransitionPending, subscribeToTransitionComplete } from '../../../../components/transitions/pageTransitions';

const CONFETTI = [
    { left: '7%', color: '#F7D95F', delay: 0, duration: 4100, drift: 34, turn: 420 },
    { left: '16%', color: '#B33B3B', delay: 450, duration: 4700, drift: -28, turn: -510 },
    { left: '25%', color: '#6F9160', delay: 980, duration: 3900, drift: 42, turn: 610 },
    { left: '34%', color: '#E691B7', delay: 250, duration: 5200, drift: -37, turn: -460 },
    { left: '43%', color: '#F7D95F', delay: 760, duration: 4400, drift: 26, turn: 550 },
    { left: '53%', color: '#B33B3B', delay: 1260, duration: 5000, drift: -45, turn: -630 },
    { left: '62%', color: '#6F9160', delay: 120, duration: 4600, drift: 31, turn: 470 },
    { left: '71%', color: '#E691B7', delay: 650, duration: 4200, drift: -33, turn: -580 },
    { left: '79%', color: '#F7D95F', delay: 1080, duration: 4900, drift: 39, turn: 520 },
    { left: '88%', color: '#B33B3B', delay: 350, duration: 4500, drift: -25, turn: -490 },
    { left: '12%', color: '#E691B7', delay: 1450, duration: 4300, drift: 36, turn: 490 },
    { left: '48%', color: '#6F9160', delay: 560, duration: 5100, drift: -31, turn: -550 },
    { left: '67%', color: '#F7D95F', delay: 1620, duration: 4000, drift: 44, turn: 600 },
    { left: '94%', color: '#E691B7', delay: 870, duration: 4800, drift: -29, turn: -520 },
];

const iconPopStyle = (progress, startX, startY, rotation) => ({
    opacity: progress,
    transform: [
        { scale: progress },
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [startX, 0] }) },
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [startY, 0] }) },
        { rotate: rotation },
    ],
});

export default function Confirmation() {
    const router = useRouter();
    const [canRevealSuccess, setCanRevealSuccess] = useState(() => !isTransitionPending('stamp'));
    const checkProgress = useRef(new Animated.Value(0)).current;
    const detailsIn = useRef(new Animated.Value(0)).current;
    const iconPops = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const confettiFalls = useRef(CONFETTI.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        if (canRevealSuccess) return undefined;
        return subscribeToTransitionComplete((id) => {
            if (id === 'stamp') setCanRevealSuccess(true);
        });
    }, [canRevealSuccess]);

    useEffect(() => {
        if (!canRevealSuccess) return undefined;
        const primaryAnimation = Animated.parallel([
            Animated.timing(checkProgress, {
                toValue: 1,
                duration: 650,
                useNativeDriver: false,
            }),
            ...confettiFalls.map((fall, index) => Animated.sequence([
                Animated.delay(CONFETTI[index].delay),
                Animated.timing(fall, {
                    toValue: 1,
                    duration: CONFETTI[index].duration,
                    useNativeDriver: true,
                }),
            ])),
        ]);
        const detailsAnimation = Animated.sequence([
            Animated.delay(620),
            Animated.spring(detailsIn, {
                toValue: 1,
                friction: 7,
                tension: 70,
                useNativeDriver: true,
            }),
            Animated.stagger(140, iconPops.map((pop) => Animated.spring(pop, {
                toValue: 1,
                friction: 6,
                tension: 85,
                useNativeDriver: true,
            }))),
        ]);
        primaryAnimation.start();
        detailsAnimation.start();

        return () => {
            primaryAnimation.stop();
            detailsAnimation.stop();
        };
    }, [canRevealSuccess, checkProgress, confettiFalls, detailsIn, iconPops]);

    const detailStyle = {
        opacity: detailsIn,
        transform: [{ scale: detailsIn.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }],
    };

    return (
        <Base style={confirmUI.screen}>
            <View pointerEvents="none" style={confirmUI.screenConfettiLayer}>
                {CONFETTI.map((piece, index) => {
                    const fall = confettiFalls[index];
                    const animationStyle = {
                        left: piece.left,
                        backgroundColor: piece.color,
                        opacity: fall.interpolate({ inputRange: [0, 0.03, 0.92, 1], outputRange: [0, 1, 1, 0] }),
                        transform: [
                            { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-110, 1180] }) },
                            { translateX: fall.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, piece.drift, -piece.drift * 0.65, piece.drift * 0.45, 0] }) },
                            { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.turn}deg`] }) },
                        ],
                    };

                    return <Animated.View key={`${piece.left}-${index}`} style={[confirmUI.confetti, animationStyle]} />;
                })}
            </View>

            <View style={confirmUI.center}>
                <View style={confirmUI.hero}>
                    <Animated.View pointerEvents="none" style={[confirmUI.icon, confirmUI.schoolIcon, iconPopStyle(iconPops[0], 135, 72, '-8deg')]}><Ionicons name="school" size={70} color={colors.maroon} /></Animated.View>
                    <Animated.View pointerEvents="none" style={[confirmUI.icon, confirmUI.flaskIcon, iconPopStyle(iconPops[1], -128, 67, '13deg')]}><Ionicons name="flask-outline" size={70} color={colors.mustard} /></Animated.View>
                    <Animated.View pointerEvents="none" style={[confirmUI.icon, confirmUI.bookIcon, iconPopStyle(iconPops[2], 126, -64, '-9deg')]}><Ionicons name="book-outline" size={68} color={colors.sage} /></Animated.View>
                    <View style={confirmUI.check}><Animated.View style={[confirmUI.checkReveal, { width: checkProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 92] }) }]}><Ionicons name="checkmark" size={88} color={colors.white} /></Animated.View></View>
                    <Animated.View style={[confirmUI.grade, detailStyle]}><Text style={confirmUI.gradeText}>A+</Text></Animated.View>
                </View>
                <Text style={confirmUI.title}>Order confirmed!</Text>
                <Text style={confirmUI.message}>3 items are yours. Pick them up Fri at{`\n`}3 PM, Library lobby. Alex R. and the{`\n`}sellers have been told.</Text>
            </View>
            <View style={confirmUI.actions}>
                <Pressable onPress={() => router.push('/Contacts')} style={confirmUI.primary}><Text style={confirmUI.primaryText}>Message the sellers</Text></Pressable>
                <Pressable onPress={() => router.push('/Store')} style={confirmUI.secondary}><Text style={confirmUI.secondaryText}>Keep browsing</Text></Pressable>
            </View>
        </Base>
    );
}
const confirmUI=StyleSheet.create({
 screen:{overflow:'hidden'},center:{flex:1,alignItems:'center',justifyContent:'center'},
 screenConfettiLayer:{...StyleSheet.absoluteFillObject,overflow:'hidden'},confetti:{position:'absolute',top:0,width:9,height:17,borderRadius:2},
 icon:{position:'absolute',alignItems:'center',justifyContent:'center'},schoolIcon:{top:-22,left:-55},flaskIcon:{top:-16,right:-50},bookIcon:{top:111,left:-45},
 hero:{width:230,height:170,alignItems:'center',justifyContent:'center',position:'relative'},
 check:{width:132,height:132,borderRadius:66,backgroundColor:colors.maroon,alignItems:'center',justifyContent:'center'},checkReveal:{position:'absolute',left:20,top:22,height:90,overflow:'hidden'},
 grade:{position:'absolute',top:79,right:0,width:81,height:81,borderRadius:41,borderWidth:4,borderColor:'#C0392B',backgroundColor:colors.appBg,alignItems:'center',justifyContent:'center'},gradeText:{fontFamily:'Caveat',fontWeight:'700',fontSize:50,color:'#C0392B'},
 title:{marginTop:22,fontFamily:'Outfit',fontWeight:'700',fontSize:42,letterSpacing:-1.5,color:colors.maroon},message:{marginTop:22,fontFamily:'Caveat',fontWeight:'600',fontSize:25,lineHeight:31,textAlign:'center',color:colors.ink},actions:{gap:16,paddingBottom:8},primary:{height:52,backgroundColor:colors.maroon,alignItems:'center',justifyContent:'center'},primaryText:{fontFamily:'Outfit',fontWeight:'700',fontSize:18,color:colors.white},secondary:{height:52,backgroundColor:colors.cream,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:.15,shadowRadius:4,elevation:3},secondaryText:{fontFamily:'Outfit',fontWeight:'700',fontSize:18,color:colors.maroon}
});
