import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { TouchableOpacity, } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Fonts } from '../utils/Fonts';
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';
import TourScreens from './TourScreens';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';
import { SafeAreaView } from 'react-navigation';
import { axiosClient } from '../utils/Constant';
import PermissionPopup from '../components/PermissionPopup';
import API from '../services/API';
import { API_URL } from '../utils/Constant';
import DeviceInfo from 'react-native-device-info';
import AppSocketManager from '../components/AppSocket';

import realm from '../schemas/realm'

let navListItem = [
    {
        label: "About us",
        routeLink: "About",
    },
    {
        label: "Privacy Policy",
        routeLink: "Privacy",
    },
    {
        label: "Terms & Conditions",
        routeLink: "Term",
    },
]


class HelpScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            navList: navListItem,
            modalVisible: false,
        };
    }

    handleLogout = async () => {

        // CLOSE POPUP
        this.closePopup();

        try {
            let res = await API.post(API_URL.AUTH_LOGOUT, {
                user_id: await AppHelper.getItem('user_id'),
            })
            console.log(res)
            if (res) {
                const data = await res
                if (data.status == "Success") {

                    if (global.socket != null) {
                        global.socket.disconnect();
                        console.log("Socket disconnected")

                        // let appSocket = AppSocketManager.getInstance()
                        // appSocket.disconnect()
                    }

                    AppHelper.removeItem('device_identifier')
                    AppHelper.removeItem('user_data')
                    AppHelper.removeItem('last_sync_timestamp')
                    AppHelper.removeItem('access_token')
                    AppHelper.removeItem('user_id')
                    AppHelper.removeItem('fcmToken')
                    console.log("Asyncstorage cleared")

                    this.props.navigation.replace('SplashLoading')
                }
            }
        } catch (error) {
            console.warn('Internal Server Error TWO', error);
            this.setState({ spinner: false });
        }
    }

    handleTourScreen = async (hide) => {
        this.props.navigation.navigate('AppTourHelp', { route: 'help' });
    }
    closePopup = () => {
        this.setState({ modalVisible: false, });
    }

    handleLogoutPopup = () => {
        // SHOW LOGOUT POPUP
        this.setState({ modalVisible: true, });
    }

    render() {
        const { spinner, navList, modalVisible } = this.state;

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>

                    <NavigationBar
                        title={"Help"}
                        context={this.props}
                        // removeBackButton={false}
                        onBackButtonPress={() => this.props.navigation.navigate('Setting')}
                        backButton={true}
                        right={null}
                        transparent={false}
                        noShadow={true}
                    />
                    {/* NAVIGATION HEADER END*/}

                    {/* Spinner */}
                    <CustomSpinner visible={spinner} />

                    <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} extraScrollHeight={75}>
                        <ScrollView
                            style={{
                                backgroundColor: colors.white,
                                width: "100%",
                            }}
                        >
                            <View style={{
                                flex: 1,
                                marginTop: hp(0.5),
                                marginHorizontal: hp(1.8),
                                backgroundColor: colors.transparent,
                            }}>
                                {/* NAV LINKS */}
                                {
                                    navList.map((item, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => this.props.navigation.navigate(item.routeLink)}
                                            style={[GlobalStyles.borderBottomGray, { borderBottomColor: colors.strokeColor4, paddingVertical: wp(5), flexDirection: "row", justifyContent: "space-between", alignItems: "center", }]}
                                        >
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayThree, textTransform: "capitalize", }}>{item.label}</Text>
                                            <View style={{ height: wp(4), width: wp(4), }}><Image source={require("../assets/icons/arrow_icon.png")} style={[GlobalStyles.imgContain]} /></View>
                                        </TouchableOpacity>
                                    ))
                                }

                                {/* TAKE AN APP TOUR */}
                                <TouchableOpacity
                                    onPress={() => this.handleTourScreen(true)}
                                    style={[GlobalStyles.borderBottomGray, { borderBottomColor: colors.strokeColor4, paddingVertical: wp(5), flexDirection: "row", justifyContent: "space-between", alignItems: "center", }]}
                                >
                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayThree, textTransform: "capitalize", }}>Take an app tour</Text>
                                </TouchableOpacity>

                                {/* REPORT A PROBLEM */}
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("Report")}
                                    style={[GlobalStyles.borderBottomGray, { borderBottomColor: colors.strokeColor4, paddingVertical: wp(5), flexDirection: "row", justifyContent: "space-between", alignItems: "center", }]}
                                >
                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayThree, textTransform: "capitalize", }}>report a problem</Text>
                                </TouchableOpacity>

                                {/* LOGOUT BUTTON */}
                                <TouchableOpacity
                                    onPress={this.handleLogoutPopup}
                                    style={[GlobalStyles.borderBottomGray, { borderBottomColor: colors.strokeColor4, paddingVertical: wp(5), flexDirection: "row", justifyContent: "flex-start", alignItems: "center", }]}
                                >
                                    <View style={{ height: wp(4), width: wp(4), }}><Image source={require("../assets/icons/logout-icon.png")} style={[GlobalStyles.imgContain]} /></View>
                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayThree, textTransform: "capitalize", marginLeft: wp(3), }}>Log out</Text>
                                </TouchableOpacity>

                                <PermissionPopup message={"Are you sure you want to log out?"} showPopup={modalVisible} onPressYes={this.handleLogout} onPressNo={this.closePopup} />

                            </View>
                        </ScrollView>
                    </KeyboardAwareScrollView>

                    <View style={styles.footerContainer}>
                        <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), flex: 1, textAlign: 'center', color: colors.grayThree, }]}>v{DeviceInfo.getVersion()}{global.ENV == "staging" ? ` (${DeviceInfo.getBuildNumber()})` : ""}</Text>
                    </View>

                </SafeAreaView>
            </Container>
        );
    }
}

export default HelpScreen;

const styles = StyleSheet.create({
    footerContainer: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0
    }
});