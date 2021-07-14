import React, { Component } from 'react';
import { Dimensions, } from 'react-native';
import {
    createSwitchNavigator,
    createDrawerNavigator,
    createStackNavigator,
    DrawerItems
} from 'react-navigation';

import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import LoginScreen from '../screens/LoginScreen'
import AuthProfileInfoScreen from '../screens/AuthProfileInfoScreen'
import RegisterScreen from '../screens/RegisterScreen'
import TermScreen from '../screens/TermScreen'
import VerifyScreen from '../screens/VerifyScreen'
import ClinicScreen from '../screens/ClinicScreen'
import ClinicProfileScreen from '../screens/ClinicProfileScreen'
import HomePatientScreen from '../screens/HomePatientScreen'
import ChatPackageScreen from '../screens/ChatPackageScreen'
import ChatScreen from '../screens/ChatScreen'
import MediaScreen from '../screens/MediaScreen'
import DoctorProfileChatScreen from '../screens/DoctorProfileChatScreen'
import NotificationScreen from '../screens/NotificationScreen'
import WalletScreen from '../screens/WalletScreen'
import SettingScreen from '../screens/SettingScreen'
import AboutScreen from '../screens/AboutScreen'
import PrivacyScreen from '../screens/PrivacyScreen'
import ReportScreen from '../screens/ReportScreen'
import DoctorSessionEndedScreen from '../screens/DoctorSessionEndedScreen'
import CreditCardScreen from '../screens/CreditCardScreen'
import CreditCardEasypaisaScreen from '../screens/CreditCardEasypaisaScreen'
import AppTourScreen from '../screens/TourScreens'


import ConnectDoctor from '../screens/ConnectDoctorScreen'
import ScanQRCode from '../screens/ScanQRCodeScreen'

import ProfileViewScreen from '../screens/ProfileViewScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import VerifyNumberScreen from '../screens/VerifyNumberScreen';
import InviteYourDoctorScreen from '../screens/InviteYourDoctorScreen';
import HelpScreen from '../screens/HelpScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import SearchScreen from '../screens/SearchScreen';
import EditPatientProfileScreen from '../screens/EditPatientProfileScreen';
import PatientPrescriptionViewScreen from '../screens/PatientPrescriptionViewScreen';
import PatientNotificationScreen from '../screens/PatientNotificationScreen'
import ReminderScreen from '../screens/ReminderScreen';
import TestScreen from '../screens/TestScreen';
import MyPrescriptionScreen from '../screens/MyPrescriptionScreen';
import MedicalRecordScreen from '../screens/MedicalRecordScreen';
import AddMedicalRecordScreen from '../screens/AddMedicalRecordScreen';

const WIDTH = Dimensions.get('window').width;

/* Help Stack */
const HelpStackNav = createStackNavigator({
    Help: { screen: HelpScreen },
    Term: { screen: TermScreen },
    About: { screen: AboutScreen },
    Privacy: { screen: PrivacyScreen },
    Report: { screen: ReportScreen },
    AppTourHelp: { screen: AppTourScreen },
    SplashLoading: { screen: AuthLoadingScreen },
},
    {
        initialRouteName: 'Help',
        headerMode: 'none',
    }
);


/* Setting Stack */
const SettingStackNav = createStackNavigator({
    Setting: { screen: SettingScreen },
    ProfileEdit: { screen: EditPatientProfileScreen },
    Wallet: { screen: WalletScreen },
    CreditCard: { screen: CreditCardScreen, },
    CreditCardEasypaisa: { screen: CreditCardEasypaisaScreen, },
    ConnectDoctor: { screen: ConnectDoctor },
    SearchDoctor: { screen: SearchScreen },
    InviteYourDoctor: { screen: InviteYourDoctorScreen, },
    ScanQRCode: { screen: ScanQRCode },
    HelpStack: { screen: HelpStackNav },
    PatientNotification: { screen: PatientNotificationScreen }
},
    {
        initialRouteName: 'Setting',
        headerMode: 'none',
    }
);

/*  Clinic Stack */
const ClinicStack = createStackNavigator({
    Clinic: { screen: ClinicScreen },
    ClinicProfile: { screen: ClinicProfileScreen },
},
    {
        initialRouteName: 'Clinic',
        headerMode: 'none',
    }
);

/* Chat Stack */
const ChatStack = createStackNavigator({
    Home: { screen: HomePatientScreen },
    SettingStack: { screen: SettingStackNav },
    ProfileView: { screen: ProfileViewScreen, },
    DoctorProfile: { screen: DoctorProfileChatScreen },
    Notification: { screen: NotificationScreen },
    ChatPackage: { screen: ChatPackageScreen },
    Chat: { screen: ChatScreen },
    Media: { screen: MediaScreen },
    DoctorSessionEnded: { screen: DoctorSessionEndedScreen },
    Feedback: { screen: FeedbackScreen },
    ProfileEdit: { screen: ProfileEditScreen },
    VerifyNumber: { screen: VerifyNumberScreen },
    PrescriptionView: { screen: PatientPrescriptionViewScreen },
    Reminder: { screen: ReminderScreen },
    MyPrescription: { screen: MyPrescriptionScreen },
    Test: { screen: TestScreen },
    MedicalRecords: { screen: MedicalRecordScreen },
    AddMedicalRecord: { screen: AddMedicalRecordScreen }
},
    {
        initialRouteName: 'Home',
        headerMode: 'none',
    }
);

const ConnectDoctorStack = createStackNavigator(
    {
        ConnectDoctor: { screen: ConnectDoctor },
        ScanQRCode: { screen: ScanQRCode },
    },
    {
        initialRouteName: "ConnectDoctor",
        headerMode: 'none'
    }
);

const AuthStack = createStackNavigator(
    {
        Login: LoginScreen,
        Verification: VerifyScreen,
        Register: RegisterScreen,
        AuthProfileInfo: AuthProfileInfoScreen,
        Term: TermScreen,
    },
    {
        initialRouteName: 'Login',
        headerMode: 'none',
    }
);

/* Startup Routes */
export const createRootNavigatorPatient = () => {
    return createSwitchNavigator(
        {
            SplashLoading: { screen: AuthLoadingScreen },
            AppTour: { screen: AppTourScreen },
            Login: { screen: AuthStack },
            Home: { screen: ChatStack, },
        },
        {
            initialRouteName: 'SplashLoading',
        }
    )
};