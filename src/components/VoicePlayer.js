import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import Slider from '@react-native-community/slider';
var RNFS = require('react-native-fs');

import React, { Component } from 'react';
import { RATIO } from '../utils/Constant';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import appHelper from '../utils/AppHelper'
import Sound from 'react-native-sound';
import API from '../services/API';
import appSingleton from '../components/AppSingleton'

import {
    Player,
    Recorder,
    MediaStates
} from '@react-native-community/audio-toolkit';
import { Icon, Item } from 'native-base';


const styles = StyleSheet.create({
    titleTxt: {
        marginTop: 100 * RATIO,
        color: 'white',
        fontSize: 28 * RATIO,
    },
    viewRecorder: {
        marginTop: 40 * RATIO,
        width: '100%',
        alignItems: 'center',
    },
    recordBtnWrapper: {
        flexDirection: 'row',
    },
    viewPlayer: {
        marginTop: 60 * RATIO,
        alignSelf: 'stretch',
        alignItems: 'center',
    },
    viewBarWrapper: {
    },
    viewBar: {

    },
    viewBarPlay: {
        width: 0,
    },
    playStatusTxt: {
        marginTop: 8 * RATIO,
        color: '#ccc',
    },
    playBtnWrapper: {
        flexDirection: 'row',
        marginTop: 40 * RATIO,
    },
    btn: {
        borderColor: 'white',
        borderWidth: 1 * RATIO,
    },
    txt: {
        color: 'white',
        fontSize: 14 * RATIO,
        marginHorizontal: 8 * RATIO,
        marginVertical: 4 * RATIO,
    },
    txtRecordCounter: {
        marginTop: 32 * RATIO,
        color: 'white',
        fontSize: 20 * RATIO,
        textAlignVertical: 'center',
        fontWeight: '200',
        fontFamily: 'Helvetica Neue',
        letterSpacing: 3,
    },
    txtCounter: {
        marginTop: 12 * RATIO,
        color: 'white',
        fontSize: 20 * RATIO,
        textAlignVertical: 'center',
        fontWeight: '200',
        fontFamily: 'Helvetica Neue',
        letterSpacing: 3,
    },
});

export default class VoicePlayer extends Component {

    constructor(props) {
        super(props);

        let audio = JSON.parse(props.data.audio)
        // console.log("=========== audio", audio)
        this.state = {
            isLoggingIn: false,
            recordSecs: 0,
            recordTime: '00:00',
            currentPositionSec: 0,
            currentDurationSec: 0,
            isPlaying: false,
            isPause: false,
            playTime: '00:00',

            playRecordingView: false,
            pauseRecordingView: false,
            savedAudioFile: null,
            audioObject: null,

            messageObject: props.data,
            durationText: audio.duration == undefined ? "0:00" : audio.duration,
            duration: audio.duration == undefined ? "0:00" : audio.duration,
            local_path: audio.local_url == undefined ? "" : audio.local_url == "" ? "" : `${appHelper.getHomeDirectoryPath()}media/audios/${appHelper.fileNameFromUrl(audio.local_url)}`,
            url: audio.url == undefined ? "" : audio.url,
            downloading: false,
        };

        var playerObject = null

        // Enable playback in silence mode
        Sound.setCategory('Playback');
    }

    componentWillUnmount() {
        console.log("componentWillUnmount componentWillUnmount componentWillUnmount")
        this.clearAllIntervals()
        this.onPause()
    }

    onStartPlay = async () => {

        if (global.playerArray == null) {
            global.playerArray = { "1": "1" }
        }

        let _file_path = `${appHelper.getHomeDirectoryPath()}media/audios/${appHelper.fileNameFromUrl(this.state.url)}`
        // console.log("_file_path", _file_path)
        // console.log("VoicePlayer onStartPlay", this.state.local_path, this.state.url)

        let is_exits_file = await RNFS.exists(_file_path)
        if (is_exits_file == false) {
            this.setState({ downloading: true })
            let download = await API.download(this.state.url, 'audios', (data) => {
                console.log("Downloading..")
                if (data.status == "success") {
                    console.log("===== downloaded", data.path)
                    this.setState({ local_path: data.path, downloading: false }, () => {
                        this.play()
                        return;
                    })
                }
            })
        } else {
            this.setState({ local_path: _file_path, downloading: false }, () => {
                this.play()
                return;
            })
        }
    }

