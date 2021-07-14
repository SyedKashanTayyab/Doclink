import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, Image, Text, Alert, TouchableOpacity, Platform } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Fonts } from '../utils/Fonts';
import Countdown from '../components/Countdown';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { Verify } from '../api/Authentication';
import AppInfo from '../../src/modules/AppInfoNativeModule';
import firebase from '@react-native-firebase/app';
import GlobalStyles from '../styles/GlobalStyles';
import colors from '../utils/Colors';
import AppButton from '../components/AppButton';
import OTPInputView from '@twotalltotems/react-native-otp-input'
import NavigationBar from '../components/NavigationBar';
import { SafeAreaView } from 'react-navigation';
import OtpVerification from '../components/OtpVerification';
import { API_URL, isAndroid } from '../utils/Constant';
import API from '../services/API';
import FontSize from '../utils/FontSize';
import PermissionPopup from '../components/PermissionPopup';
var moment = require('moment');
let bgimg = require('../assets/images/login_screen_bg.png');


const OTP_KEY = {
    OTP_CALL_VERIFY: "otp_call_verification",
    SKIP_VERIFY: "skip_verification",
}

class VerifyScreen extends Component {
    constructor(props) {
        super(props);
        const { navigation } = this.props;
        const data = navigation.getParam('data', 0);
        const is_verified = navigation.getParam('is_verified', 0);
        const is_number_verified = navigation.getParam('is_number_verified', 0);

        this.state = {
            loading: false,
            data: [],
            code: '',
            is_verified: is_verified,
            is_number_verified: is_number_verified,
            show_resent_option: false,
            counter_reset: false,
            showCounter: true,
            showSkipBtn: false,
            popupVisible: false,
            callMeBtnTitle: "call me",
            showOr: true,
            showCallReqText: false,
            counterType: "text",
            counterTitle: "Resend code in",
            showCallMeBtn: true,
            callMeBtnIsActive: false,
            permissionPopup: {
                title: "",
                key: "",
                message: "",
            },
            receivedAuthCode: '',
        };
    }

    async componentDidMount() {
        const { navigation } = this.props;
        const data = navigation.getParam('data', 0);

        const auth_code = navigation.getParam('auth_code', 0);
        await this.setState({ data: data, code: auth_code, });

        global.authCodeTime = moment().utc(true)
    }

    showResendOption = () => {
        const { is_verified, is_number_verified } = this.state;
        // console.log("showResendOption fired ", is_verified);

        this.setState({
            show_resent_option: true,
            counter_reset: false,
            showCounter: false,
            showSkipBtn: is_number_verified === 1 ? false : true,
            showCallReqText: false,
            showCallMeBtn: true,
            showOr: true,
            callMeBtnIsActive: true,
            counterTitle: "Resend code in",
            counterType: "text",
        });
    }

