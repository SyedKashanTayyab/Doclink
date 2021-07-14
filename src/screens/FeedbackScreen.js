import React, { Component } from 'react';
import { View, StyleSheet, Alert, TextInput, Text } from 'react-native';
import { Container, } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
// import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import appHelper, { CustomSpinner } from '../utils/AppHelper';
import NavigationBar from '../components/NavigationBar';
import { ScrollView } from 'react-native-gesture-handler';
import colors from '../utils/Colors';
import AppButton from '../components/AppButton';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';
import CustomAudioPlayer from '../components/CustomAudioPlayer';
import { API_URL } from '../utils/Constant';
import API from '../services/API';


class FeedbackScreen extends Component {
    constructor(props) {
        super(props)
        
        // GET PARAMS COMING FROM SESSION END RATING POPUP
        const { navigation } = this.props;
        const paramsData = navigation.getParam('ratingParams', "")


        this.state = {
            spinner: false,
            description: "",
            audioFile: null,
            ratingParams: paramsData,
        }
    }

    getAudioFile = (data) => {
        // console.log("====================");
        // console.log("getAudioFile", data);
        // console.log("====================");

        this.setState({ audioFile: data, })
    }

    _submitForm = async () => {
        const { audioFile, description, ratingParams } = this.state;
        console.log("SUBMIT FORM", audioFile);
        if (audioFile == null && description == "") {
            console.log("audio verify");
            Alert.alert('Alert', "The feedback is empty")
            return;
        }
        this.setState({ spinner: true });
        let params = [
            {
                "key": "feedback",
                "value": description,
            },
            {
                "key": "access_token",
                "value": ratingParams.access_token,
            },
            {
                "key": "rating",
                "value": ratingParams.rating,
            },
            {
                "key": "given_by",
                "value": ratingParams.given_by,
            },
            {
                "key": "given_to",
                "value": ratingParams.given_to,
            },
            {
                "key": "review",
                "value": ratingParams.review,
            },
            {
                "key": "session_id",
                "value": ratingParams.session_id,
            },
        ]
        // console.log("ratingParams after", ratingParams);
        // console.log("feedback params before hitting API", params);

        try {
            const response = await API.postMultipart(API_URL.PATIENT_FEEDBACK, audioFile, params, null);
            if (response) {
                console.log("response",response)
                const { data } = await response;
                if (response.status == "Success") {
                    // const data = await API.post(API_URL.PATIENT_FEEDBACK, params);
                    this.setState({ spinner: false });

                    this.props.navigation.navigate('Home')
                    // setTimeout(() => {
                    //     Alert.alert(
                    //         '',
                    //         response.message,
                    //         [
                    //             { text: 'OK', onPress: () => this.props.navigation.navigate('Home') },
                    //         ],
                    //         { cancelable: false },
                    //     );
                    // }, 500);

                } else if (data.status == "Error") {
                    this.setState({ spinner: false });
                    console.log("Internal Server Error", data.message);
                }
            }
        } catch (error) {
            Alert.alert("", JSON.stringify(error));
            console.log("catch",error)
            this.setState({ spinner: false });
        }
    }

    handleNotNow = () => {
        this.props.navigation.navigate("Home");
    }

    render() {
        const { spinner, description, } = this.state;
        // console.log("===================")
        // console.log("render () category ===>", this.state.category)
        // console.log("===================")

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Feedback"}
                    context={this.props}
                    // removeBackButton={false}
                    backButton={true}
                    right={null}
                />
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                {/* MAIN CONTENT SECTION */}
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} enableOnAndroid={true} extraScrollHeight={Platform.OS == "android" ? 75 : 10}>
                    <ScrollView
                        style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: hp(1.8),
                            marginHorizontal: hp(5),
                            backgroundColor: colors.transparent,
                        }}>
                                <Text style={{
                                    fontFamily: Fonts.HelveticaNeue,
                                    fontSize: FontSize('small'),
                                    color: colors.black,
                                    marginHorizontal: wp('0'),
                                    marginVertical: hp('2%'),
                                    textAlign: 'center',
                                }}
                                >
                                    Help us improve our services by giving your
                                    valuable feedback. You can either type it or
                                    record a voice note.
                                </Text>

                                {/* AUDIO PLAYER */}
                                <CustomAudioPlayer audioData={this.getAudioFile} />


                                {/* Message */}
                                {/* <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, textTransform: 'capitalize', marginTop: wp(0), paddingBottom: hp(1), }}>Message</Text> */}
                                <View style={[GlobalStyles.borderGray, { width: "100%", borderRadius: wp(1), marginTop: 20, minHeight: hp(30), paddingLeft: wp(2), }]}>
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
                                            this.setState({ description })
                                        }}
                                        underlineColorAndroid="transparent"
                                        placeholder={"Type your feedback here..."}
                                        placeholderTextColor={colors.placeholderColor}
                                        numberOfLines={16}
                                        multiline={true}
                                        maxLength={300}
                                    />
                                </View>

                                <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                                    <AppButton
                                        onPressButton={this._submitForm}
                                        styles={{ marginTop: hp(5), width: wp(38.5), }}
                                        title={"Submit"}
                                    ></AppButton>
                                    <AppButton
                                        onPressButton={this.handleNotNow}
                                        styles={{ marginTop: hp(5), width: wp(38.5), borderBottomRightRadius: wp(1.5), borderRadius: 0, backgroundColor: "#d1eafe", }}
                                        title={"Not Now"}
                                        textColor={colors.primaryText}
                                    ></AppButton>
                                </View>

                        </View>
                    </ScrollView>
                </KeyboardAwareScrollView>
            </Container>
        );
    }
}

export default FeedbackScreen;

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