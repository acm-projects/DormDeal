import { StyleSheet, Text, View, Image } from 'react-native'
import { component_root_styles } from '../../root_styles'

const Default_Text = ({children, style}) => {
    return (
        <Text style={
            [
                component_root_styles.default_text,
                style
            ]
        }>
            {children}
        </Text>
    )
}

export default Default_Text;

export const Header1 = ({children}) => {
    return (
        <Default_Text style={
            {
                fontWeight: 'bold',
                fontSize: 48,
                letterSpacing: '-2%',
                color: '#800000',
                marginBottom: 48,
            }
        }>
            {children}
        </Default_Text>
    );
}

export const Header2 = ({children}) => {
    return (
        <Default_Text style={
            {
                fontWeight: 'bold',
                fontSize: 36,
                letterSpacing: '-2%',
                marginBottom: 36,
            }
        }>
            {children}
        </Default_Text>
    );
}

export const Header3 = ({children}) => {
    return (
        <Default_Text style={
            {
                fontWeight: 'semibold',
                fontSize: 24,
                letterSpacing: '-2%',
                marginBottom: 24,
            }
        }>
            {children}
        </Default_Text>
    );
}

export const Header4 = ({children}) => {
    return (
        <Default_Text style={
            {
                fontWeight: 'semibold',
                fontSize: 22,
                letterSpacing: '-2%',
                marginBottom: 22,
            }
        }>
            {children}
        </Default_Text>
    );
}

export const Header5 = ({children}) => {
    return (
        <Default_Text style={
            {
                fontWeight: 'semibold',
                fontSize: 17,
                letterSpacing: '-2%',
                marginBottom: 17,
            }
        }>
            {children}
        </Default_Text>
    );
}

export const ErrorText = ({style, children}) => {
    return (
        <Default_Text style={
            [
                {
                    fontFamily: 'Outfit',
                    fontWeight: 'bold',
                    color: '#800000',
                },
                style
            ]
        }>
            {children}
        </Default_Text>
    );
}