
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createRootNavigatorPatient } from './src/routes/PatientRoutes'
import { createRootNavigatorDoctor } from './src/routes/DoctorRoutes'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import AppInfo from './src/modules/AppInfoNativeModule';
import firebase from '@react-native-firebase/app';
import { NetworkProvider } from './src/components/NetworkProvider';
import NavigationService from './src/components/NavigationService';
import appHelper from './src/utils/AppHelper';

import '@react-native-firebase/crashlytics';

require('./src/utils/Extension');

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1994fb',
    accent: '#000000',
  }
};

export default class App extends Component {
  constructor(props) {
    super(props)

    this.navigation = props.navigation;
    this.state = {
      showTour: false,
    }
  }

  async componentDidMount() {
    // Set Target of the app
    global.target = await AppInfo.TARGET;

    this.checkPermission();

    this.handleUserFirstLogin();

    const access_token = await appHelper.getItem("access_token");
    global.accessToken = access_token;

    // Make document Directories
    await appHelper.makeDocumentDirectories()
  }

  /*componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }*/

  handleUserFirstLogin = async () => {
    const value = await appHelper.getItem('show_tour');
    // console.log("handleUserFirstLogin value ====>>>>>", value);

    if (value == null) {
      await appHelper.setItem('show_tour', 'true')
      await appHelper.setItem('show_package', 'true')
    }
  }

  checkPermission = async () => {
    try {
      const enabled = await firebase.messaging().hasPermission()
      if (enabled == 1) {
        this.getToken();
      } else {
        this.requestPermission();
      }
    } catch (error) {
      console.log("App.js checkPermission Catch", error)
    }
  }

  async getToken() {
    try {
      let fcmToken = await appHelper.getItem('fcmToken');
      // console.log("=== FCM Token", fcmToken)
      if (!fcmToken) {
        fcmToken = await firebase.messaging().getToken()
        if (fcmToken) {
          // user has a device token
          console.log("=== Innert FCM Token", fcmToken)
          await appHelper.setItem('fcmToken', fcmToken);
        }
      }
    } catch (error) {
      console.log("App.js getToken Catch", error)
    }
  }

  async requestPermission() {
    try {
      const authStatus = await firebase.messaging().requestPermission();
      const enabled =
        authStatus === firebase.messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === firebase.messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled == 1) {
        this.getToken();
      } else {
        // nothing...
      }
    } catch (error) {
      // User has rejected permissions
      console.log('App.js requestPermission Catch', error);
    }
  }



  render() {
    console.disableYellowBox = true;
    if (__DEV__) {
      console.disableYellowBox = false;
    }
    // Condition To Load Screen
    if (AppInfo.TARGET == "doctor") {
      const AppContainer = createAppContainer(createRootNavigatorDoctor());
      var LoadScreen = <AppContainer ref={navigatorRef => {
        NavigationService.setTopLevelNavigator(navigatorRef);
      }} />
    }
    else if (AppInfo.TARGET == "manager") {
      var LoadScreen = <Manager />
    }
    else if (AppInfo.TARGET == "patient") {
      const AppContainer = createAppContainer(createRootNavigatorPatient());
      var LoadScreen = <AppContainer ref={navigatorRef => {
        NavigationService.setTopLevelNavigator(navigatorRef);
      }} />
    }
    else {
      var LoadScreen = <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white' }}> Welcome to doclink Test </Text>
      </View>
    }

    return (
      <NetworkProvider>
        {LoadScreen}
      </NetworkProvider>
    );
  }
}