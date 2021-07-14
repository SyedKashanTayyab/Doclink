import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSet,
    AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ActivityIndicator
} from 'react-native';
import Slider from '@react-native-community/slider';
var RNFS = require('react-native-fs');

import React, { Component } from 'react';
import AudioButton from './AudioButton';
import { GET_STRING, SCREEN_WIDTH, RATIO } from '../utils/Constant';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import appHelper from '../utils/AppHelper'
import Sound from 'react-native-sound';
import API from '../services/API';

import {
    Player,
    Recorder,
    MediaStates
} from '@react-native-community/audio-toolkit';
import { Icon, Item } from 'native-base';
import { duration } from 'moment';


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

    mediabtn: {
        backgroundColor: colors.btnBgColor,
        width: wp(12), height: wp(12),
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default class VoicePlayerChatRequestPopup extends Component {

    constructor(props) {
        super(props);

        let audio = this.props.data
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
            durationText: "0:00",//audio.duration == undefined ? "0:00" : audio.duration,
            duration: audio.duration == undefined ? "0:00" : audio.duration,
            local_path: audio.local_url == undefined ? "" : audio.local_url == "" ? "" : `${appHelper.getHomeDirectoryPath()}media/audios/${appHelper.fileNameFromUrl(audio.local_url)}`,
            url: audio.url == undefined ? "" : audio.url,
            downloading: false,
        };

        var p = null

        // Enable playback in silence mode
        Sound.setCategory('Playback');

        // console.log("Voice Player, data ", props.data)
    }

    componentWillUnmount() {
        console.log("VociePlayerChatRequestPopup: componentWillUnmount")
        if (this.p != undefined) {
            this.p.pause(err => {
                console.log("handlePlayRecordedAudio Paused")
            })
        }
    }

    onStartPlay = async () => {

        if (global.playerArray == null) {
            global.playerArray = { "1": "1" }
        }
        let _file_path = `${appHelper.getHomeDirectoryPath()}media/audios/${appHelper.fileNameFromUrl(this.state.url)}`
        console.log("_file_path", _file_path)

        let is_exits_file = await RNFS.exists(_file_path)
        if (is_exits_file == false) {
            this.setState({ downloading: true })
            let download = await API.download(this.state.url, 'audios', (data) => {
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
        console.log("----- SSSS ------")
        this.play()
    }

    play = async () => {

        const { messageObject } = this.state
        console.log("Played")


        let path = this.state.local_path
        //.replace("file:///", "")
        console.log(" ====== path", path)
        //.replace("file:///", "")

        if (this.p == null) {

            this.p = new Player(path)
            console.log("Player Initialized", path)


        }

        console.log(" =====  SSSS ", this.state.local_path, this.state.url)

        // console.log("global.playerArray", global.playerArray)
        // let arrKeys = Object.keys(global.playerArray)
        // console.log(arrKeys)
        // arrKeys.map((item) => {
        //     console.log("IDDDDD", item)
        //     let a = global.playerArray[item]
        //     // (a as Player).pause(err => {
        //     //     console.log("handlePlayRecordedAudio Paused")
        //     // })
        //     // let b = Player()
        //     // if (typeof a === Player) {
        //     //     a.pause(err => {
        //     //         console.log("handlePlayRecordedAudio Paused")
        //     //     })
        //     // } else {
        //     //     console.log("Type not matched")
        //     // }
        // })

        // if (arrKeys.includes(messageObject._id) == false) {
        //     let _id = messageObject._id
        //     global.playerArray[_id] = this.p
        //     console.log(global.playerArray)
        // }

        this.p.looping = false;
        this.p.volume = 1.0;
        this.p.prepare((err) => {

            if (err) {
                console.log("Error prepare", err)
                return;
            }
            console.log("==== Prepared")
            // this.setState({
            //     currentDurationSec: this.p.duration
            // })
            this.p.seek(this.state.currentPositionSec == 0 ? 0 : this.state.currentPositionSec, (err => {
                if (err)
                    return;
                console.log(err)

                this.p.play((err) => {
                    console.log(" ==== Play Error", err);
                    if (err) {

                        return;
                    }
                    console.log(this.p.duration)
                    this.setState({
                        currentDurationSec: this.p.duration
                    })
                    this.timerInterval = setInterval(() => {
                        if (this.p != null) {
                            if (this.p.currentTime == null) {
                                this.clearAllIntervals()
                            } else {
                                this.setState({
                                    currentPositionSec: this.p.currentTime,
                                    durationText: appHelper.format_duration((this.p.currentTime / 1000))
                                })
                            }
                        }
                        // console.log("play", (this.p.currentTime == 0) ? " null " : " not null");
                        // if (this.p.currentTime > 50) {
                        // if (this.timerInterval == null) {
                        //     return;
                        // }

                        // }
                    }, 100);

                }).on('ended', () => {
                    console.log("PLAY ENDED")
                    this.clearAllIntervals()
                    this.p = null;
                    this.setState({
                        isPlaying: false,
                        isPause: false,
                        currentPositionSec: 0,
                        durationText: "0:00"
                    });
                })
            }))
        })
    }

    clearAllIntervals() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
    onPausePlay = async () => {
        if (this.p == null) {
            return;
        }
        this.p.playPause(err => {
            if (err)
                return;

            this.timerInterval = setInterval(() => {
                if (this.p != null) {
                    this.setState({
                        currentPositionSec: this.p.currentTime,
                        durationText: appHelper.format_duration((this.p.currentTime / 1000))
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
            this.p.pause(err => {
                console.log("handlePlayRecordedAudio Paused")
            })
            this.setState({ isPlaying: false, isPause: true });
        }
    }

    onPause = async () => {
        console.log("============== called ===============")
        this.p.pause(err => {
            console.log("handlePlayRecordedAudio Paused")
        })
    }

    setSeekBar(value) {
        if (this.p == null) {
            return;
        }
        this.p.seek(value, (err => {
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
        const { isPlaying, durationText, duration, currentPositionSec, downloading } = this.state;
        return (
            <View style={[this.props.containerStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: hp(1) }]}>
                <TouchableOpacity style={[styles.mediabtn, { paddingLeft: wp(1) }]} onPress={this.handlePlayRecordedAudio}>
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
                                ? <Icon type="FontAwesome5" name='play' style={{ color: '#fff', fontSize: FontSize('medium') }}></Icon>
                                : <Icon type="FontAwesome5" name='pause' style={{ color: '#fff', fontSize: FontSize('medium'), marginLeft: wp(-1) }}></Icon>
                    }
                </TouchableOpacity>
                <Slider
                    style={{ marginLeft: 0, height: 25, width: "75%", backgroundColor: colors.transparent }}
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
                <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.black }}>{duration}</Text>
            </View>
        )
    }
}