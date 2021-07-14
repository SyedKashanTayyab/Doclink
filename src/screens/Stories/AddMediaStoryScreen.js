import { relativeTimeThreshold } from 'moment';
import React, { PureComponent } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, NativeModules } from 'react-native';
import { Container, Icon } from 'native-base';
import { RNCamera } from 'react-native-camera';
import DialogAndroid from 'react-native-dialogs';
import appHelper, { CustomSpinner } from '../../utils/AppHelper';
import ImagePicker from 'react-native-image-crop-picker';

import colors from '../../utils/Colors';
import FontSize from '../../utils/FontSize';
import { wp, hp } from '../../utils/Utility';
import StoryImageEdit from './StoryImageEdit';
import StoryVideoEdit from './StoryVideoEdit';

const { AppInfo } = NativeModules

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

var i = 1;

class AddMediaStoryScreen extends PureComponent {


    constructor(props) {
        super(props);
        this.state = {
            cameraPosition: 'back',
            isRecording: false,
            duration: 0,
            flash: 0,
            imageVisible: false,
            videoVisible: false,
            imageObject: null,
            videoObject: null,
            spinner: false,

            video_file_path_for_iOS: ""
        };
        this.processVideo = this.processVideo.bind(this);
    }

    takePicture = async () => {
        if (this.camera) {
            const options = { quality: 0.5, };
            const data = await this.camera.takePictureAsync(options);
            this.setState({
                imageVisible: true,
                imageObject: { path: data.uri }
            })
        }
    };

    processVideo(result, original_path) {
        setTimeout(() => {
            this.setState({
                isRecording: false,
                videoVisible: true,
                videoObject: { path: original_path, duration: this.state.duration, video_file_path_for_iOS: result },
            })
        }, 500);
    }

