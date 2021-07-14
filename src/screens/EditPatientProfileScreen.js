import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Alert, } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-picker';
var RNFS = require('react-native-fs');
import { SafeAreaView, NavigationActions } from 'react-navigation';

import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import AppTextInput from '../components/AppTextInput';
import FontSize from '../utils/FontSize';
import AppButton from '../components/AppButton';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';

import { API_URL, URL_IMAGE_UPLOAD } from '../utils/Constant';
import FloatingLabel from '../components/CustomFloatingTextInput';
import API from '../services/API';
import AppInfo from '../modules/AppInfoNativeModule';

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

class EditPatientProfileScreen extends Component {
    constructor(props) {
        super(props);

        const userData = global.user_data;
        console.log("constructor =>", userData);

        let phoneFieldMode = userData.is_number_verified === 0 ? "icon-label-verify-view" : "icon-label-view";

        this.state = {
            mode: "icon-label-edit-view",
            avatar: userData.avatar,
            selectedPhoto: null,
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            mrNo: userData.mrn,
            status_text: userData.status_text ? userData.status_text : "Hello, I am now available on DocLink",
            specialization: userData.specialization,
            specialization_id: userData.specialization_id,
            phoneFieldMode: phoneFieldMode,
            errors: { name: "", phoneNumber: "", status: "", email: "" },
            isEditing: { name: false, phone: false, status: false, email: false },
            spinner: false,
            showSaveButton: false,
            sectionIndex: 0,
            initialPage: 0
        };

        this.props.navigation.addListener('willFocus', async () => {
            this.checkNumberVerification()
        })
    }


    checkNumberVerification = () => {
        const userData = global.user_data;
        console.log("=======================");
        console.log("checkNumberVerification =>", userData);
        console.log("=======================");


        let phoneFieldMode = userData.is_number_verified === 0 ? "icon-label-verify-view" : "icon-label-view";
        this.setState({ phoneFieldMode: phoneFieldMode, })

    }


    handleEditPress = (key) => {
        const { isEditing } = this.state;
        // SET IS EDITING TO TRUE ON CLICKED FIELD
        isEditing[key] = true;

        if (key == 'status') {
            isEditing['name'] = false;
        }
        if (key == 'name') {
            isEditing['status'] = false;
        }

        // UPDATE ISEDITING STATE
        this.setState({ isEditing, showSaveButton: true, });
    }

    validateName = () => {
        const { errors, name } = this.state;
        // console.log("validateName errors.name =>", errors.name);
        if (name == '') {
            errors.name = "Name Required";
            this.setState({ errors, })
            return false;
        } else {
            errors.name = "";
            this.setState({ errors, })
        }
    }

    validateStatus = () => {
        const { errors, status_text } = this.state;
        // console.log("validatestatus errors.status =>", errors.status);
        if (status_text == '') {
            errors.status = "Status Required";
            this.setState({ errors, })
            return false;
        } else {
            errors.status = "";
            this.setState({ errors, })
        }
    }

