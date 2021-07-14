//
//  Utility.js
//  Docklink
//
//  Created by Kashif Khatri on 06/04/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

import { Dimensions, Alert, Platform, StatusBar } from 'react-native';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './Constant';

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height, width } = Dimensions.get('window');

const isIPhoneX = () => Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? width === X_WIDTH && height === X_HEIGHT || width === XSMAX_WIDTH && height === XSMAX_HEIGHT
    : false;

const StatusBarHeight = Platform.select({
    ios: isIPhoneX() ? 44 : 20,
    android: StatusBar.currentHeight,
    default: 0
})

const deviceHeight = isIphoneX()
    ? SCREEN_HEIGHT - 78 // iPhone X style SafeAreaView size in portrait
    : Platform.OS === "android"
        ? SCREEN_HEIGHT - StatusBar.currentHeight
        : SCREEN_HEIGHT;

// String to Date
function showAlert(title, message = "") {
    Alert.alert(title, message)
}

function showAlertInfo(title, message = "", buttonTitle = "Ok", onPress = () => { }) {
    Alert.alert(title,
        message,
        [
            { text: buttonTitle, onPress: onPress },
        ],
        { cancelable: false },
    )
}

function converToRatio(fontSize) {
    // guideline height for standard 5" device screen
    const standardScreenHeight = 680;
    const heightPercent = (fontSize * deviceHeight) / standardScreenHeight;
    if (Platform.OS === 'ios') {
        return Math.round(heightPercent);
    } else {
        return Math.round(heightPercent) - 2
    }


    // const standardScreenHeight = 680;
    // const heightPercent = (value * SCREEN_HEIGHT) / standardScreenHeight;
    // return Math.round(heightPercent)

    // const scale = SCREEN_WIDTH / 320;
    // const newSize = value * scale
    // if (Platform.OS === 'ios') {
    //     return Math.round(PixelRatio.roundToNearestPixel(newSize))
    // } else {
    //     return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
    // }
}

export function isIphoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        ((dimen.height === 812 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
    );
}

// export function ifIphoneX(iphoneXStyle, regularStyle) {
//     if (isIphoneX()) {
//         return iphoneXStyle;
//     }
//     return regularStyle;
// }

export function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifIphoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight,
        default: 0
    });
}

export function getBottomSpace() {
    return isIphoneX() ? 34 : 0;
}

export function hp(percent) {
    const heightPercent = (percent * deviceHeight) / 100;
    return Math.round(heightPercent);
}

export function wp(percent) {
    const widthPercent = (percent * SCREEN_WIDTH) / 100;
    return Math.round(widthPercent);
}

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function validateEmail(email) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
        return false
    }
    else {
        return true;
    }
}

export default {
    showAlert,
    showAlertInfo,
    converToRatio,
    jsUcfirst,
    validateEmail,
    isIPhoneX,
    StatusBarHeight
}