    takeVideo = async () => {
        if (this.camera) {
            let options = {
                maxDuration: 30,
                quality: '480p'
            };

            if (Platform.OS == 'ios') {
                console.log("here .....", RNCamera.Constants.VideoCodec['HVEC'])
                options['codec'] = RNCamera.Constants.VideoCodec['HVEC']
            }
            console.log("coded", options)
            try {
                const promise = this.camera.recordAsync(options);

                if (promise) {
                    this.setState({ isRecording: true });
                    const data = await promise;
                    console.log("promise", data)

                    if (Platform.OS == 'ios') {

                        let path = data.uri
                        path = path.replace('file://', "")

                        // https://github.com/taltultc/react-native-mov-to-mp4
                        let video_file_name = appHelper.getRandomString(15)
                        AppInfo.convertMovToMp4(path, video_file_name)
                            .then((results) => {
                                //here you can upload the video...
                                console.log("====");
                                console.log("results", results, path);
                                console.log("====");
                                this.processVideo(results, path)

                            }).catch(error => {
                                console.log("Not converted Error", error)
                            })
                    } else {
                        this.setState({
                            videoVisible: true,
                            videoObject: { path: data.uri, duration: this.state.duration }
                        })
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    changePosition = () => {
        if (this.state.cameraPosition == 'front') {
            this.setState({ cameraPosition: 'back' })
        } else {
            this.setState({ cameraPosition: 'front' })
        }
    }

    stopRecord = () => {
        if (this.state.isRecording) {
            this.camera.stopRecording()
            clearInterval(this.countdownTimer);
            this.countdownTimer = null
        }
    }

    toggleFlash = () => {
        if (this.state.flash == 0) {
            this.setState({ flash: 2 })
        } else {
            this.setState({ flash: 0 })
        }
    }

    startTimer = () => {
        i = 0;
        this.countdownTimer = setInterval(() => {
            if (this.state.isRecording) {
                this.setState({ duration: i })
                i = i + 1;
                if (i >= 31) {
                    clearInterval(this.countdownTimer);
                    this.countdownTimer = null
                }
            }
            else {
                clearInterval();
            }
        }, 1000);
    }

    _onImage = () => {
        ImagePicker.openPicker({ mediaType: "photo", compressImageQuality: 0.6 })
            .then((response) => this.processImage(response))
            .catch((e) => console.log(e));
    }

    processImage = (res) => {
        if (res.mime == 'image/jpeg') {
            this.setState({
                imageVisible: true,
                imageObject: res
            })
        } else if (res.mime == 'video/mp4') {
            this.setState({
                videoVisible: true,
                videoObject: res
            })
        }
    }

    render() {
        const { isRecording, duration, flash, cameraPosition, spinner } = this.state;
        const { imageVisible, imageObject, videoVisible, videoObject } = this.state;

        if (imageObject != null) {
            return (
                <StoryImageEdit visible={imageVisible} imageObject={imageObject} onClosePress={(show, go_back = false) => {
                    if (go_back == true) {
                        this.props.navigation.goBack()
                    } else {
                        this.setState({ imageVisible: show, imageObject: null })
                    }
                }} />
            )
        }
        if (videoObject != null) {
            return (
                <StoryVideoEdit visible={videoVisible} videoObject={videoObject} onClosePress={(show, go_back = false) => {
                    if (go_back == true) {
                        this.props.navigation.goBack()
                    }
                    this.setState({ videoVisible: show, videoObject: null, duration: 0 })
                }} />
            )
        }
        return (
            <Container style={{ backgroundColor: this.state.bgColor }}>
                {/* Spinner */}
                <CustomSpinner visible={spinner} text={this.state.spinnnerText} activityColor={colors.white} textStyle={{ color: colors.white }} />


                <RNCamera
                    ref={ref => this.camera = ref}
                    style={styles.preview}
                    type={cameraPosition}
                    flashMode={flash}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    androidRecordAudioPermissionOptions={{
                        title: 'Permission to use audio recording',
                        message: 'We need your permission to use your audio',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    onRecordingStart={this.startTimer}
                >

                    <View style={{ width: wp(100), marginTop: Platform.OS === 'ios' ? STATUSBAR_HEIGHT : 0, paddingHorizontal: wp(2), height: hp(7), justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/doctor_status_close.png')} />
                        </TouchableOpacity>
                        {
                            isRecording
                                ? <Text style={{ fontSize: FontSize('medium'), color: colors.white }}>{'00:' + ('0' + duration).slice(-2)}</Text>
                                : null
                        }
                        {
                            cameraPosition == 'back'
                                ? <TouchableOpacity onPress={this.toggleFlash}>
                                    {
                                        flash == 'front'
                                            ? <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/flash_off.png')} />
                                            : <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/flash_on.png')} />
                                    }
                                </TouchableOpacity>
                                : null
                        }
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(100), paddingHorizontal: wp(5), paddingBottom: wp(2), height: hp(10), marginBottom: hp(3) }}>
                        <TouchableOpacity onPress={this._onImage}>
                            <Image style={{ width: wp(10), height: wp(10), tintColor: colors.white, resizeMode: 'contain' }} source={require('../../assets/icons/status_pic_gallery.png')} />
                        </TouchableOpacity>
                        {
                            isRecording
                                ? <TouchableOpacity onPress={this.stopRecord} style={styles.stopRecord} /> : null
                        }
                        {
                            isRecording
                                ? null : <TouchableOpacity onLongPress={this.takeVideo} onPress={this.takePicture.bind(this)} style={styles.capture} />
                        }
                        <TouchableOpacity onPress={this.changePosition}>
                            <Image style={{ width: wp(10), height: wp(10), tintColor: colors.white, resizeMode: 'contain' }} source={require('../../assets/icons/status_switch_camera.png')} />
                        </TouchableOpacity>
                    </View>
                </RNCamera>
            </Container>
        );
    }
}

export default AddMediaStoryScreen;

const styles = StyleSheet.create({
    preview: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        borderColor: '#fff',
        borderRadius: wp(20),
        borderWidth: 4,
        width: wp(20),
        height: wp(20),
    },
    stopRecord: {
        flex: 0,
        backgroundColor: 'red',
        width: wp(15),
        borderRadius: wp(15) / 2,
        height: wp(15),
    }
});