import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'native-base';
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
    ProfileScreen, 
    EditProfileScreen, 
    HomeScreen, 
    ChatScreen, 
    DoctorProfileScreen, 
    PlanScreen, 
    HelpDeskScreen, 
    HelpDeskAddScreen, 
    HelpDeskDetailScreen, 
    LogoutScreen,
    PaymentMethodListScreen,
    PaymentCheckoutScreen,
    TwocoCheckoutScreen,
    StripeCheckoutScreen,
    EasypaisaCheckoutScreen,
    JazzCheckoutScreen,
    PrivacyScreen,
    ThanksScreen
} from '../screens';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DrawerHeader from '../components/DrawerHeader';

const DrawerContent = (props) => (
    <View>
        <DrawerHeader />
        <DrawerItems {...props} />
    </View>
);

const ChatStack = createStackNavigator({
    Home: { screen: HomeScreen },
    Chat: { screen: ChatScreen },
    DoctorProfile: { screen: DoctorProfileScreen },
    Plan: { screen: PlanScreen },
    PaymentMethodList: { screen: PaymentMethodListScreen },
    TwocoCheckout: { screen: TwocoCheckoutScreen },
    StripeCheckout: { screen: StripeCheckoutScreen },
    Thanks: { screen: ThanksScreen },
},
    {
        initialRouteName: 'Home',
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

const ProfileStack = createStackNavigator({
    Profile: { screen: ProfileScreen },
    EditProfile: { screen: EditProfileScreen },
},
    {
        initialRouteName: 'Profile',
        headerMode: 'none',
    }
);

const PlanStack = createStackNavigator({
    Plan: { screen: PlanScreen },
    PaymentMethodList: { screen: PaymentMethodListScreen },
    PaymentCheckout: { screen: PaymentCheckoutScreen },
    TwocoCheckout: { screen: TwocoCheckoutScreen },
    StripeCheckout: { screen: StripeCheckoutScreen },
    EasypaisaCheckout: { screen: EasypaisaCheckoutScreen },
    JazzCheckout: { screen: JazzCheckoutScreen },
},
    {
        initialRouteName: 'Plan',
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
    /* Plan: {
        screen: PlanStack,
        navigationOptions: {
            drawerLabel: 'Plans',
            drawerIcon: <Icon type="MaterialIcons" name='poll' style={{ fontSize: hp('3%'), color: '#666' }} />
        }
    }, */
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
        },
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
    },
    {
        initialRouteName: 'SplashLoading',
    }
);

export default createAppContainer(AppSwitchNavigator);