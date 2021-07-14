import React, { Component, Fragment } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableWithoutFeedback, Alert, Image, TouchableOpacity, TouchableHighlight, Animated } from 'react-native';
import { Icon, Button, Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors'
import { TextInput } from 'react-native-paper';
import { ConnectDoctor } from '../api/Profile';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import { SafeAreaView } from 'react-navigation';
import NavigationBar from '../components/NavigationBar';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import FloatingLabel from '../components/CustomFloatingTextInput';
import AppButton from '../components/AppButton';
// import PermissionPopup from '../components/PermissionPopup';

class ConnectDoctorScreen extends Component {

    state = {
        referral_code: '',
        heightReferralView: new Animated.Value(hp(7)),
        showReferralCodeView: false,
        viewReferralOpacity: new Animated.Value(0),
        errors: { refCode: "", },
        // popupVisible: false,
        // permissionPopup: {
        //     title: "Profile Verification",
        //     key: "",
        //     message: "Your profile is not verified. Please verify your mobile number through OTP verification.",
        // }
    };

    // API Request
    requestConnectDoctor = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");

        let params = {
            "code": this.state.referral_code,
            user_id: user_id,
            access_token: access_token,
        }
        try {
            const res = await ConnectDoctor(params);
            if (res) {

                this.setState({ spinner: false });

                const { data } = res;
                console.log("data", data);
                // if(data.error === 10)
                //     this.showProfileVerificationPopup();
                if (data.status == 'Success') {
                    var object = data.data

                    // Create new object
                    let newObject = ChatRoomModel.createOrUpdate(object)

                    // Navigate
                    this.props.navigation.navigate('Chat', { chatroom: newObject })
                }
                else if (data.status == 'Error') {
                    setTimeout(() => {
                        Alert.alert('', data.message);
                    }, 150);
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

    // Button Handler Connect with doctor 
    connectBtnHandler = async () => {
        const { referral_code, errors } = this.state;

        let user_data = await appHelper.getData("user_data");
        console.log("==================================");
        console.log("user_data =", user_data.is_verified);
        console.log("==================================");

        
        if (referral_code == '') {
            errors.refCode = "Referral Code Required";
            this.setState({ errors, })
            return false;
        } else {
            errors.refCode = "";
            this.setState({ errors, })
            this.requestConnectDoctor()
        }

        // if (referral_code.length == 0) {
        //     Alert.alert('Alert', 'Please enter valid referral code');
        // } else {
        //     this.requestConnectDoctor()
        // }
    }

    // showProfileVerificationPopup = () => {
    //     console.log("showProfileVerificationPopup fired()");
    //     this.setState({ popupVisible: true, });
    // }

    // closePopup = () => {
    //     this.setState({ popupVisible: false, });
    // }

    // handleNumberVerification = () => {
    //     const userData = global.user_data;
    //     this.setState({ popupVisible: false, })
    //     // REDIRECT TO VERIFICATION SCREEN
    //     this.props.navigation.navigate('VerifyNumber', { phoneNumber: userData.phone, });
    // }

    handleQRCodeRequest = () => {
        // REDIRECT TO ScanQRCode SCREEN
        this.props.navigation.navigate('ScanQRCode', {});
    }

    render() {
        const { errors } = this.state;
        // console.log(this.state.heightReferralView)
        const icon_name = (this.state.showReferralCodeView == false) ? "angle-right" : "angle-down"
        const icon_color = (this.state.showReferralCodeView == false) ? "#b5b5b5" : "#1994fb"

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: "#e3f2ff", }]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Connect With Doctor"}
                        context={this.props}
                        // removeBackButton={false}
                        backButton={true}
                        right={null}
                    />
                    {/* NAVIGATION HEADER END*/}

                    {/* MAIN CONTENT SECTION */}
                    <View style={{
                        flex: 1,
                        marginTop: hp(1.8),
                        marginHorizontal: hp(1.8),
                        backgroundColor: colors.transparent,
                    }}>

                        {/* Spinner */}
                        <CustomSpinner visible={this.state.spinner} />

                        <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, marginVertical: hp('2%'), textAlign: 'center' }}>Scan the QR Code or add the Referral Code of your doctor.</Text>
                        <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, marginVertical: hp(0), textAlign: 'center' }}>If your doctor is not available on DocLink send us their information and we will contact them.</Text>

                        <View style={{ marginTop: hp(4) }}>

                            {/* SEARCH DOCTOR */}
                            {/* <View style={{ backgroundColor: colors.white, borderRadius: 10, width: "100%", height: hp(7), flexDirection: 'column' }}>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("SearchDoctor")}
                                    style={{ flexDirection: 'row', padding: wp('2%'), justifyContent: 'flex-start', alignItems: 'center', marginLeft: wp('2%'), }}
                                >
                                    <Fragment>
                                        <Icon type="FontAwesome" name='search' style={{ width: 32, height: 32, color: "#777777", padding: 0 }} />
                                        <View style={{ flexDirection: 'column', marginLeft: wp('2%'), flex: 1, justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.black, }}>Search Doctor</Text>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('xMini'), color: colors.black, }}>lorem ipsum lorem ipsome lorem</Text>
                                        </View>
                                        <View style={{ flexDirection: 'column', marginRight: wp('2%') }}>
                                            <Icon name='angle-right' type="FontAwesome" style={{ color: '#b5b5b5' }} />
                                        </View>
                                    </Fragment>
                                </TouchableOpacity>
                            </View> */}

                            {/* QR CODE OPTIONS */}
                            <View style={{ backgroundColor: colors.white, borderRadius: 10, width: "100%", height: hp(7), flexDirection: 'column', marginTop: hp('2%') }}>
                                <TouchableOpacity
                                    onPress={this.handleQRCodeRequest}
                                    style={{ flexDirection: 'row', padding: wp('2%'), justifyContent: 'flex-start', alignItems: 'center', marginLeft: wp('2%'),  }}
                                >
                                    <Fragment>
                                        <Image source={require('../assets/icons/icon_qr_code.png')}
                                            resizeMode="contain"
                                            style={{ width: 32, height: 32, }} />
                                        <View style={{ flexDirection: 'column', marginLeft: wp('2%'), flex: 1, justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.black, }}>QR Code</Text>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('xMini'), color: colors.black, }}>Scan the QR Code given by your doctor</Text>
                                        </View>
                                        <View style={{ flexDirection: 'column', marginRight: wp('2%') }}>
                                            <Icon name='angle-right' type="FontAwesome" style={{ color: '#b5b5b5' }} />
                                        </View>
                                    </Fragment>
                                </TouchableOpacity>
                            </View>

                            {/* REFERRAL CODE */}
                            <Animated.View style={[{
                                backgroundColor: colors.white, borderRadius: 10, width: "100%", height: this.state.heightReferralView, flexDirection: 'column', marginTop: hp('2%')
                            }]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (this.state.showReferralCodeView == true) {

                                            Animated.parallel([
                                                Animated.timing(this.state.viewReferralOpacity, {
                                                    toValue: 0,
                                                    duration: 200,
                                                }).start(() => {

                                                }),
                                                Animated.timing(this.state.heightReferralView, {
                                                    toValue: hp('7%'),
                                                    duration: 200,
                                                }).start(() => {
                                                    this.setState({ showReferralCodeView: false, referral_code: '' })
                                                })
                                            ])
                                        } else {
                                            Animated.parallel([
                                                Animated.timing(this.state.heightReferralView, {
                                                    toValue: hp('18%'),
                                                    duration: 200,
                                                }).start(() => {
                                                    this.setState({ showReferralCodeView: true })
                                                }),
                                                Animated.timing(this.state.viewReferralOpacity, {
                                                    toValue: 1,
                                                    duration: 200,
                                                }).start(() => {

                                                })
                                            ])
                                        }
                                    }}
                                    style={{ flexDirection: 'row', padding: wp('2%'), justifyContent: 'flex-start', alignItems: 'center', marginLeft: wp('2%') }}

                                >
                                    <Fragment>
                                        <Image source={require('../assets/icons/icon_referral.png')}
                                            resizeMode="contain"
                                            style={{ width: 32, height: 32, }} />

                                        {/* <View style={{ flexDirection: 'column', marginLeft: wp('2%'), flex: 1, justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: hp('2%'), color: '#000', }}>Referral Code</Text>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueLight, fontSize: hp('1.5%'), color: '#000', }}>Add the Referral Code given by your doctor</Text>
                                        </View> */}

                                        <View style={{ flexDirection: 'column', marginLeft: wp('2%'), flex: 1, justifyContent: 'center' }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.black, }}>Referral Code</Text>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('xMini'), color: colors.black, }}>Add the Referral Code given by your doctor</Text>
                                        </View>

                                        <View style={{ flexDirection: 'column', marginRight: wp('2%') }}>
                                            <Icon name={icon_name} type="FontAwesome" style={{ color: icon_color }} />
                                        </View>
                                    </Fragment>
                                </TouchableOpacity>
                                {
                                    this.state.showReferralCodeView == true ?
                                        <Animated.View style={{ flexDirection: 'row', padding: wp(0), justifyContent: 'center', alignItems: 'flex-end', marginTop: hp(1), opacity: this.state.viewReferralOpacity, }}>
                                            {/* <TextInput
                                                mode='outlined'
                                                underlineColorAndroid={'rgba(0,0,0,0)'}
                                                label='Enter Code'
                                                value={this.state.referral_code}
                                                keyboardType="default"
                                                onChangeText={referral_code => this.setState({ referral_code })}
                                                style={{ width: wp('60%'), height: wp('15%') }}
                                            /> */}
                                            <FloatingLabel
                                                labelStyle={[GlobalStyles.labelStyle, {}]}
                                                inputStyle={[GlobalStyles.inputStyle, (errors && errors.refCode != "") ? GlobalStyles.inputErrorStyle : {}]}
                                                style={[GlobalStyles.inputWrapper, { width: wp(60), }]}
                                                value={this.state.referral_code}
                                                onChangeText={referral_code => this.setState({ referral_code })}
                                                // onBlur={this.validatePhone}
                                                error={(errors && errors.refCode != "") ? true : false}
                                                keyboardType="default"
                                                maxLength={30}
                                            >
                                                {/* PLACEHOLDER */}
                                                {(errors && errors.refCode != "") ? errors.refCode : "Enter Code"}
                                            </FloatingLabel>
                                            <View style={{
                                                marginTop: 0,
                                                marginLeft: wp('3%'),
                                                width: wp(14),
                                                height: hp(7),
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: colors.btnBgColor,
                                            }}>
                                                <TouchableOpacity onPress={() => {
                                                    this.connectBtnHandler()
                                                }}
                                                    style={{
                                                        width: wp('6%'),
                                                        height: wp('6%'),
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Image source={require('../assets/icons/icon_connect.png')} resizeMode="center" style={{ width: "90%", height: "90%" }} />
                                                </TouchableOpacity >
                                            </View>
                                        </Animated.View>
                                        : null
                                }
                            </Animated.View>

                            {/* INVITE DOCTOR */}
                            <TouchableOpacity style={{ flexDirection: "row", justifyContent: "center", marginTop: hp(5) }} onPress={() => {
                                this.props.navigation.navigate('InviteYourDoctor')
                            }}>
                                <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('large'), color: colors.primaryText, }}>Invite Doctor</Text>
                            </TouchableOpacity>

                        </View>


                        {/* PROFILE VERIFICATION POPUP */}
                        {/* <PermissionPopup
                            popupTitle={permissionPopup.title}
                            message={permissionPopup.message}
                            showPopup={popupVisible}
                            onPressYes={this.handleNumberVerification}
                            onPressNo={this.closePopup}
                        /> */}

                    </View>
                </SafeAreaView>
            </Container>
        );
    }
}

export default ConnectDoctorScreen;

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
});