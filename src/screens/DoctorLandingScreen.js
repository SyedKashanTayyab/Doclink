import React, { Component } from 'react';
import { View, Text, ImageBackground, Image, TouchableWithoutFeedback } from 'react-native';
import { Container, Button } from 'native-base';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import { hp, wp } from '../utils/Utility';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import NavigationBar from '../components/NavigationBar';
import Share from 'react-native-share';
import { SafeAreaView } from 'react-navigation';

let splashName = require('../assets/images/doctor_landing_bg.png')
let logo = require('../assets/images/Doctor_landing_logo.png')
let backArrow = require('../assets/icons/back_arrow.png');

class DoctorLandingScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }


    handleSignIn = () => {
        this.props.navigation.navigate("Login");
    }

    handleInvite = () => {
        console.log("handle invite fired",);
        let inviteLink = "hello@doclink.health";
        // message: `Hello, I am now using DocLink to connect with my doctor remotely in case I want to ask them something. You should also try it out! ${inviteLink}`,
        const shareOptions = {
            title: 'Email',
            message: `${inviteLink}`,
        };
        Share.open(shareOptions)
    }

    render() {
        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: colors.white, justifyContent: 'center' }]} forceInset={{ top: 'never', bottom: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        // title={"Sign Up"}
                        titleView={null}
                        removeBackButton={true}
                        context={this.props}
                        backButton={true}
                        right={null}
                        noShadow={true}
                        transparent={true}
                    />
                    {/* NAVIGATION HEADER END*/}
                    <ImageBackground style={{ justifyContent: 'center', height: hp(103), }} resizeMode="cover" source={splashName} >
                        <View style={{ backgroundColor: "transparent", justifyContent: 'center', alignItems: 'center', height: hp(20), }}>
                            <Image source={logo} style={[GlobalStyles.imgContain, {}]} />
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', }}>
                            <Text
                                style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, lineHeight: 23, color: colors.white, backgroundColor: colors.transparent, textAlign: 'center', marginTop: hp(8), marginBottom: hp(5), }}
                            >
                                DocLink is currently <Text style={{ fontFamily: Fonts.HelveticaNeueBold }}>"By Invitation Only".</Text> {"\n"} If you are keen to join, please drop us a {"\n"} note at {""}
                                <TouchableWithoutFeedback onPress={this.handleInvite}>
                                    <Text style={{ textDecorationLine: 'underline', fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.white, backgroundColor: colors.transparent, }}>hello@doclink.health</Text>
                                </TouchableWithoutFeedback>
                            </Text>
                            <Text
                                style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, lineHeight: 23, color: colors.white, backgroundColor: colors.transparent, textAlign: 'center', marginTop: hp(0), marginBottom: hp(5), }}
                            >
                                If you are already a member {"\n"} then click below to sign in
                            </Text>
                        </View>
                        {/* SIGN IN BUTTON */}
                        <Button
                            style={[{ width: wp(45), height: hp(7), alignSelf: 'center', marginBottom: -hp(8), justifyContent: 'center', borderRadius: wp(2) / 2, backgroundColor: colors.white, zIndex: 0 }]}
                            onPress={this.handleSignIn}
                        >
                            <Text style={{ color: colors.primaryText, fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase", fontSize: FontSize('small'), }}>Sign In</Text>
                            <View style={{ width: wp(4.8), height: wp(4.8), marginLeft: wp(3), }}>
                                <Image source={backArrow} style={[GlobalStyles.imgContain]} />
                            </View>
                        </Button>
                    </ImageBackground>
                </SafeAreaView>
            </Container>
        );
    }
}

export default DoctorLandingScreen;
