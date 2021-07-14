import React, { Component } from 'react';
import { ImageBackground, StatusBar } from 'react-native';
import appHelper from '../utils/AppHelper';
import { CheckRedirection } from '../api/Authentication';
import AppInfo from '../../src/modules/AppInfoNativeModule';
import colors from '../utils/Colors';
import { isDoctor } from '../utils/Constant';

class AuthLoadingScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        setTimeout(() => {
            this._bootstrapAsync();
        }, 500);
    }

    // Generate Random String
    getRandomString(max) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < max; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = async () => {

        try {
            const access_token = await appHelper.getItem('access_token');
            // console.log("Access TOken", access_token)
            if (!access_token) {
                await appHelper.setItem('device_identifier', this.getRandomString(50));
            }

            //Set global user data for navigation
            global.user_data = await appHelper.getData("user_data");

            //Set Navigation Global
            global.navigation = await this.props.navigation;

            global.show_tour = await appHelper.getItem('show_tour');

            //check access token for redirection
            if (access_token) {
                //Check New User
                //if (AppInfo.TARGET == "patient") {
                // var userid = global.user_data.id;
                // try {
                //     const res = await CheckRedirection(userid);
                //     const { data } = await res;
                //     if (data.status == 'Success') {
                //         if (data.data) {
                //             this.props.navigation.navigate('Clinic');
                //         }
                //         else {
                //             this.props.navigation.navigate('Home');
                //         }
                //     }
                //     else if (data.status == 'Error') {
                //         this.props.navigation.navigate('Clinic');
                //     }
                // }
                // catch (error) {
                //     console.warn('Internal Server Error', error);
                // }
                //}
                // console.log(global.user_data)
                if (global.user_data.name == "" || global.user_data.name == null) {
                    this.props.navigation.navigate('AuthProfileInfo');
                } else {
                    this.props.navigation.navigate('Home');
                }
            }
            else {
                if (global.show_tour == 'true') {
                    this.props.navigation.navigate('AppTour');
                } else {
                    // SEND THE USER TO LOGIN SCREEN
                    isDoctor ? this.props.navigation.navigate('DoctorLanding') : this.props.navigation.navigate('Login');
                }

            }
        } catch (error) {
            console.log(error)
        }
    };

    render() {
        var splashName = ""
        if (AppInfo.TARGET == "doctor") {
            splashName = require('../assets/images/splash_doctor.png')
        }
        else if (AppInfo.TARGET == "patient") {
            splashName = require('../assets/images/slpash_patient.png')
        }
        return (
            <ImageBackground style={{ width: "100%", height: "100%" }} resizeMode="cover" source={splashName} >
                {/* <StatusBar backgroundColor={colors.primaryText} barStyle='dark-content' /> */}
            </ImageBackground>
        );
    }
}

export default AuthLoadingScreen;