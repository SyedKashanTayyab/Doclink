import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ImageBackground, StatusBar } from 'react-native';
import { Container } from 'native-base';
import { hp, wp } from '../utils/Utility';
import AppInfo from '../modules/AppInfoNativeModule';
import AppIntroSlider from '../components/AppIntroSlider';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import { Icon } from 'native-base';
import { SafeAreaView } from 'react-navigation';
import GlobalStyles from '../styles/GlobalStyles';
import appHelper from '../utils/AppHelper';
import NavigationBar from '../components/NavigationBar';
import { NavigationActions } from 'react-navigation';

const DoctorSlides = [
	{
		key: 'one',
		title: 'Welcome to\nDocLink',
		text: 'Consult your patients remotely through various in-app features',
		image: require('../assets/images/tour_doctor/d1.png'),
		mainlogo: require('../assets/images/tour_doctor_logo.png')
	},
	{
		key: 'two',
		title: 'Connect with\nyour Patient',
		text: 'Share your referral code to invite patients to use Doclink and connect with them',
		image: require('../assets/images/tour_doctor/d2.png'),
		mainlogo: require('../assets/images/tour_doctor_logo.png')
	},
	{
		key: 'three',
		title: 'Manage your Earnings\nand Payouts',
		text: 'Keep a track of your Earnings from each session and Doclink\'s payout records',
		image: require('../assets/images/tour_doctor/d3.png'),
		mainlogo: require('../assets/images/tour_doctor_logo.png')
	},
	{
		key: 'four',
		title: 'Modify your\nPackages',
		text: 'Set session charges to interact with your patients',
		image: require('../assets/images/tour_doctor/d4.png'),
		mainlogo: require('../assets/images/tour_doctor_logo.png')
	},
	{
		key: 'five',
		title: 'Communicate with\nPatients via Chat',
		text: 'Talk to your patients through text messages or voice notes and share images',
		image: require('../assets/images/tour_doctor/d5.png'),
		mainlogo: require('../assets/images/tour_doctor_logo.png')
	},
	{
		key: 'six',
		title: 'Provide Prescription\nfor Patients',
		text: 'Summarize your advice in closing notes and prescribe medicines as well',
		image: require('../assets/images/tour_doctor/d6.png'),
		mainlogo: require('../assets/images/tour_doctor_logo.png')
	},
];
const PatientSlides = [
	{
		key: 'one',
		title: 'Welcome to\nDocLink',
		text: 'Consult your doctors remotely through various in-app features',
		image: require('../assets/images/tour/p1.png'),
		mainlogo: require('../assets/images/tour_patient_logo.png')
	},
	{
		key: 'two',
		title: 'Connect with\nyour Doctors',
		text: 'Search your Doctors by their name or Referral Code and add them to start a session',
		image: require('../assets/images/tour/p2.png'),
		mainlogo: require('../assets/images/tour_patient_logo.png')
	},
	{
		key: 'three',
		title: 'Communicate with\nDoctors via Chat',
		text: 'Talk to your doctor through text messages or voice notes and share images',
		image: require('../assets/images/tour/p3.png'),
		mainlogo: require('../assets/images/tour_patient_logo.png')
	},
	{
		key: 'four',
		title: 'View your\nPrescription',
		text: 'Receive the details and comments of medicines prescribed by your doctor',
		image: require('../assets/images/tour/p4.png'),
		mainlogo: require('../assets/images/tour_patient_logo.png')
	},
	{
		key: 'six',
		title: 'Top Up\nyour Wallet',
		text: 'Top Up your wallet using various methods to pay for the sessions',
		image: require('../assets/images/tour/p5.png'),
		mainlogo: require('../assets/images/tour_patient_logo.png')
	},
];

export default class TourScreens extends Component {

	constructor(props) {
		super(props);
		this.state = {
			route: null,
		}
	}

	componentDidMount = async () => {
		const { navigation } = this.props;
		let route = await navigation.getParam('route', null);
		this.setState({
			route: route
		})
	}

	_renderItem = ({ item }) => {
		return (
			<View style={styles.mainContent}>

				{/*  Logo  */}
				<View style={styles.mainRow}>
					<Image style={{ width: wp(100), height: hp(7) }} resizeMode="contain" source={item.mainlogo} />
				</View>

				{/*  Main Image  */}
				<View style={styles.mainRow}>
					<Image style={{ width: wp(100), height: hp(40) }} resizeMode="contain" source={item.image} />
				</View>

				{/*  Main Title  */}
				<View style={[styles.mainRow, { alignItems: 'flex-start', paddingLeft: wp(6) }]}>
					<Text style={styles.title}>{item.title}</Text>
				</View>

				{/*  Main Text  */}
				<View style={[styles.mainRow, { alignItems: 'flex-start', paddingLeft: wp(6), paddingRight: wp(30) }]}>
					<Text style={styles.text}>{item.text}</Text>
				</View>

			</View>
		);
	};

