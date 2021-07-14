import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, Platform, } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Slider from '@react-native-community/slider';
import Modal from 'react-native-translucent-modal';
import { Icon } from 'native-base';

import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import AppButton from './AppButton';
import AppInfo from '../modules/AppInfoNativeModule';
import VoicePlayerChatRequestPopup from '../components/VoicePlayerChatRequestPopup';
import appHelper from '../utils/AppHelper';


class NewChatRequestPopup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
        }


        // console.log("constructor() ================");
        // console.log("this.props.showPopup", this.props.data);
        // console.log("constructor() ================");

        //this._setModalVisible()

    }

    _setModalVisible(visible) {
        // console.log("_setModalVisible() ================");
        // console.log("this.props.showPopup", this.props.showPopup);

        this.setState({
            modalVisible: this.props.showPopup,
        });
    }

    _closeModal() {
        // console.log("_closeModal fired");
        this.props.onPressCancel();
    }

    render() {
        const { booking } = this.state;
        const { showPopup, data, onPressAccept, onPressReject } = this.props;

        // console.log("======================");
        // console.log("CHATREQUESTPOUP data", this.props.data);
        // console.log("======================");
        // console.log("======================");
        // console.log("CHATREQUESTPOUP AppInfo.TARGET", AppInfo.TARGET );
        // console.log("======================");

        const rejectBtnStyle = (AppInfo.TARGET == 'patient') ? styles.rejectBtnFullWidth : styles.rejectBtnHalf;

        let json_request_data = (data != '' && appHelper.isEmpty(data.request_data) == false) ? JSON.parse(data.request_data) : null
        return (
            <Fragment>
                {/* Example Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showPopup}
                    onRequestClose={() => {
                        this._closeModal();
                        // this.props.onClosePopup(false)
                    }}>

                    <View style={GlobalStyles.overlay}>
                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>
                            <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.btnBgColor, paddingVertical: wp(4), paddingHorizontal: wp(5), borderTopRightRadius: wp(1.5), borderTopLeftRadius: wp(1.5), }]}>
                                <Text style={[GlobalStyles.modalHead,]}>{(AppInfo.TARGET == 'patient') ? "My Chat Request" : "New Chat Request"}  </Text>
                                <TouchableOpacity
                                    style={[GlobalStyles.shadowElevationSix, { backgroundColor: colors.transparent, position: "relative", top: 0, right: -wp(2), zIndex: 99, }]}
                                    onPress={() => {
                                        if (this.refNCR != undefined) {
                                            this.refNCR.onPause()
                                        }
                                        this._closeModal();
                                    }}
                                >
                                    <View style={[GlobalStyles.alignCenter, {}]}>
                                        <Icon type="AntDesign" name='closecircle' style={{ fontSize: hp(3), color: colors.white, }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, }]}>
                                <View style={[{ width: '100%', minHeight: hp(20), backgroundColor: colors.transparent, paddingVertical: hp(2), }]}>
                                    <View style={[{ marginTop: hp(0), marginBottom: hp(2), paddingHorizontal: wp(5), paddingVertical: hp(0), }]}>
                                        <Text style={[styles.label, {}]}>{(AppInfo.TARGET == 'patient') ? "Doctor Name" : "Patient Name:"}</Text>
                                        <Text style={[styles.paraTxt, {}]} numberOfLines={2}>
                                            {
                                                (data === null) ?
                                                    ""
                                                    :
                                                    (AppInfo.TARGET == 'patient') ? (`${data.title} ${data.doctor_name}`) : data.patient.name
                                            }
                                        </Text>
                                    </View>
                                    <View style={[{ marginTop: hp(0), marginBottom: hp(0), paddingHorizontal: wp(5), paddingVertical: hp(0), }]}>
                                        <Text style={[styles.label, {}]}>Chief Complaint:</Text>
                                        {
                                            (data != null && data.chief_complaint != "")
                                                ? <Text style={[styles.paraTxt, {}]} numberOfLines={7}>{(data === null) ? "" : data.chief_complaint}</Text>
                                                : null
                                        }
                                        {
                                            (json_request_data != null && appHelper.isEmpty(json_request_data.audioData) == false)
                                                ?
                                                <VoicePlayerChatRequestPopup
                                                    ref={refNCR => this.refNCR = refNCR}
                                                    data={json_request_data.audioData}
                                                    containerStyle={{
                                                        width: "100%",
                                                        height: hp(7),
                                                    }}
                                                    childElements={<></>}
                                                    onTrashHandler={(object) => {
                                                        // console.log(object)
                                                        return RNFS.unlink(object.path)
                                                            .then(() => {
                                                                console.log('FILE DELETED');
                                                                this.setState({
                                                                    audioData: null,
                                                                    showRecorded: false,
                                                                    showVoiceRecorder: false
                                                                })
                                                            })
                                                            // `unlink` will throw an error, if the item to unlink does not exist
                                                            .catch((err) => {
                                                                console.log(err.message);
                                                            });
                                                    }}>
                                                </VoicePlayerChatRequestPopup>
                                                // <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: hp(2) }}>
                                                //     <TouchableOpacity style={[styles.mediabtn, { paddingLeft: wp(1) }]}>
                                                //         <Icon style={{ color: '#fff', fontSize: 24 }} type="FontAwesome" name="play" />
                                                //     </TouchableOpacity>
                                                //     <Slider
                                                //         style={{ width: wp(60), height: 25 }}
                                                //         minimumValue={0} maximumValue={1}
                                                //         thumbTintColor={colors.btnBgColor}
                                                //         minimumTrackTintColor={colors.btnBgColor}
                                                //         maximumTrackTintColor="#000000"
                                                //     />
                                                //     <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.black }}>{json_request_data.audioData.duration}</Text>
                                                // </View>
                                                : null
                                        }
                                    </View>
                                </View>
                                <View style={[{ flexDirection: "row", backgroundColor: colors.transparent }]}>
                                    {
                                        (AppInfo.TARGET == 'patient') ?
                                            <AppButton
                                                onPressButton={() => {
                                                    if (this.refNCR != undefined) {
                                                        this.refNCR.onPause()
                                                    }
                                                    onPressReject()
                                                }}
                                                styles={[styles.rejectBtnDefault, rejectBtnStyle]}
                                                title={"Cancel Request"}
                                                textColor={colors.primaryText}>
                                            </AppButton>
                                            :
                                            <>
                                                <AppButton
                                                    onPressButton={() => {
                                                        if (this.refNCR != undefined) {
                                                            this.refNCR.onPause()
                                                        }
                                                        onPressAccept()
                                                    }}
                                                    styles={[styles.acceptBtn]}
                                                    title={"Accept"}>
                                                </AppButton>
                                                <AppButton
                                                    onPressButton={() => {
                                                        if (this.refNCR != undefined) {
                                                            this.refNCR.onPause()
                                                        }
                                                        onPressReject()
                                                    }}
                                                    styles={[styles.rejectBtnDefault, rejectBtnStyle]}
                                                    title={"Reject"}
                                                    textColor={colors.primaryText}>
                                                </AppButton>
                                            </>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    headingTxt: {
        color: colors.primary,
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: FontSize('large'),
    },
    paraTxt: {
        fontFamily: Fonts.HelveticaNeue,
        color: colors.black,
        fontSize: FontSize('small'),
        lineHeight: FontSize('small'),
        textAlign: "left",
        // backgroundColor:"#f1f1f1",
    },
    label: {
        fontFamily: Fonts.HelveticaNeueBold,
        color: colors.black,
        fontSize: FontSize('small'),
        textAlign: "left",
        paddingBottom: hp(0.5),
        // backgroundColor:"#f1f1f1",
    },
    acceptBtn: {
        marginTop: hp(0), width: wp(45), borderBottomLeftRadius: wp(1.5), borderRadius: 0,
    },
    rejectBtnDefault: {
        marginTop: hp(0), borderBottomRightRadius: wp(1.5), borderRadius: 0, backgroundColor: "#d1eafe",
    },
    rejectBtnHalf: {
        width: wp(45),
    },
    rejectBtnFullWidth: {
        width: wp(90),
        borderBottomLeftRadius: wp(1.5),
    },
    mediabtn: {
        backgroundColor: colors.btnBgColor,
        width: wp(12), height: wp(12),
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default NewChatRequestPopup;