    play = async () => {

        try {

            if (this.playerObject) {
                this.playerObject.destroy();
            }

            const { messageObject } = this.state
            // console.log("Played")


            let path = this.state.local_path

            this.pauseCurrentObject()

            this.playerObject = new Player(path).play((err) => {
                console.log(" ==== Play Error", err);
                if (err) {
                    return;
                }
                // console.log(this.playerObject.duration)
                this.setState({
                    currentDurationSec: this.playerObject.duration
                })
                this.timerInterval = setInterval(() => {
                    // console.log("2222")
                    if (this.playerObject != null) {
                        if (this.playerObject.currentTime == null) {
                            this.clearAllIntervals()
                        } else {
                            this.setState({
                                currentPositionSec: this.playerObject.currentTime,
                                durationText: appHelper.format_duration((this.playerObject.currentTime / 1000))
                            })
                        }
                    }
                }, 100);
            }).on('ended', () => {
                appSingleton.getInstance().set_new_player(null)
                console.log("PLAY ENDED")
                this.clearAllIntervals()
                // this.playerObject = null;
                this.setState({
                    isPlaying: false,
                    isPause: false,
                    currentPositionSec: 0
                });
            });
            appSingleton.getInstance().set_new_player(this)
        } catch (error) {
            console.log("VoicePlayer play catch", error)
        }
    }