	_renderNextButton = () => {
		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Text style={styles.buttonText}>Next</Text>
				<Icon type='FontAwesome' name='angle-right' style={[styles.iconColor, { fontSize: FontSize('large'), paddingVertical: 15 }]} />
			</View>
		);
	};

	_renderPrevButton = () => {
		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Icon type='FontAwesome' name='angle-left' style={[styles.iconColor, { fontSize: FontSize('large'), paddingVertical: 15 }]} />
				<Text style={styles.buttonText}>Previous</Text>
			</View>
		);
	};

	_renderDoneButton = () => {
		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Text style={styles.buttonText}>Finish</Text>
				<Icon type='FontAwesome' name='angle-right' style={[styles.iconColor, { fontSize: FontSize('large'), paddingVertical: 15 }]} />
			</View>
		);
	};

	_onDoneButtonHandler = async () => {
		console.log(this.state.route)
		try {
			if (this.state.route == null) {
				await appHelper.setItem("show_tour", 'false');
				if (AppInfo.TARGET == "doctor") {
					this.props.navigation.navigate('DoctorLanding')
				} else {
					this.props.navigation.navigate('Login')
				}
			} else {
				this.props.navigation.dispatch(NavigationActions.back());
				// this.props.context.navigation.goBack();
			}
		} catch (error) {
			console.log(error)
		}
	}

	_keyExtractor = (item) => item.key;

	render() {
		const slides = AppInfo.TARGET == "doctor" ? DoctorSlides : PatientSlides;


		let bodyElement = <>
			{/* <View style={[styles.mainRow, { paddingVertical: 20, paddingRight: 15, alignItems: 'flex-end' }]}>
				<TouchableOpacity onPress={() => {
					this._onDoneButtonHandler()
				}}>
					<Text style={{ color: AppInfo.TARGET == 'patient' ? colors.primary : colors.white, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small') }}>Skip</Text>
				</TouchableOpacity>
			</View> */}
			<AppIntroSlider
				data={slides}
				showPrevButton={true}
				keyExtractor={this._keyExtractor}
				renderItem={this._renderItem}
				renderNextButton={this._renderNextButton}
				renderPrevButton={this._renderPrevButton}
				renderDoneButton={this._renderDoneButton}
				onDone={this._onDoneButtonHandler}
				activeDotStyle={styles.activeDot}
				dotStyle={styles.dot}
			/>
		</>
		return (
			<Container>
				<SafeAreaView style={[GlobalStyles.AndroidSafeArea, { backgroundColor: colors.transparent }]} forceInset={{ top: 'never', bottom: 'never' }}>
					<NavigationBar
						// title={"Sign Up"}
						titleView={null}
						removeBackButton={true}
						context={this.props}
						backButton={false}
						right={
							<TouchableOpacity
								style={{ padding: wp(0), }}
								onPress={() => {
									this._onDoneButtonHandler()
								}}>
								<Text style={{ color: AppInfo.TARGET == 'patient' ? colors.primary : colors.white, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small') }}>Skip</Text>
							</TouchableOpacity>
						}
						noShadow={true}
						transparent={true}
						exclusiveBg={AppInfo.TARGET == 'patient' ? colors.aliceBlue2 : colors.primary}
						statusBarBgColor={AppInfo.TARGET == 'patient' ? colors.aliceBlue2 : colors.primary}
					/>

					<View style={{ flex: 1, backgroundColor: colors.transparent }}>
						{
							AppInfo.TARGET == 'patient'
								? <View style={{ flex: 1, backgroundColor: 'blue' }}>
									{bodyElement}
								</View>
								: <ImageBackground style={{ flex: 1 }} source={require('../assets/images/gradient_blue_bg.png')} resizeMode="cover">
									{bodyElement}
								</ImageBackground>
						}
					</View>
					{/* <NavigationBar
						// title={"Sign Up"}
						titleView={null}
						removeBackButton={true}
						context={this.props}
						backButton={false}
						right={
							<TouchableOpacity
								style={{ padding: wp(0),  }}
								onPress={() => {
									this._onDoneButtonHandler()
								}}>
								<Text style={{ color: AppInfo.TARGET == 'patient' ? colors.primary : colors.white, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small') }}>Skip</Text>
							</TouchableOpacity>
						}
						noShadow={false}
						transparent={true}
						exclusiveBg={AppInfo.TARGET == 'patient' ? colors.aliceBlue2 : colors.primary}
						statusBarBgColor={AppInfo.TARGET == 'patient' ? colors.aliceBlue2 : colors.primary}
					/>
					{
						AppInfo.TARGET == 'patient'
							? <View style={{ flex: 1, backgroundColor: 'blue' }}>
								{bodyElement}
							</View>
							: <ImageBackground style={{ flex: 1 }} source={require('../assets/images/gradient_blue_bg.png')} resizeMode="cover">
								{bodyElement}
							</ImageBackground>
					} */}



				</SafeAreaView>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	mainContent: {
		flex: 1,
		backgroundColor: AppInfo.TARGET == 'patient' ? colors.aliceBlue2 : colors.transparent,
		width: '100%',
	},
	mainRow: {
		paddingVertical: 13,
		width: wp(100),
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		textAlign: 'left',
		fontSize: FontSize('xLarge'),
		fontFamily: Fonts.HelveticaNeue,
		lineHeight: 35,
		color: AppInfo.TARGET == 'patient' ? colors.primary : colors.white,
	},
	text: {
		textAlign: 'left',
		fontSize: FontSize('medium'),
		fontFamily: Fonts.HelveticaNeue,
		lineHeight: 35,
		color: AppInfo.TARGET == 'patient' ? '#686868' : colors.white,
	},
	image: {
		width: wp(100),
		height: "100%",
	},
	buttonText: {
		backgroundColor: 'transparent',
		color: AppInfo.TARGET == 'patient' ? colors.primary : colors.white,
		fontSize: FontSize("small"),
		paddingVertical: 15,
		paddingHorizontal: 10,
		fontFamily: Fonts.HelveticaNeue,
	},
	activeDot: {
		width: 12, height: 12,
		borderRadius: 10,
		backgroundColor: AppInfo.TARGET == 'patient' ? colors.primary : colors.white,
	},
	dot: {
		width: 12, height: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: AppInfo.TARGET == 'patient' ? colors.primary : colors.white,
	},
	iconColor: {
		color: AppInfo.TARGET == 'patient' ? colors.primary : colors.white,
	}
});