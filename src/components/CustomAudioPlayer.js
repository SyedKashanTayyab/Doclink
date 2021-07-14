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
} from 'react-native';
var RNFS = require('react-native-fs');

import React, { Component } from 'react';
import AudioButton from './AudioButton';
import { GET_STRING, SCREEN_WIDTH, RATIO } from '../utils/Constant';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import AppHelper from '../utils/AppHelper';
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
});


class CustomAudioPlayer extends Component {

	constructor(props) {
		super(props);
		this.state = {
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
		};

		this.audioRecorderPlayer = new AudioRecorderPlayer();
		this.audioRecorderPlayer.setSubscriptionDuration(0.09); // optional. Default is 0.1
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

	onStartRecord = async () => {
		if (Platform.OS === 'android') {
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
					{
						title: 'Permissions for write access',
						message: 'Give permission to your storage to write a file',
						buttonPositive: 'ok',
					},
				);
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					console.log('You can use the storage');
				} else {
					console.log('permission denied');
					return;
				}
			} catch (err) {
				console.warn(err);
				return;
			}
		}
		if (Platform.OS === 'android') {
			try {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
					{
						title: 'Permissions for write access',
						message: 'Give permission to your storage to write a file',
						buttonPositive: 'ok',
					},
				);
				if (granted === PermissionsAndroid.RESULTS.GRANTED) {
					console.log('You can use the camera');
				} else {
					console.log('permission denied');
					return;
				}
			} catch (err) {
				console.warn(err);
				return;
			}
		}
		// const path = Platform.select({
		// 	ios: 'hello.m4a',
		// 	android: 'sdcard/hello.mp4',
		// });
		const audioSet = {
			AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
			AudioSourceAndroid: AudioSourceAndroidType.MIC,
			AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
			AVNumberOfChannelsKeyIOS: 2,
			AVFormatIDKeyIOS: AVEncodingOption.aac,
		};
		console.log('onStartRecord() audioSet', audioSet);
		const result = await this.audioRecorderPlayer.startRecorder();
		this.audioRecorderPlayer.addRecordBackListener((e) => {
			// console.log("====================");
			// console.log("audioRecorderPlayer e.current_position", e.current_position);
			// console.log("====================");

			let secTime = this.audioRecorderPlayer.mmssss(
				Math.floor(e.current_position),
			)
			let arrTime = secTime.split(":")

			this.setState({
				recordSecs: e.current_position,
				recordTime: arrTime[0] + ":" + arrTime[1],
				savedAudioFile: result,
			});
			return;
		});
		console.log("onStartRecord() ==>result", result);
	};

	onStopRecord = async () => {
		const result = await this.audioRecorderPlayer.stopRecorder();
		this.audioRecorderPlayer.removeRecordBackListener();
		this.setState({
			recordSecs: 0,
		});
		console.log("onStopRecord() ==> result", result);
		this.props.audioData(result);
	};

	// onStartPlay = async () => {
	// 	console.log('onStartPlay');
	// 	const path = Platform.select({
	// 		ios: 'hello.m4a',
	// 		android: 'sdcard/hello.mp4',
	// 	});
	// 	const msg = await this.audioRecorderPlayer.startPlayer(path);
	// 	this.audioRecorderPlayer.setVolume(1.0);
	// 	console.log(msg);
	// 	this.audioRecorderPlayer.addPlayBackListener((e) => {
	// 		if (e.current_position === e.duration) {
	// 			console.log('finished');
	// 			this.audioRecorderPlayer.stopPlayer();
	// 		}
	// 		this.setState({
	// 			currentPositionSec: e.current_position,
	// 			currentDurationSec: e.duration,
	// 			playTime: this.audioRecorderPlayer.mmssss(
	// 				Math.floor(e.current_position),
	// 			),
	// 			duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
	// 		});
	// 	});
	// };
	onStartPlay = async () => {
		console.log('onStartPlay');
		const msg = await this.audioRecorderPlayer.startPlayer();
		console.log("onStartPlay() ==> \n msg", msg, "\n savedAudioFile", this.state.savedAudioFile);
		this.audioRecorderPlayer.addPlayBackListener((e) => {
			if (e.current_position === e.duration) {
				console.log('finished');
				this.audioRecorderPlayer.stopPlayer();
				this.setState({ startRecordingView: false, stopRecordingView: false, playRecordingView: true, pauseRecordingView: false, });
			}

			let secTime = this.audioRecorderPlayer.mmssss(
				Math.floor(e.current_position),
			)
			let arrTime = secTime.split(":")

			this.setState({
				currentPositionSec: e.current_position,
				currentDurationSec: e.duration,
				playTime: arrTime[0] + ":" + arrTime[1],
				duration: this.audioRecorderPlayer.mmss(Math.floor(e.duration)),
			});
			return;
		});
	};

	onPausePlay = async () => {
		await this.audioRecorderPlayer.pausePlayer();
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
		console.log("==========================");
		console.log("Print RECORDED AUDIO FILE :) audioPath ", audioPath);


		return RNFS.unlink(audioPath)
			.then(() => {
				console.log('FILE DELETED');
				this.props.audioData(null);
			})
			// `unlink` will throw an error, if the item to unlink does not exist
			.catch((err) => {
				console.log(err.message);
			});
	}

	handleRecordAudioStart = () => {
		// console.log("==========================");
		// START RECORDING AUDIO
		this.setState({ startRecordingView: false, stopRecordingView: true, });
		this.onStartRecord();
	}

	handleRecordAudioStop = () => {
		// console.log("==========================");
		// STOP RECORDING AUDIO 
		if (this.state.recordSecs > 1000) {
			this.setState({ startRecordingView: false, stopRecordingView: false, playRecordingView: true, });
			this.onStopRecord();
		}
	}

	handlePlayRecordedAudio = () => {
		// console.log("==========================");
		// PLAY RECORDING AUDIO
		this.setState({ startRecordingView: false, stopRecordingView: false, playRecordingView: false, pauseRecordingView: true });
		this.onStartPlay();
	}

	handlePauseRecordedAudio = () => {
		// console.log("==========================");
		// PAUSE RECORDING AUDIO
		this.setState({ startRecordingView: false, stopRecordingView: false, playRecordingView: true, pauseRecordingView: false });
		this.onPausePlay();
	}

	handleRecordAudioDelete = () => {
		// console.log("==========================");
		// DELETE RECORD AUDIO
		this.onStopPlay();
		this.onFileDelete();
		this.setState({ startRecordingView: true, stopRecordingView: false, playRecordingView: false, pauseRecordingView: false });
	}

	render() {
		const { startRecordingView, stopRecordingView, playRecordingView, pauseRecordingView, recordTime, isPlayAudio } = this.state;

		let playWidth = (this.state.currentPositionSec / this.state.currentDurationSec) * (SCREEN_WIDTH - wp(44.4) * RATIO);
		// console.log("render() playWidth", playWidth);
		// console.log("==========================",);
		// console.log("render() recordTime", recordTime);
		// console.log("==========================",);

		if (!playWidth) playWidth = 0;

		return (
			<View style={{
				flex: 1,
				backgroundColor: colors.transparent,
				flexDirection: 'column',
				marginVertical: hp(2),
			}}>


				{startRecordingView ?
					/* START RECORD AUDIO VIEW */
					<View style={{ flex: 1, flexDirection: "row", alignItems: "center", }}>
						<View style={[GlobalStyles.borderGray, { flex: 1, paddingHorizontal: wp(4), height: hp(7), justifyContent: "center", borderRadius: wp(1), }]}>
							<Text style={{ fontSize: FontSize('small'), color: "#888888", fontFamily: Fonts.HelveticaNeue, }}>Tap to record your voice note</Text>
						</View>
						<TouchableOpacity onPress={this.handleRecordAudioStart} style={{ width: wp(12), height: wp(12), backgroundColor: colors.btnBgColor, borderRadius: wp(12 / 2), padding: wp(2.5), marginLeft: wp(3), }}>
							<Image source={require('../assets/icons/audio_record_icon.png')} resizeMode='contain' style={[GlobalStyles.imgContain,]} />
						</TouchableOpacity>
					</View>
					:
					null
				}
				{stopRecordingView ?
					/* ON STOP RECORD AUDIO VIEW */
					<View style={{ flex: 1, flexDirection: "row", alignItems: "center", }}>
						<View style={[GlobalStyles.borderPrimary, { flex: 1, paddingHorizontal: wp(4), height: hp(7), justifyContent: "center", alignItems: "center", borderRadius: wp(1), }]}>
							<Text style={{ fontSize: FontSize('small'), color: "#444444", fontFamily: Fonts.HelveticaNeue, }}>{recordTime}</Text>
						</View>
						<TouchableOpacity onPress={this.handleRecordAudioStop} style={[GlobalStyles.alignCenter, { width: wp(12), height: wp(12), backgroundColor: "#d1eafe", borderRadius: wp(12 / 2), padding: wp(2.5), marginLeft: wp(3), }]}>
							<View style={{ backgroundColor: colors.btnBgColor, width: wp(6), height: wp(6), borderRadius: wp(1), }}></View>
						</TouchableOpacity>
					</View>
					:
					null
				}

				{playRecordingView ?
					/* ON PLAY RECORD AUDIO VIEW */
					<View style={{ flex: 1, flexDirection: "row", alignItems: "center", }}>
						<View style={[{ flex: 1, flexDirection: "row", backgroundColor: "#d1eafe", paddingHorizontal: wp(4), height: hp(7), alignItems: "center", borderRadius: wp(1), }]}>
							<TouchableOpacity onPress={this.handlePlayRecordedAudio} style={{ width: wp(9), height: "100%", marginLeft: -wp(4), marginRight: wp(4), paddingLeft: wp(4), backgroundColor: "transparent", justifyContent: "center", }}>
								<View style={{ width: wp(5), height: wp(5), marginRight: wp(4), }}>
									<Image source={require('../assets/icons/play_icon.png')} resizeMode='contain' style={[GlobalStyles.imgContain,]} />
								</View>
							</TouchableOpacity>
							<Text style={{ fontSize: FontSize('small'), color: "#1994fb", fontFamily: Fonts.HelveticaNeue, }}>{"Recorded"}</Text>
						</View>
						<TouchableOpacity onPress={this.handleRecordAudioDelete} style={[GlobalStyles.alignCenter, { width: wp(11), height: wp(11), backgroundColor: "transparent", borderRadius: wp(12 / 2), padding: wp(2.5), marginLeft: wp(3), }]}>
							<Image source={require('../assets/icons/delete_icon.png')} resizeMode='contain' style={[GlobalStyles.imgContain,]} />
						</TouchableOpacity>
					</View>
					:
					null
				}
				{pauseRecordingView ?
					/* ON PAUSE RECORD AUDIO VIEW */
					<View style={{ flex: 1, flexDirection: "row", alignItems: "center", }}>
						<View style={[{ flex: 1, flexDirection: "row", backgroundColor: "#d1eafe", paddingHorizontal: wp(4), height: hp(7), alignItems: "flex-end", borderRadius: wp(1), }]}>
							<TouchableOpacity onPress={this.handlePauseRecordedAudio} style={{ width: wp(9), height: "100%", marginLeft: -wp(4), marginRight: wp(4), paddingLeft: wp(4), backgroundColor: "transparent", justifyContent: "center", }}>
								<View style={{ width: wp(5), height: wp(5), marginRight: wp(4), }}>
									<Image source={require('../assets/icons/audio_pause_icon.png')} resizeMode='contain' style={[GlobalStyles.imgContain,]} />
								</View>
							</TouchableOpacity>
							<View style={{ backgroundColor: colors.transparent, flex: 1, marginBottom: hp(0.7), }}>
								<TouchableOpacity
									style={[styles.viewBarWrapper, { marginTop: 0, marginHorizontal: 0, alignSelf: 'stretch', }]}
									onPress={this.onStatusPress}
								>
									<View style={[styles.viewBar, { backgroundColor: colors.white, height: hp(0.5), alignSelf: 'stretch', borderRadius: wp(0.5), }]}>
										<View style={[styles.viewBarPlay, { backgroundColor: colors.btnBgColor, height: hp(0.5), width: playWidth, borderRadius: wp(0.5), }]} />
									</View>
								</TouchableOpacity>
								<Text style={{ fontSize: FontSize('xMini'), color: "#1994fb", fontFamily: Fonts.HelveticaNeue, textAlign: "right", marginTop: wp(1), }}>{this.state.playTime}</Text>
							</View>
						</View>
						<TouchableOpacity onPress={this.handleRecordAudioDelete} style={[GlobalStyles.alignCenter, { width: wp(11), height: wp(11), backgroundColor: "transparent", borderRadius: wp(12 / 2), padding: wp(2.5), marginLeft: wp(3), }]}>
							<Image source={require('../assets/icons/delete_icon.png')} resizeMode='contain' style={[GlobalStyles.imgContain,]} />
						</TouchableOpacity>
					</View>
					:
					null
				}
			</View>
		);
	}
}

export default CustomAudioPlayer;