    _verify = async (authCode) => {
        let params = {
            "auth_code": authCode,
            "device_identifier": await appHelper.getItem("device_identifier")
        }

        // console.log("========================",)
        // console.log("_verify \n", params)
        // console.log("========================",)

        if (authCode.toString().length != 4) return;

        try {
            // SET THE LAODER - TRUE
            this.setState({ loading: true, })
            const res = await API.post(API_URL.AUTH_VERIFY, params);
            // const res = await Verify(params);
            if (res) {
                const data = res;
                if (data.status == 'Success') {

                    console.log("_verify \n", data.data)
                    var auth_user = {
                        id: data.data.id,
                        name: data.data.name,
                        email: data.data.email,
                        phone: data.data.phone,
                        avatar: data.data.avatar,
                        gender: data.data.gender,
                        specialization: data.data.specialization ? data.data.specialization : "",
                        specialization_id: data.data.specialization_id ? data.data.specialization_id : 0,
                        mrn: data.data.mrn ? data.data.mrn : "",
                        ratings: data.data.ratings ? data.data.ratings.toFixed(1) : 0,
                        referral_code: data.data.referral_code ? data.data.referral_code : "",
                        pmdc_number: data.data.pmdc_number ? data.data.pmdc_number : "",
                        last_sync_timestamp: data.data.last_sync_timestamp ? data.data.last_sync_timestamp : "",
                        status_text: data.data.status_text ? data.data.status_text : "",
                        is_verified: data.data.is_verified,
                        is_number_verified: data.data.is_number_verified,
                        reference_code_signup: data.data.reference_code_signup,
                        total_connected_users: AppInfo.TARGET == "doctor" ? data.data.total_patients : data.data.total_doctors
                    };

                    await appHelper.setData("user_data", auth_user);
                    global.user_data = auth_user;
                    await appHelper.setItem("access_token", data.data.access_token);
                    await appHelper.setItem("user_id", data.data.id.toString());

                    if (data.data.last_sync_timestamp != null) {
                        await appHelper.setItem("last_sync_timestamp", data.data.last_sync_timestamp);
                    }

                    const access_token = await appHelper.getItem("access_token");
                    global.accessToken = access_token;
                    const fcmToken = await firebase.messaging().getToken();
                    var tokenParams = {
                        user_id: data.data.id.toString(),
                        access_token: access_token,
                        fcmToken: fcmToken
                    }

                    try {
                        const result = await API.post(API_URL.PATIENT_ADD_FCM_TOKEN, tokenParams);
                        const data = result
                        // console.log('response.data', result)
                        if (data.status == "Success") {
                            // SET THE LAODER - FALSE
                            this.setState({ loading: false, counter_reset: true, showCounter: false, receivedAuthCode: "" })
                            await appHelper.setItem('fcmToken', fcmToken);
                        }
                    }
                    catch (error) {
                        // SET THE LAODER - FALSE
                        this.setState({ loading: false, receivedAuthCode: "" })
                        console.log(error)
                    }
                    this.props.navigation.navigate('AuthProfileInfo');
                }
                else if (data.status == 'Error') {
                    // SET THE LAODER - FALSE
                    Alert.alert('', data.message);
                    this.setState({ loading: false, receivedAuthCode: "" })
                }
            }
        }
        catch (error) {
            // SET THE LAODER - FALSE
            this.setState({ loading: false, receivedAuthCode: "" })
            console.warn(error)
        }
    }

    _login = async () => {
        // console.log("_login fired");

        this.setState({ loading: true });
        let params = {
            "app_version": this.state.data.app_version,
            "device_brand": this.state.data.device_brand,
            "device_identifier": this.state.data.device_identifier,
            "device_model": this.state.data.device_model,
            "device_name": this.state.data.device_name,
            "device_os": this.state.data.device_os,
            "device_token": this.state.data.device_token,
            "flavor": this.state.data.flavor,
            "mobile": this.state.data.mobile,
            "platform": this.state.data.platform,
        }

        // console.log("Login _params", params);

        try {
            const res = await API.post(API_URL.AUTH_MOBILE, params);
            // console.log("login api hit res.data ==>", res.data);
            if (res) {

                this.setState({ spinner: false });

                if (res.status == 'Success') {
                    this.setState({ loading: false, code: res.data.auth_code });
                    // Alert.alert(res.message);
                    // Alert.alert(`A login verification code has been sent. ${data.data.auth_code}`);
                }
                else if (res.status == 'Error') {
                    Alert.alert(res.message);
                }
            }
        }
        catch (error) {
            this.setState({ spinner: false });
            setTimeout(() => {
                Alert.alert('Alert', error);
            }, 150);
        }
    }

    onChangeText = (value) => {
        this.setState({
            text: value
        })
    }

    handleCallMe = async (isShow) => {
        if (!isShow) return;
        // console.log("handleCallMe fired()");
        try {
            this.setState({ loading: true });
            let params = {
                "app_version": this.state.data.app_version,
                "device_brand": this.state.data.device_brand,
                "device_identifier": this.state.data.device_identifier,
                "device_model": this.state.data.device_model,
                "device_name": this.state.data.device_name,
                "device_os": this.state.data.device_os,
                "device_token": this.state.data.device_token,
                "flavor": this.state.data.flavor,
                "mobile": this.state.data.mobile,
                "platform": this.state.data.platform,
            }

            const res = await API.post(API_URL.AUTH_VOICE_OTP, params);
            // console.log("handleCallMe res", res);
            const { data } = res;

            // console.log("======= ON handleCallMe DATA ===========\n", data,)

            if (res.status == "Success")
                this.setState({
                    loading: false, // set the loading false
                    popupVisible: false,
                    showSkipBtn: false,
                    show_resent_option: false,
                    showOr: false,
                    showCallMeBtn: false,
                    showCallReqText: true,
                    counterTitle: "Recall in",
                    counterType: "button",
                    counter_reset: true,
                    showCounter: true,
                });

        } catch (error) {
            // SET THE LAODER - FALSE
            this.setState({ loading: false, })
            Alert.alert('', error);
        }

    }

