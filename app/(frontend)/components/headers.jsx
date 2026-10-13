import { StyleSheet } from 'react-native'
import Text from './text'

export const Header1 = ({children}) => {
    return (
        <Text style={
            {
                fontFamily: 'Outfit',
                fontWeight: 'bold',
                fontSize: 48,
                letterSpacing: '-2%',
                color: '#800000',
                marginBottom: 48,
            }
        }>
            {children}
        </Text>
    );
}

export const Header2 = ({children}) => {
    return (
        <Text style={
            {
                fontWeight: 'bold',
                fontSize: 36,
                letterSpacing: '-2%',
                marginBottom: 36,
            }
        }>
            {children}
        </Text>
    );
}

export const Header3 = ({children}) => {
    return (
        <Text style={
            {
                fontWeight: 'semibold',
                fontSize: 24,
                letterSpacing: '-2%',
                marginBottom: 24,
            }
        }>
            {children}
        </Text>
    );
}

export const Header4 = ({children}) => {
    return (
        <Text style={
            {
                fontWeight: 'semibold',
                fontSize: 22,
                letterSpacing: '-2%',
                marginBottom: 22,
            }
        }>
            {children}
        </Text>
    );
}

export const Header5 = ({children}) => {
    return (
        <Text style={
            {
                fontWeight: 'semibold',
                fontSize: 17,
                letterSpacing: '-2%',
                marginBottom: 17,
            }
        }>
            {children}
        </Text>
    );
}