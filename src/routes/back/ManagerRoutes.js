
import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'native-base';
import { 
    createSwitchNavigator, 
    createStackNavigator, 
    createAppContainer, 
    createDrawerNavigator,
    DrawerItems
} from 'react-navigation';
import { 
    AuthLoadingScreen, 
    LoginScreen, 
    TermScreen,
    OtpScreen, 
    CompleteProfileScreen,
    HomeManagerScreen, 
    LogoutScreen, 
    ProfileScreen,
    EditProfileScreen,
    PaymentScreen, 
    HelpDeskScreen,
    HelpDeskAddScreen,
    HelpDeskDetailScreen,
    PatientProfileScreen,
    DoctorProfileScreen,
    PaymentAddScreen,
    PatientListScreen,
    PatientAddScreen,
    PatientEditScreen,
    PrivacyScreen,
} from '../screens';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DrawerHeader from '../components/DrawerHeader';

const DrawerContent = (props) => (
    <View>
        <DrawerHeader />
        <DrawerItems {...props} />
    </View>
);

const ProfileStack = createStackNavigator({
    Profile: { screen: ProfileScreen },
    EditProfile: { screen: EditProfileScreen },
},
    {
        initialRouteName: 'Profile',
        headerMode: 'none',
    }
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

const PatientStack = createStackNavigator({
    PatientList: { screen: PatientListScreen },
    PatientAdd: { screen: PatientAddScreen },
    PatientEdit: { screen: PatientEditScreen },
    PatientProfile: { screen: PatientProfileScreen },
    PaymentAdd: { screen: PaymentAddScreen },
},
    {
        initialRouteName: 'PatientList',
        headerMode: 'none',
    }
);

const HomeStack = createStackNavigator({
    Home: { screen: HomeManagerScreen },
    DoctorProfile: { screen: DoctorProfileScreen },
    PatientList: { screen: PatientStack },
},
    {
        initialRouteName: 'Home',
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

const AppDrawNavigator = createDrawerNavigator({
    Home: {
        screen: HomeStack,
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
    Payment: {
        screen: PaymentScreen,
        navigationOptions: {
            drawerLabel: 'Payments',
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
        Login: LoginScreen,
        Verification: OtpScreen,
        CompleteProfile: CompleteProfileScreen,
        Term: TermScreen,
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
    }
);

export default createAppContainer(AppSwitchNavigator);