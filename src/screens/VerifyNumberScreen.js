import React, { Component } from 'react';
import { View, StyleSheet, Text, Alert, Platform } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeviceInfo from 'react-native-device-info';
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import FloatingLabel from '../components/CustomFloatingTextInput';
import AppButton from '../components/AppButton';
import Countdown from '../components/Countdown';
import OtpVerification from '../components/OtpVerification';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import { API_URL, isAndroid } from '../utils/Constant';
import API from '../services/API';
import { Verify } from '../api/Authentication';
import { AddFcmToken } from '../api/Patient';
import firebase from '@react-native-firebase/app';
import AppInfo from '../../src/modules/AppInfoNativeModule';
import { findPhoneNumbersInText, parsePhoneNumber } from 'libphonenumber-js'


class VerifyNumberScreen extends Component {
    constructor(props) {
        super(props);
        const { navigation } = this.props;
        const phoneNumber = navigation.getParam('phoneNumber', 0);
        const _redirection = navigation.getParam('redirection', 0);

        console.log("==============================");
        console.log("phoneNumber ==", phoneNumber);

        const _phoneNumber = parsePhoneNumber(phoneNumber)

        _phoneNumber.formatInternational() === '+1 213 373 4253'
        _phoneNumber.formatNational() === '(213) 373-4253'
        console.log("phoneNumber ==", _phoneNumber.nationalNumber);

        this.state = {
            spinner: false,
            phoneNumber: phoneNumber,
            nationalNumber: _phoneNumber.nationalNumber,
            phoneFieldMode: "icon-label-view",
            showVerifyBtn: true,
            errors: { phoneNumber: "", },
            loading: false,
            data: [],
            code: '',
            show_resent_option: false,
            counter_reset: false,
            showCounter: true,
            callMeBtnTitle: "call me",
            showOr: true,
            showCallReqText: false,
            counterType: "text",
            counterTitle: "Resend code in",
            showCallMeBtn: true,
            callMeBtnIsActive: false,
            verifyOtp: false,
            redirection: _redirection
        };
    }

    async componentDidMount() {
        const { navigation } = this.props;
        const data = navigation.getParam('data', 0);

        const auth_code = navigation.getParam('auth_code', 0);
        await this.setState({ data: data, code: auth_code, });

    }

