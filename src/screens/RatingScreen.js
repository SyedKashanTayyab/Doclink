import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableHighlight, TouchableWithoutFeedback, Alert, Button, TouchableOpacity, TextInput } from 'react-native';
import { H1, H2, Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import StarRating from 'react-native-star-rating';

import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { SubmitRating } from '../api/Patient';
import AppInfo from '../modules/AppInfoNativeModule';
import GlobalStyles from '../styles/GlobalStyles';
import colors from '../utils/Colors';
import AppButton from '../components/AppButton';
import FontSize from '../utils/FontSize';

class RatingScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            data: [],
            review: '',
            rating: '0',
            session_data: [],
            star_color: colors.btnBgColor,
            visible: false,
            step_two: false,
            spinner: false,
            modalVisible: true,
        };
    }

    componentDidMount = () => {
        this.setState({
            session_data: this.props.data,
            visible: true,
        });
    };


    onStarRatingPress(rating) {

        var color = colors.btnBgColor;
        if (rating < 3) {
            color = '#e0282b';
        }
        this.setState({
            rating: rating,
            star_color: color
        });
    }

    _submitForm = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");

        var params = {
            access_token: access_token,
            given_by: this.state.session_data.patient_id,
            given_to: this.state.session_data.doctor_id,
            session_id: this.state.session_data.id,
            review: this.state.review,
            rating: this.state.rating,
        }
        // console.log("_submitForm", params)
        try {
            const res = await SubmitRating(params);
            if (res) {
                const { data } = await res;
                this.setState({ spinner: false });
                if (data.status == "Success") {
                    
                    this._closeModal(null, false);
                    setTimeout(() => {
                        Alert.alert("", "Your rating and feedback has been submitted, Thank You.");
                    }, 150);
                }
                else if (data.status == "Error") {
                    // this.clearForm();
                    this._closeModal(null, false);
                    console.log("Internal Server Error", data.message);
                }
            }
        }
        catch (error) {
            this.setState({ spinner: false });
            this._closeModal(null, false);
            console.warn("Internal Server Error", error);
        }
    }

    clearForm = () => {
        this.setState({
            review: '',
            rating: '0',
            session_data: [],
            star_color: '#f99603',
            visible: false,
            step_two: false
        })
    }

    handleSubmit = async (comments) => {

        if (comments) {
            Alert.alert(
                '',
                'Confirm Submit?',
                [
                    { text: 'Cancel', onPress: () => { return null } },
                    {
                        text: 'Confirm', onPress: () => {
                            if (this.state.review.length == 0) {
                                Alert.alert('', 'Feedback Required');
                            }
                            else {

                                this._submitForm();

                            }
                        }
                    },
                ],
                { cancelable: false }
            )
        }
        else {
            this._submitForm();
        }
    }

    _closeModal(params, showFeedbackScreen = true) {
        // this.setState({ modalVisible: false, });
        // console.log("_closeModal fired fired");
        this.props.onCloseModal(params, showFeedbackScreen);
    }

    redirectToFeedbackScreen = async () => {
        const { rating, session_data, review } = this.state;
        const access_token = await appHelper.getItem("access_token");
        // console.log("redirectToFeedbackScreen", session_data);
        let ratingParams = {
            "access_token": access_token,
            "given_by": session_data.patient_id,
            "given_to": session_data.doctor_id,
            "session_id": session_data.id,
            "review": review,
            "rating": rating,
        }
        this.props.onCloseModal(ratingParams);
        // CLOSE MODAL
        // this._closeModal();



    }

    render() {
        const { visible, star_color, step_two, rating } = this.state;

        return (
            <Fragment>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.props.showRatingPopup}
                    onRequestClose={() => {
                        this._closeModal();
                        // this.props.onClosePopup(false)
                    }}>

                    <View style={GlobalStyles.overlay} >
                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), }]}>
                            <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.btnBgColor, paddingVertical: wp(4), paddingHorizontal: wp(5), borderTopLeftRadius: wp(1), borderTopRightRadius: wp(1), }]}>
                                <Text style={[GlobalStyles.modalHead,]}> Session Ended</Text>
                                <TouchableOpacity
                                    style={[ GlobalStyles.shadowElevationSix, { backgroundColor: colors.transparent, position: "relative", top: 0, right: -wp(2), zIndex: 99, }]}
                                    onPress={() => {
                                        this._closeModal();
                                    }}
                                >
                                    <View style={[GlobalStyles.alignCenter, {}]}>
                                        <Icon type="AntDesign" name='closecircle' style={{ fontSize: hp(3), color: colors.white, }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.transparent, }]}>
                                <View style={[{ width: '100%', marginTop: hp(2), paddingBottom: hp(2), }]}>
                                    <KeyboardAwareScrollView>
                                        <View style={{ padding: 10, }}>
                                            <View style={{ alignItems: "center", }}>
                                                <Text style={{ fontSize: FontSize('small'), color: colors.black, fontFamily: Fonts.HelveticaNeue, }}>How would you rate your interaction today?</Text>
                                                <View style={{ paddingTop: hp(2), paddingBottom: 10, width:"100%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", }}>
                                                    <StarRating
                                                        disabled={false}
                                                        maxStars={5}
                                                        rating={this.state.rating}
                                                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                                                        fullStarColor={star_color}
                                                        emptyStarColor={star_color}
                                                        starStyle={{ marginRight:8, }}
                                                    />
                                                </View>
                                                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 20, justifyContent: 'center' }}>
                                                    <AppButton
                                                        onPressButton={() => {
                                                            if (AppInfo.TARGET == "doctor") {
                                                                // Submit Rating to server with out feedback
                                                                this.handleSubmit(false)
                                                            }
                                                            else if (AppInfo.TARGET == "patient") {
                                                                if (rating == 0) {
                                                                    Alert.alert('Alert', 'Select a Rating')
                                                                    return;
                                                                }
                                                                if (rating <= 3) {
                                                                    // If rating is 3 or less than then feedback screen will appear
                                                                    // this.setState({ step_two: true })
                                                                    this.redirectToFeedbackScreen()
                                                                } else {
                                                                    // if rating is 3 or greater than then feedback screen will not appear and send rating to server
                                                                    this.handleSubmit(false)
                                                                }
                                                            }
                                                        }}
                                                        styles={{ width: "100%", borderRadius: wp(1), }}
                                                        title={"Submit"}
                                                    ></AppButton>
                                                </View>
                                            </View>
                                        </View>
                                    </KeyboardAwareScrollView>


                                </View>
                            </View>
                        </View>
                    </View>

                </Modal>
            </Fragment>

        );
    }
}

export default RatingScreen;

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