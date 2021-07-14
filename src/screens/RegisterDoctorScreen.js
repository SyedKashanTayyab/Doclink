import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, TouchableWithoutFeedback, Alert, ScrollView, Platform } from 'react-native';
import { Container, Icon } from 'native-base';
// import { ActivityIndicator, Checkbox, TextInput, Button } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-picker';
var RNFS = require('react-native-fs');
import DeviceInfo from 'react-native-device-info';
import { findPhoneNumbersInText } from 'libphonenumber-js'
import { TouchableOpacity } from 'react-native-gesture-handler';

// import { TextInputMask } from 'react-native-masked-text';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import CheckBox from '../components/CheckBox'
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';
import AppButton from '../components/AppButton';
import FloatingLabel from '../components/CustomFloatingTextInput';
// import DropDownPicker from '../components/DropDownPicker';
import { API_URL } from '../utils/Constant';
import API from '../services/API'
import DropdownPickerModal from '../components/DropdownPickerModal';

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

class RegisterDoctorScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            checked: false,
            name: '',
            email: '',
            phone: '',
            gender: 'Male',
            avatar: '',
            selectedPhoto: null,
            cnic: '',
            pmdc: '',
            specialization: null,
            spacializationPlaceholder: "Speciality",
            errors: { name: "", email: "", phoneNumber: "", CNIC: "", termChecked: "", pmdc: "", specialization: "", },
            arraySpecialization: [],
            dropDownPickerVisible: false,
            isSpecializationSelected: false,
        };
    }

    async componentDidMount() {
        this._getDoctorSpecializationsList()
    }

    handleDropdownChange = (item) => {
        const { errors, specialization } = this.state;

        // SET CATEGORY ERROR TO FALSE,
        errors.specialization = false;
        this.setState({ errors, })

        // UPDATE CATEGORY STATE HERE
        this.setState({
            specialization: item.value,
        });
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

    _emptyState() {
        this.setState({
            name: '',
            email: '',
            avatar: '',
        })
    }

    _resetStack = async (stackName) => {
        this._emptyState();
        this.props
            .navigation
            .dispatch(StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({
                        routeName: stackName,
                    }),
                ],
            }))
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

    handleValidation = async () => {
        const { errors, name, email, cnic, phone, checked } = this.state

        // VALIDATE NAME FIELD
        await this.validateName()

        // VALIDATE EMAIL FIELD
        await this.validateEmail()

        // VALIDATE PHONE FIELD
        await this.validatePhone()

        // VALIDATE PMDC FIELD
        // await this.validatePMDC()

        // VALIDATE CNIC FIELD
        // await this.validateCNIC()

        // VALIDATE SPACIALIZATION FIELD
        await this.validateSpacialization()

        // VALIDATE TERMS CHECKED
        await this.validateTerms()

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

    validatePhone = () => {
        const { errors, phone } = this.state;

        let phoneNumberData = findPhoneNumbersInText("+92" + phone, 'PK')

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
        } if (phoneNumberData.length == 0) {
            errors.phoneNumber = "Incorrect mobile number";
            this.setState({ errors, })
            return false;
        } else {
            errors.phoneNumber = "";
            this.setState({ errors, })
        }
    }

    validatePMDC = () => {
        const { errors, pmdc } = this.state;

        if (pmdc == '') {
            // Alert.alert('', "Phone Required");
            errors.pmdc = "PMDC Required";
            this.setState({ errors, })
            return false;
        }
        // else if (pmdc.length < 11) {
        //     // Alert.alert('', "Invalid PMDC Number");
        //     errors.pmdc = "Invalid PMDC Number";
        //     this.setState({ errors, })
        //     return false;
        // } 
        else {
            errors.pmdc = "";
            this.setState({ errors, })
        }
    }

    validateCNIC = () => {
        const { errors, cnic } = this.state;
        // console.log("validateName errors.cnic =>", errors.CNIC);
        if (cnic == '') {
            // Alert.alert('', "CNIC Required");
            errors.CNIC = "CNIC Required";
            this.setState({ errors, });
            return false;
        }
        if (cnic.length < 15) {
            // Alert.alert('', "Invalid CNIC number");
            errors.CNIC = "Invalid CNIC number";
            this.setState({ errors, });
            return false;
        } else {
            errors.CNIC = "";
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

    validateTerms = () => {
        const { errors, checked } = this.state;

        if (checked == false) {
            Alert.alert('', "Please accept Terms and Conditions");
            errors.termChecked = true;
            this.setState({ errors, })
            return false;
        } else {
            errors.termChecked = "";
            this.setState({ errors, })
        }

    }

    //RegisterDoctor API Function
    _RegisterDoctor = async () => {
        this.setState({ spinner: true });

        let phoneNumberData = findPhoneNumbersInText("+92" + this.state.phone, 'PK')

        if (phoneNumberData == "") {
            this.validatePhone();
            this.setState({ spinner: false, });
            return;
        }


        let params = {
            "name": this.state.name,
            "email": this.state.email,
            "phone": phoneNumberData[0].number.number,
            "cnic": this.state.cnic,
            "pmdc": this.state.pmdc,
            "specialization": this.state.specialization,
            "device_identifier": await appHelper.getItem('device_identifier'),
            "device_token": DeviceInfo.getUniqueId(),
            "device_type": DeviceInfo.getBrand(),
            "device_name": await DeviceInfo.getDeviceName(),
            "device_model": DeviceInfo.getModel(),
            "device_brand": DeviceInfo.getBrand(),
            "platform": Platform.OS === "android" ? "android" : "IOS",
            "app_version": DeviceInfo.getVersion(),
        }

        if (this.state.selectedPhoto != null) {
            const photoData = await RNFS.readFile(this.state.selectedPhoto.uri, 'base64')
            params['avatar'] = photoData
        }

        // console.log("_RegisterDoctor params", params);
        try {
            const res = await API.post(API_URL.AUTH_REGISTER_DOCTOR, params);
            // console.log("res from register doc API; ==> \n", res);
            if (res) {

                this.setState({ spinner: false });

                if (res.status == 'Success') {
                    // Successfully Registered Message and redirect to login

                    setTimeout(() => {
                        Alert.alert(
                            'Success!',
                            'Your account has been created', [{
                                text: 'OK', onPress: () => {
                                    this.props.navigation.navigate('Login');
                                }
                            }], { cancelable: false }
                        )
                    }, 150);

                }
                else if (res.status == 'Error') {
                    setTimeout(() => {
                        Alert.alert('', res.message);
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

    handleSubmit = () => {

        const { errors, phone, checked } = this.state;
        // VALIDATE FORM FIELDS
        this.handleValidation();

        console.log(this.state.errors)
        console.log(errors)
        if (errors.name == "" && errors.email == "" && errors.phoneNumber == "" && errors.specialization == "" && checked == true)
            this._RegisterDoctor();
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
        const { checked, errors, spacializationPlaceholder, arraySpecialization, dropDownPickerVisible, isSpecializationSelected } = this.state;

        // console.log("render() arraySpecialization", arraySpecialization);


        let dropdownArrow = dropDownPickerVisible ? <Icon type="MaterialIcons" name="arrow-drop-up" style={{ color: colors.strokeColor1, }} /> : <Icon type="MaterialIcons" name="arrow-drop-down" style={{ color: colors.strokeColor1, }} />

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea, {}]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Sign Up"}
                        // titleView={
                        //     <Text style={{
                        //         textAlign: "center",
                        //         backgroundColor: colors.transparent,
                        //         width: "100%", marginLeft: wp(0),
                        //         color: colors.white,
                        //         fontFamily: Fonts.HelveticaNeueBold,
                        //         fontSize: FontSize('medium'),
                        //     }}>Sign Up</Text>
                        // }
                        context={this.props}
                        backButton={true}
                        // removeBackButton={true}
                        right={null}
                        noShadow={true}
                        transparent={true}
                    />
                    {/* NAVIGATION HEADER END*/}

                    <DropdownPickerModal
                        visible={dropDownPickerVisible}
                        selectedItem={this.handleSelectedItem}
                        dropdownData={arraySpecialization}
                    />

                    <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }}>
                        <ScrollView style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}>
                            <View style={[{ flex: 1, width: "100%", height: hp(38), backgroundColor: colors.primary, }]}>
                                <View style={{ flex: 1, alignItems: 'center', width: "100%", }}>
                                    {/* Profile photo */}
                                    {/* PERSON AVATAR BLOCK */}
                                    <View style={[{ backgroundColor: colors.primary, width: wp(100), height: hp(16) / 2, alignItems: "center" }]}>
                                        <TouchableOpacity
                                            onPress={() => { this._showImagePicker() }}
                                            style={[GlobalStyles.imageContainer, { width: hp(16), height: hp(16), borderRadius: hp(16) / 2, borderColor: colors.white, marginTop: hp(3), }]}
                                        >
                                            <Image
                                                style={[GlobalStyles.imgContain,]}
                                                resizeMode='cover'
                                                source={{
                                                    uri: (this.state.selectedPhoto != null) ? this.state.selectedPhoto.uri : (this.state.avatar) ? this.state.avatar : global.BASE_URL_IMAGE + 'dummy.png'
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    {/* PERSON AVATAR BLOCK END */}
                                    {/* CHANGE PROFILE LINK */}
                                    <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: hp(12), }]}>
                                        <View style={[{ width: wp(5), height: wp(5), marginRight: wp(2), }]}>
                                            <Image style={[GlobalStyles.imgContain,]} source={require("../assets/icons/upload_icon.png")} />
                                        </View>
                                        <TouchableOpacity onPress={() => {
                                            this._showImagePicker()
                                        }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.white, }}>Change Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Spinner */}
                            <CustomSpinner visible={this.state.spinner} />


                            <View style={{ flex: 1, height: "auto", paddingBottom: hp(5), marginHorizontal: hp(1.8), }}>
                                <View style={[GlobalStyles.shadowElevationThree, { height: "auto", marginTop: wp(-17), backgroundColor: colors.white, alignItems: 'center', borderRadius: wp('5%') / 2, paddingBottom: hp(5), }]}>
                                    <View style={{ marginTop: wp('5%'), height: "auto", }}>

                                        {/* Name Field */}
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle, { left: wp(14), }]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.name != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), }]}
                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                            value={this.state.name}
                                            onChangeText={name => this.setState({ name })}
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validateName}
                                            error={(errors && errors.name != "") ? true : false}
                                            callingCode="Dr."
                                            maxLength={25}
                                        >
                                            {/* PLACEHOLDER */}
                                            {(errors && errors.name != "") ? errors.name : 'Name*'}
                                        </FloatingLabel>

                                        {/* Email Field */}
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle,]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.email != "") ? GlobalStyles.inputErrorStyle : {}]}
                                            keyboardType='email-address'
                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                            value={this.state.email}
                                            onChangeText={email => this.setState({ email })}
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validateEmail}
                                            maxLength={35}
                                            error={(errors && errors.email != "") ? true : false}
                                        >
                                            {/* PLACEHOLDER */}
                                            {(errors && errors.email != "") ? errors.email : 'Email*'}
                                        </FloatingLabel>

                                        {/* Phone Number Field */}
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle, { left: wp(14), }]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.phoneNumber != "") ? { borderColor: colors.errorColor, paddingLeft: wp(16), } : { paddingLeft: wp(16), }]}
                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                            value={this.state.phone}
                                            onChangeText={phone => this.setState({ phone })}
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validatePhone}
                                            keyboardType='phone-pad'
                                            error={(errors && errors.phoneNumber != "") ? true : false}
                                            callingCode="+92"
                                            maxLength={12}
                                            masking={true}
                                            maskType={'custom'}
                                            autoFocus={false}
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

                                        {/* PMDC number Field - Optional */}
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle,]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.pmdc != "") ? GlobalStyles.inputErrorStyle : {}]}
                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                            value={this.state.pmdc}
                                            onChangeText={pmdc => this.setState({ pmdc })}
                                            keyboardType='default'
                                            // onFocus={this.handleOnFocus}
                                            // onBlur={this.validatePMDC}
                                            error={(errors && errors.pmdc != "") ? true : false}
                                            maxLength={11}
                                        >
                                            {/* PLACEHOLDER */}
                                            {(errors && errors.pmdc != "") ? errors.pmdc : 'PMDC Number'}
                                        </FloatingLabel>

                                        {/* CNIC FIELD - Commented this field due 1.4v Req */}
                                        {/* <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle,]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.CNIC != "") ? GlobalStyles.inputErrorStyle : {}]}
                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                            value={this.state.cnic}
                                            onChangeText={cnic => this.setState({ cnic })}
                                            keyboardType='number-pad'
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validateCNIC}
                                            error={(errors && errors.CNIC != "") ? true : false}
                                            maxLength={15}
                                            masking={true}
                                            maskType={'custom'}
                                            autoFocus={false}
                                            maskOptions={{
                                                mask: '99999-9999999-9',
                                                validator: function (value, settings) {
                                                    var re = /^\(?([0-9]{5})\)?[-.●]?([0-9]{7})[-.●]?([0-9]{1})$/;
                                                    return re.test(value);
                                                }
                                            }}
                                        > */}
                                        {/* PLACEHOLDER */}
                                        {/* {(errors && errors.CNIC != "") ? errors.CNIC : 'CNIC*'}
                                        </FloatingLabel> */}


                                        {/* Category Dropdown Field */}
                                        {/* <DropDownPicker
                                            items={this.state.arraySpecialization}
                                            // showArrow={true}
                                            // arrowColor={colors.strokeColor1}
                                            customArrowUp={() => <Icon type="MaterialIcons" name="arrow-drop-up" style={{ color: colors.strokeColor1, }} />}
                                            customArrowDown={() => <Icon type="MaterialIcons" name="arrow-drop-down" style={{ color: colors.strokeColor1, }} />}
                                            // dropDownStyle={[GlobalStyles.defaultDropdownStyle,]}
                                            dropDownMaxHeight={800}
                                            placeholder={spacializationPlaceholder}
                                            // placeholderStyle={{ color: colors.placeholderColor, }}
                                            // labelStyle={[GlobalStyles.defaultLabelStyle, {}]}
                                            defaultValue={null}
                                            containerStyle={{ height: hp(7), marginTop: 20, }}
                                            // style={[]}
                                            onChangeItem={this.handleDropdownChange}
                                        /> */}

                                        {/* Category Dropdown Field - Commented this field due 1.4v Req */}
                                        <TouchableOpacity onPress={this.handleDropdownPickup} style={[(errors && errors.specialization != "") ? GlobalStyles.borderError : (!isSpecializationSelected) ? GlobalStyles.borderGray : GlobalStyles.borderPrimary, { flexDirection: "row", justifyContent: 'center', marginTop: 20, height: hp(7), borderRadius: wp(1), }]}>
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

                                        {/* Category Dropdown Field - Commented this field due 1.4v Req */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: hp(1), }}>
                                            <CheckBox
                                                checkedIcon={<Image source={require('../assets/icons/Icon_checked.png')} />}
                                                uncheckedIcon={<Image source={require('../assets/icons/Icon_unchecked.png')} />}
                                                checked={checked}
                                                onPress={() => this.setState({ checked: !this.state.checked })}
                                            />
                                            <Text style={{ fontFamily: Fonts.RobotoLight }}>I agree to the
                                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate("Term", { terms: true, })}>
                                                    <Text style={{ fontFamily: Fonts.HelveticaNeueBold }}> Terms and Conditions</Text>
                                                </TouchableWithoutFeedback>
                                            </Text>
                                        </View>
                                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                            <Checkbox
                                                color={'#1994fb'}
                                                status={checked ? 'checked' : 'unchecked'}
                                                onPress={() => { this.setState({ checked: !checked }); }}
                                            />
                                            <Text style={{ fontFamily: Fonts.RobotoLight }}>I agree to the
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Term')}>
                                                    <Text style={{ fontFamily: Fonts.RobotoBold }}> Terms and Conditions</Text>
                                                </TouchableWithoutFeedback>
                                            </Text>
                                        </View> */}
                                        {/* SIGNUP BUTTON */}
                                        <AppButton
                                            onPressButton={this.handleSubmit}
                                            styles={{ marginTop: hp(1) }}
                                            title={"Sign Up"}
                                        ></AppButton>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </Container>
        );
    }
}

export default RegisterDoctorScreen;

const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#fff'
    },
    imageBackground: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flex: 45,
    },
    logoImage: {
        width: wp('100%'),
        height: hp('18%'),
        resizeMode: 'contain',
        marginBottom: 10
    },
    signupText: {
        color: '#ffffff',
        top: wp('5%'),
        fontSize: wp('6%')
    },
    headerFont: {
        fontFamily: Fonts.RobotoMedium,
        color: '#fff',
        fontSize: hp('3%')
    },
    imageContainer: {
        width: wp('30%'),
        height: wp('30%'),
        backgroundColor: colors.white,
        borderRadius: wp('30%') / 2,
        borderWidth: 0,
        borderColor: 'transparent',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
        marginTop: wp('10%'),
        marginBottom: wp('2%'),
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    headerIcon: {
        color: '#fff',
        position: 'absolute',
        top: wp('5%'),
        left: wp('5%')
    },
});