    handleSkipPress = () => {
        // console.log("handleSkipPress fired()");

        this.setState({ popupVisible: true, }); // Set the Permission Popup True
        // UPDATE PERMISSIO OBJECT
        this.setState({
            permissionPopup: {
                title: "Skip Verification",
                key: OTP_KEY.SKIP_VERIFY,
                message: `You will receive limited access to the DocLink application until phone number is verified from My Profile. Proceed?`,
            }
        })

        // REDIRECT TO DASHBOARD SCREEN
        // this.props.navigation.navigate("Home");

    }

    closePopup = () => {
        this.setState({ popupVisible: false, });
    }

    handlePermissionVerification = (key) => {
        // console.log("handlePermissionVerification key ==>", key);
        // ON YES PRESS CALL
        this.setState({ popupVisible: false, }); // HIDE POPUP
        if (key == OTP_KEY.SKIP_VERIFY) // ON SKIP PRESS
            this.handleSkipVerificationRequest();
    }

    handleSkipVerificationRequest = async () => {
        try {
            this.setState({ loading: true });
            let params = {
                "app_version": this.state.data.app_version,
                "device_brand": this.state.data.device_brand,
                "device_identifier": this.state.data.device_identifier,
                "device_model": this.state.data.device_model,
                "device_name": this.state.data.device_name,
                "device_os": this.state.data.device_os,
                "device_token": this.state.data.device_token,
                "flavor": this.state.data.flavor,
                "mobile": this.state.data.mobile,
                "platform": this.state.data.platform,
            }

            const res = await API.post(API_URL.AUTH_SKIP, params);
            // console.log("handlePermissionVerification res", res);
            this.setState({
                loading: false, // set the loading false
            });

            const { data } = res;

            console.log("======= ON SKIP DATA ===========\n", data, "\n res", res)
            var auth_user = {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                avatar: data.avatar,
                gender: data.gender,
                specialization: data.specialization ? data.specialization : "",
                specialization_id: data.specialization_id ? data.specialization_id : 0,
                mrn: data.mrn ? data.mrn : "",
                ratings: data.ratings ? data.ratings.toFixed(1) : 0,
                referral_code: data.referral_code ? data.referral_code : "",
                pmdc_number: data.pmdc_number ? data.pmdc_number : "",
                last_sync_timestamp: data.last_sync_timestamp ? data.last_sync_timestamp : "",
                status_text: data.status_text ? data.status_text : "",
                is_verified: data.is_verified,
                is_number_verified: data.is_number_verified,
            };

            await appHelper.setData("user_data", auth_user);
            global.user_data = auth_user;
            await appHelper.setItem("access_token", data.access_token);
            await appHelper.setItem("user_id", data.id.toString());

            if (data.last_sync_timestamp != null) {
                await appHelper.setItem("last_sync_timestamp", data.last_sync_timestamp);
            }

            const access_token = await appHelper.getItem("access_token");
            global.accessToken = access_token;
            const fcmToken = await firebase.messaging().getToken();
            var tokenParams = {
                user_id: data.id.toString(),
                access_token: access_token,
                fcmToken: fcmToken
            }

            try {
                const result = await API.post(API_URL.PATIENT_ADD_FCM_TOKEN, tokenParams);
                const data = result
                // console.log('response.data', result)
                if (data.status == "Success") {
                    // SET THE LAODER - FALSE
                    this.setState({ loading: false, })
                    await appHelper.setItem('fcmToken', fcmToken);
                }
            }
            catch (error) {
                // SET THE LAODER - FALSE
                this.setState({ loading: false, })
                Alert.alert('', error);
            }

            // REDIRECT TO DASHBOARD SCREEN
            this.props.navigation.navigate('AuthProfileInfo');

        } catch (error) {
            // SET THE LAODER - FALSE
            this.setState({ loading: false, })
            Alert.alert('', error);
        }
    }