    showResendOption = () => {
        const { } = this.state;
        // console.log("showResendOption fired ", is_verified);

        this.setState({
            show_resent_option: true,
            counter_reset: false,
            showCounter: false,
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
            const res = await Verify(params);
            if (res) {
                const { data } = await res;
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
                        var result = await AddFcmToken(tokenParams);
                        const { data } = await result
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
                        console.log(error)
                    }

                    //Check New User
                    // if (AppInfo.TARGET == "patient") {
                    // var userid = data.data.id.toString();
                    // try {
                    //     const res = await CheckRedirection(userid);
                    //     const { data } = await res;
                    //     if (data.status == 'Success') {
                    //         // SET THE LAODER - FALSE
                    //         this.setState({ loading: false, })

                    //         // if (!data.data.length || data.data == false) {
                    //         //     this.props.navigation.navigate('Clinic');
                    //         // } else {
                    //         // this.props.navigation.navigate('Home');
                    //         // }
                    //         return;
                    //     }
                    //     else if (data.status == 'Error') {
                    //         console.warn('======>error');
                    //         this.props.navigation.navigate('Clinic');
                    //     }
                    // }
                    // catch (error) {
                    //     // SET THE LAODER - FALSE
                    //     this.setState({ loading: false, })
                    //     console.warn('', error);
                    // }
                    // }
                    this.props.navigation.navigate(this.state.redirection);
                }
                else if (data.status == 'Error') {
                    // SET THE LAODER - FALSE
                    this.setState({ loading: false, })
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            // SET THE LAODER - FALSE
            this.setState({ loading: false, })
            console.warn(error)
        }
    }

    _login = async () => {
        console.log("_login fired");

        this.setState({ spinner: true });

        try {
            let params = {
                "mobile": this.state.phoneNumber,
                "device_identifier": await appHelper.getItem('device_identifier'),
                "device_token": DeviceInfo.getUniqueId(),
                "device_brand": DeviceInfo.getBrand(),
                "device_name": await DeviceInfo.getDeviceName(),
                "flavor": AppInfo.TARGET,
                "device_model": DeviceInfo.getModel(),
                "platform": Platform.OS === "android" ? "android" : "ios",
                "app_version": DeviceInfo.getVersion(),
                "device_os": DeviceInfo.getSystemVersion(),
            }

            console.log("Login _params", params);

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
            console.log("====================");
            console.log(error);
            console.log("====================");
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
        console.log("handleCallMe fired()");
        try {
            this.setState({ loading: true });
            let params = {
                "mobile": this.state.phoneNumber,
                "device_identifier": await appHelper.getItem('device_identifier'),
                "device_token": DeviceInfo.getUniqueId(),
                "device_brand": DeviceInfo.getBrand(),
                "device_name": await DeviceInfo.getDeviceName(),
                "flavor": AppInfo.TARGET,
                "device_model": DeviceInfo.getModel(),
                "platform": Platform.OS === "android" ? "android" : "ios",
                "app_version": DeviceInfo.getVersion(),
                "device_os": DeviceInfo.getSystemVersion(),
            }

            console.log("handleCallMe _params", params);

            const res = await API.post(API_URL.AUTH_VOICE_OTP, params);
            console.log("handleCallMe res", res);
            const { data } = res;

            console.log("======= ON handleCallMe DATA ===========\n", data,)

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

    handleVerifyNow = () => {
        console.log("handleVerifyNow");
        this._login()
        this.setState({ showVerifyBtn: false, verifyOtp: true, })

    }


    render() {
        const { spinner, phoneNumber, nationalNumber, showVerifyBtn, errors, counterType, counterTitle, showCounter, callMeBtnTitle, showOr, showCallReqText, showCallMeBtn, callMeBtnIsActive, verifyOtp, loading } = this.state;
        const _intervalTime = 30;
        // console.log('showCallMeBtn', showCallMeBtn);

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: colors.white }]} forceInset={{ top: 'never' }} >
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Verify Mobile Number"}
                        context={this.props}
                        // removeBackButton={false}
                        // onBackButtonPress={() => this.props.navigation.navigate('Setting')}
                        backButton={true}
                        right={null}
                        transparent={false}
                        noShadow={true}
                    />
                    {/* NAVIGATION HEADER END*/}

                    {/* Spinner */}
                    <CustomSpinner visible={loading} />


                    {/* NAVIGATION HEADER END*/}

                    <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} extraScrollHeight={75} scrollEnabled={false}>
                        {/* MAIN CONTENT SECTION */}
                        <View style={{
                            flex: 1,
                            marginTop: hp(1.8),
                            marginHorizontal: hp(1.8),
                            backgroundColor: colors.transparent,
                        }}>

                            {/* PHONE NUMBER FIELD */}
                            <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: hp(3), }]}>
                                <FloatingLabel
                                    labelStyle={[GlobalStyles.labelStyle, { left: wp(14), color: colors.borderColor, }]}
                                    inputStyle={[GlobalStyles.inputStyle, (errors && errors.phoneNumber != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), borderColor: colors.borderColor, color: colors.borderColor, }]}
                                    callingCodeStyle={[{ color: colors.borderColor, }]}
                                    style={[{ justifyContent: "center", textAlignVertical: "center", width: wp(80), }]}
                                    value={nationalNumber}
                                    onChangeText={phoneNumber => this.setState({ phoneNumber })}
                                    // onFocus={this.handleOnFocus}
                                    onBlur={this.validatePhone}
                                    keyboardType='phone-pad'
                                    error={(errors && errors.phoneNumber != "") ? true : false}
                                    callingCode="+92"
                                    maxLength={12}
                                    masking={true}
                                    maskType={'custom'}
                                    autoFocus={false}
                                    editable={false}
                                    maskOptions={{
                                        mask: '999 9999999',
                                        validator: function (value, settings) {
                                            var re = /^\(?([0-9]{5})\)?[-.●]?([0-9]{7})[-.●]?([0-9]{1})$/;
                                            return re.test(value);
                                        }
                                    }}
                                >
                                    {/* PLACEHOLDER */}
                                    {(errors && errors.phoneNumber != "") ? errors.phoneNumber : 'Phone*'}
                                </FloatingLabel>
                            </View>

                            <View style={{}}>
                                <AppButton
                                    onPressButton={this.handleVerifyNow}
                                    styles={[showVerifyBtn ? styles.btnActiveStyle : styles.btnInactiveStyle]}
                                    title={"Verify Now"}
                                ></AppButton>
                            </View>

                            {verifyOtp &&
                                <>
                                    <View style={{ backgroundColor: colors.white, borderColor: 'transparent', margin: 15, borderRadius: wp('5%') / 2, marginTop: hp(4), marginBottom: hp(3), }}>
                                        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('xLarge'), color: '#000' }}> OTP Verification </Text>
                                        </View>

                                        <View style={{ marginHorizontal: 20, marginBottom: hp(3), }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.black, textAlign: "center", lineHeight: FontSize('xLarge'), }}>Please enter 4 digit OTP code {'\n'} send to
                                                <Text style={{ color: colors.primaryText }}> {phoneNumber}</Text>
                                            </Text>
                                            {/* <Text>{this.state.code ? this.state.code : null}</Text> */}
                                        </View>
                                        {
                                            isAndroid ?
                                                <OtpVerification onOTPFilled={this._verify} />
                                                :
                                                // OTP HANDLER FOR IOS
                                                <View style={{ marginTop: hp(3), marginBottom: hp(5), alignItems: "center", }}>
                                                    <OTPInputView
                                                        style={{ width: "80%", height: hp(9), }}
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
                                            styles={{ marginTop: hp(2), marginBottom: hp(1), }}
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
                                </>
                            }




                        </View>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </Container>
        );
    }
}

export default VerifyNumberScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    btnActiveStyle: {
        marginBottom: hp(0),
    },
    btnInactiveStyle: {
        backgroundColor: colors.grayFour,
    },
    callMeBtnStyle: {
        marginTop: hp(1), marginBottom: hp(0),
    },
    callMeBtnInactiveStyle: {
        backgroundColor: colors.grayFour,
    },

});
