import React, { Component, Fragment } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableWithoutFeedback, Alert, Image, TouchableOpacity, TouchableHighlight, Animated, Clipboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Icon, Button, Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors'
import { TextInput } from 'react-native-paper';
import { ConnectDoctor } from '../api/Profile';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getDoctorProfile } from '../api/Doctor'
import Share from 'react-native-share';
import NavigationBar from '../components/NavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FontSize from '../utils/FontSize';
import AppButton from '../components/AppButton';
import { isAndroid, isIOS, isDoctor, isPatient, APP_STORE_URL } from '../utils/Constant';

class ConnectPatientScreen extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        referral_code: '',
        refCodeCopied: false,
    };

    async componentDidMount() {
        var data = await appHelper.getData("user_data");
        this.makeRemoteRequest();
        this.setState({ referral_code: data.referral_code })
    }

    writeToClipboard = async () => {
        var data = await appHelper.getData("user_data");
        await Clipboard.setString(data.referral_code);
        // alert('Copied to Clipboard!');
        this.setState({ refCodeCopied: true, })
    };

    makeRemoteRequest = async () => {

        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");

        var params = { doctor_id: user_id, access_token: access_token }
        try {
            const res = await getDoctorProfile(params);
            if (res) {
                const { data } = await res;
                console.log("data", data);
                if (data.status == 'Success') {
                    this.setState({ data: data.data });

                    var _data = await appHelper.getData("user_data");
                    _data['referral_code'] = data.data.referral_code
                    await appHelper.setData("user_data", _data);

                    this.setState({ referral_code: data.data.referral_code })

                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error)
        }
    }

    handleReferNow = () => {
        let inviteLink = "";
        if (isAndroid) {
            if (isPatient)
                inviteLink = APP_STORE_URL.ANDROID_DOCTOR
            if (isDoctor)
                inviteLink = APP_STORE_URL.ANDROID_PATIENT
        }
        if (isIOS) {
            if (isPatient)
                inviteLink = APP_STORE_URL.IOS_DOCTOR;
            if (isDoctor)
                inviteLink = APP_STORE_URL.IOS_PATIENT
        }
        const shareOptions = {
            title: 'Share Referral Code',
            message: 'Hello, connect with me on DocLink using my Referral Code ' + this.state.referral_code + '.\n' + inviteLink,
        };
        Share.open(shareOptions)
    }


    render() {
        const { spinner, refCodeCopied, referral_code } = this.state;

        let shareIcon = require('../assets/icons/icon_sharing.png');

        // console.warn("render() referral_code", referral_code);

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Connect With Patient"}
                    context={this.props}
                    // removeBackButton={false}
                    backButton={true}
                    right={null}
                    noShadow={true}
                    transparent={Platform.OS === 'ios' ? true : false}
                />
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                {/* MAIN CONTENT SECTION */}
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100), backgroundColor: colors.bgColor, }} enableOnAndroid={true} extraScrollHeight={75}>
                    <ScrollView
                        style={{
                            backgroundColor: colors.transparent,
                            width: "100%",
                        }}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: hp(1.8),
                            marginHorizontal: hp(5),
                            backgroundColor: colors.transparent,
                        }}>

                            <View style={{ flex: 1, padding: hp('2%'), justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column', }} >

                                <View style={[styles.spaceMargin, { width: hp('16%'), height: hp('16%'), backgroundColor: colors.white, borderRadius: hp('8%'), padding: hp('4%'), justifyContent: 'center', alignItems: 'center' }]}>
                                    <Image
                                        source={require("../assets/icons/icon_refer_patient.png")}
                                        resizeMode="contain"
                                        style={{ flex: 1, }}
                                    />
                                </View>

                                <Text style={[styles.spaceMargin, { fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('medium'), color: colors.black, marginHorizontal: wp(0), marginVertical: hp('2%'), textAlign: 'center' }]}>
                                    Share this Code with your patients and connect on DocLink
                                </Text>

                                <View style={[styles.spaceMargin, { width: "100%", justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', marginBottom: hp('2%') }]}>

                                    <Text style={[{ fontFamily: Fonts.RobotoLight, fontSize: FontSize('medium'), color: "#3f3f3f", textAlign: 'center', marginBottom: hp(0.5), }]}>Your Referral Code</Text>

                                    <View style={[{ width: wp('50%'), height: hp('7%'), borderColor: colors.borderColor, borderRadius: 5, borderWidth: 1, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={[{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('medium'), color: colors.black, textAlign: 'center' }]}>{this.state.referral_code}</Text>
                                    </View>

                                    <TouchableOpacity style={{ height: hp('3%'), marginTop: hp(1.5), }} onPress={() => {
                                        this.writeToClipboard()
                                    }}>
                                        <Text style={[{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('medium'), color: colors.primaryText, textAlign: 'center' }]}>Tap to copy</Text>
                                    </TouchableOpacity>
                                    {refCodeCopied ?
                                        <View style={{ height: hp(3.5), backgroundColor: "#acd0f0", borderRadius: wp(1), paddingHorizontal: wp(4.5), paddingVertical: hp(0), marginTop: hp(3), justifyContent: "center", alignItems: "center", }}>
                                            <Text style={{ fontSize: FontSize('small'), lineHeight: FontSize('small'), color: colors.white, textTransform: "capitalize", }}>copied</Text>
                                        </View>
                                        :
                                        null
                                    }
                                </View>

                                <AppButton
                                    onPressButton={this.handleReferNow}
                                    styles={{ marginTop: hp(2), }}
                                    icon={shareIcon}
                                    title={"Refer now"}
                                ></AppButton>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAwareScrollView>
            </Container>
        );
    }
}

export default ConnectPatientScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {

        height: hp('12%'),
        justifyContent: 'center',
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: hp('3%')
    },
    headerIcon: {
        color: '#fff'
    },
    headerTitle: {
        fontSize: wp('5%'),
        fontFamily: Fonts.RobotoRegular,
        color: '#fff',
        marginLeft: hp('3%')
    },
    spaceMargin: {
        marginTop: hp('3%')
    }
});