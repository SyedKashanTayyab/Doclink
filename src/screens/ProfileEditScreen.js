import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList, TextInput, TouchableOpacity, TouchableWithoutFeedback, InputAccessoryView, Keyboard, Button } from 'react-native';
import { Container, Tabs, Tab, TabHeading, Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native-gesture-handler';
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
import PackageScreen from './PackageScreen';
import DatePicker from 'react-native-date-picker'
import Modal from 'react-native-translucent-modal';
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

var moment = require('moment');

var _startTimeObject = null
var _endTimeObject = null

const inputAccessoryViewID = 'inputAccessoryView1';

let weekDaysIndex = [1, 2, 3, 4, 5, 6, 7];
class ProfileEditScreen extends Component {
    constructor(props) {
        super(props);

        const userData = global.user_data;
        console.log("constructor =>", userData);

        let phoneFieldMode = userData.is_number_verified === 0 ? "icon-label-verify-view" : "icon-label-view";

        const { navigation } = props;
        let tabIndex = navigation.getParam('tabIndex', 0)

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
            sectionIndex: (tabIndex == 1) ? 1 : 0,
            initialPage: (tabIndex == 1) ? 1 : 0,
            arrSchedule: "",
            scheduleModal: false,
            clinicName: "",
            startTime: "Select",
            endTime: "Select",
            weekDays: ["M", "T", "W", "T", "F", "S", "S"],
            scheduleObject: null,
            selectedTimeKey: "start",
            schedulePopupButtonTitle: "Select",
            startTimeDate: null,
            endTimeDate: null,
            daysIndex: [],
        };

        this.props.navigation.addListener('willFocus', async () => {
            this.checkNumberVerification()
        })
    }


    async componentDidMount() {
        // const { navigation } = this.props;
        // let tabIndex = navigation.getParam('tabIndex', 0)
        // if (tabIndex == 1) {
        //     this.setState({ initialPage: tabIndex, sectionIndex: tabIndex })
        //     setTimeout(() => {
        //         console.log("tabIndex", tabIndex)
        //         this.render()
        //     }, 1000);
        // }
        this.fetchScheduleData();
        this.resetTime()
    }

    resetTime() {
        this.setState({
            scheduleModal: false,
            startTime: "Select",
            endTime: "Select",
            startTimeDate: null,
            endTimeDate: null,
            selectedTimeKey: "start",
            schedulePopupButtonTitle: 'Select',
            daysIndex: [],
            clinicName: "",
            scheduleObject: null,
        })
        this._startTimeObject = null
        this._endTimeObject = null
    }


    fetchScheduleData = async () => {
        console.log("fetchScheduleData fired",);

        this.setState({ spinner: true });

        const user_id = await AppHelper.getItem("user_id");

        // doctor/schedule?doctor_id=184

        try {
            let res = await API.get(API_URL.DOCTOR_SCHEDULE, {
                doctor_id: user_id, // AppHelper.getItem('user_id')
            })
            console.log("=========================")
            console.log("res", res)
            console.log("=========================")
            if (res) {
                const data = await res
                if (data.status == "Success") {
                    this.setState({ arrSchedule: data.data, spinner: false, });
                }
            }
        } catch (error) {
            Alert.alert('Alert', error);
            this.setState({ spinner: false });
        }

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
            isEditing['email'] = false;
        }
        if (key == 'name') {
            isEditing['status'] = false;
            isEditing['email'] = false;
        }
        if (key == 'email') {
            isEditing['status'] = false;
            isEditing['name'] = false;
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

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
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

    validateEmail = () => {
        const { errors, email } = this.state;
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (email == '') {
            errors.email = "Email Required";
            this.setState({ errors, })
            return false;
        }
        if (reg.test(email) === false) {
            errors.email = "Invalid Email";
            this.setState({ errors, });
            return false;
        } else {
            errors.email = "";
            this.setState({ errors, })
        }

    }

    validateProfile = () => {
        const { name, phone, status, email, isEditing } = this.state;
        // VALIDATE FIELDS
        if (isEditing.name == true && name == '')
            this.validateName();
        else if (isEditing.email == true && email == '')
            this.validateEmail();
        else if (isEditing.status == true && status == '')
            this.validateStatus();
        else
            this.handleSubmit();
    }

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
            email: this.state.email,
        }

        let doctorParams = {
            role: "doctor",
            user_id: user_id,
            name: this.state.name,
            email: this.state.email,
            status_text: this.state.status_text,
            // gender: this.state.gender,
        }


        let params = global.target == "doctor" ? doctorParams : patientParams;

        if (this.state.selectedPhoto != null) {
            const response_image = await API.postMultipart(URL_IMAGE_UPLOAD, this.state.selectedPhoto.uri, [], null, 'image')
            let final_image_url = response_image.data.base_url + "/" + response_image.data.image_name
            params['avatar'] = final_image_url
        }

        if (email != "") {
            patientParams['email'] = email
        }
        console.log("handleSubmit params", params);


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

    /* On Refresh */
    _onRefresh = async () => {

    }

    closeScheduleModal = () => {
        console.log("schedule modal ",);
        this.setState({ scheduleModal: false, });
        this.resetTime()
    }

    handleScheduleEdit = (item) => {
        console.log("=================",);
        console.log("item", item, "\n item.start_time_text", item.start_time_text);
        console.log("=================",);

        try {
            this.setState({ startTime: item.start_time_text, endTime: item.end_time_text, clinicName: item.place_name, daysIndex: item.days_index, });
        } catch (error) {

        }
    }

    requestScheduleUpdate = async (params, schedule_object = null) => {

        const user_id = await AppHelper.getItem("user_id");

        this.setState({ spinner: true });

        try {
            params['doctor_id'] = user_id
            params['response'] = "true"
            if (schedule_object != null) {
                params['schedule_id'] = schedule_object.id
            }
            console.log(params)

            let res = await API.post(API_URL.DOCTOR_SCHEDULE, params)
            if (res) {
                const data = await res
                if (data.status == "Success") {
                    this.setState({
                        arrSchedule: data.data,
                        spinner: false,
                        scheduleModal: false,
                        startTime: "Select",
                        endTime: "Select",
                        startTimeDate: null,
                        endTimeDate: null,
                        selectedTimeKey: "start",
                        schedulePopupButtonTitle: 'Select',
                        daysIndex: [],
                        clinicName: "",
                        scheduleObject: null,
                    })
                    this._startTimeObject = null
                    this._endTimeObject = null
                }
            }
        } catch (error) {
            Alert.alert('Alert', error);
            this.setState({ spinner: false });
        }
    }

    requestScheduleDelete = async (schedule_object, index) => {

        const user_id = await AppHelper.getItem("user_id");

        this.setState({ spinner: true });

        try {
            let params = {
                'schedule_id': schedule_object.id
            }

            let res = await API.remove(API_URL.DOCTOR_SCHEDULE, params)
            // console.log("=========================")
            // console.log("res", res)
            // console.log("=========================")
            if (res) {
                const data = await res
                if (data.status == "Success") {
                    const arrSchedule = this.state.arrSchedule
                    arrSchedule.splice(index, 1)
                    this.setState({ arrSchedule, spinner: false })
                }
            }
        } catch (error) {
            Alert.alert('Alert', error);
            this.setState({ spinner: false });
        }
    }

    editSchedule = async (item) => {
        this._startTimeObject = moment('1970-01-01T' + item.start_time).utc(true)
        this._endTimeObject = moment('1970-01-01T' + item.end_time).utc(true)

        console.log(this._startTimeObject.format('hh:mm a'))
        console.log(this._endTimeObject.format('hh:mm a'))

        let _a = new Date(moment('1970-01-01T' + item.start_time).utc(false))
        let _b = new Date(moment('1970-01-01T' + item.end_time).utc(false))

        this.setState({
            endTime: this._endTimeObject.format('hh:mm a'),
            endTimeDate: _b,
            startTime: this._startTimeObject.format('hh:mm a'),
            startTimeDate: _a,
            scheduleObject: item,
            scheduleModal: true,
            selectedTimeKey: "start",
            schedulePopupButtonTitle: "Select",
            daysIndex: item.days_index,
            clinicName: item.place_name
        })
    }

    deleteSchedule = async (item, index) => {
        Alert.alert(
            "",
            `Are you sure you want to delete this ${item.place_name} schedule?`,
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes', onPress: () => {
                        this.requestScheduleDelete(item, index)
                    }
                },
            ],
            { cancelable: false },
        )
    }

    render() {
        const { avatar, name, phone, email, mrNo, errors, mode, isEditing, spinner, phoneFieldMode, specialization, status_text, showSaveButton, sectionIndex, scheduleModal, clinicName, startTime, endTime, weekDays, daysIndex } = this.state;
        // console.log("Render ProfileEditScreen ==> status ==", status, "====", "\n ===== errors", errors, "=======");
        // console.log("render mode =>", mode, "=====");
        // console.log("========================");
        // console.log("render user avaatr", avatar)
        // console.log("========================");
        // console.log("========================");
        // console.log("render user URI", (this.state.selectedPhoto != null) ? this.state.selectedPhoto.uri : (this.state.avatar) ? this.state.avatar : global.BASE_URL_IMAGE + "dummy.png")
        // console.log("========================");
        // console.log("render() isEditing", isEditing);
        // console.log("========================");
        // console.log("render daysIndex", this.state.daysIndex,)
        // console.log("========================");

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

                    {
                        <Tabs
                            initialPage={this.state.initialPage}
                            page={this.state.sectionIndex}
                            onChangeTab={({ i }) => this.setState({ sectionIndex: i })}
                            tabBarUnderlineStyle={{ backgroundColor: colors.white, }}
                            tabContainerStyle={{
                                elevation: 0,
                            }}
                        >
                            <Tab
                                textStyle={[{ color: colors.white, textTransform: "uppercase", }]}
                                heading={
                                    <TabHeading style={{ backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                        <Text style={[(sectionIndex == 0) ? styles.tabSelectText : styles.tabDefaultText]} >My Profile</Text>
                                    </TabHeading>
                                }
                            >
                                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }}>
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


                                            {/* STATUS FIELD */}
                                            {(global.target == "doctor") ?
                                                !isEditing.status ?
                                                    <AppTextInput
                                                        mode={mode}
                                                        label={"Status"}
                                                        value={status_text}
                                                        icon={statusIcon}
                                                        onEditPress={() => this.handleEditPress("status")}
                                                        onChangeText={status_text => this.setState({ status_text })}
                                                        // onValidatePress={this.validateStatus}
                                                        error={(errors && errors.status != "") ? true : false}
                                                    />
                                                    :
                                                    <View style={{ flexDirection: "row", alignItems: "flex-end", marginVertical: hp(1), }}>
                                                        <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), height: hp(7), }]}>
                                                            <Image source={statusIcon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                                        </View>
                                                        <FloatingLabel
                                                            labelStyle={[GlobalStyles.labelStyle,]}
                                                            inputStyle={[GlobalStyles.inputStyle, (errors && errors.status != "") ? GlobalStyles.inputErrorStyle : {}]}
                                                            style={[GlobalStyles.inputWrapper, { flex: 1, }]}
                                                            value={this.state.status_text}
                                                            onChangeText={status_text => this.setState({ status_text })}
                                                            // onFocus={this.handleOnFocus}
                                                            onBlur={this.validateStatus}
                                                            error={(errors && errors.status != "") ? true : false}
                                                            maxLength={150}
                                                        >
                                                            {/* PLACEHOLDER */}
                                                            {(errors && errors.status != "") ? errors.status : 'Status'}
                                                        </FloatingLabel>
                                                    </View>
                                                :
                                                null
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
                                            {
                                                (global.target == "patient") ?
                                                    <AppTextInput
                                                        mode={"icon-label-view"}
                                                        label={"MR. No"}
                                                        value={mrNo}
                                                        icon={require('../assets/icons/mr_icon.png')}
                                                    />
                                                    :
                                                    null
                                            }
                                            {
                                                (global.target == "doctor") ?
                                                    <AppTextInput
                                                        mode={"icon-label-view"}
                                                        label={"Specialization"}
                                                        value={specialization ? specialization : "Not Found"}
                                                        icon={require('../assets/icons/specialization_gray_icon.png')}
                                                    />
                                                    :
                                                    null
                                            }


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

                                        {/* Schedule Section */}
                                        <View style={{ backgroundColor: colors.white, width: "100%", padding: wp(4), marginTop: hp(2) }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <Text style={{ fontSize: FontSize('medium'), color: colors.black, fontFamily: Fonts.HelveticaNeueBold }}>Schedule</Text>
                                                {
                                                    <TouchableOpacity onPress={() => this.setState({ scheduleModal: true })}>
                                                        <View style={{ width: hp(3.5), height: hp(3.5), backgroundColor: "#1896FC", justifyContent: 'center', alignItems: 'center', borderRadius: hp(3.5) }}>
                                                            <Icon type="Entypo" name='plus' style={{ fontSize: FontSize('medium'), color: colors.white }} />
                                                        </View>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                            <FlatList
                                                style={{ marginTop: hp(1) }}
                                                data={this.state.arrSchedule}
                                                ItemSeparatorComponent={() => {
                                                    return (
                                                        <View
                                                            style={{
                                                                height: 0.5,
                                                                width: "100%",
                                                                backgroundColor: colors.borderColor,
                                                                marginTop: wp(2),
                                                                marginBottom: wp(2)
                                                            }}
                                                        />
                                                    );
                                                }}
                                                keyExtractor={(item, index) => item + index}
                                                renderItem={({ item, index }) => {
                                                    return (
                                                        <View style={[{ flex: 1 }]}>
                                                            <TouchableWithoutFeedback
                                                                onPress={() => {
                                                                    // this.setState({ scheduleModal: true })
                                                                    // this.handleScheduleEdit(item);
                                                                }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                                    <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                        <Text style={{ color: colors.valentino, fontFamily: Fonts.HelveticaNeueMedium, fontSize: FontSize('medium'), }}>{item.place_name}</Text>
                                                                        <Text style={{ color: colors.valentino, fontFamily: Fonts.HelveticaNeueMedium, fontSize: FontSize('medium'), }}>{item.start_time_text} to {item.end_time_text}</Text>
                                                                        <Text style={{ color: colors.primary, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{item.days_text.join(", ")}</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                                                                        <TouchableOpacity onPress={() => {
                                                                            this.editSchedule(item)
                                                                        }}>
                                                                            <Image source={require('../assets/icons/icon-edit.png')} resizeMode='contain' style={{ width: wp(8), height: wp(8), }} ></Image>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity
                                                                            style={{ marginLeft: wp(2) }}
                                                                            onPress={() => {
                                                                                this.deleteSchedule(item, index)
                                                                            }}>
                                                                            <Image source={require('../assets/icons/icon-delete.png')} resizeMode='contain' style={{ width: wp(8), height: wp(8), }} ></Image>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            </TouchableWithoutFeedback>
                                                        </View>
                                                    )
                                                }}
                                                ListEmptyComponent={
                                                    <View style={{ marginTop: 10 }}>
                                                        <Text style={{ textAlign: 'center', color: '#999999' }}>Add your schedule</Text>
                                                    </View>
                                                }
                                            />
                                        </View>

                                        {/* ==================== */}
                                        {/* Schedule Popup */}
                                        {/* ==================== */}
                                        <Modal
                                            animationType="fade"
                                            transparent={true}
                                            visible={scheduleModal}
                                            onRequestClose={() => {
                                                // this._closeModal();
                                                // this.props.onClosePopup(false)
                                            }}>
                                            <KeyboardAwareScrollView style={[{
                                                width: wp(100),
                                                height: hp(100),
                                                backgroundColor: 'rgba(0,0,0,0.8)',
                                            }]}>
                                                <ScrollView
                                                    contentContainerStyle={{
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View style={[
                                                        {
                                                            flex: 1,
                                                            width: wp(100),
                                                            height: hp(100),
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }
                                                    ]}>
                                                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>
                                                            <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: wp(4), paddingHorizontal: wp(3) }]}>
                                                                <View style={{ width: 25 }}>

                                                                </View>
                                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                                                                    <Text style={[{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }]}>Schedule</Text>
                                                                </View>
                                                                <View style={{ width: 25, zIndex: 99999 }}>
                                                                    <TouchableOpacity
                                                                        style={[{}]}
                                                                        onPress={() => {
                                                                            this.closeScheduleModal()
                                                                        }}
                                                                    >
                                                                        <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#CBF6FF", width: hp(3), height: hp(3), borderRadius: hp(3) / 2 }]}>
                                                                            <Icon type="AntDesign" name='close' style={{ fontSize: hp(2), color: '#1896FC' }} />
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                </View>

                                                            </View>
                                                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }]}>
                                                                <View style={[{ width: '100%', backgroundColor: colors.transparent, alignItems: 'center' }]}>
                                                                    <View style={{ width: '100%', marginBottom: 10 }}>
                                                                        <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino, }}>Clinic/Hospital</Text>
                                                                        {/* <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                            <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{clinicName}</Text>
                                                                        </View> */}
                                                                        <TextInput
                                                                            style={{
                                                                                height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4), color: colors.black
                                                                            }}
                                                                            placeholder={"Enter Clinic Name"}
                                                                            placeholderTextColor={colors.gray}
                                                                            maxLength={30}
                                                                            editable={true}
                                                                            value={clinicName}
                                                                            onChangeText={clinicName => this.setState({ clinicName })}
                                                                            // keyboardType={keyboardType}
                                                                            spellCheck={false}
                                                                            autoCorrect={false}
                                                                            inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                                                        >
                                                                        </TextInput>
                                                                    </View>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        flexWrap: 'wrap',
                                                                        alignItems: 'flex-start',
                                                                    }}>
                                                                        <View style={{ width: '49%', marginRight: '2%', }}>
                                                                            <TouchableOpacity onPress={() => {
                                                                                this.setState({
                                                                                    schedulePopupButtonTitle: 'Select',
                                                                                    selectedTimeKey: 'start',
                                                                                })
                                                                            }}>
                                                                                <>
                                                                                    <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino, }}>Start Time</Text>
                                                                                    <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                                        <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{startTime}</Text>
                                                                                    </View>
                                                                                </>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                        <View style={{ width: '49%', }}>
                                                                            <TouchableOpacity onPress={() => {
                                                                                if (this.state.startTime == "Select" && this.state.endTime == "Select") {
                                                                                    console.log("no selectiong")
                                                                                }
                                                                                else if (this.state.startTime != "Select" && this.state.endTime == "Select") {
                                                                                    let tempDate = this.state.startTimeDate
                                                                                    const currentHours = tempDate.getHours()
                                                                                    tempDate.setHours(currentHours + 1)

                                                                                    let a = this._startTimeObject.clone()
                                                                                    this._endTimeObject = a
                                                                                    this._endTimeObject.add(1, 'hours')

                                                                                    this.setState({
                                                                                        schedulePopupButtonTitle: 'Done',
                                                                                        selectedTimeKey: 'end',
                                                                                        endTimeDate: tempDate,
                                                                                        endTime: this._endTimeObject.format('hh:mm a'),
                                                                                    })
                                                                                } else {
                                                                                    this.setState({
                                                                                        schedulePopupButtonTitle: 'Done',
                                                                                        selectedTimeKey: 'end',
                                                                                    })
                                                                                }
                                                                            }
                                                                            }>
                                                                                <>
                                                                                    <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino, }}>End Time</Text>
                                                                                    <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                                        <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{endTime}</Text>
                                                                                    </View>
                                                                                </>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    </View>
                                                                    <View style={[{ height: 180, marginTop: 10, marginBottom: 10 }]}>
                                                                        <DatePicker
                                                                            date={
                                                                                (this.state.selectedTimeKey == "start")
                                                                                    ? (startTime == "Select")
                                                                                        ? new Date()
                                                                                        : this.state.startTimeDate
                                                                                    : (endTime == "Select")
                                                                                        ? new Date()
                                                                                        : this.state.endTimeDate
                                                                            }
                                                                            androidVariant={'nativeAndroid'}
                                                                            mode={'time'}
                                                                            timeZoneOffsetInMinutes={300}
                                                                            minuteInterval={15}
                                                                            onDateChange={(date) => {

                                                                                if (this.state.selectedTimeKey == "start") {
                                                                                    this._startTimeObject = moment(date.toJSON()).utc(true)
                                                                                    this.setState({
                                                                                        startTimeDate: date,
                                                                                        startTime: this._startTimeObject.utc(true).format('hh:mm a'),
                                                                                    })
                                                                                }
                                                                                if (this.state.selectedTimeKey == "end") {

                                                                                    this._endTimeObject = moment(date.toJSON()).utc(true)
                                                                                    this.setState({
                                                                                        endTimeDate: date,
                                                                                        endTime: this._endTimeObject.utc(true).format('hh:mm a'),
                                                                                    })
                                                                                }
                                                                            }}
                                                                        />
                                                                    </View>
                                                                    <View style={{ width: '100%', marginBottom: hp(4), }}>
                                                                        <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino, marginBottom: hp(1), }}>Days</Text>
                                                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
                                                                            {
                                                                                weekDaysIndex.map((value, i) => (
                                                                                    <>
                                                                                        <TouchableOpacity onPress={() => {
                                                                                            let arr = daysIndex
                                                                                            if (daysIndex.includes(value)) {
                                                                                                arr = arr.filter(item => item != value)
                                                                                            } else {
                                                                                                arr.push(value)
                                                                                            }
                                                                                            this.setState({ daysIndex: arr })
                                                                                        }}>
                                                                                            <View style={[styles.defaultDayStyle, daysIndex.includes(value) ? styles.activeDayStyle : null]}>
                                                                                                <Text style={[styles.defaultDayText, daysIndex.includes(value) ? styles.activeDayText : null]}>
                                                                                                    {weekDays[i]}
                                                                                                </Text>
                                                                                            </View>
                                                                                        </TouchableOpacity>
                                                                                    </>
                                                                                ))

                                                                            }
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, }]}>
                                                                    {
                                                                        <AppButton
                                                                            onPressButton={
                                                                                () => {
                                                                                    if (this._startTimeObject == null) {
                                                                                        Alert.alert('Select Start Time')
                                                                                    } else if (this._endTimeObject == null) {

                                                                                        let tempDate = this.state.startTimeDate
                                                                                        const currentHours = tempDate.getHours()
                                                                                        tempDate.setHours(currentHours + 1)

                                                                                        let a = this._startTimeObject.clone()
                                                                                        this._endTimeObject = a
                                                                                        this._endTimeObject.add(1, 'hours')

                                                                                        this.setState({
                                                                                            schedulePopupButtonTitle: 'Done',
                                                                                            selectedTimeKey: 'end',
                                                                                            endTimeDate: tempDate,
                                                                                            endTime: this._endTimeObject.format('hh:mm a'),
                                                                                        })
                                                                                    } else if (this._startTimeObject > this._endTimeObject) {
                                                                                        Alert.alert('Start time should be smaller than the End time')
                                                                                    } else {
                                                                                        if (clinicName.length == 0) {
                                                                                            Alert.alert("Enter Clinic/Hospital name")
                                                                                        } else if (daysIndex.length == 0) {
                                                                                            Alert.alert("Select Days")
                                                                                        } else {

                                                                                            let params = {
                                                                                                place_name: this.state.clinicName,
                                                                                                days: this.state.daysIndex.sort().join(","),
                                                                                                start_time: this._startTimeObject.utc(true).format('HH:mm:ss'),
                                                                                                end_time: this._endTimeObject.format('HH:mm:ss'),
                                                                                            }
                                                                                            this.requestScheduleUpdate(params, this.state.scheduleObject)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            styles={[{ marginTop: hp(0), borderRadius: wp(1.5) }]}
                                                                            title={this.state.schedulePopupButtonTitle}
                                                                            textColor={colors.white}>
                                                                        </AppButton>
                                                                    }
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </ScrollView>
                                            </KeyboardAwareScrollView>
                                        </Modal>
                                    </ScrollView>
                                </KeyboardAwareScrollView>
                            </Tab>
                            <Tab
                                // activeTextStyle={{ colors: "#000" }}
                                textStyle={[{ color: colors.white, textTransform: "uppercase", }]}
                                // activeTabStyle={{ backgroundColor: '#129378' }}
                                heading={
                                    <TabHeading style={{ backgroundColor: colors.primary, shadowColor: colors.transparent, shadowOpacity: 0 }}>
                                        <Text style={[(sectionIndex == 1) ? styles.tabSelectText : styles.tabDefaultText]}>Packages</Text>
                                    </TabHeading>
                                }
                            >
                                <PackageScreen />
                            </Tab>
                        </Tabs>
                    }
                    {
                        (Platform.OS === 'ios') ?
                            <InputAccessoryView nativeID={inputAccessoryViewID}>
                                <View style={{ backgroundColor: colors.grayFour, alignItems: 'flex-end', width: 100, height: 45, justifyContent: 'center' }}>
                                    <Button
                                        color={colors.black}
                                        onPress={() =>
                                            // Hide that keyboard!
                                            Keyboard.dismiss()
                                        }
                                        title="Done"
                                    />
                                </View>
                            </InputAccessoryView>
                            :
                            null
                    }
                </SafeAreaView>
            </Container>
        );
    }
}

export default ProfileEditScreen;

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
        fontWeight: 'bold'
    },
    tabDefaultText: {
        color: colors.white,
        opacity: 0.8,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    defaultDayStyle: {
        width: hp(5),
        height: hp(5),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp(5 / 2),
        marginRight: wp(1.5),
        backgroundColor: "#E6E6E6",
    },
    activeDayStyle: {
        backgroundColor: "#1896FC",
    },
    defaultDayText: {
        color: colors.graySix,
    },
    activeDayText: {
        color: colors.white,
    },
});
