import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'native-base';
import AppInfo from './src/modules/AppInfoNativeModule';
import {
    createAppContainer,
    createSwitchNavigator,
    createDrawerNavigator,
    createStackNavigator,
    DrawerItems
} from 'react-navigation';
import {
    AuthLoadingScreen,
    LoginScreen,
    TermScreen,
    OtpScreen,
    CompleteProfileScreen,
    HomeScreen,
    ChatScreen,
    PatientProfileScreen,
    ProfileScreen,
    EditProfileScreen,
    ManagerScreen,
    ManagerAddScreen,
    ManagerEditScreen,
    ManagerProfileScreen,
    HelpDeskScreen,
    HelpDeskAddScreen,
    HelpDeskDetailScreen,
    LogoutScreen,
    DoctorProfileScreen,
    PatientListScreen,
    PatientAddScreen,
    PatientEditScreen,
    PrivacyScreen,
    DoctorPlanScreen,
    DoctorPlanAddScreen,
    DoctorPlanEditScreen,
} from '../screens';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DrawerHeader from '../components/DrawerHeader';

const DrawerContent = (props) => (
    <View>
        <DrawerHeader />
        <DrawerItems {...props} />
    </View>
);

const HelpStack = createStackNavigator({
    HelpDesk: { screen: HelpDeskScreen },
    HelpDeskAdd: { screen: HelpDeskAddScreen },
    HelpDeskDetail: { screen: HelpDeskDetailScreen },
},
    {
        initialRouteName: 'HelpDesk',
        headerMode: 'none',
    }
);

const ManagerStack = createStackNavigator({
    Manager: { screen: ManagerScreen },
    ManagerAdd: { screen: ManagerAddScreen },
    ManagerEdit: { screen: ManagerEditScreen },
    ManagerProfile: { screen: ManagerProfileScreen },
},
    {
        initialRouteName: 'Manager',
        headerMode: 'none',
    }
);

const PatientStack = createStackNavigator({
    PatientList: { screen: PatientListScreen },
    PatientAdd: { screen: PatientAddScreen },
    PatientEdit: { screen: PatientEditScreen },
    PatientProfile: { screen: PatientProfileScreen },
},
    {
        initialRouteName: 'PatientList',
        headerMode: 'none',
    }
);

const ChatStack = createStackNavigator({
    Home: { screen: HomeScreen },
    Chat: { screen: ChatScreen },
    PatientProfile: { screen: PatientProfileScreen },
    PatientEdit: { screen: PatientEditScreen },
    PatientList: { screen: PatientStack }
},
    {
        initialRouteName: 'Home',
        headerMode: 'none',
    }
);

const ProfileStack = createStackNavigator({
    Profile: { screen: (AppInfo.TARGET == 'doctor') ? DoctorProfileScreen : PatientProfileScreen }, //ProfileScreen
    EditProfile: { screen: EditProfileScreen },
    /* PatientAdd:     { screen: PatientAddScreen }, */
},
    {
        initialRouteName: 'Profile',
        headerMode: 'none',
    }
);

const SettingStack = createStackNavigator({
    Logout: { screen: LogoutScreen },
    Privacy: { screen: PrivacyScreen },
},
    {
        initialRouteName: 'Logout',
        headerMode: 'none',
    }
);

const PlanStack = createStackNavigator({
    Plan: { screen: DoctorPlanScreen },
    PlanAdd: { screen: DoctorPlanAddScreen },
    PlanEdit: { screen: DoctorPlanEditScreen },
},
    {
        initialRouteName: 'Plan',
        headerMode: 'none',
    }
);

const AppDrawNavigator = createDrawerNavigator({
    Home: {
        screen: ChatStack,
        navigationOptions: {
            drawerLabel: 'Home',
            drawerIcon: <Icon type="MaterialIcons" name='home' style={{ fontSize: hp('3%'), color: '#666' }} />
        }
    },
    Profile: {
        screen: ProfileStack,
        navigationOptions: {
            drawerLabel: 'Profile',
            drawerIcon: <Icon type="MaterialIcons" name='person' style={{ fontSize: hp('3%'), color: '#666' }} />
        }
    },
    Manager: {
        screen: ManagerStack,
        navigationOptions: {
            drawerLabel: 'Manager',
            drawerIcon: <Icon type="MaterialIcons" name='people' style={{ fontSize: hp('3%'), color: '#666' }} />
        }
    },
    Plan: {
        screen: PlanStack,
        navigationOptions: {
            drawerLabel: 'Plans',
            drawerIcon: <Icon type="MaterialIcons" name='poll' style={{ fontSize: hp('3%'), color: '#666' }} />
        }
    },
    HelpDesk: {
        screen: HelpStack,
        navigationOptions: {
            drawerLabel: 'Help Desk',
            drawerIcon: <Icon type="MaterialIcons" name='report' style={{ fontSize: hp('3%'), color: '#666' }} />
        }
    },
    Logout: {
        screen: SettingStack,
        navigationOptions: {
            drawerLabel: 'Settings',
            drawerIcon: <Icon type="MaterialIcons" name='settings' style={{ fontSize: hp('2.5%'), color: '#666' }} />
        }
    }
},
    {
        initialRouteName: 'Home',
        headerMode: 'none',
        contentComponent: DrawerContent,
        drawerPosition: 'right',
        drawerLockMode: 'locked-closed'
    }
);

const AuthStack = createStackNavigator(
    {
        Login: { screen: LoginScreen },
        Verification: { screen: OtpScreen },
       // CompleteProfile: { screen: CompleteProfileScreen },
        Term: { screen: TermScreen },
    },
    {
        initialRouteName: 'Login',
        headerMode: 'none',
    }
);

const AppSwitchNavigator = createSwitchNavigator(
    {
        SplashLoading: { screen: AuthLoadingScreen },
        Login: { screen: AuthStack },
        Home: { screen: AppDrawNavigator },
    },
    {
        initialRouteName: 'SplashLoading',
    }
);

export default createAppContainer(AppSwitchNavigator);