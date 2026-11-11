import { Animated, ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Text as SvgText } from 'react-native-svg';
import Base from '../components/base';
import { colors } from '../../root_styles';
import PaperBackground from '../../../assets/images/paper_bg.png';
export default function Landing() {
    const router = useRouter();
    const {
        height
    } = useWindowDimensions();
    const globeScale = Math.max(.56, Math.min(.82, (height - 420) / 560));
    const spin = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const animation = Animated.loop(Animated.timing(spin, {
            toValue: 1,
            duration: 48000,
            useNativeDriver: true
        }), {
            resetBeforeIteration: true
        });
        animation.start();
        return () => animation.stop();
    }, [spin]);
    const swing = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const animation = Animated.loop(Animated.sequence([Animated.timing(swing, {
            toValue: 1,
            duration: 3600,
            useNativeDriver: true
        }), Animated.timing(swing, {
            toValue: 0,
            duration: 3600,
            useNativeDriver: true
        })]));
        animation.start();
        return () => animation.stop();
    }, [swing]);
    const tagRotation = swing.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg']
    });
    return <ImageBackground source={PaperBackground} resizeMode="cover" style={landingStyles.background}><Base style={landingStyles.base}><View style={landingStyles.screen}>
        <View style={landingStyles.brand}><View style={landingStyles.hanger} /><Animated.View style={[landingStyles.tagWrap, {
                        transform: [{
                            rotate: tagRotation
                        }]
                    }]}><DealTag /></Animated.View><Text style={landingStyles.word}>Dorm</Text><Squiggle /></View>
        <EarthIllustration orbit={spin} scale={globeScale} />
        <Text style={landingStyles.tagline}>Marketplace for students,{"\n"}by <Text style={landingStyles.hand}>students.</Text></Text>
        <View style={landingStyles.buttons}><Pressable accessibilityLabel="Log in" onPress={() => router.push('/Login')} style={landingStyles.login}><Text style={landingStyles.loginText}>Log in</Text></Pressable><Pressable accessibilityLabel="Sign up" onPress={() => router.push('/SignUp')} style={landingStyles.signUp}><Text style={landingStyles.signUpText}>Sign up</Text></Pressable></View><Text style={landingStyles.caption}>Join with your school email. Students only.</Text>
    </View></Base></ImageBackground>;
    /* return <Base style={styles.base}><View style={styles.screen}>
        <View style={styles.brand} accessibilityLabel="DormDeal"><View style={styles.string}/><View style={styles.tag}><Text style={styles.tagText}>Deal</Text></View><Text style={styles.word}>Dorm</Text><View style={styles.squiggle}/></View>
        <View style={styles.people}><Text>○</Text><Text>○</Text><Text>○</Text><Text>○</Text></View>
        <Animated.View accessible accessibilityLabel="Spinning Earth with students chatting around it" style={[styles.earth, { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}><View style={[styles.land, styles.landOne]}/><View style={[styles.land, styles.landTwo]}/><View style={[styles.land, styles.landThree]}/></Animated.View>
        <Text style={styles.tagline}>Marketplace for students,{"\n"}by <Text style={styles.hand}>students.</Text></Text>
        <View style={styles.buttons}><Pressable accessibilityLabel="Log in" onPress={() => router.push('/Login')} style={styles.login}><Text style={styles.loginText}>Log in</Text></Pressable><Pressable accessibilityLabel="Sign up" onPress={() => router.push('/SignUp')} style={styles.signUp}><Text style={styles.signUpText}>Sign up</Text></Pressable></View><Text style={styles.caption}>Join with your school email. Students only.</Text>
    </View></Base>;
    } */
}
function Squiggle() {
    return <Svg width={160} height={12}><Path d="M2 7 Q16 1 30 7 T58 7 T86 7 T114 7 T142 6 T158 6" stroke={colors.maroon} strokeWidth={3} fill="none" strokeLinecap="round" /></Svg>;
}
function DealTag() {
    return <Svg width={150} height={74} viewBox="0 0 150 74"><Path d="M25 14 H138 a8 8 0 0 1 8 8 V58 a8 8 0 0 1 -8 8 H25 L5 40 Z" fill={colors.maroon} stroke={colors.maroonDark} strokeWidth={3} /><Circle cx={25} cy={40} r={6} fill={colors.appBg} stroke={colors.maroonDark} strokeWidth={2} /><SvgText x={89} y={52} fill="white" fontFamily="Outfit" fontSize={32} fontWeight="800" textAnchor="middle">Deal</SvgText></Svg>;
}
function Person({
    x,
    y,
    flip = false
}) {
    return <View style={[landingStyles.person, {
        left: x,
        top: y,
        transform: [{
            scaleX: flip ? -1 : 1
        }]
    }]}><Svg width={44} height={64} viewBox="0 0 44 64"><Circle cx={22} cy={9} r={6} fill={colors.cream} stroke={colors.ink} strokeWidth={3} /><Path d="M22 15 V35 M22 24 L7 16 M22 24 L37 30 M22 35 L13 55 M22 35 L31 55" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" /><Path d="M18 17 H26" stroke={colors.maroon} strokeWidth={4} /></Svg></View>;
}
function Student({
    x,
    y,
    angle
}) {
    return <G transform={`translate(${x} ${y}) rotate(${angle})`} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none"><Circle cx="0" cy="-47" r="7" fill={colors.cream} /><Path d="M0 -40 V-18 M0 -31 L-15 -39 M0 -31 L15 -37 M0 -18 L-10 0 M0 -18 L10 0" /><Path d="M-5 -39 H5" stroke={colors.maroon} strokeWidth={4} /></G>;
}
function EarthIllustration({
    orbit,
    scale
}) {
    const rotate = orbit.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });
    return <View accessible accessibilityLabel="Spinning Earth with students standing on its edge" style={[landingStyles.earthWrap, {
        height: Math.round(424 * scale)
    }]}><Animated.View style={[landingStyles.orbit, {
            transform: [{
                scale
            }, {
                rotate
            }]
        }]}><Svg width={426} height={424} viewBox="-48 -48 426 424" style={landingStyles.earthCanvas} overflow="visible"><Defs><ClipPath id="earthClip"><Circle cx={165} cy={164} r={112} /></ClipPath></Defs><G clipPath="url(#earthClip)"><Circle cx={165} cy={164} r={112} fill="#CFE3F0" /><Path d="M58 114 C85 75 124 83 130 116 C138 147 105 168 78 154 C60 145 52 130 58 114 Z" fill="#8DBF8B" stroke={colors.ink} strokeWidth={3} /><Path d="M173 112 C199 90 247 105 256 139 C263 174 235 200 207 195 C181 190 164 164 167 140 Z" fill="#8DBF8B" stroke={colors.ink} strokeWidth={3} /><Path d="M142 216 C174 202 213 222 209 249 C203 273 169 282 147 266 C129 253 124 231 142 216 Z" fill="#8DBF8B" stroke={colors.ink} strokeWidth={3} /></G><Circle cx={165} cy={164} r={112} fill="none" stroke={colors.ink} strokeWidth={4} /><Student x={165} y={52} angle={0} /><Student x={262} y={108} angle={60} /><Student x={262} y={220} angle={120} /><Student x={165} y={276} angle={180} /><Student x={68} y={220} angle={240} /><Student x={68} y={108} angle={300} /></Svg></Animated.View></View>;
}
const landingStyles = StyleSheet.create({
    background: {
        flex: 1
    },
    base: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0
    },
    screen: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 4,
        justifyContent: 'space-between'
    },
    brand: {
        height: 210,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    hanger: {
        position: 'absolute',
        height: 135,
        top: -20,
        left: '58%',
        borderLeftWidth: 2,
        borderColor: colors.ink
    },
    tagWrap: {
        position: 'absolute',
        top: 90,
        left: '58%',
        marginLeft: -25,
        zIndex: 10,
        elevation: 10,
        transformOrigin: '25px 0px'
    },
    word: {
        color: colors.ink,
        fontFamily: 'Outfit',
        fontWeight: '800',
        fontSize: 68,
        letterSpacing: -3
    },
    earthWrap: {
        width: 330,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    earthCompact: {
        height: 238
    },
    earthTall: {
        height: 286
    },
    orbit: {
        position: 'absolute',
        width: 330,
        height: 328
    },
    orbitCompact: {
        transform: [{
            scale: .62
        }]
    },
    orbitTall: {
        transform: [{
            scale: .78
        }]
    },
    earthCanvas: {
        position: 'absolute',
        left: -48,
        top: -48
    },
    person: {
        position: 'absolute',
        width: 44,
        height: 64,
        zIndex: 2
    },
    tagline: {
        color: colors.ink,
        fontFamily: 'Outfit',
        fontSize: 19,
        fontWeight: '500',
        lineHeight: 27,
        textAlign: 'center'
    },
    hand: {
        fontFamily: 'Caveat',
        fontWeight: '700',
        fontSize: 28
    },
    buttons: {
        flexDirection: 'row',
        width: '100%',
        gap: 14
    },
    login: {
        flex: 1,
        height: 52,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: colors.maroon,
        backgroundColor: colors.cream,
        alignItems: 'center',
        justifyContent: 'center'
    },
    signUp: {
        flex: 1,
        height: 52,
        borderRadius: 999,
        backgroundColor: colors.maroon,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loginText: {
        color: colors.maroon,
        fontFamily: 'Caveat',
        fontWeight: '700',
        fontSize: 26
    },
    signUpText: {
        color: colors.white,
        fontFamily: 'Caveat',
        fontWeight: '700',
        fontSize: 26
    },
    caption: {
        color: colors.muted,
        fontFamily: 'Outfit',
        fontSize: 12
    }
});
