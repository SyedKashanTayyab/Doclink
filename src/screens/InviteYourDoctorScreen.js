import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Alert, Image, TextInput, ScrollView, Platform, } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';

import NavigationBar from '../components/NavigationBar';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import colors from '../utils/Colors';
import AppButton from '../components/AppButton';
import CustomTextInput from '../components/CustomTextInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';
import API from '../services/API';
import { API_URL } from '../utils/Constant';



class InviteYourDoctorScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            clinicName: "",
            contactNumber: "",
            message: "",
            errors: { name: "", clinicName: "", message: "" },
            spinner: "",
        };
    }

    componentDidMount = () => {

    }

    validateFields = () => {

        const { name, clinicName, contactNumber, message, errors } = this.state;
        console.log("errors", errors);

        if (name == "") {
            // Utility.showAlert("Error", "Enter name")
            errors.name = true,
                this.setState({ errors, })
            console.log("errors", errors);

        } else if (clinicName == "") {
            errors.name = false,
                errors.clinicName = true,
                this.setState({ errors, })
        } else if (message == "") {
            // Alert.alert('Please provide message')
            errors.message = true,
                errors.clinicName = false,
                errors.name = false,
                this.setState({ errors, })
        } else if (message.length < 10) {
            // Alert.alert('Enter your desired message')
            errors.message = true,
                errors.clinicName = false,
                errors.name = false,
                this.setState({ errors, })
        } else {
            errors.name = false,
                errors.clinicName = false,
                errors.message = false,
                this.setState({ errors, })

            // Save User Information
            this.requestFormSubmit();
        }
    }

    handleSubmit = () => {
        console.log("submit fired");

        // VALIDATE FORM FIELDS
        this.validateFields();

    }

    requestFormSubmit = async () => {
        console.log("requestFormSubmit fired");

        const user_id = await AppHelper.getItem("user_id");

        const { name, clinicName, contactNumber, message, errors } = this.state;

        this.setState({ spinner: true });

        var params = {}

        if (name != null) { params["doctor_name"] = name }
        if (clinicName != null) { params["clinic_name"] = clinicName }
        if (contactNumber != null) { params["contact_number"] = contactNumber }
        if (message != null) { params["message"] = message }

        params['user_id'] = user_id
        params['platform'] = Platform.OS

        try {
            const res = await API.post(API_URL.DOCTOR_INVITE, params);
            if (res) {
                const data = await res
                if (data.status == "Success") {
                    this.setState({
                        spinner: false,
                        name: "",
                        clinicName: "",
                        contactNumber: "",
                        message: "",
                    });
                    setTimeout(() => {
                        Alert.alert('', 'Thank you for inviting your doctor. Your request is being reviewed');
                    }, 150);
                }
                else {
                    this.setState({ spinner: false });
                    setTimeout(() => {
                        Alert.alert('', data.message);
                    }, 150);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error TWO', error);
            this.setState({ spinner: false });
        }
    }

    render() {
        const { name, clinicName, contactNumber, message, spinner, errors } = this.state;
        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Invite Your Doctor"}
                    context={this.props}
                    // removeBackButton={false}
                    backButton={true}
                    right={null}
                    noShadow={true}
                />
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                {/* MAIN CONTENT SECTION */}
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} enableOnAndroid={true} extraScrollHeight={75}>
                    <ScrollView style={{
                        backgroundColor: colors.white,
                        width: "100%",
                    }}>
                        <View style={{
                            flex: 1,
                            marginTop: hp(4),
                            marginHorizontal: hp(5),
                            backgroundColor: colors.transparent,
                            height: hp(91.2),
                        }}>

                            {/* Name */}
                            <CustomTextInput
                                title={"Name*"}
                                value={name}
                                editable={true}
                                // icon={require('../assets/icons/IconUser.png')}
                                placeholder={"Write your doctor's name"}
                                onChangeText={name => {
                                    this.setState({ name })
                                }}
                                error={errors.name ? errors.name : false}
                                ref={'_firstNameField'}
                            />
                            {/* Clinic Name */}
                            <CustomTextInput
                                title={"Clinic Name*"}
                                value={clinicName}
                                editable={true}
                                placeholder={"Write your doctor's clinic name"}
                                onChangeText={clinicName => {
                                    this.setState({ clinicName })
                                }}
                                ref={'_firstNameField'}
                                error={errors.clinicName ? errors.clinicName : false}
                            />
                            {/* Contact Number */}
                            <CustomTextInput
                                title={"Contact Number"}
                                value={contactNumber}
                                editable={true}
                                placeholder={"Write your doctor’s contact number"}
                                onChangeText={contactNumber => {
                                    this.setState({ contactNumber })
                                }}
                                ref={'_firstNameField'}
                                keyboardType={'number-pad'}
                                maxLength={12}
                                masking={true}
                                maskType={'custom'}
                                maskOptions={{
                                    mask: '9999-9999999',
                                    validator: function (value, settings) {
                                        var re = /^\(?([0-9]{5})\)?[-.●]?([0-9]{7})[-.●]?([0-9]{1})$/;
                                        return re.test(value);
                                    }
                                }}
                                keyboardType={'number-pad'}
                                editable={true}
                            />

                            {/* Message */}
                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, textTransform: 'capitalize', marginTop: wp(0), paddingBottom: hp(1.5), }}>Message*</Text>
                            <View style={[errors.message ? GlobalStyles.borderError : GlobalStyles.borderGray, { width: "100%", borderRadius: wp(1), minHeight: hp(30) }]}>
                                <TextInput
                                    style={{
                                        fontFamily: Fonts.HelveticaNeue,
                                        fontSize: FontSize('small'),
                                        color: colors.black,
                                        backgroundColor: 'transparent',
                                        // height: hp(7),
                                        paddingHorizontal: wp(4),
                                        justifyContent: "flex-start",
                                        alignItems: "flex-start",
                                        textAlignVertical: "top",
                                        minHeight: hp(30)
                                    }}
                                    value={message}
                                    onChangeText={message => {
                                        this.setState({ message })
                                    }}
                                    underlineColorAndroid="transparent"
                                    placeholder={"Write a message to your doctor inviting them on DocLink"}
                                    placeholderTextColor={"#9E9E9E"}
                                    numberOfLines={8}
                                    multiline={true}
                                    maxLength={300}
                                />
                            </View>

                            <AppButton
                                onPressButton={this.handleSubmit}
                                styles={{ marginTop: hp(10), position: "absolute", bottom: hp(4), }}
                                title={"Submit"}
                            ></AppButton>
                        </View>
                    </ScrollView>
                </KeyboardAwareScrollView>
            </Container>
        );
    }
}

export default InviteYourDoctorScreen;

const styles = StyleSheet.create({





});