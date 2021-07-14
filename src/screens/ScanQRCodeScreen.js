import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, Alert, Platform, } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import { ConnectDoctor } from '../api/Profile';
import colors from '../utils/Colors'
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { RNCamera } from 'react-native-camera';
import { SafeAreaView } from 'react-navigation';
import NavigationBar from '../components/NavigationBar';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import PermissionPopup from '../components/PermissionPopup';

class ScanQRCodeScreen extends Component {
    constructor(props) {
        super(props);

        this.referral_code = ''
    }

    state = {
        spinner: false,
        popupVisible: false,
        permissionPopup: {
            title: "Profile Verification",
            key: "",
            message: "Your profile is not verified. Please verify your mobile number through OTP verification.",
        }
    };

    // API Request
    requestConnectDoctor = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        let params = {
            "code": this.referral_code,
            user_id: user_id,
            access_token: access_token,
        }
        try {
            const res = await ConnectDoctor(params);
            if (res) {

                this.setState({ spinner: false });

                const { data } = await res;
                if (data.error === 10)
                    this.showProfileVerificationPopup();
                else if (data.status == 'Success') {

                    var object = data.data
                    // console.log(object)

                    // Create new object
                    let newObject = ChatRoomModel.createOrUpdate(object)
                    console.log(newObject)

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
    showProfileVerificationPopup = () => {
        console.log("showProfileVerificationPopup fired()");
        this.setState({ popupVisible: true, });
    }
    closePopup = () => {
        this.setState({ popupVisible: false, });
    }
    handleNumberVerification = () => {
        const userData = global.user_data;
        this.setState({ popupVisible: false, })
        // REDIRECT TO VERIFICATION SCREEN
        this.props.navigation.navigate('VerifyNumber', { phoneNumber: userData.phone, redirection: 'ConnectDoctor' });
    }


    render() {
        const { permissionPopup, popupVisible } = this.state;
        // console.log(this.state.heightReferralView)

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: "#e3f2ff", }]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Scan Code"}
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
                        // marginHorizontal: hp(1.8),
                    }}>

                        <Text style={{
                            fontFamily: Fonts.HelveticaNeue,
                            fontSize: FontSize('medium'),
                            color: colors.black,
                            marginHorizontal: wp('5%'),
                            marginVertical: hp('2%'),
                            textAlign: 'center',
                        }}
                        >
                            Scan the <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('medium'), }}>QR Code</Text>
                        </Text>

                        <View style={{ marginTop: hp(1), overflow: "hidden", width: wp(100), height: hp(60), backgroundColor: colors.primary }}>

                            <RNCamera
                                ref={ref => {
                                    this.camera = ref;
                                }}
                                style={{
                                    flex: 1,
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                                barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
                                type={RNCamera.Constants.Type.back}
                                flashMode={RNCamera.Constants.FlashMode.auto}
                                androidCameraPermissionOptions={{
                                    title: 'Permission to use camera',
                                    message: 'We need your permission to use your camera',
                                    buttonPositive: 'Ok',
                                    buttonNegative: 'Cancel',
                                }}
                                // androidRecordAudioPermissionOptions={{
                                //     title: 'Permission to use audio recording',
                                //     message: 'We need your permission to use your audio',
                                //     buttonPositive: 'Ok',
                                //     buttonNegative: 'Cancel',
                                // }}
                                onGoogleVisionBarcodesDetected={({ barcodes }) => {
                                    console.warn(barcodes)
                                    if (Platform.OS === 'android') {
                                        if (barcodes.length > 0 && barcodes[0].type == "QR_CODE" && this.referral_code == '') {
                                            this.referral_code = barcodes[0].data

                                            // Send scanned code to server to connect with doctor
                                            this.requestConnectDoctor()
                                        }
                                    } else if (Platform.OS === 'ios') {
                                        if (barcodes.length > 0 && barcodes[0].type == "TEXT" && this.referral_code == '') {
                                            this.referral_code = barcodes[0].data

                                            // Send scanned code to server to connect with doctor
                                            this.requestConnectDoctor()
                                        }
                                    }
                                }}
                            >
                            </RNCamera>

                        </View>
                        {/* PROFILE VERIFICATION POPUP */}
                        <PermissionPopup
                            popupTitle={permissionPopup.title}
                            message={permissionPopup.message}
                            showPopup={popupVisible}
                            onPressYes={this.handleNumberVerification}
                            onPressNo={this.closePopup}
                        />

                        {/* Spinner */}
                        <CustomSpinner visible={this.state.spinner} />
                    </View>
                </SafeAreaView>
            </Container>
        );
    }
}

export default ScanQRCodeScreen;

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