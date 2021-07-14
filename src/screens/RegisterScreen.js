import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, TouchableWithoutFeedback, Alert, ScrollView, Platform, } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Container, } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePicker from 'react-native-image-picker';
var RNFS = require('react-native-fs');
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-navigation';

import appHelper, { CustomSpinner } from '../utils/AppHelper';
import CheckBox from '../components/CheckBox'
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';
import FloatingLabel from '../components/CustomFloatingTextInput';
import AppButton from '../components/AppButton';
import NavigationBar from '../components/NavigationBar';
import { findPhoneNumbersInText } from 'libphonenumber-js'
import { BASE_API_VER, API_URL, isAndroid } from '../utils/Constant';
import API from '../services/API';

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

class RegisterScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            checked: false,
            name: '',
            email: '',
            phone: '',
            refCode: '',
            gender: 'Male',
            avatar: '',
            cnic: '',
            selectedPhoto: null,
            refCodePlaceholder: "Who helped you download? (Optional)",
            errors: { name: "", email: "", phoneNumber: "", CNIC: "", termChecked: "", refCode: "", },
        };
    }

    updateValue(text, field) {
        if (field == 'name') {
            this.setState({ name: text })
        }
        if (field == 'email') {
            this.setState({ email: text })
        }
        if (field == 'phone') {
            this.setState({ phone: text })
        }
    }

    onValueChange(value) {
        this.setState({
            gender: value
        });
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

    handleSubmit = () => {
        const { errors, phone, checked } = this.state;
        // VALIDATE FORM FIELDS
        this.handleValidation();

        if (errors.name == "" && errors.email == "" && errors.phoneNumber == "" && checked == true)
            this._register();
    }


    handleValidation = async () => {
        const { errors, name, email, cnic, phone, checked } = this.state

        // VALIDATE NAME FIELD
        await this.validateName()

        // VALIDATE EMAIL FIELD
        await this.validateEmail()

        // VALIDATE PHONE FIELD
        await this.validatePhone()

        // VALIDATE CNIC FIELD
        // await this.validateCNIC()

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

    validateRef = () => {
        const { errors, refCode } = this.state;
        // console.log("validateName errors.name =>", errors.name);
        if (refCode == '') {
            errors.refCode = "Required";
            this.setState({ errors, })
            return false;
        } else {
            errors.refCode = "";
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

    //Register API Function
    _register = async () => {
        // console.log("====================");
        // console.log("_register fired", );
        // console.log("====================");

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
            // "cnic": this.state.cnic,
            "reference_code": this.state.refCode,
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

        // console.log("handleSubmit params", params);

        try {
            const res = await API.post(API_URL.AUTH_REGISTER, params);
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

    handleOnFocus = (key) => {
        // console.log("refCode", key );
        if (key == "refCode")
            this.setState({ refCodePlaceholder: "Reference code", })

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


    render() {
        const { checked, name, errors, refCodePlaceholder, avatar } = this.state;
        console.log("render() avatar", avatar);

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Sign Up"}
                        context={this.props}
                        backButton={true}
                        // removeBackButton={true}
                        right={null}
                        noShadow={true}
                        transparent={true}
                    />
                    {/* NAVIGATION HEADER END*/}

                    <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} enableOnAndroid={true} extraScrollHeight={isAndroid ? 150 : 0}>
                        <ScrollView style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}>
                            <View style={[{ flex: 1, width: "100%", height: (Platform.OS === "android") ? hp(38) : hp(35), backgroundColor: colors.primary, }]}>
                                <View style={{ flex: 1, alignItems: 'center', width: "100%", }}>
                                  
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

                            <View style={{ flex: 1, height: "100%", paddingBottom: hp(5), marginHorizontal: hp(1.8), }}>
                                <View style={[GlobalStyles.shadowElevationThree, { marginTop: wp(-17), backgroundColor: colors.white, alignItems: 'center', borderRadius: wp('5%') / 2, paddingBottom: hp(5), }]}>
                                    <View style={{ marginTop: wp('5%') }}>
                                        
                                        {/* NAME FIELD */}
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle,]}
                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.name != "") ? GlobalStyles.inputErrorStyle : {}]}
                                            style={[GlobalStyles.inputWrapper, { marginTop: 20 }]}
                                            value={this.state.name}
                                            onChangeText={name => this.setState({ name })}
                                            // onFocus={this.handleOnFocus}
                                            onBlur={this.validateName}
                                            maxLength={30}
                                            error={(errors && errors.name != "") ? true : false}
                                        >
                                            {/* PLACEHOLDER */}
                                            {(errors && errors.name != "") ? errors.name : 'Name*'}
                                        </FloatingLabel>

                                        {/* EMAIL FIELD */}
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

                                        {/* PHONENUMBER FIELD */}
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

                                        {/* REFERENCE CODE FIELD */}
                                        <FloatingLabel
                                            labelStyle={[GlobalStyles.labelStyle,]}
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


                                        {/* <TextInput
                                            mode='outlined'
                                            underlineColorAndroid={colors.borderColor}
                                            label={(errors && errors.name != "") ? errors.name : 'Name*'}
                                            value={this.state.name}
                                            onChangeText={name => this.setState({ name })}
                                            // returnKeyType = "next"
                                            theme={{ colors: { placeholder: colors.borderColor, } }}
                                            style={[{ width: wp('80%'), alignSelf: 'center', marginTop: 10, }]}
                                            onBlur={this.validateName}
                                            error={(errors && errors.name != "") ? true : false}
                                        /> */}

                                        {/* <TextInput
                                            mode='outlined'
                                            underlineColorAndroid={colors.borderColor}
                                            label={(errors && errors.email != "") ? errors.email : 'Email*'}
                                            value={this.state.email}
                                            keyboardType='email-address'
                                            onChangeText={email => this.setState({ email })}
                                            theme={{ colors: { placeholder: colors.borderColor, } }}
                                            style={{ width: wp('80%'), alignSelf: 'center', marginTop: 10 }}
                                            onBlur={this.validateEmail}
                                            error={(errors && errors.email != "") ? true : false}
                                            // returnKeyType="next"
                                        /> */}

                                        {/* <View style={[ GlobalStyles.alignCenter, { flexDirection: "row",  width: wp(80), alignSelf: 'center', marginTop: 15, backgroundColor:"", }]}>
                                            <Text style={[GlobalStyles.borderGray, { position: "absolute", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), lineHeight: FontSize('small'), color: colors.black, backgroundColor: colors.transparent, width: wp(13), height:hp(7.1), textAlignVertical: "center", textAlign: "center", paddingHorizontal: wp(0), marginRight: -1, left: 0, top: 6, }]}>+92</Text>
                                            <TextInput
                                                mode='outlined'
                                                underlineColorAndroid={colors.borderColor}
                                                label='Phone*'
                                                keyboardType='phone-pad'
                                                value={this.state.phone}
                                                onChangeText={phone => this.setState({ phone })}
                                                theme={{ colors: { placeholder: colors.borderColor, }, paddingLeft: wp(13), }}
                                                style={{ width: "100%", alignSelf: 'center', marginTop: 0, paddingLeft: wp(13), }}
                                                render={props =>
                                                    <CustomTextInputMask
                                                        {...props}
                                                        type={'custom'}
                                                        options={{
                                                            mask: '99999999999'
                                                        }}
                                                    />
                                                }
                                            />
                                        </View> */}

                                        {/* CNIC Field */}
                                        {/* <TextInput
                                            mode='outlined'
                                            underlineColorAndroid={colors.borderColor}
                                            label={(errors && errors.CNIC != "") ? errors.CNIC : 'CNIC*'}
                                            keyboardType='number-pad'
                                            returnKeyType="done"
                                            value={this.state.cnic}
                                            onChangeText={cnic => this.setState({ cnic })}
                                            theme={{ colors: { placeholder: colors.borderColor, } }}
                                            style={{ width: wp('80%'), alignSelf: 'center', marginTop: 10 }}
                                            onBlur={this.validateCNIC}
                                            error={(errors && errors.CNIC != "") ? true : false}
                                            render={props =>
                                                <CustomTextInputMask
                                                    {...props}
                                                    type={'custom'}
                                                    options={{
                                                        mask: '99999-9999999-9',
                                                        validator: function (value, settings) {
                                                            var re = /^\(?([0-9]{5})\)?[-.●]?([0-9]{7})[-.●]?([0-9]{1})$/;
                                                            return re.test(value);
                                                        }
                                                    }}
                                                />
                                            }
                                        /> */}

                                        {/* <View style={{ marginTop:20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                                            <Picker
                                                mode="dropdown"
                                                iosIcon={<Icon name="arrow-down" />}
                                                placeholder="Gender"
                                                placeholderStyle={{ color: "#bfc6ea" }}
                                                placeholderIconColor="#007aff"
                                                style={{ color: '#000', width: undefined }}
                                                selectedValue={this.state.gender}
                                                onValueChange={this.onValueChange.bind(this)}
                                            >
                                                <Picker.Item label='Male' value='Male' key='Male' />
                                                <Picker.Item label='Female' value='Female' key='Female' />
                                            </Picker>
                                        </View> */}

                                        {/* TERMS CHECKBOX FIELD - Commented this field due 1.4v Req */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: hp(1) }}>
                                            <CheckBox

                                                checkedIcon={<Image source={require('../assets/icons/Icon_checked.png')} />}
                                                uncheckedIcon={<Image source={require('../assets/icons/Icon_unchecked.png')} />}
                                                checked={checked}
                                                onPress={() => this.setState({ checked: !this.state.checked })}
                                            />
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueLight, letterSpacing: 0.3, }}>I agree to the
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
                                            styles={{ marginTop: hp(1), }}
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

export default RegisterScreen;

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
        fontFamily: Fonts.HelveticaNeue,
        color: '#fff',
        fontSize: hp('3%')
    },
    imageContainer: {
        width: wp(30),
        height: wp(30),
        backgroundColor: colors.white,
        borderRadius: wp(30) / 2,
        borderWidth: 0,
        borderColor: colors.transparent,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.white,
        marginTop: wp(6),
        marginBottom: wp(2),
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
