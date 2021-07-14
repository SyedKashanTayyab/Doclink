
import { Icon } from 'native-base';
import React, { Component } from 'react';
import { Modal, TouchableOpacity, Image, StyleSheet, ImageBackground, Text, View, TextInput, KeyboardAvoidingView, Keyboard, StatusBar, Platform } from 'react-native';
import Video from 'react-native-video';

import { API_URL, URL_MEDIA_UPLOAD } from '../../utils/Constant';
import { CustomSpinner } from '../../utils/AppHelper';
import API from '../../services/API';
import colors from '../../utils/Colors';
import { Fonts } from '../../utils/Fonts';
import FontSize from '../../utils/FontSize';
import { hp, wp } from '../../utils/Utility';
import PrivacyModal from '../../modals/PrivacyModal';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

class StoryVideoEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {

            spinner: false,
            spinnnerText: "Loading...",

            videoObject: { path: '', duration: 0 },
            visible: false,
            myPatient: true,
            caption: '',

            rate: 1,
            volume: 1,
            muted: false,
            resizeMode: 'cover',
            duration: 0.0,
            currentTime: 0.0,
            paused: false,
            endVideo: false,

            viewPrivacy: false,

            textInputHeight: wp(4),
        };
    }

    static getDerivedStateFromProps(props, state) {

        if (props.visible !== state.visible) {
            return {
                visible: props.visible,
                videoObject: props.videoObject
            }
        }
        return null
    }

    onSubmit = async () => {
        this.setState({ spinner: true });
        const privacy = this.state.myPatient == true ? 'patient' : 'public';
        const url = this.state.videoObject.path;
        const duration = this.state.videoObject.duration;

        try {
            let params = {
                type: 'video',
                data: JSON.stringify({ url, duration }),
                privacy,
                caption: this.state.caption,
            };

            const res = await API.post(API_URL.DOCTOR_STORIES, params);

            this.setState({ spinner: false, videoObject: { path: '' }, visible: false, myPatient: true, caption: '' })

            this.props.onClosePress(false, true)

        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    queueVideoUpload = async () => {
        try {
            this.setState({ spinner: true, spinnnerText: 'Uploading...' });
            let _video_path = Platform.OS == 'ios' ? this.state.videoObject.video_file_path_for_iOS : this.state.videoObject.path
            const response = await API.postMultipart(URL_MEDIA_UPLOAD, _video_path, [], null, 'media')
            let cloneImageList = this.state.videoObject
            cloneImageList.path = response.data.base_url + '/' + response.data.image_name;
            this.setState({ videoObject: cloneImageList })
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
                <CustomSpinner visible={spinner} text={this.state.spinnnerText} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={{ flex: 1 }}>
                    <View style={{ flex: 1 }} onPress={() => {
                        Keyboard.dismiss()
                    }}>
                        {/* Video Player */}
                        <View style={[styles.fullScreen, { backgroundColor: colors.transparent, }]}>
                            <Video
                                ref={(ref) => { this.video = ref }}
                                source={{ uri: this.state.videoObject.path }}
                                // source={{ uri: Platform.OS == 'ios' ? this.state.videoObject.video_file_path_for_iOS : this.state.videoObject.path }}
                                style={[styles.fullScreen]}
                                rate={this.state.rate}
                                paused={this.state.paused}
                                volume={this.state.volume}
                                muted={this.state.muted}
                                resizeMode={this.state.resizeMode}
                                repeat={false}
                                onEnd={() => {
                                    this.setState({ paused: true, endVideo: true });
                                }}
                                onError={error => {
                                    console.log("Error while playing", error)
                                }}
                            />
                        </View>

                        {/* Top Layer */}
                        <View style={[{ width: "100%", height: hp(10), backgroundColor: colors.transparent, zIndex: 999, }]}>
                            {/* Cancel option */}
                            <View style={{ height: hp(10), backgroundColor: colors.transparent, width: wp(100), marginLeft: wp(2) }}>
                                <TouchableOpacity style={[styles.cameraIcon, { backgroundColor: colors.transparent, borderWidth: 0, marginTop: Platform.OS == 'ios' ? STATUSBAR_HEIGHT : 10 }]} onPress={() => {
                                    this.props.onClosePress(false)
                                }}>
                                    <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/doctor_status_close.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Control option */}
                        <View style={{ flex: 1, backgroundColor: colors.transparent, width: wp(100), }}>
                            <View style={[{ justifyContent: 'center', alignItems: 'center', zIndex: 999, width: "100%", height: "100%", }]}>
                                <View style={{ width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                                    {
                                        (this.state.paused == true)
                                            ? <TouchableOpacity
                                                style={{ width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: colors.graySeven, justifyContent: 'center', alignItems: 'center' }}
                                                onPress={() => {
                                                    if (this.state.endVideo == true) {
                                                        this.video.seek(0)
                                                    }
                                                    this.setState({ paused: false, endVideo: false });
                                                }}>
                                                <Icon type="FontAwesome" name="play" style={{ color: colors.greyEight, marginLeft: 5, fontSize: wp(7), }} />
                                            </TouchableOpacity>
                                            : <TouchableOpacity
                                                style={{ width: "100%", height: "100%" }}
                                                onPress={() => {
                                                    this.setState({ paused: true })
                                                }}>
                                            </TouchableOpacity>
                                    }

                                </View>
                            </View>
                        </View>


                        {/* Bottom options */}
                        <View style={{ backgroundColor: colors.transparent, width: wp(100), justifyContent: 'flex-end' }}>
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: wp(4), paddingBottom: wp(4) }}>
                                    <TouchableOpacity onPress={() => this.props.onClosePress(false)} style={styles.cameraIcon}>
                                        <Image style={{ width: wp(5), height: wp(4), tintColor: colors.tintColor, resizeMode: 'contain' }} source={require('../../assets/icons/status_camera_icon.png')} />
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
                                        }}
                                        style={{
                                            paddingTop: Platform.OS == 'ios' ? 10 : 0,
                                            backgroundColor: colors.white,
                                            width: wp(70),
                                            borderRadius: wp(6),
                                            height: this.state.textInputHeight,
                                            minHeight: wp(10),
                                            fontSize: FontSize('xMini'),
                                            paddingHorizontal: wp(4),
                                            paddingVertical: wp(1),
                                            borderColor: colors.borderColor1,
                                            borderWidth: 1,
                                            color: colors.black
                                        }}
                                    />

                                    <TouchableOpacity onPress={this.queueVideoUpload}>
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
                        </View>
                    </View>
                </KeyboardAvoidingView>
                <PrivacyModal visible={viewPrivacy} onClosePress={(show) => this.setState({ viewPrivacy: show })} />
            </Modal >
        )
        return (
            <Modal
                visible={this.state.visible}
                transparent={true}
                animationType="slide"
                style={{ flex: 1, width: wp(100), height: hp(100) }}
            >
                {/* Spinner */}
                <CustomSpinner visible={spinner} text={this.state.spinnnerText} />

                {/* Video Player */}
                <View style={[styles.fullScreen, { backgroundColor: colors.transparent, }]}>
                    <Video
                        ref={(ref) => { this.video = ref }}
                        source={{ uri: this.state.videoObject.path }}
                        style={[styles.fullScreen]}
                        rate={this.state.rate}
                        paused={this.state.paused}
                        volume={this.state.volume}
                        muted={this.state.muted}
                        resizeMode={this.state.resizeMode}
                        repeat={false}
                        onEnd={() => {
                            this.setState({ paused: true });
                        }}
                    />
                </View>

                {/* Top Layer */}
                <View style={[{ position: 'absolute', top: 0, bottom: 0, width: "100%", height: "100%", backgroundColor: colors.transparent, }]}>
                    {/* Cancel option */}
                    <View style={{ height: "30%", backgroundColor: colors.transparent, width: wp(100) }}>
                        <TouchableOpacity style={[styles.cameraIcon, { backgroundColor: 'transparent', borderWidth: 0 }]} onPress={() => this.props.onClosePress(false)}>
                            <Icon type="AntDesign" name="close" style={{ color: colors.white }} />
                        </TouchableOpacity>
                    </View>
                    {/* Control option */}
                    <View style={{ height: "40%", backgroundColor: colors.transparent, width: wp(100) }}>
                        <View style={[{ justifyContent: 'center', alignItems: 'center', zIndex: 999, width: "100%", height: "100%", }]}>
                            <View style={{ width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                                {
                                    (this.state.paused == true)
                                        ? <TouchableOpacity
                                            style={{ width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: colors.graySeven, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => {
                                                this.setState({ paused: false });
                                            }}>
                                            <Icon type="FontAwesome" name="play" style={{ color: colors.greyEight, marginLeft: 5, fontSize: wp(7), }} />
                                        </TouchableOpacity>
                                        : <TouchableOpacity
                                            style={{ width: "100%", height: "100%" }}
                                            onPress={() => {
                                                this.setState({ paused: true })
                                            }}>
                                        </TouchableOpacity>
                                }

                            </View>
                        </View>
                    </View>
                </View>
                <PrivacyModal visible={viewPrivacy} onClosePress={(show) => this.setState({ viewPrivacy: show })} />
            </Modal>
        );
    }
}

export default StoryVideoEdit;

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
        backgroundColor: 'transparent',
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
        borderWidth: 2, borderColor: colors.white, borderRadius: wp(5)
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
})