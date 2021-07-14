import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSet,
    AudioSourceAndroidType,
    AVSAMple
} from 'react-native-audio-recorder-player';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
var RNFS = require('react-native-fs');

import React, { Component } from 'react';
import { GET_STRING, SCREEN_WIDTH, RATIO } from '../utils/Constant';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import Sound from 'react-native-sound';
import appHelper from '../utils/AppHelper';

const styles = StyleSheet.create({

});

export default class VoiceRecorder extends Component {

    constructor(props) {
        super(props);
        this.state = {
            _voiceRecorderStarted: false,
            isLoggingIn: false,
            recordSecs: 0,
            recordTime: '00:00',
            currentPositionSec: 0,
            currentDurationSec: 0,
            playTime: '00:00:00',
            duration: '00:00:00',
            startRecordingView: true,
            stopRecordingView: false,
            playRecordingView: false,
            pauseRecordingView: false,
            savedAudioFile: null,
            isStartingRecording: false,
            cancelRecording: false,
        };

        this.audioRecorderPlayer = new AudioRecorderPlayer();
        this.audioRecorderPlayer.setSubscriptionDuration(0.09); // optional. Default is 0.1
    }

    static getDerivedStateFromProps(props, state) {
        if (props.recording !== state.isStartingRecording) {
            return {
                isStartingRecording: props.recording,
                cancelRecording: props.cancelRecording
            }
        }
        return null
    }

    componentDidUpdate(prevProps, prevState) {

        if (this.state.isStartingRecording !== prevState.isStartingRecording) {
            this.voiceRecordingHandler()
        }

        if (this.state.cancelRecording != prevState.cancelRecording)
            if (this.state.cancelRecording == true) {
                this.handleRecordAudioDelete();
            }
    }

    componentWillUnmount() {
        this.onStopRecord()
        this.onFileDelete()
    }

    onStatusPress = (e) => {
        const touchX = e.nativeEvent.locationX;
        console.log(`touchX: ${touchX}`);
        const playWidth =
            (this.state.currentPositionSec / this.state.currentDurationSec) *
            (SCREEN_WIDTH - 56 * RATIO);
        console.log(`currentPlayWidth: ${playWidth}`);

        const currentPosition = Math.round(this.state.currentPositionSec);
        console.log(`currentPosition: ${currentPosition}`);

        if (playWidth && playWidth < touchX) {
            const addSecs = Math.round(currentPosition + 1000);
            this.audioRecorderPlayer.seekToPlayer(addSecs);
            console.log(`addSecs: ${addSecs}`);
        } else {
            const subSecs = Math.round(currentPosition - 1000);
            this.audioRecorderPlayer.seekToPlayer(subSecs);
            console.log(`subSecs: ${subSecs}`);
        }
    };

    /**
     * Voice Recording
     */
    onStartRecord = async () => {
        console.log("========================");
        console.log("onStartRecord fired");
        console.log("========================");
        try {

            let dir_media_audio = `${appHelper.getHomeDirectoryPath()}media/audios/${appHelper.guid()}.mp4`

            console.log("dir_media_audio", dir_media_audio)
            const audioSet = {
                AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
                AudioSourceAndroid: AudioSourceAndroidType.MIC,
                AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
                AVNumberOfChannelsKeyIOS: 2,
                AVFormatIDKeyIOS: AVEncodingOption.aac,
            };

            const result = await this.audioRecorderPlayer.startRecorder(dir_media_audio, audioSet, true)
            console.log("onStartRecord() ==>result", result);

            this.audioRecorderPlayer.addRecordBackListener((e) => {

                let secTime = this.audioRecorderPlayer.mmssss(
                    Math.floor(e.current_position),
                )
                let arrTime = secTime.split(":")

                this.setState({
                    recordSecs: e.current_position,
                    recordTime: arrTime[0] + ":" + arrTime[1],
                    savedAudioFile: result,
                });

                if (this.props.maxRecordingInSeconds != null && this.props.maxRecordingInSeconds != 0) {
                    // console.log(e.current_position / 1000, this.props.maxRecordingInSeconds)
                    if (e.current_position > ((this.props.maxRecordingInSeconds + 0.5) * 1000)) {
                        this.onStopRecord()
                    }
                }
                return;
            });
        } catch (err) {
            console.log(err);
            return;
        }

    };

    onStopRecord = async () => {
        this.audioRecorderPlayer.stopRecorder()
            .then(object => {

                setTimeout(() => {
                    let dir_media_audio = ''
                    console.log("===== object", object)
                    if (Platform.OS === 'android') {
                        dir_media_audio = object.replace("file:///", "")
                    } else {
                        dir_media_audio = object
                    }

                    let soundFile = new Sound(dir_media_audio, '', (error) => {
                        if (error) {
                            console.log('failed to load the sound', error);
                            return;
                        }
                        let duration = appHelper.format_duration(soundFile.getDuration())

                        let data = {
                            path: object,
                            duration: duration
                        }
                        console.log("==========================");
                        console.log("onStopRecord data", data);
                        console.log("==========================");
                        this.props.output(data)
                        this.setState({
                            recordTime: "00:00",
                            _voiceRecorderStarted: false,
                            isStartingRecording: false
                        })
                    });
                }, 1000);

            })
            .catch(error => {
                console.log("VoiceRecorder - onStopRecord ", error)
            })
        this.audioRecorderPlayer.removeRecordBackListener();
        this.setState({
            recordSecs: 0,
        });
        // console.log("onStopRecord() ==> result", result);
        // this.props.audioData(result);
    };

    onStopPlay = async () => {
        console.log('onStopPlay');
        this.audioRecorderPlayer.stopPlayer();
        this.audioRecorderPlayer.removePlayBackListener();
    };

    onFileDelete = () => {
        const { savedAudioFile } = this.state;
        console.log("on file delete fired() ==>  savedAudioFile", savedAudioFile);
        // create a path you want to delete
        var audioPath = savedAudioFile;

        if (audioPath == null) return;

        console.log("==========================");
        console.log("Print RECORDED AUDIO FILE :) audioPath ", audioPath);


        return RNFS.unlink(audioPath)
            .then(() => {
                console.log('FILE DELETED');
                // let data = {
                //     path: {},
                //     duration: "0:00"
                // }
                this.props.output(null);
                this.setState({
                    recordTime: "00:00",
                    _voiceRecorderStarted: false
                })
            })
            // `unlink` will throw an error, if the item to unlink does not exist
            .catch((err) => {
                console.log(err.message);
            });
    }

    handleRecordAudioDelete = () => {
        // console.log("==========================");
        // DELETE RECORD AUDIO
        this.onStopPlay();
        this.onFileDelete();
        this.setState({ startRecordingView: true, stopRecordingView: false, playRecordingView: false, pauseRecordingView: false });
    }

    voiceRecordingHandler = async () => {
        if (this.state.isStartingRecording == true) {
            if (this.state._voiceRecorderStarted == false) {
                this.setState({ _voiceRecorderStarted: true }, () => {
                    this.onStartRecord()
                })
            }
        } else {
            if (this.state._voiceRecorderStarted == true) {
                this.onStopRecord()
            }
        }
    }

    render() {
        const { } = this.state;

        let playWidth = (this.state.currentPositionSec / this.state.currentDurationSec) * (SCREEN_WIDTH - wp(44.4) * RATIO);
        // console.log("render() playWidth", playWidth);
        // console.log("==========================",);
        // console.log("render() recordTime", recordTime);
        // console.log("==========================",);


        return (<Text style={this.props.textStyle}>{this.state.recordTime}</Text>);
    }
}