import { StyleSheet, Text, View, Image } from 'react-native'

const Default_Text = ({children, style}) => {
    return (
        <Text style={
            [
                {
                    fontFamily: 'Outfit',
                    fontWeight: 'regular',
                    textAlign: 'center',
                    color: "#000",
                    fontSize: 17,
                },

                style
            ]
        }>
            {children}
        </Text>
    )
}

export default Default_Text;