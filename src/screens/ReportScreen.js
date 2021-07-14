import React, { Component } from 'react';
import { View, StyleSheet, Alert, TextInput, Platform, Text } from 'react-native';
import { Icon, Container, } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
// import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { reportProblem } from '../api/Setting';
import NavigationBar from '../components/NavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../utils/Colors';
import AppButton from '../components/AppButton';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';
import FloatingLabel from '../components/CustomFloatingTextInput';
import DropDownPicker from '../components/DropDownPicker';
import { API_URL } from '../utils/Constant'
import API from '../services/API';

const maxChars = 500;

let doctorReportCategory = [
    { label: 'General', value: 'general' },
    { label: 'Patient', value: 'patient' },
    { label: 'Application', value: 'application' },
    { label: 'Payment', value: 'payment' },
]

let patientReportCategory = [
    { label: 'General', value: 'general' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Application', value: 'application' },
    { label: 'Payment', value: 'payment' },
]

class ReportScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            spinner: false,
            subject: "",
            category: "",
            categoryItems: global.target == "doctor" ? doctorReportCategory : patientReportCategory,
            categoryPlaceholder: "Category*",
            description: "",
            errors: { subject: false, category: false, description: false, },
            resetDropdown: false,
            charsLeft: 0
        };
    }

    _submitForm = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = {
            user_id: user_id,
            access_token: access_token,
            subject: this.state.subject,
            category: this.state.category,
            description: this.state.description,
        }
        try {
            const res = await API.post(API_URL.SETTING_REPORT_PROBLEM, params)
            if (res) {
                const data = res;
                if (data.status == 'Success') {
                    Alert.alert('', 'Thank you for submitting your request. We will contact you shortly.');
                    this.setState({
                        subject: "",
                        category: "",
                        categoryPlaceholder: "refresh",
                        description: "",
                        resetDropdown: true,
                        charsLeft: 0
                    });
                    setTimeout(() => {
                        this.setState({
                            resetDropdown: false
                        })
                    }, 1000);
                }
                else if (data.status == 'Error') {
                    console.warn('Internal Server Error', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    onValueChange(value) {
        this.setState({
            category: value
        });
    }

    validateCategory = () => {
        const { errors, category } = this.state;
        // Alert.alert('', "Category Required");
        if (category == '') {
            errors.category = true;
            this.setState({ errors, });
            return false;
        } else {
            errors.category = false;
            this.setState({ errors, })
        }
    }

    validateSubject = () => {
        const { errors, subject } = this.state;
        if (subject == '') {
            errors.subject = "Subject Required";
            this.setState({ errors, })
            return false;
        } else {
            errors.subject = false;
            this.setState({ errors, })
        }
    }

    handleDropdownChange = (item) => {
        const { errors, } = this.state;

        // SET CATEGORY ERROR TO FALSE,
        errors.category = false;
        this.setState({ errors, })

        // UPDATE CATEGORY STATE HERE
        this.setState({
            category: item.value,
        });
    }

    render() {
        const { spinner, description, categoryItems, categoryPlaceholder, subject, errors, charsLeft } = this.state;
        // console.log("===================")
        // console.log("render () category ===>", this.state.category)
        // console.log("===================")

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Report a Problem"}
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
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} enableOnAndroid={true} extraScrollHeight={Platform.OS == "android" ? 75 : 0}>
                    <ScrollView
                        style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: hp(4),
                            marginHorizontal: hp(5),
                            backgroundColor: colors.transparent,
                        }}>
                            <View>

                                <DropDownPicker
                                    items={categoryItems}
                                    showArrow={true}
                                    arrowColor={colors.strokeColor1}
                                    reset={this.state.resetDropdown}
                                    customArrowUp={() => <Icon type="MaterialIcons" name="arrow-drop-up" style={{ color: colors.strokeColor1, }} />}
                                    customArrowDown={() => <Icon type="MaterialIcons" name="arrow-drop-down" style={{ color: colors.strokeColor1, }} />}
                                    dropDownStyle={[GlobalStyles.defaultDropdownStyle,]}
                                    placeholder={categoryPlaceholder}
                                    placeholderStyle={{ color: colors.placeholderColor, }}
                                    labelStyle={[GlobalStyles.defaultLabelStyle, {}]}
                                    defaultValue={null}
                                    containerStyle={{ height: hp(7), marginBottom: 20 }}
                                    style={[GlobalStyles.pickerDefaultStyle, (errors && errors.category != "") ? GlobalStyles.inputErrorStyle : {},]}
                                    onChangeItem={this.handleDropdownChange}
                                />

                                {/* Subject */}
                                <FloatingLabel
                                    labelStyle={[GlobalStyles.labelStyle,]}
                                    inputStyle={[GlobalStyles.inputStyle, (errors && errors.subject != "") ? GlobalStyles.inputErrorStyle : {}]}
                                    style={[GlobalStyles.inputWrapper]}
                                    value={subject}
                                    onChangeText={subject => this.setState({ subject })}
                                    // onFocus={this.handleOnFocus}
                                    onBlur={this.validateSubject}
                                    error={(errors && errors.subject != "") ? true : false}
                                >
                                    {/* PLACEHOLDER */}
                                    {(errors && errors.subject != "") ? errors.subject : 'Subject*'}
                                </FloatingLabel>

                                {/* Message */}
                                {/* <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, textTransform: 'capitalize', marginTop: wp(0), paddingBottom: hp(1), }}>Message</Text> */}
                                <View style={[errors.description ? GlobalStyles.borderError : GlobalStyles.borderGray, { width: "100%", borderRadius: wp(1), marginTop: 0, paddingLeft: wp(2), minHeight: hp(30), marginTop: 20 }]}>
                                    <TextInput
                                        style={{
                                            fontFamily: Fonts.HelveticaNeue,
                                            fontSize: FontSize('small'),
                                            color: colors.black,
                                            backgroundColor: 'transparent',
                                            paddingLeft: wp(4),
                                            textAlignVertical: "top",
                                            minHeight: "100%",
                                        }}
                                        value={description}
                                        onChangeText={description => {
                                            var input = description.length;
                                            this.setState({ charsLeft: parseInt(input), description });
                                        }}
                                        underlineColorAndroid="transparent"
                                        placeholder={"Help us improve ourselves"}
                                        placeholderTextColor={colors.placeholderColor}
                                        numberOfLines={11}
                                        multiline={true}
                                        maxLength={maxChars}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "flex-end", backgroundColor: colors.white }}>
                                    <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueItalic, color: "#888888" }}>{charsLeft}/{maxChars}</Text>
                                </View>
                                <AppButton
                                    onPressButton={() => {
                                        Alert.alert(
                                            '',
                                            'Confirm Submit?',
                                            [
                                                { text: 'Cancel', onPress: () => { return null } },
                                                {
                                                    text: 'Confirm', onPress: () => {
                                                        if (this.state.category.length == 0) {
                                                            this.validateCategory();
                                                        }
                                                        else if (this.state.subject.length == 0) {
                                                            this.validateSubject();
                                                        }
                                                        else if (this.state.description.length == 0) {
                                                            // Alert.alert('', "Description Required");
                                                            errors.category = false;
                                                            errors.subject = false;
                                                            errors.description = true;
                                                            this.setState({ errors, });
                                                        }
                                                        else {
                                                            errors.category = false;
                                                            errors.subject = false;
                                                            errors.description = false;
                                                            this._submitForm();
                                                        }
                                                    }
                                                },
                                            ],
                                            { cancelable: false }
                                        )
                                    }}
                                    styles={{ marginTop: hp(4), marginBottom: hp(4) }}
                                    title={"Submit"}
                                ></AppButton>

                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAwareScrollView>
            </Container>
        );
    }
}

export default ReportScreen;

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