    validatePhone = () => {
        const { errors, phone } = this.state;

        if (phone == '') {
            // Alert.alert('', "Phone Required");
            errors.phoneNumber = "Phone Required";
            this.setState({ errors, })
            return false;
        }
        if (phone.length < 10) {
            // Alert.alert('', "Invalid Phone Number");
            errors.phoneNumber = "Invalid Phone Number";
            this.setState({ errors, })
            return false;
        } else {
            errors.phoneNumber = "";
            this.setState({ errors, })
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
                this.setState({ selectedPhoto: response, showSaveButton: true, })
            }
        });
    }

    validateProfile = () => {
        const { name, phone, status, email } = this.state;

        // VALIDATE FIELDS
        if (name == '')
            this.validateName();
        else if (email == '')
            this.validateEmail();
        // else if (phone == '' && phone.length < 10)
        //     this.validatePhone();
        else if (status == '')
            this.validateStatus();
        else
            // IF NO ERRORS THEN UPDATE USER PROFILE
            this.handleSubmit();
    }

    validateEmail = () => {
        const { errors, email } = this.state;
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (email == '') {
            // Alert.alert('', "Email Required");
            errors.email = "Email Required";
            this.setState({ errors, })
            return false;
        }
        if (reg.test(email) === false) {
            // Alert.alert('', "Invalid Email");
            errors.email = "Invalid Email";
            this.setState({ errors, });
            return false;
        } else {
            errors.email = "";
            this.setState({ errors, })
        }

    }

    // _emptyState() {
    //     this.setState({
    //         name: '',
    //         email: '',
    //         avatar: '',
    //         // gender:'',
    //     })
    // }

    _resetStack = async (stackName) => {
        // this._emptyState();
        return this.props
            .navigation
            .dispatch(NavigationActions.reset(
                {
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: stackName })
                    ]
                }));
    }

    /* On Submit */
    handleSubmit = async () => {

        const { errors, email } = this.state;
        console.log(errors)
        if (errors.name != "" && errors.email != "") {
            return;
        }


        this.setState({ spinner: true });
        const access_token = await AppHelper.getItem("access_token");
        const user_id = await AppHelper.getItem("user_id");
        let patientParams = {
            role: "patient",
            user_id: user_id,
            name: this.state.name,
        }
        if (this.state.email != "") {
            patientParams['email'] = this.state.email
        }

        let params = patientParams;

        if (this.state.selectedPhoto != null) {
            const response_image = await API.postMultipart(URL_IMAGE_UPLOAD, this.state.selectedPhoto.uri, [], null, 'image')
            let final_image_url = response_image.data.base_url + "/" + response_image.data.image_name
            params['avatar'] = final_image_url
        }

        //post form api here
        try {
            const res = await API.post(API_URL.PROFILE_UPDATE, params);
            console.log("RESPONSE \n", res);
            if (res) {
                const { data } = await res
                if (res.status == "Success") {
                    console.log("data update")
                    console.log(data)
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

                    await AppHelper.setData("user_data", auth_user);
                    global.user_data = auth_user;
                    if (data.last_sync_timestamp != null) {
                        await AppHelper.setItem("last_sync_timestamp", data.last_sync_timestamp);
                    }

                    this.setState({ spinner: false, });
                    this.handleCancelEditing();
                    // this.props.navigation.navigate('ProfileView', { skipLastScreen: true, });
                    // this._resetStack('ProfileEdit');
                }
                else {
                    console.log("Error", data)
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            Alert.alert('handleSubmit Error', error)
            this.setState({ spinner: false });
        }
    }

    handleCancelEditing = async () => {
        const { isEditing } = this.state;
        // SET IS EDITING TO TRUE ON CLICKED FIELD
        isEditing['phone'] = false;

        const userData = global.user_data;

        if (isEditing['status'] == true) {
            this.setState({ status_text: userData.status_text ? userData.status_text : "Hello, I am now available on DocLink" })
            isEditing['status'] = false;
            isEditing['name'] = false;
            isEditing['email'] = false;
        }
        if (isEditing['name'] == true) {
            this.setState({ name: userData.name })
            isEditing['name'] = false;
            isEditing['status'] = false;
            isEditing['email'] = false;
        }
        if (isEditing['email'] == true) {
            this.setState({ email: userData.email })
            isEditing['name'] = false;
            isEditing['status'] = false;
            isEditing['email'] = false;
        }

        // UPDATE ISEDITING STATE
        this.setState({ isEditing, showSaveButton: false, });
    }

    handleProfileVerification = () => {
        console.log("handleProfileVerification");
        // REDIRECT TO VERIFICATION SCREEN
        this.props.navigation.navigate('VerifyNumber', { phoneNumber: this.state.phone, redirection: 'ProfileEdit' });
    }

    render() {
        const {
            name, phone,
            email, mrNo, errors,
            mode, isEditing, spinner,
            phoneFieldMode, showSaveButton
        } = this.state;

        let nameIcon = require('../assets/icons/name_gray_icon.png');
        let phoneIcon = require('../assets/icons/phone_icon.png')
        let statusIcon = require('../assets/icons/status_gray_icon.png')

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Profile Info"}
                        context={this.props}
                        backButton={true}
                        // removeBackButton={false}
                        right={
                            (isEditing.name == true || isEditing.status == true || isEditing.email == true) ?
                                <TouchableOpacity
                                    // style={[{ flex: 1, paddingVertical: wp(3) }]}
                                    onPress={this.handleCancelEditing}>
                                    <Text style={[{
                                        fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.white, width: "100%"
                                    }]}>Cancel</Text>
                                </TouchableOpacity>
                                : null
                        }
                        transparent={false}
                        noShadow={true}
                    />
                    {/* NAVIGATION HEADER END*/}

                    <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} scrollEnabled={false}>
                        <ScrollView style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}
                            enabled={false}
                        >
                            {/* Spinner */}
                            <CustomSpinner visible={spinner} />

                            {/* PERSON AVATAR BLOCK */}
                            <View style={[{ backgroundColor: colors.white, width: wp(100), height: hp(21) / 2, alignItems: "center" }]}>
                                <TouchableOpacity
                                    onPress={() => { this._showImagePicker() }}
                                    style={[GlobalStyles.imageContainer, { width: hp(20), height: hp(20), borderRadius: hp(20) / 2, borderColor: colors.white, marginTop: hp(1), }]}
                                >
                                    <Image
                                        style={[GlobalStyles.imgContain,]}
                                        resizeMode='cover'
                                        source={{
                                            uri: (this.state.selectedPhoto != null) ? this.state.selectedPhoto.uri : (this.state.avatar) ? this.state.avatar : global.BASE_URL_IMAGE + "dummy_profile_avatar.png"
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                            {/* PERSON AVATAR BLOCK END */}

                            {/* CHANGE PROFILE LINK */}
                            <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: hp(12), }]}>
                                <View style={[{ width: wp(5), height: wp(5), marginRight: wp(2), }]}>
                                    <Image style={[GlobalStyles.imgContain,]} source={require('../assets/icons/upload_blue_icon.png')} />
                                </View>
                                <TouchableOpacity onPress={() => {
                                    this._showImagePicker()
                                }}>
                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.primaryText, }}>Change Image</Text>
                                </TouchableOpacity>
                            </View>

                            {/* MAIN CONTENT SECTION */}
                            <View style={{
                                flex: 1,
                                marginTop: hp(0),
                                marginHorizontal: hp(1.8),
                                backgroundColor: colors.transparent,
                            }}>

                                {/* EMPTY SPACE */}
                                <View style={{ paddingVertical: hp(1), }}></View>

                                {/* NAME FIELD */}
                                {!isEditing.name ?
                                    <AppTextInput
                                        mode={mode}
                                        label={"Name"}
                                        value={name}
                                        icon={nameIcon}
                                        onEditPress={() => this.handleEditPress("name")}
                                        onChangeText={name => this.setState({ name })}
                                        onValidatePress={this.validateName}
                                        error={(errors && errors.name != "") ? true : false}
                                    />
                                    :
                                    (global.target != "doctor") ?
                                        <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: hp(0), marginTop: 20 }}>
                                            <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), height: hp(7), }]}>
                                                <Image source={nameIcon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                            </View>
                                            <FloatingLabel
                                                labelStyle={[GlobalStyles.labelStyle,]}
                                                inputStyle={[GlobalStyles.inputStyle, GlobalStyles.inputStylePaddingLeft, (errors && errors.name != "") ? GlobalStyles.inputErrorStyle : {}]}
                                                style={[GlobalStyles.inputWrapper, { flex: 1, }]}
                                                value={this.state.name}
                                                onChangeText={name => this.setState({ name })}
                                                // onFocus={this.handleOnFocus}
                                                onBlur={this.validateName}
                                                error={(errors && errors.name != "") ? true : false}
                                                maxLength={30}
                                            >
                                                {/* PLACEHOLDER */}
                                                {(errors && errors.name != "") ? errors.name : 'Name*'}
                                            </FloatingLabel>
                                        </View>
                                        :
                                        <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: hp(1), marginTop: 20 }}>
                                            <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), height: hp(7), }]}>
                                                <Image source={nameIcon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                            </View>
                                            <FloatingLabel
                                                labelStyle={[GlobalStyles.labelStyle, { left: wp(14), }]}
                                                inputStyle={[GlobalStyles.inputStyle, (errors && errors.name != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), }]}
                                                style={[GlobalStyles.inputWrapper, { flex: 1, }]}
                                                value={this.state.name}
                                                onChangeText={name => this.setState({ name })}
                                                // onFocus={this.handleOnFocus}
                                                onBlur={this.validateName}
                                                error={(errors && errors.name != "") ? true : false}
                                                callingCode="Dr."
                                                maxLength={30}
                                            >
                                                {/* PLACEHOLDER */}
                                                {(errors && errors.name != "") ? errors.name : 'Name*'}
                                            </FloatingLabel>
                                        </View>
                                }


                                {/* PHONE FIELD */}
                                {!isEditing.phone ?
                                    <AppTextInput
                                        mode={phoneFieldMode}
                                        label={"Phone"}
                                        value={phone}
                                        icon={phoneIcon}
                                        verifyLabel={"verify"}
                                        onEditPress={this.handleProfileVerification}
                                        onChangeText={phone => this.setState({ phone })}
                                        onValidatePress={this.validatePhone}
                                        error={(errors && errors.phoneNumber != "") ? true : false}
                                    />
                                    :
                                    <View style={{ flexDirection: "row", alignItems: "flex-end", }}>
                                        <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), height: hp(7), }]}>
                                            <Image source={phoneIcon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                        </View>
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle, { left: wp(14), }]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.phoneNumber != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), }]}
                                            style={[GlobalStyles.inputWrapper, { flex: 1, }]}
                                            value={this.state.phone}
                                            onChangeText={phone => this.setState({ phone })}
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validatePhone}
                                            keyboardType='phone-pad'
                                            error={(errors && errors.phoneNumber != "") ? true : false}
                                            callingCode="+92"
                                            maxLength={10}
                                        >
                                            {/* PLACEHOLDER */}
                                            {(errors && errors.phoneNumber != "") ? errors.phoneNumber : 'Phone*'}
                                        </FloatingLabel>
                                    </View>
                                }

                                {/* Email FIELD */}
                                {!isEditing.email ?
                                    <AppTextInput
                                        mode={mode}
                                        label={"Email"}
                                        value={(AppHelper.isNull(email) == true) ? "n/a" : email}
                                        icon={require('../assets/icons/email_icon.png')}
                                        onEditPress={() => this.handleEditPress("email")}
                                        onChangeText={email => this.setState({ email })}
                                        onValidatePress={this.validateEmail}
                                        error={(errors && errors.email != "") ? true : false}
                                    />
                                    :
                                    <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: hp(1), marginTop: 20 }}>
                                        <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), height: hp(7), }]}>
                                            <Image source={require('../assets/icons/email_icon.png')} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                        </View>
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle, {}]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.email != "") ? { borderColor: colors.errorColor } : {}]}
                                            style={[GlobalStyles.inputWrapper, { flex: 1, }]}
                                            value={this.state.email}
                                            onChangeText={email => this.setState({ email })}
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validateEmail}
                                            error={(errors && errors.email != "") ? true : false}
                                            maxLength={50}
                                            keyboardType='email-address'
                                        >
                                            {/* PLACEHOLDER */}
                                            {(errors && errors.email != "") ? errors.email : 'Email'}
                                        </FloatingLabel>
                                    </View>
                                }

                                <AppTextInput
                                    mode={"icon-label-view"}
                                    label={"MR. No"}
                                    value={mrNo}
                                    icon={require('../assets/icons/mr_icon.png')}
                                />


                                {
                                    showSaveButton ?
                                        <AppButton
                                            onPressButton={this.validateProfile}
                                            styles={{ marginTop: hp(10), }}
                                            title={"Save Changes"}
                                        ></AppButton>
                                        :
                                        null

                                }
                            </View>
                        </ScrollView>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </Container>
        );
    }
}

export default EditPatientProfileScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    imageContainer: {
        alignItems: 'center',
        width: wp('30%'),
        height: wp('30%'),
        borderRadius: wp('30%') / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff'
    },
    tabSelectText: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
    },
    tabDefaultText: {
        color: colors.white,
        opacity: 0.8,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
    },
});