    render() {
        const _intervalTime = 30;
        const { showCounter, showSkipBtn, popupVisible, callMeBtnTitle, showOr, showCallReqText, showCallMeBtn, counterType, counterTitle, permissionPopup, callMeBtnIsActive, is_verified } = this.state;
        let screenTitle = ""
        let splashName = ""

        if (AppInfo.TARGET == "doctor") {
            splashName = require('../assets/images/header_logo_image_doctor.png')
            screenTitle = ""
        }
        else if (AppInfo.TARGET == "patient") {
            splashName = require('../assets/images/header_logo_image.png')
            screenTitle = ""
        }


        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: colors.primary }]} forceInset={{ top: 'never', bottom: 'never' }} >
                    <ImageBackground style={{ justifyContent: 'center', height: "100%", }} resizeMode="cover" source={bgimg} >
                        {/* NAVIGATION HEADER */}
                        <NavigationBar
                            // title={"Sign Up"}
                            titleView={null}
                            removeBackButton={false}
                            context={this.props}
                            backButton={true}
                            right={null}
                            noShadow={true}
                            transparent={Platform.OS === 'ios' ? true : false}
                            exclusiveBg={colors.transparent}
                        />
                        {/* NAVIGATION HEADER END*/}

                        <KeyboardAwareScrollView style={{ flex: 1, width: wp(100), backgroundColor: colors.transparent, }} extraScrollHeight={75} scrollEnabled={false}>
                            <View style={[{ flex: 1, width: "100%", height: hp(23), marginBottom: hp(4), backgroundColor: colors.transparent, }]}>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Image style={styles.logoImage} source={splashName} />
                                    <Text style={styles.headerFont}>{screenTitle}</Text>
                                </View>
                            </View>

                            <View style={{ backgroundColor: colors.white, paddingBottom: 30, flex: 1, height: hp(67), }}>
                                <View style={{ marginHorizontal: hp(1.8), }}>
                                    <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, borderColor: 'transparent', marginBottom: hp(1), borderRadius: wp('5%') / 2, marginTop: hp(-6), paddingBottom: hp(3), }]}>
                                        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('xLarge'), color: '#000' }}> OTP Verification </Text>
                                        </View>

                                        <View style={{ marginHorizontal: 20, marginBottom: hp(2), backgroundColor: colors.transparent }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.black, textAlign: "center", lineHeight: FontSize('xLarge'), }}>Please enter 4 digit OTP code {'\n'} sent to
                                                <Text style={{ color: colors.primaryText }}> {this.state.data.mobile}</Text>
                                            </Text>
                                            {/* <Text>{this.state.code ? this.state.code : null}</Text> */}
                                        </View>
                                        {
                                            isAndroid ?
                                                <View style={{ height: hp(10), backgroundColor: colors.transparent }}>
                                                    <OtpVerification onOTPFilled={(code) => {

                                                        let time = moment().utc(true)
                                                        if (code.length > 3) {
                                                            let authCodeTime = moment(global.authCodeTime)
                                                            let diff = time.diff(authCodeTime, 'second')
                                                            if (diff < 3) {
                                                                return;
                                                            } else {
                                                                global.authCodeTime = moment().utc(true)
                                                                this._verify(code)
                                                            }
                                                        }

                                                    }} />
                                                </View>
                                                :
                                                // OTP HANDLER FOR IOS
                                                <View style={{ marginTop: hp(0), marginBottom: hp(0), height: hp(10), alignItems: "center", backgroundColor: colors.transparent }}>
                                                    <OTPInputView
                                                        style={{ width: "80%", height: hp(10) }}
                                                        pinCount={4}
                                                        // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                                                        onCodeChanged={code => { this.setState({ code }) }}
                                                        secureTextEntry={true}
                                                        autoFocusOnLoad={true}
                                                        codeInputFieldStyle={styles.underlineStyleBase}
                                                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                                                        onCodeFilled={(code => {
                                                            this._verify(code)
                                                        })}
                                                    />
                                                </View>
                                        }
                                    </View>
                                    <View style={{ display: (this.state.show_resent_option == true) ? "flex" : "none" }}>
                                        <AppButton
                                            onPressButton={() => {
                                                this.setState({ show_resent_option: false })
                                                this._login()
                                                this.setState({ counter_reset: true, showCounter: true, showSkipBtn: false, callMeBtnIsActive: false, })
                                            }}
                                            styles={{ marginTop: hp(1), marginBottom: hp(1), }}
                                            title={"Resend code"}
                                        ></AppButton>
                                    </View>

                                    {/* COUNTER VIEW */}
                                    <Countdown
                                        title={counterTitle}
                                        type={counterType}
                                        showCounter={showCounter}
                                        intervalTime={_intervalTime}
                                        resetTime={this.state.counter_reset}
                                        onFinish={this.showResendOption}
                                    />

                                    {/* DIVIDER START */}
                                    {showOr &&
                                        <View style={{ marginVertical: hp(1), backgroundColor: colors.transparent, flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
                                            <View style={{ height: 1, width: 45, backgroundColor: colors.borderColor, }}></View>
                                            <Text style={{ marginHorizontal: hp(2), fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.black, textAlign: "center", lineHeight: FontSize('xLarge'), }}>
                                                or
                                    </Text>
                                            <View style={{ height: 1, width: 45, backgroundColor: colors.borderColor, }}></View>
                                        </View>
                                    }
                                    {/* DIVIDER END */}

                                    {/* CALL ME BUTTON BLOCK */}
                                    {
                                        showCallMeBtn &&
                                        <AppButton
                                            onPressButton={() => this.handleCallMe(callMeBtnIsActive)}
                                            styles={[callMeBtnIsActive ? styles.callMeBtnStyle : styles.callMeBtnInactiveStyle]}
                                            title={callMeBtnTitle}
                                        ></AppButton>
                                    }


                                    {/* CALL REQ TEXT BLOCK*/}
                                    {showCallReqText &&
                                        <View style={{ marginVertical: hp(1), backgroundColor: colors.transparent, flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
                                            <Text style={{ marginHorizontal: hp(2), fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), lineHeight: FontSize('small'), color: colors.gray, textAlign: "center", }}>
                                                Your Request has been sent. You will {'\n'} Receive a Call shortly.
                                    </Text>
                                        </View>
                                    }
                                    {/* CALL REQ TEXT END */}

                                    {/* SKIP BUTTON START */}
                                    {showSkipBtn &&
                                        <View style={{ marginVertical: hp(2), justifyContent: "center", alignItems: "center", }}>
                                            <TouchableOpacity onPress={this.handleSkipPress} style={{}}>
                                                <Text style={styles.skipBtn}>
                                                    Skip
                                            </Text>
                                            </TouchableOpacity>
                                        </View>
                                    }
                                    {/* SKIP BUTTON END */}

                                </View>
                            </View>

                            {/* Spinner */}
                            <CustomSpinner visible={this.state.loading} />

                            <PermissionPopup
                                popupTitle={permissionPopup.title}
                                message={permissionPopup.message}
                                showPopup={popupVisible}
                                onPressYes={() => this.handlePermissionVerification(permissionPopup.key)}
                                onPressNo={this.closePopup}
                            />

                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
            </Container>
        );
    }
}

export default VerifyScreen;

const styles = StyleSheet.create({
    logoImage: {
        width: wp('100%'),
        height: hp('15%'),
        resizeMode: 'contain',

    },
    headerFont: {
        fontFamily: Fonts.HelveticaNeueBold,
        color: '#fff',
        fontSize: hp('3%')
    },
    underlineStyleBase: {
        width: wp(15),
        height: hp(7),
        borderRadius: wp(1)
    },
    underlineStyleHighLighted: {
        borderColor: colors.btnBgColor,
    },
    textInput: {
        marginTop: 20,
        width: 200,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1
    },
    skipBtn: {
        marginHorizontal: hp(1),
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        color: colors.gray,
        textAlign: "center",
        lineHeight: FontSize('xLarge'),
        textDecorationLine: "underline",
    },
    callMeBtnStyle: {
        marginTop: hp(1), marginBottom: hp(0),
    },
    callMeBtnInactiveStyle: {
        backgroundColor: colors.grayFour,
    }

});
