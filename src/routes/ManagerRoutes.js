import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { Icon } from 'native-base';
import { 
    createSwitchNavigator, 
    createStackNavigator, 
    createAppContainer, 
    createDrawerNavigator,
    DrawerItems
} from 'react-navigation';

import AuthLoadingScreen from '../screens/AuthLoadingScreen'
import LoginScreen from '../screens/LoginScreen'
import VerifyScreen from '../screens/VerifyScreen'
import HomeManagerScreen from '../screens/HomeManagerScreen'
import WalletHistoryScreen from '../screens/WalletHistory'
import DoctorListScreen from '../screens/DoctorListScreen'
import DoctorProfileScreen from '../screens/DoctorProfileScreen'
import DoctorScheduleScreen from '../screens/DoctorScheduleScreen'
import ReferPatientListScreen from '../screens/ReferPatientListScreen'
import ViewPatientScreen from '../screens/ViewPatientScreen'
import SettingScreen from '../screens/SettingScreen'
import AboutScreen from '../screens/AboutScreen'
import PrivacyScreen from '../screens/PrivacyScreen'
import TermScreen from '../screens/TermScreen'
import ReportScreen from '../screens/ReportScreen'
import ManagerProfileScreen from '../screens/ManagerProfileScreen'
import EditManagerProfileScreen from '../screens/EditManagerProfileScreen'
import ConnectScreen from '../screens/ConnectScreen'

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DrawerHeader from '../components/DrawerHeader';
import { Fonts } from '../utils/Fonts';

const WIDTH = Dimensions.get('window').width;

/* Drawer Header Component */
const DrawerContent = (props) => (
    <View>
        <DrawerHeader />
        <DrawerItems {...props} />
    </View>
);

/* Setting Stack */
const SettingStack = createStackNavigator({
    Setting: { screen: SettingScreen },
    About: { screen: AboutScreen },
    Privacy: { screen: PrivacyScreen },
    Term: { screen: TermScreen },
    Report: { screen: ReportScreen },
    SplashLoading: { screen: AuthLoadingScreen },
},
    {
        initialRouteName: 'Setting',
        headerMode: 'none',
    }
);

/*  Patient Stack */
const PatientStack = createStackNavigator({
    PatientList: { screen: ReferPatientListScreen },
    ViewPatient: { screen: ViewPatientScreen },
},
    {
        initialRouteName: 'PatientList',
        headerMode: 'none',
    }
);

/*  Doctor Stack */ 
const DoctorStack = createStackNavigator({
    DoctorList: { screen: DoctorListScreen },
    DoctorProfile: { screen: DoctorProfileScreen },
    Schedule: { screen: DoctorScheduleScreen },
},
    {
        initialRouteName: 'DoctorList',
        headerMode: 'none',
    }
);

/*  Profile Stack */
const ProfileStack = createStackNavigator({
    ManagerProfile: { screen: ManagerProfileScreen },
    EditManagerProfile: { screen: EditManagerProfileScreen },
},
    {
        initialRouteName: 'ManagerProfile',
        headerMode: 'none',
    }
);

/* Home Stack */
const HomeStack = createStackNavigator({
    Home: { screen: HomeManagerScreen },
    WalletHistory: { screen: WalletHistoryScreen },
},
    {
        initialRouteName: 'Home',
        headerMode: 'none',
    }
);

/* Drawer Navigation */
const AppDrawNavigator = createDrawerNavigator({
    Home: {
        screen: HomeStack,
        navigationOptions: {
            drawerLabel: 'Home',
            drawerIcon: <Icon type="MaterialIcons" name='home' style={{ fontSize: hp('3%'), color: '#3f3f3f' }} />
        }
    },
    Profile: {
        screen: ProfileStack,
        navigationOptions: {
            drawerLabel: 'My Profile',
            drawerIcon: <Icon type="MaterialIcons" name='person' style={{ fontSize: hp('3%'), color: '#3f3f3f' }} />
        }
    },
    WalletHistory: {
        screen: WalletHistoryScreen,
        navigationOptions: {
            drawerLabel: 'Wallet',
            drawerIcon: <Icon type="Entypo" name='wallet' style={{ fontSize: hp('3%'), color: '#3f3f3f' }} />
        }
    },
    Doctor: {
        screen: DoctorStack,
        navigationOptions: {
            drawerLabel: 'Doctors',
            drawerIcon: <Icon type="FontAwesome" name='user-md' style={{ fontSize: hp('3%'), color: '#3f3f3f' }} />
        }
    },
    Patient: {
        screen: PatientStack,
        navigationOptions: {
            drawerLabel: 'Patients',
            drawerIcon: <Icon type="FontAwesome" name='users' style={{ fontSize: hp('3%'), color: '#3f3f3f' }} />
        }
    },
    Connect: {
        screen: ConnectScreen,
        navigationOptions: {
            drawerLabel: 'Connect',
            drawerIcon: <Icon type="Feather" name='link' style={{ fontSize: hp('3%'), color: '#3f3f3f' }} />
        }
    },
    Setting: {
        screen: SettingStack,
        navigationOptions: {
            drawerLabel: 'Settings',
            drawerIcon: <Icon type="MaterialIcons" name='settings' style={{ fontSize: hp('2.5%'), color: '#3f3f3f' }} />
        }
    }
},
    {
        initialRouteName: 'Home',
        headerMode: 'none',
        contentComponent: DrawerContent,
        drawerWidth: WIDTH * 0.7,
        drawerLockMode: 'locked-closed',
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        contentOptions: {
            labelStyle: {
                fontWeight: 'normal',
                fontFamily: Fonts.RobotoBold
            }
        }
    }
);

/* Auth Stack */
const AuthStack = createStackNavigator(
    {
        Login: LoginScreen,
        Verification: VerifyScreen,
        Term: TermScreen,
    },
    {
        initialRouteName: 'Login',
        headerMode: 'none',
    }
);

/* Route Start From Here */
const AppSwitchNavigator = createSwitchNavigator(
    {
        SplashLoading: { screen: AuthLoadingScreen },
        Login: { screen: AuthStack },
        Home: { screen: AppDrawNavigator },
    }
);

export default createAppContainer(AppSwitchNavigator);