    pauseCurrentObject() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        let voicePlayerInstance = appSingleton.getInstance().get_current_player()
        console.log("pauseCurrentObject")
        if (voicePlayerInstance != null) {
            voicePlayerInstance.onPause()
        }
    }

    clearAllIntervals() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    onPausePlay = async () => {
        if (this.playerObject == null) {
            return;
        }
        console.log("---- 4")
        this.pauseCurrentObject()

        appSingleton.getInstance().set_new_player(this)

        this.playerObject.playPause(err => {
            if (err)
                return;

            this.timerInterval = setInterval(() => {
                // console.log("1111")
                if (this.playerObject != null) {
                    this.setState({
                        currentPositionSec: this.playerObject.currentTime,
                        durationText: appHelper.format_duration((this.playerObject.currentTime / 1000))
                    })
                }
            }, 100);
        })
    }

    handlePlayRecordedAudio = () => {
        if (this.state.isPlaying == false && this.state.isPause == false) {
            if (this.state.currentPositionSec == 0) {
                console.log("----1")
                this.setState({ isPlaying: true, isPause: false });
                this.onStartPlay();
            } else {
                this.setState({ isPlaying: true, isPause: false });
                this.play()
            }
        } else if (this.state.isPause == true && this.state.isPlaying == false) {
            console.log("----2")
            this.setState({ isPlaying: true, isPause: false });
            this.onPausePlay()
        } else {
            this.clearAllIntervals()
            console.log("----3")
            this.playerObject.pause(err => {
                console.log("handlePlayRecordedAudio Paused")
            })
            this.setState({ isPlaying: false, isPause: true });
        }
    }

    onPause() {
        console.log("onPause called")
        if (this.playerObject != null) {
            this.playerObject.pause(err => {
                console.log("handlePlayRecordedAudio Paused", err)
                if (err == null) {
                    this.clearAllIntervals()
                    this.setState({
                        isPlaying: false,
                        isPause: true
                    });
                } else if (err != null) {
                    this.clearAllIntervals()
                    if (err.err == "notfound") {
                        console.log(" ===== not found")
                        this.playerObject.destroy();
                        this.playerObject = null
                        appSingleton.getInstance().set_new_player(null)
                        this.play()
                    }
                }
            })
        }
    }

    setSeekBar(value) {
        if (this.playerObject == null) {
            return;
        }
        this.playerObject.seek(value, (err => {
            if (err)
                return;

            console.log("setSeekBar", err)
            this.onPausePlay()
            this.setState({
                isPlaying: true
            })
        }))
    }

    render() {
        const { isPlaying, downloading } = this.state;
        return (
            <View style={[this.props.containerStyle, {
                flex: 1,
                backgroundColor: colors.transparent,
                flexDirection: 'row',
                marginVertical: hp(0.5),
                justifyContent: 'flex-start',
                alignItems: 'center'
            }]}>

                <TouchableOpacity
                    onPress={this.handlePlayRecordedAudio}
                    style={{ width: "20%", height: "100%", marginRight: wp(1), marginLeft: wp(1), backgroundColor: colors.transparent, justifyContent: "center", }}>
                    <View style={{ backgroundColor: colors.btnBgColor, borderRadius: wp(11 / 2), width: wp(11), height: wp(11), justifyContent: 'center', alignItems: 'center' }}>
                        {
                            (downloading == true)
                                ? <ActivityIndicator
                                    animating={true}
                                    color='#fff'
                                    size="small"
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 80
                                    }} />
                                : (isPlaying == false)
                                    ? <Icon type="FontAwesome5" name='play' style={{ fontSize: hp('2%'), color: colors.white, marginLeft: wp(1) }}></Icon>
                                    : <Icon type="FontAwesome5" name='pause' style={{ fontSize: hp('2%'), color: colors.white }}></Icon>
                        }
                    </View>
                </TouchableOpacity>
                <View style={{ flex: 1, backgroundColor: colors.transparent, width: "100%", marginBottom: hp(0), justifyContent: 'center', alignItems: 'flex-start', height: "100%", flexDirection: 'column' }}>
                    <View style={{ backgroundColor: colors.transparent, width: "100%", height: "25%" }}>
                    </View>
                    <Slider
                        style={{ marginLeft: Platform.OS === 'ios' ? 0 : -10, height: "50%", width: Platform.OS === 'ios' ? "95%" : "105%", backgroundColor: colors.transparent }}
                        minimumValue={0}
                        maximumValue={(this.state.currentDurationSec == 0) ? (appHelper.getTotalSecondsFromDuration(this.state.duration) * 1000) : this.state.currentDurationSec}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.primary}
                        thumbTintColor={colors.primary}
                        onSlidingStart={(value) => {
                            console.log("onSlidingStart", value)
                            // if (this.state.isPlaying == true && this.p.isPlaying == true) {
                            if (this.state.isPlaying == true) {
                                console.log("----1")
                                this.handlePlayRecordedAudio()
                                this.setState({
                                    isPlaying: false,
                                    isPause: true
                                })
                            }
                        }}
                        onSlidingComplete={(value) => {
                            this.setState({
                                currentPositionSec: value,
                            })
                            if (this.state.isPlaying == false && this.state.isPause == true) {
                                console.log("----2")
                                this.setSeekBar(value)
                                // this.handlePlayRecordedAudio()
                            }
                            // console.log("onSlidingComplete", value)
                            // this.setState({
                            //     currentPositionSec: Math.floor(value),
                            // })
                            //
                        }}
                        onValueChange={(value) => {
                            console.log(value)
                            this.setState({
                                durationText: appHelper.format_duration((value / 1000)),
                                // currentPositionSec: value
                            })

                        }}
                        value={this.state.currentPositionSec}
                    />
                    <View style={{ backgroundColor: colors.transparent, width: wp(45), height: "25%", flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{
                            marginTop: -2,
                            fontSize: FontSize('mini'),
                            color: "#1994fb",
                            fontFamily: Fonts.HelveticaNeueMedium,
                        }}>
                            {this.state.durationText}
                        </Text>
                        <View style={{ marginRight: 5 }}>
                            {this.props.childElements}
                            {/* <Text style={{
                                fontSize: FontSize('xMini'),
                                color: "#1994fb",
                                fontFamily: Fonts.HelveticaNeue,
                                marginRight: wp(3)
                            }}>
                                {this.state.durationText}
                            </Text> */}
                        </View>
                    </View>
                </View>
            </View >
        )
    }
}