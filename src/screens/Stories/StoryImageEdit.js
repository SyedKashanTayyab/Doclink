
import { Icon } from 'native-base';
import React, { Component } from 'react';
import { Modal, TouchableOpacity, Image, StyleSheet, ImageBackground, Text, View, TextInput, Platform, StatusBar, KeyboardAvoidingView, Keyboard, Pressable } from 'react-native';

import { API_URL, URL_IMAGE_UPLOAD } from '../../utils/Constant';
import { CustomSpinner } from '../../utils/AppHelper';
import API from '../../services/API';
import colors from '../../utils/Colors';
import { Fonts } from '../../utils/Fonts';
import FontSize from '../../utils/FontSize';
import { hp, wp } from '../../utils/Utility';
import PrivacyModal from '../../modals/PrivacyModal';
import { TouchableHighlight, TouchableWithoutFeedback } from 'react-native-gesture-handler';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

class StoryImageEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            spinnnerText: "Loading...",

            imageObject: { path: '' },
            visible: false,
            myPatient: true,
            caption: '',

            viewPrivacy: false,

            textInputHeight: wp(4),

        };
    }

    static getDerivedStateFromProps(props, state) {

        if (props.visible !== state.visible) {
            return {
                visible: props.visible,
                imageObject: props.imageObject
            }
        }
        return null
    }

    onSubmit = async () => {
        this.setState({ spinner: true });
        const privacy = this.state.myPatient == true ? 'patient' : 'public';
        const url = this.state.imageObject.path;

        try {
            let params = {
                type: 'image',
                data: JSON.stringify({ url }),
                privacy,
                caption: this.state.caption,
            };

            const res = await API.post(API_URL.DOCTOR_STORIES, params);

            this.setState({ spinner: false, imageObject: { path: '' }, visible: false, myPatient: true, caption: '' })

            this.props.onClosePress(false, true)
        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    queueImageUpload = async () => {

        try {
            this.setState({ spinner: true, spinnnerText: 'Uploading...' });
            const response = await API.postMultipart(URL_IMAGE_UPLOAD, this.state.imageObject.path, [], null, 'image')
            let cloneImageList = this.state.imageObject
            cloneImageList.path = response.data.base_url + '/' + response.data.image_name;
            this.setState({ imageObject: cloneImageList })
            this.setState({ spinnnerText: 'Uploading...' })
            this.onSubmit();

        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    render() {
        const { myPatient, spinner, viewPrivacy } = this.state;
        return (
            <Modal
                visible={this.state.visible}
                transparent={true}
                animationType="slide"
                style={{ flex: 1, width: wp(100), height: hp(100) }}
            >
                {/* Spinner */}
                <CustomSpinner visible={spinner} text={this.state.spinnnerText} activityColor={colors.white} textStyle={{ color: colors.white }} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={{ flex: 1 }}>
                    <View style={{ flex: 1 }} onPress={() => {
                        Keyboard.dismiss()
                    }}>
                        <ImageBackground style={styles.chatBackground} resizeMode="contain" source={{ uri: this.state.imageObject.path }} >

                            <TouchableOpacity style={[styles.cameraIcon, { backgroundColor: 'transparent', borderWidth: 0, marginTop: Platform.OS === 'ios' ? STATUSBAR_HEIGHT : 0 }]} onPress={() => this.props.onClosePress(false)}>
                                {/* <Icon type="AntDesign" name="close" style={{ color: '#fff' }} /> */}
                                <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/doctor_status_close.png')} />
                            </TouchableOpacity>
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: wp(4), paddingBottom: wp(4) }}>
                                    <TouchableOpacity onPress={() => this.props.onClosePress(false)} style={styles.cameraIcon}>
                                        <Image style={{ width: wp(5), height: wp(5), tintColor: colors.tintColor, resizeMode: 'contain' }} source={require('../../assets/icons/status_camera_icon.png')} />
                                    </TouchableOpacity>
                                    <TextInput
                                        multiline
                                        placeholder="Add a caption..."
                                        onChangeText={(text) => this.setState({ caption: text })}
                                        value={this.state.caption}
                                        // keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                                        onContentSizeChange={(e) => {
                                            this.setState({
                                                textInputHeight: e.nativeEvent.contentSize.height
                                            })
                                            // console.log("NOL", e.nativeEvent.contentSize.height, e.nativeEvent.contentSize.height / FontSize('xMini'))
                                        }}
                                        style={{
                                            backgroundColor: '#fff',
                                            width: wp(70),
                                            height: this.state.textInputHeight,
                                            borderRadius: wp(6),
                                            minHeight: wp(10),
                                            fontSize: FontSize('xMini'),
                                            paddingHorizontal: wp(4),
                                            paddingVertical: wp(1),
                                            borderColor: colors.borderColor1,
                                            borderWidth: 1,
                                            color: colors.black
                                        }}
                                    />
                                    <TouchableOpacity onPress={this.queueImageUpload}>
                                        <Image style={{ resizeMode: 'contain', width: wp(10), height: wp(10), }} source={require('../../assets/icons/submit_status.png')} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: wp(10), paddingHorizontal: wp(4), width: wp(100), backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => this.setState({ myPatient: true })} style={[myPatient ? null : styles.publicstyles, { width: wp(5), height: wp(5) }]}>
                                            {
                                                myPatient
                                                    ? <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5), }} source={require('../../assets/icons/set_public_icon.png')} />
                                                    : null
                                            }
                                        </TouchableOpacity>
                                        <Text style={{ color: colors.white, fontFamily: Fonts.HelveticaNeueBold, paddingLeft: wp(2), textAlignVertical: 'center', marginRight: wp(2) }}>My Patients</Text>
                                        <TouchableOpacity onPress={() => this.setState({ myPatient: false })} style={[myPatient ? styles.publicstyles : null, { width: wp(5), height: wp(5) }]}>
                                            {
                                                myPatient
                                                    ? null
                                                    : <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5), }} source={require('../../assets/icons/set_public_icon.png')} />
                                            }
                                        </TouchableOpacity>
                                        <Text style={{ color: colors.white, fontFamily: Fonts.HelveticaNeueBold, paddingLeft: wp(2), textAlignVertical: 'center' }}>Set As Public</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.setState({ viewPrivacy: true })} style={{ alignItems: 'center' }}>
                                        <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5), }} source={require('../../assets/icons/exclamationcircle.png')} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                </KeyboardAvoidingView>
                <PrivacyModal visible={viewPrivacy} onClosePress={(show) => this.setState({ viewPrivacy: show })} />
            </Modal>
        );
    }
}

export default StoryImageEdit;

const styles = StyleSheet.create({
    closeButton: {
        color: colors.white,
        textAlign: "right",
        paddingTop: 20,
        paddingRight: 20,
        fontSize: hp(3),
    },
    chatBackground: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: 'space-between',
        paddingTop: wp(4)
    },
    cameraIcon: {
        width: wp(10),
        height: wp(10),
        backgroundColor: colors.white,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.borderColor1,
        borderWidth: 1
    },
    publicstyles: {
        borderWidth: 2, borderColor: '#fff', borderRadius: wp(5)
    }
})