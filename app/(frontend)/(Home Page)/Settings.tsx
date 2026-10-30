import { View, ScrollView, } from 'react-native';
import { Header1 } from '../components/text_styles'
import Search_Bar from '../components/search_bar'
import Back_Button from '../components/back_button'
import Settings_Holder from '../components/settings_holder'
import Settings_Button from '../components/settings_button'
import Base from '../components/base'
import styles from '../../root_styles'

import Logo from '../../../assets/images/icon.png'

const Settings = () => {
    return (
        <Base>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Back_Button href="/home"/>
                <Header1 style={{textAlign: 'left', marginBottom: 0, marginLeft: 15}}>
                    settings
                </Header1>
            </View>
            
            {/* needs button later */}
            <Search_Bar style={{marginTop: 30}} placeholder='Search'/>

            <ScrollView 
                contentContainerStyle={{marginTop: 20, gap: 20}}
                showsVerticalScrollIndicator={false}
                >
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
                    <Settings_Button text="Messages" style={{backgroundColor: "#FF0000"}}/>
                    <Settings_Button text="This" style={{backgroundColor: "#00FF00"}}/>
                    <Settings_Button text="That" style={{backgroundColor: "#0000FF"}}/>
                    <Settings_Button text="Messages" style={{backgroundColor: "#FF0000"}}/>
                    <Settings_Button text="This" style={{backgroundColor: "#00FF00"}}/>
                    <Settings_Button text="That" style={{backgroundColor: "#0000FF"}}/>
                </Settings_Holder>
            </ScrollView>
        </Base>
    );
}

export default Settings