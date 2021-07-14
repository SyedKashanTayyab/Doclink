import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, Image, Text, Alert, Platform, DeviceEventEmitter } from 'react-native';
import { Container, Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-picker';
var RNFS = require('react-native-fs');
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import AppInfo from '../modules/AppInfoNativeModule';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import AppButton from '../components/AppButton';
import FontSize from '../utils/FontSize';
import FloatingLabel from '../components/CustomFloatingTextInput';
import { SafeAreaView } from 'react-navigation';
import NavigationBar from '../components/NavigationBar';
import realm from '../schemas/realm'
import API from '../services/API';
import { API_URL, URL_IMAGE_UPLOAD } from '../utils/Constant';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DropdownPickerModal from '../components/DropdownPickerModal';
import AsyncImageView from '../services/AsyncImageView';

let bgimg = require('../assets/images/login_screen_bg.png');

const defaultOptions = {
    title: 'Choose Option',
    customButtons: [],
    cancelButtonTitle: 'Cancel',
    takePhotoButtonTitle: 'Take Photo',
    chooseFromLibraryButtonTitle: "Choose from Library",
    // storageOptions: {
    //     skipBackup: false,
    //     path: 'media',
    // },
    maxWidth: 800,
    maxHeight: 600,
    quality: 1,
    allowsEditing: true
};

class AuthProfileInfoScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            nameFieldPlaceholder: 'Type your name here',
            pmdc: '',
            avatar: '',
            spinner: false,
            checked: false,
            specialization: null,
            spacializationPlaceholder: "Speciality",
            errors: { name: "", pmdc: "", specialization: "", },
            arraySpecialization: [],
            dropDownPickerVisible: false,
            isSpecializationSelected: false,
            refCodePlaceholder: "Who helped you download? (Optional)",
            refCode: '',
            showRefCodeField: false,
            showPMDCField: false,
            showSpecialityField: false,
            selectedPhoto: null,
            requesting: false
        };
    }

    componentDidMount = async () => {
        var data = await appHelper.getData("user_data");
        if (AppInfo.TARGET == "doctor") {
            this.setState({
                name: data.name,
                pmdc: data.pmdc_number,
                specialization: data.specialization_id ? data.specialization_id : "",
                spacializationPlaceholder: (data.specialization == "") ? "Speciality" : (data.specialization == null) ? "Speciality" : data.specialization,
                isSpecializationSelected: true,
                nameFieldPlaceholder: "Name",
                avatar: data.avatar,
                showPMDCField: (appHelper.isNull(data.pmdc_number) == true) ? true : false,
                showSpecialityField: (appHelper.isNull(data.specialization) == true) ? true : false,
            })
            this._getDoctorSpecializationsList()
        } else {
            this.setState({
                name: data.name,
                nameFieldPlaceholder: "Name",
                avatar: data.avatar,
                refCode: data.reference_code_signup,
                showRefCodeField: (appHelper.isNull(data.reference_code_signup) == true) ? true : false,
            })
        }
    }

    //Update Input Values
    updateValue(text, field) {
        if (field == 'mobile') {
            this.setState({ mobile: text })
        }
    }

    handleDropdownPickup = () => {
        // console.log("handleDropdownPickup",);
        this.setState({ dropDownPickerVisible: true, })
    }

    handleSelectedItem = (item) => {
        const { errors, specialization } = this.state;

        if (item == null) {
            // errors.specialization = true;
            this.setState({ dropDownPickerVisible: false, })
        } else {
            errors.specialization = false;
            this.setState({ errors, dropDownPickerVisible: false, })
            // UPDATE CATEGORY STATE HERE
            // console.log("the selected item was", item, item.label, item.value);
            this.setState({ specialization: item.value, spacializationPlaceholder: item.label, isSpecializationSelected: true, });
        }
    }

    handleOnFocus = (key) => {
        // console.log("refCode", key );
        if (key == "refCode")
            this.setState({ refCodePlaceholder: "Reference code", })

    }

    _getDoctorSpecializationsList = async () => {
        try {
            const res = await API.get(API_URL.DOCTOR_SPECIALIZATIONS_LIST);
            if (res) {
                if (res.status == 'Success') {
                    const { data } = await res;
                    let arrDocSpec = []
                    data.map((object) => {
                        arrDocSpec.push({
                            label: object.name,
                            value: object.id,
                        })
                    })
                    this.setState({ arraySpecialization: arrDocSpec })

                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            Alert.alert('_getDoctorSpecializationsList', error);
        }
    }

    handleSubmit = () => {
        console.log("======= adfasdfsadf ======")
        try {

            const { errors, name, pmdc } = this.state;
            // VALIDATE FORM FIELDS
            this.handleValidation();

            if (AppInfo.TARGET == "doctor") {
                if ((errors.name == "" || errors.name == null) && errors.specialization == "" && errors.pmdc == "")
                    this.updateProfileInfo();
            } else {
                if (errors.name == "") {
                    this.updateProfileInfo();
                }
            }

        } catch (error) {
            console.log(error)
        }


    }

    handleValidation = async () => {
        const { errors, name, pmdc } = this.state

        // VALIDATE NAME FIELD
        await this.validateName()

        if (AppInfo.TARGET == "doctor") {
            // VALIDATE PMDC FIELD
            // await this.validatePMDC()

            // VALIDATE SPACIALIZATION FIELD
            await this.validateSpacialization()
        }
    }

    validateName = () => {
        const { errors, name } = this.state;
        // console.log("validateName errors.name =>", errors.name);
        if (name == null) {
            errors.name = "Name is required";
            this.setState({ errors, nameFieldPlaceholder: (name == "") ? 'Type your name here' : "Name" })
            return false;
        } else if (name == '') {
            errors.name = "Name is required";
            this.setState({ errors, nameFieldPlaceholder: (name == "") ? 'Type your name here' : "Name" })
            return false;
        } else {
            errors.name = "";
            this.setState({ errors, nameFieldPlaceholder: (name == "") ? 'Type your name here' : "Name" })
        }
    }

    validatePMDC = () => {
        const { errors, pmdc } = this.state;
        // console.log("validateName errors.name =>", errors.name);
        if (pmdc == '') {
            errors.pmdc = "PMDC is required";
            this.setState({ errors, })
            return false;
        } else {
            errors.pmdc = "";
            this.setState({ errors, })
        }
    }

    validateSpacialization = () => {
        const { errors, specialization } = this.state;
        // Alert.alert('', "Category Required");
        if (specialization == '' || specialization == null) {
            errors.specialization = true;
            this.setState({ errors, });
            return false;
        } else {
            errors.specialization = false;
            this.setState({ errors, })
        }
    }

    updateProfileInfo = async () => {

        try {
            this.r2Ref.refs.btn.props.onStartRequesting()

            const { name, pmdc, specialization, refCode } = this.state
            const user_id = await appHelper.getItem("user_id");

            console.log("updateProfileInfo")
            if (name == "" || name == null) {
                return;
            }

            let params = {
                "user_id": user_id,
                "name": name,
                "role": AppInfo.TARGET
            }

            if (AppInfo.TARGET == "doctor") {
                params['pmdc'] = pmdc
                params['specialty'] = specialization
            } else {
                params['reference_code'] = refCode
            }

            if (this.state.selectedPhoto != null) {
                const response_image = await API.postMultipart(URL_IMAGE_UPLOAD, this.state.selectedPhoto.uri, [], null, 'image')
                let final_image_url = response_image.data.base_url + "/" + response_image.data.image_name
                params['avatar'] = final_image_url
            }

            console.log(params)

            const res = await API.post(API_URL.AUTH_PROFILE_UPDATE, params);
            // console.log("res from register doc API; ==> \n", res);
            if (res) {

                const { data } = await res;

                this.setState({ spinner: false });

                if (res.status == 'Success') {
                    // Successfully Registered Message and redirect to login

                    this.r2Ref.refs.btn.props.onClear()

                    var auth_user = {
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        avatar: data.avatar,
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
                        total_connected_users: AppInfo.TARGET == "doctor" ? data.total_patients : data.total_doctors
                    };

                    await appHelper.setData("user_data", auth_user);
                    setTimeout(() => {

                        DeviceEventEmitter.removeListener('otpReceived', (message) => {
                            console.log("DeviceEventEmitter.removeListener('otpReceived'")
                            console.log(message)
                        })

                        this.props.navigation.navigate('Home');
                    }, 150);

                }
                else if (res.status == 'Error') {
                    this.r2Ref.refs.btn.props.onClear()
                    setTimeout(() => {
                        Alert.alert('', res.message);
                    }, 150);
                }
            }
        }
        catch (error) {
            this.r2Ref.refs.btn.props.onClear()
            this.setState({ spinner: false });
            setTimeout(() => {
                Alert.alert('Alert', error);
            }, 150);
        }
    }

    // Show Image picker control where user can capture photo from camera or select from photo gallery
    async _showImagePicker() {

        ImagePicker.showImagePicker(defaultOptions, (response) => {
            // console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                console.warn('111')
                // const source = { uri: response.uri };
                // this.setState({
                //     avatar: response.uri,
                // });
                // const source = { uri: response.uri };
                // var path = RNFS.DocumentDirectoryPath + '/media/';
                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                // console.warn(response)
                this.setState({ selectedPhoto: response, showSaveButton: true, avatar: response.uri })
            }
        });
    }

    render() {

        console.log("==== render ====")

        const { checked, errors, isSpecializationSelected, spacializationPlaceholder, arraySpecialization, dropDownPickerVisible, refCodePlaceholder } = this.state;
        let dropdownArrow = dropDownPickerVisible ? <Icon type="MaterialIcons" name="arrow-drop-up" style={{ color: colors.strokeColor1, }} /> : <Icon type="MaterialIcons" name="arrow-drop-down" style={{ color: colors.strokeColor1, }} />
        var splashName = ""
        if (AppInfo.TARGET == "doctor") {
            splashName = require('../assets/images/header_logo_image_doctor.png')
        }
        else if (AppInfo.TARGET == "patient") {
            splashName = require('../assets/images/header_logo_image.png')
        }

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: colors.primary }]} forceInset={{ top: 'never', bottom: 'never' }} >
                    <KeyboardAwareScrollView style={{ flex: 1, width: wp(100), backgroundColor: colors.transparent, }} extraScrollHeight={10} scrollEnabled={false} showsVerticalScrollIndicator={false}>
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
                            <View style={[{ flex: 1, width: "100%", height: hp(23), marginBottom: hp(4), backgroundColor: colors.transparent, }]}>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <Image style={styles.logoImage} source={splashName} />
                                </View>
                            </View>


                            <View style={{ backgroundColor: colors.white, paddingBottom: 30, height: hp(67), }}>
                                <View style={{ marginHorizontal: hp(1.8), }}>
                                    <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, borderColor: 'transparent', marginBottom: hp(0), borderRadius: wp('5%') / 2, marginTop: hp(-6), paddingBottom: hp(0), }]}>
                                        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 0 }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('xLarge'), color: colors.black }}> Profile Info </Text>
                                        </View>

                                        <View style={{}}>
                                            <KeyboardAwareScrollView contentContainerStyle={{}} scrollEnabled={false}>

                                                <View style={{ flex: 1, height: "auto", paddingBottom: hp(3), marginHorizontal: hp(3), }}>
                                                    <View style={[{ width: "100%", height: hp(20), alignItems: "center" }]}>
                                                        <TouchableOpacity
                                                            onPress={() => { this._showImagePicker() }}
                                                            style={[GlobalStyles.imageContainer, { width: hp(16), height: hp(16), borderRadius: hp(16) / 2, borderColor: colors.white, marginTop: hp(2.5), }]}
                                                        >

                                                            <AsyncImageView
                                                                style={{ backgroundColor: 'blue', zIndex: 50, }}
                                                                width={"100%"}
                                                                height={"100%"}
                                                                directory={"images"}
                                                                url={this.state.avatar}
                                                                placeholderImage={require('../assets/images/dummy.png')}
                                                                selectedImage={this.state.selectedPhoto}
                                                                onBegin={(res) => {
                                                                    console.log("Begin", res)
                                                                }}
                                                                onProgress={(res) => {
                                                                    console.log("AuthProfile Progress", res)
                                                                }}
                                                                onFinish={(res) => {
                                                                    console.log("Finish", res)
                                                                }}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>

                                                    {
                                                        (AppInfo.TARGET == "doctor")
                                                            ? <>
                                                                {/* Name */}
                                                                <FloatingLabel
                                                                    labelStyle={[GlobalStyles.labelStyle, { left: wp(14), }]}
                                                                    inputStyle={[GlobalStyles.inputStyle, (errors && errors.name != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), }]}
                                                                    style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                                                    value={this.state.name}
                                                                    onChangeText={name => this.setState({ name })}
                                                                    onFocus={() => {
                                                                        this.setState({ nameFieldPlaceholder: "Name*" })
                                                                    }}
                                                                    onBlur={this.validateName}
                                                                    error={(errors && errors.name != "") ? true : false}
                                                                    callingCode="Dr."
                                                                    maxLength={25}
                                                                >
                                                                    {/* PLACEHOLDER */}
                                                                    {(errors && errors.name != "") ? errors.name : this.state.nameFieldPlaceholder}
                                                                </FloatingLabel>

                                                                {/* PMDC number Field */}
                                                                {
                                                                    this.state.showPMDCField
                                                                        ? <FloatingLabel
                                                                            labelStyle={[GlobalStyles.labelStyle,]}
                                                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.pmdc != "") ? GlobalStyles.inputErrorStyle : {}]}
                                                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                                                            value={this.state.pmdc}
                                                                            onChangeText={pmdc => this.setState({ pmdc })}
                                                                            keyboardType='default'
                                                                            // onFocus={this.setState({ refCodePlaceholder: "Who helped you download? (Optional)" })}
                                                                            // onBlur={this.validatePMDC}
                                                                            error={(errors && errors.pmdc != "") ? true : false}
                                                                            maxLength={11}
                                                                        >
                                                                            {/* PLACEHOLDER */}
                                                                            {(errors && errors.pmdc != "") ? errors.pmdc : 'PMDC Number'}
                                                                        </FloatingLabel>
                                                                        : null
                                                                }

                                                                {
                                                                    this.state.showSpecialityField
                                                                        ? <TouchableOpacity onPress={this.handleDropdownPickup} style={[(errors && errors.specialization != "") ? GlobalStyles.borderError : (!isSpecializationSelected) ? GlobalStyles.borderGray : GlobalStyles.borderPrimary, { flexDirection: "row", justifyContent: 'center', marginTop: 20, height: hp(7), borderRadius: wp(1), }]}>
                                                                            <View style={[{ flex: 1, flexDirection: "row", }]}>
                                                                                <View style={{ flex: 1, justifyContent: "center", }}>
                                                                                    <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.placeholderColor, paddingLeft: wp(5), }]}>
                                                                                        {spacializationPlaceholder}
                                                                                    </Text>
                                                                                </View>
                                                                                <View style={[{ justifyContent: "center", alignItems: "center", width: wp(10), paddingLeft: wp(0), }]}>
                                                                                    {dropdownArrow}
                                                                                </View>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                        : null
                                                                }

                                                            </>
                                                            : <>
                                                                {/* Name */}
                                                                <FloatingLabel
                                                                    labelStyle={[GlobalStyles.labelStyle, {}]}
                                                                    inputStyle={[GlobalStyles.inputStyle, (errors && errors.name != "") ? { borderColor: colors.errorColor, } : {}]}
                                                                    style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                                                    value={this.state.name}
                                                                    onChangeText={name => this.setState({ name })}
                                                                    onFocus={() => {
                                                                        // if (this.state.name = "") {
                                                                        this.setState({ nameFieldPlaceholder: "Name*" })
                                                                        // }
                                                                    }}
                                                                    onBlur={this.validateName}
                                                                    error={(errors && errors.name != "") ? true : false}
                                                                    maxLength={25}
                                                                >
                                                                    {/* PLACEHOLDER */}
                                                                    {(errors && errors.name != "") ? errors.name : this.state.nameFieldPlaceholder}
                                                                </FloatingLabel>

                                                                {
                                                                    this.state.showRefCodeField
                                                                        ? <FloatingLabel
                                                                            labelStyle={[GlobalStyles.labelStyle, {}]}
                                                                            inputStyle={[GlobalStyles.inputStyle,]}
                                                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                                                            value={this.state.refCode}
                                                                            onChangeText={refCode => this.setState({ refCode })}
                                                                            onFocus={() => this.handleOnFocus("refCode")}
                                                                            onBlur={() => this.setState({ refCodePlaceholder: "Who helped you download? (Optional)" })}
                                                                        // error={(errors && errors.refCode != "") ? true : false}
                                                                        >
                                                                            {/* PLACEHOLDER */}
                                                                            {refCodePlaceholder}
                                                                        </FloatingLabel>
                                                                        : null
                                                                }
                                                            </>
                                                    }

                                                    <AppButton
                                                        ref={r2Ref => this.r2Ref = r2Ref}
                                                        onPressButton={this.handleSubmit}
                                                        requesting={this.state.requesting}
                                                        styles={{ marginTop: 20 }}
                                                        title={"Next"}>

                                                    </AppButton>
                                                </View>
                                            </KeyboardAwareScrollView>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <DropdownPickerModal
                                visible={dropDownPickerVisible}
                                selectedItem={this.handleSelectedItem}
                                dropdownData={arraySpecialization}
                            />
                        </ImageBackground>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </Container >
        );
    }
}

export default AuthProfileInfoScreen;

const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#fff'
    },
    logoImage: {
        width: wp('100%'),
        height: hp('15%'),
        resizeMode: 'contain',
        marginBottom: 0
    },
    headerFont: {
        fontFamily: Fonts.HelveticaNeue,
        color: '#fff',
        fontSize: hp('3%')
    }
});