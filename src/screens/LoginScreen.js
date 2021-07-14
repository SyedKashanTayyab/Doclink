import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, Image, Text, Alert, Platform, } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Container, } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';

import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import AppInfo from '../../src/modules/AppInfoNativeModule';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import AppButton from '../components/AppButton';
import FontSize from '../utils/FontSize';
import FloatingLabel from '../components/CustomFloatingTextInput';
import { SafeAreaView } from 'react-navigation';
import NavigationBar from '../components/NavigationBar';
import { findPhoneNumbersInText } from 'libphonenumber-js'
import realm from '../schemas/realm'
import API from '../services/API';
import { API_URL } from '../utils/Constant';

let bgimg = require('../assets/images/login_screen_bg.png');

class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            checked: false,
            mobile: '',
            errors: { phoneNumber: "", },
        };
    }

    componentDidMount = async () => {
        try {
            realm.write(() => {
                realm.deleteAll();
            });
            console.log("cleared Realm")
        } catch (e) {
            console.log("Setting Screen Delete all data", e);
        }
    }

    //Update Input Values
    updateValue(text, field) {
        if (field == 'mobile') {
            this.setState({ mobile: text })
        }
    }

    //Login API Function
    _login = async () => {

        this.r2Ref.refs.btn.props.onStartRequesting();

        let phoneNumberData = findPhoneNumbersInText("+92" + this.state.mobile, 'PK')

        if (phoneNumberData.length == 0) {
            this.r2Ref.refs.btn.props.onClear();
            Alert.alert('', "Incorrect mobile number");
            return;
        }
        // console.log(phoneNumberData[0].number.number)
        this.setState({ spinner: true });
        let params = {
            "mobile": phoneNumberData[0].number.number,
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

        try {
            const res = await API.post(API_URL.AUTH_MOBILE, params);
            // console.log("login api hit res ==>", res);
            if (res) {

                this.r2Ref.refs.btn.props.onClear();
                this.setState({ spinner: false });

                if (res.status == 'Success') {
                    this.props.navigation.navigate('Verification', {
                        data: params, auth_code: res.data.auth_code,
                        is_verified: res.data.is_verified, // is user profile verified
                        is_number_verified: res.data.is_number_verified, // is user number verified
                    });
                }
                else if (res.status == 'Error') {
                    setTimeout(() => {
                        Alert.alert('', res.message);
                    }, 150);
                }
            }
        }
        catch (error) {
            this.r2Ref.refs.btn.props.onClear();
            this.setState({ spinner: false });
            setTimeout(() => {
                Alert.alert('Alert', error);
            }, 150);
        }
    }

    validatePhone = () => {
        const { errors, mobile } = this.state;

        if (mobile == '') {
            errors.phoneNumber = "Phone Required";
            this.setState({ errors, })
            return false;
        }
        if (mobile.length < 10) {
            errors.phoneNumber = "Invalid Phone Number";
            this.setState({ errors, })
            return false;
        } else {
            errors.phoneNumber = "";
            this.setState({ errors, })
            this._login();
        }
    }

    render() {
        const { checked, errors } = this.state;
        var screenTitle = ""
        var splashName = ""
        if (AppInfo.TARGET == "doctor") {
            splashName = require('../assets/images/header_logo_image_doctor.png')
        }
        else if (AppInfo.TARGET == "patient") {
            splashName = require('../assets/images/header_logo_image.png')
        }

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: colors.primary }]} forceInset={{ top: 'never', bottom: 'never' }}>
                    <ImageBackground style={{ justifyContent: 'center', height: "100%", }} resizeMode="cover" source={bgimg} >
                        <NavigationBar
                            titleView={null}
                            removeBackButton={true}
                            context={this.props}
                            backButton={true}
                            right={null}
                            noShadow={true}
                            transparent={Platform.OS === 'ios' ? true : false}
                            exclusiveBg={colors.transparent}
                        />
                        <KeyboardAwareScrollView style={{ flex: 1, width: wp(100), backgroundColor: colors.transparent, }} extraScrollHeight={75} scrollEnabled={false}>
                            <View style={[{ flex: 1, width: "100%", height: hp(23), marginBottom: hp(4), backgroundColor: colors.transparent, }]}>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Image style={styles.logoImage} source={splashName} />
                                    <Text style={styles.headerFont}>{screenTitle}</Text>
                                </View>
                            </View>

                            {/* Spinner */}
                            <CustomSpinner visible={this.state.spinner} />
                            <View style={{ backgroundColor: colors.white, paddingBottom: 30, flex: 1, height: hp(67), }}>
                                <View style={{ marginHorizontal: hp(1.8), }}>
                                    <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, borderColor: 'transparent', marginBottom: hp(3), borderRadius: wp('5%') / 2, marginTop: hp(-6), paddingBottom: hp(3), }]}>
                                        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('xLarge'), color: '#000' }}> Welcome </Text>
                                        </View>
                                        <View style={[GlobalStyles.alignCenter, { backgroundColor: colors.transparent, marginTop: hp(2), }]}>

                                            <Text style={{ width: wp(80), fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: colors.valentino, marginBottom: hp(2) }}>
                                                {
                                                    (AppInfo.TARGET == "patient") ? "Enter your number to create an account or log in" : "Enter your number to proceed"
                                                }
                                            </Text>
                                            <FloatingLabel
                                                labelStyle={[GlobalStyles.labelStyle, { left: wp(14), }]}
                                                inputStyle={[GlobalStyles.inputStyle, (errors && errors.phoneNumber != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), }]}
                                                style={[{ justifyContent: "center", textAlignVertical: "center", width: wp(80), }]}
                                                value={this.state.mobile}
                                                onChangeText={mobile => this.setState({ mobile })}
                                                onBlur={this.validatePhone}
                                                keyboardType='phone-pad'
                                                error={(errors && errors.phoneNumber != "") ? true : false}
                                                callingCode="+92"
                                                maxLength={12}
                                                maskType={'custom'}
                                                autoFocus={false}
                                                masking={true}
                                                maskOptions={{
                                                    mask: '999 9999999',
                                                    validator: function (value, settings) {
                                                        var re = /^\(?([0-9]{5})\)?[-.●]?([0-9]{7})[-.●]?([0-9]{1})$/;
                                                        return re.test(value);
                                                    }
                                                }}
                                            >
                                                {/* PLACEHOLDER */}
                                                {(errors && errors.phoneNumber != "") ? errors.phoneNumber : 'Mobile Number*'}
                                            </FloatingLabel>

                                            <AppButton
                                                ref={r2Ref => this.r2Ref = r2Ref}
                                                onPressButton={this.validatePhone}
                                                styles={{ marginTop: hp(3), }}
                                                title={"next"}
                                            ></AppButton>
                                        </View>
                                    </View>
                                </View>

                                {/* {signup} */}
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground >
                </SafeAreaView>
            </Container>
        );
    }
}

export default LoginScreen;

const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#fff'
    },
    logoImage: {
        width: wp('100%'),
        height: hp('15%'),
        resizeMode: 'contain',
        marginBottom: 10
    },
    headerFont: {
        fontFamily: Fonts.HelveticaNeue,
        color: '#fff',
        fontSize: hp('3%')
    }
});