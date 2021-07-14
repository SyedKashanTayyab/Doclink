import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard, InputAccessoryView, Button, Alert } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Icon } from 'native-base';
import Modal from 'react-native-translucent-modal';
import Slider from '@react-native-community/slider';

import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import AppButton from './AppButton';
import permissions from '../components/Permissions'
import VoiceRecorder from './VoiceRecorder';
import VoicePlayerChiefComplaint from './VoicePlayerChiefComplaint'
var RNFS = require('react-native-fs');

const maxChars = 250;

const inputAccessoryViewID = 'inputAccessoryView1';

class StartNewSessionModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
            description: null,
            charsLeft: 0,
            iOSTopMargin: 0,
            showRecorded: false,
            showVoiceRecorder: false,
            isStartingRecording: false,
            cancelRecording: false,

            audioData: null,

            error: false
        }

    }

    componentDidMount = () => {
        this.setState({
            modalVisible: this.props.visible,
            newSessionReqData: this.props.data,
            audioData: (this.props.data.audioData == null) ? null : this.props.data.audioData,
            description: (this.props.data.description == null) ? null : this.props.data.description,
            showRecorded: (this.props.data.audioData == null) ? false : true,
        })
    }

    showModal() {
        this.setState({ modalVisible: true, });
    }

    _closeModal() {
        console.log("close mdoal fired");
        this.setState({ modalVisible: false, });
        this.props.onClosePress(false);
    }

    handleSubmit = () => {
        const { description, audioData } = this.state;
        if ((description == null || description == "") && audioData == null) {
            this.setState({ error: true })
        } else {
            this.setState({ error: false })
            this.props.onSubmitPress({ description: (description == null) ? "" : description, audioData: audioData })
        }
    }

    endRecording = () => {
        this.setState({ isStartingRecording: false, error: false })
    }

    voiceRecordingHandler(param) {
        permissions.write_external_storage((key, message) => {
            if (key == "granted") {
                permissions.microphone((key, message) => {
                    if (key == "granted") {
                        this.setState({
                            showVoiceRecorder: param,
                            cancelRecording: false,
                        }, () => {
                            this.setState({
                                isStartingRecording: param
                            })
                        })
                    } else {
                        Alert.alert(key.capitalize(), message)
                    }
                })
            } else {
                Alert.alert(key.capitalize(), "message")
            }
        })
    }

    audioOutputHandler = (data) => {
        console.log('====================================');
        console.log("audioOutputHandler", data)
        console.log('====================================');

        if (data == null) return;

        this.setState({
            audioData: data,
            showRecorded: true,
            isStartingRecording: false
        })

        // // Create image message object
        // let _arrMessage = [{
        //     _id: appHelper.guid(),
        //     createdAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
        //     local_url: data.path,
        //     text: JSON.stringify({
        //         url: "",
        //         duration: data.duration
        //     })
        // }]
        // let object = await this.create_message_object(_arrMessage, 'voice')
        // console.log("Message Object", object)
    }

    render() {
        const { modalVisible, description, charsLeft } = this.state;
        const { isStartingRecording, showRecorded, showVoiceRecorder, audioData, error } = this.state;
        return (
            <Fragment>
                {/* Example Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        this._closeModal();
                        // this.props.onClosePopup(false)
                    }}>

                    <View style={GlobalStyles.overlay} >
                        <View style={[GlobalStyles.ModalWrap, { marginTop: Platform.OS === 'ios' ? this.state.iOSTopMargin : wp(0) }]}>
                            <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.btnBgColor, paddingVertical: wp(4), paddingHorizontal: wp(5), borderTopLeftRadius: wp(1), borderTopRightRadius: wp(1), }]}>
                                <Text style={[GlobalStyles.modalHead,]}> Start New Session </Text>
                                <TouchableOpacity
                                    style={[GlobalStyles.shadowElevationSix, { backgroundColor: colors.transparent, position: "relative", top: 0, right: -wp(2), zIndex: 99, }]}
                                    onPress={() => {
                                        if (this.vpRef != undefined) {
                                            this.vpRef.onPause()
                                        }
                                        this._closeModal();
                                    }}
                                >
                                    <View style={[GlobalStyles.alignCenter, {}]}>
                                        <Icon type="AntDesign" name='closecircle' style={{ fontSize: hp(3), color: colors.white, }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.transparent, }]}>
                                <View style={[{ width: '100%', marginTop: hp(0), paddingBottom: hp(3), paddingHorizontal: wp(6), }]}>
                                    {/* Message */}
                                    <View style={[GlobalStyles.borderGray, { width: "100%", borderRadius: wp(1), marginTop: 0, paddingLeft: wp(2), maxHeight: hp(30), marginTop: 20 }]}>
                                        <TextInput
                                            style={{
                                                fontFamily: Fonts.HelveticaNeue,
                                                fontSize: FontSize('small'),
                                                color: colors.black,
                                                backgroundColor: 'transparent',
                                                paddingHorizontal: wp(4),
                                                textAlignVertical: "top",
                                                height: hp(29)
                                            }}
                                            value={description}
                                            onChangeText={description => {
                                                var input = description.length;
                                                this.setState({ charsLeft: parseInt(input), description });
                                            }}
                                            onFocus={e => this.setState({ iOSTopMargin: wp(-40) })}
                                            onBlur={e => this.setState({ iOSTopMargin: wp(0) })}
                                            underlineColorAndroid="transparent"
                                            placeholder={`Please share your problem with Dr. ${this.props.doctor.name}`}
                                            placeholderTextColor={colors.placeholderColor}
                                            numberOfLines={8}
                                            multiline={true}
                                            maxLength={maxChars}
                                            inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                        />
                                    </View>
                                    <View style={{ flexDirection: "row", justifyContent: "flex-end", backgroundColor: colors.white }}>
                                        <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueItalic, color: "#888888" }}>{charsLeft}/{maxChars}</Text>
                                    </View>
                                    {/* Audio Record */}
                                    <View style={{ alignItems: 'center' }}>
                                        {
                                            this.props.enable_voice_cc == true
                                                ? showRecorded
                                                    ?
                                                    <VoicePlayerChiefComplaint
                                                        ref={vpRef => this.vpRef = vpRef}
                                                        data={audioData}
                                                        containerStyle={{
                                                            width: wp(60),
                                                            height: hp(7),
                                                        }}
                                                        childElements={<></>}
                                                        onTrashHandler={(object) => {
                                                            console.log("===== TrashHandler ====")
                                                            console.log(object)
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
                                                    </VoicePlayerChiefComplaint>
                                                    :
                                                    <View >
                                                        {
                                                            showVoiceRecorder
                                                                ?
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                                    <TouchableOpacity onPress={this.endRecording} style={styles.mediabtn}>
                                                                        <Icon style={{ color: '#fff', fontSize: 20 }} type="FontAwesome" name="stop" />
                                                                    </TouchableOpacity>
                                                                    <VoiceRecorder
                                                                        maxRecordingInSeconds={this.props.record_time}
                                                                        recording={this.state.isStartingRecording}
                                                                        output={this.audioOutputHandler}
                                                                        cancelRecording={this.state.cancelRecording}
                                                                        textStyle={{ textAlignVertical: 'center', fontSize: FontSize('xxLarge'), marginLeft: wp(4), fontFamily: Fonts.HelveticaNeue }}
                                                                    />
                                                                </View>
                                                                : <TouchableOpacity onPress={() => {
                                                                    this.voiceRecordingHandler(true)
                                                                }} style={styles.mediabtn}>
                                                                    <Icon style={{ color: '#fff', fontSize: 28 }} type="FontAwesome" name="microphone" />
                                                                </TouchableOpacity>
                                                        }
                                                    </View>
                                                : null
                                        }
                                    </View>
                                </View>

                                {
                                    error == true ?
                                        <Text style={{ marginHorizontal: wp(6), width: '80%', textAlign: 'justify', fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: 'red', marginBottom: hp(1), }}>You forgot to share you problem</Text>
                                        : null
                                }

                                <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, paddingHorizontal: wp(6), marginBottom: hp(2), }]}>
                                    <AppButton
                                        onPressButton={() => {
                                            if (this.vpRef != undefined) {
                                                this.vpRef.onPause()
                                            }
                                            this.handleSubmit()
                                        }}
                                        styles={{ width: "100%", borderBottomLeftRadius: wp(1.5), borderRadius: 0, }}
                                        title={"Submit"}
                                    ></AppButton>
                                </View>
                            </View>
                        </View>
                    </View>

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
                </Modal>
            </Fragment >
        );
    }
}

const styles = StyleSheet.create({
    headingTxt: {
        color: colors.primary,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        flex: 1,
    },
    paraTxt: {
        color: colors.black,
        fontFamily: Fonts.latoLight,
        fontSize: FontSize('mini'),
        flex: 1,
    },
    mediabtn: {
        backgroundColor: colors.btnBgColor,
        width: wp(12), height: wp(12),
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    }
})


export default StartNewSessionModal;
