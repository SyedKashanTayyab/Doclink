import { createSwitchNavigator, createStackNavigator } from 'react-navigation';

import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import LoginScreen from '../screens/LoginScreen'
import AuthProfileInfoScreen from '../screens/AuthProfileInfoScreen'
import RegisterScreen from '../screens/RegisterDoctorScreen'
import TermScreen from '../screens/TermScreen'
import VerifyScreen from '../screens/VerifyScreen'
import CompleteDoctorProfileScreen from '../screens/CompleteDoctorProfileScreen'
import CompleteDoctorPackageScreen from '../screens/CompleteDoctorPackageScreen'
import HomeDoctorScreen from '../screens/HomeDoctorScreen'
import NotificationScreen from '../screens/NotificationScreen'
import DoctorChatScreen from '../screens/DoctorChatScreen'
import MediaScreen from '../screens/MediaScreen'
import EndSessionScreen from '../screens/EndSessionScreen'
import PackageScreen from '../screens/PackageScreen'
import PaymentScreen from '../screens/PaymentScreen'
import SettingScreen from '../screens/SettingScreen'
import AboutScreen from '../screens/AboutScreen'
import PrivacyScreen from '../screens/PrivacyScreen'
import ReportScreen from '../screens/ReportScreen'
import CompleteScheduleScreen from '../screens/CompleteScheduleScreen'
import DoctorClosingNoteScreen from '../screens/DoctorClosingNoteScreen'
import DoctorSessionEndedScreen from '../screens/DoctorSessionEndedScreen'
import PatientProfileChatScreen from '../screens/PatientProfileChatScreen'
import ProfileEditScreen from '../screens/ProfileEditScreen';
import ConnectPatient from '../screens/ConnectPatientScreen'
import HelpScreen from '../screens/HelpScreen';
import ProfileViewScreen from '../screens/ProfileViewScreen';
import VerifyNumberScreen from '../screens/VerifyNumberScreen';
import DoctorLandingScreen from '../screens/DoctorLandingScreen';
import PatientPrescriptionViewScreen from '../screens/PatientPrescriptionViewScreen';
import AppTourScreen from '../screens/TourScreens'
import BroadcastScreen from '../screens/BroadcastScreen';
import DoctorReminderScreen from '../screens/DoctorReminderScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

import AddTextStoryScreen from '../screens/Stories/AddTextStoryScreen';
import AddMediaStoryScreen from '../screens/Stories/AddMediaStoryScreen';
import AnnouncementScreen from '../screens/AnnouncementScreen';

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
    About: { screen: AboutScreen },
    Privacy: { screen: PrivacyScreen },
    Term: { screen: TermScreen },
    Report: { screen: ReportScreen },
    SplashLoading: { screen: AuthLoadingScreen },
    HelpStack: { screen: HelpStackNav },
    Payment: { screen: PaymentScreen },
    ProfileEdit: { screen: ProfileEditScreen },
    VerifyNumber: { screen: VerifyNumberScreen, },
    ProfileView: { screen: ProfileViewScreen },
},
    {
        initialRouteName: 'Setting',
        headerMode: 'none',
    }
);

/*  Profile Stack */

/* Chat Stack */
const ChatStack = createStackNavigator({
    Home: { screen: HomeDoctorScreen },
    Chat: { screen: DoctorChatScreen },
    ConnectPatient: { screen: ConnectPatient },
    SettingStack: { screen: SettingStackNav },
    DoctorClosingNote: { screen: DoctorClosingNoteScreen },
    DoctorSessionEnded: { screen: DoctorSessionEndedScreen },
    PatientProfileChat: { screen: PatientProfileChatScreen },
    Notification: { screen: NotificationScreen },
    Media: { screen: MediaScreen },
    EndSession: { screen: EndSessionScreen },
    Package: { screen: PackageScreen },
    ProfileView: { screen: ProfileViewScreen },
    PrescriptionView: { screen: PatientPrescriptionViewScreen },
    Broadcast: { screen: BroadcastScreen },
    Reminder: { screen: DoctorReminderScreen },
    Statistics: { screen: StatisticsScreen },
    AddTextStory: { screen: AddTextStoryScreen },
    MediaStory: { screen: AddMediaStoryScreen },
    Announcements: { screen: AnnouncementScreen }
},
    {
        initialRouteName: 'Home',
        headerMode: 'none',
    }
);

/* Setup Stack */
const SetupStack = createStackNavigator(
    {
        CompleteDoctorProfile: { screen: CompleteDoctorProfileScreen },
        CompleteSchedule: { screen: CompleteScheduleScreen },
        CompleteDoctorPackage: { screen: CompleteDoctorPackageScreen },
    },
    {
        initialRouteName: 'CompleteDoctorProfile',
        headerMode: 'none',
    }
);

/* Authenticate Stack */
const AuthStack = createStackNavigator(
    {
        Login: { screen: LoginScreen },
        Register: { screen: RegisterScreen },
        Verification: { screen: VerifyScreen },
        AuthProfileInfo: { screen: AuthProfileInfoScreen },
        Term: { screen: TermScreen },
    },
    {
        initialRouteName: 'Login',
        headerMode: 'none',
    }
);

/* Startup Routes */
export const createRootNavigatorDoctor = () => {
    return createSwitchNavigator(
        {
            SplashLoading: { screen: AuthLoadingScreen },
            AppTour: { screen: AppTourScreen },
            Login: { screen: AuthStack },
            Setup: { screen: SetupStack },
            DoctorLanding: { screen: DoctorLandingScreen },
            Home: { screen: ChatStack },
        },
        {
            initialRouteName: 'SplashLoading',
        }
    )
};