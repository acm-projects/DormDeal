import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Header1 } from '../components/text_styles'
import Search_Bar from '../components/search_bar'
import Nav_Button from '../components/nav_button'
import Settings_Holder from '../components/settings_holder'
import Settings_Button from '../components/settings_button'
import Base from '../components/base'
import styles from '../../root_styles'

import Logo from '../../../assets/images/icon.png'

const Settings = () => {
    return (
        <Base>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Header1 style={{textAlign: 'left', marginBottom: 30}}>
                    settings
                </Header1>
            </View>
            
            {/* needs button later */}
            <Search_Bar placeholder='Search'/>

            <View style={{marginTop: 20, gap: 20}}>
                <Settings_Holder id={1}>
                    <Settings_Button text="Messages" style={{backgroundColor: "#FF0000"}}/>
                    <Settings_Button text="Profile Changes" style={{backgroundColor: "#00FF00"}}/>
                    <Settings_Button text="That" style={{backgroundColor: "#0000FF"}}/>
                </Settings_Holder>
                <Settings_Holder id={2}>
                    <Settings_Button text="Messages" style={{backgroundColor: "#FF0000"}}/>
                    <Settings_Button text="This" style={{backgroundColor: "#00FF00"}}/>
                    <Settings_Button text="That" style={{backgroundColor: "#0000FF"}}/>
                </Settings_Holder>
                <Settings_Holder id={3}>
                    <Settings_Button text="Messages" style={{backgroundColor: "#FF0000"}}/>
                    <Settings_Button text="This" style={{backgroundColor: "#00FF00"}}/>
                    <Settings_Button text="That" style={{backgroundColor: "#0000FF"}}/>
                </Settings_Holder>
            </View>

            <View style={styles.navigation}>
                <Nav_Button href="/" text="Home Page"></Nav_Button>
            </View>
        </Base>
    );
}

export default Settings

const settings_styles = StyleSheet.create({
})