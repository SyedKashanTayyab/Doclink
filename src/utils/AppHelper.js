import React from 'react';
import { StyleSheet, ActivityIndicator, View, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Toast } from 'native-base';
import io from "socket.io-client";
import { BaseUrl, Fonts } from './Fonts';
import Spinner from 'react-native-loading-spinner-overlay';
import GlobalStyles from '../styles/GlobalStyles';
var moment = require('moment');
var RNFS = require('react-native-fs');
import PushNotification from "react-native-push-notification";

// Generate Random String
function getRandomString(max) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&=";

    for (var i = 0; i < max; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getHomeDirectoryPath() {
    if (Platform.OS === 'android') {
        return `${RNFS.DocumentDirectoryPath}/`
    } else {
        return `file:///${RNFS.DocumentDirectoryPath}/`
    }
}

function guid() {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function isNull(str) {
    return (str == "" || str == null || str == "null") ? true : false
}

function convertToGMT(timestamp) {
    let _t = moment(timestamp).utc(true).format('YYYY-MM-DDTHH:mm:ssZ')
    return _t
}

function timestampFormat(timestamp, utc, format) {
    return moment(timestamp).utc(utc).format(format)
}

// Set Item
async function setItem(key, value) {
    return new Promise((resolve, reject) => {
        AsyncStorage.setItem(key, value)
            .then(res => {
                if (res !== null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => reject(err));
    });
}

// Get Item
async function getItem(key) {
    const v = await AsyncStorage.getItem(key);
    return v;
}

// Set Data
async function setData(key, data) {
    return new Promise((resolve, reject) => {
        AsyncStorage.setItem(key, JSON.stringify(data))
            .then(res => {
                if (res !== null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => reject(err));
    });
}

// Get Data
async function getData(key) {
    const v = await AsyncStorage.getItem(key);
    return JSON.parse(v)
}

// Remove Item
async function removeItem(key) {
    AsyncStorage.removeItem(key)
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function isJSONString(string) {
    if (/^[\],:{}\s]*$/.test(string.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true
    } else {
        return false
    }
}

function toastMsg(msg) {
    return Toast.show({
        text: msg,
        style: { backgroundColor: "#01233f", zIndex: 1 },
        duration: 3000,
        textStyle: { color: "#ffffff" },
        buttonText: "Close",
        buttonTextStyle: { color: "#fff" },
        buttonStyle: { backgroundColor: "#000000" },
    });
}

function socket() {
    return (
        io.connect(BaseUrl.url, {
            timeout: 10000,
            jsonp: false,
            transports: ['websocket'],
            autoConnect: false,
            agent: '-',
            path: '/',
            pfx: '-',
            key: 'token',
            passphrase: 'cookie',
            cert: '-',
            ca: '-',
            ciphers: '-',
            rejectUnauthorized: '-',
            perMessageDeflate: '-'
        })
    )
}

function currency_formatter(symbol, amount, number_format) {
    var result = '';
    amount = parseFloat(amount).toFixed(number_format);
    result = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + symbol;
    return result;
}

// Check Point - weather user logged in or not
export const isSignedIn = () => {
    return new Promise((resolve, reject) => {

        AsyncStorage.getItem(KEYS.ACCESS_TOKEN)
            .then(res => {
                if (res !== null) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => reject(err));
    });
};

export const currency = { "code": "$" };

const spinnerStyles = StyleSheet.create({
    default: {
        color: '#000',
        fontWeight: 'normal',
        fontFamily: Fonts.HelveticaNeueBold
    }
});

export const CustomSpinner = (props) => {
    return <Spinner
        {...props}
        visible={props.visible ? true : false}
        color={props.activityColor ? props.activityColor : '#1994fb'}
        textContent={(props.text == null || props.text == "") ? 'Loading...' : props.text}
        overlayColor={'rgba(0,0,0,0)'}
        textStyle={props.textStyle ? props.textStyle : spinnerStyles.default}
    />
};

export const encodeStringAscii = (str) => {
    return str.replace("'", "%27")
}

// CHECK NETWORK CONNECTIVITY
export const CheckNetworkConnectivity = (props) => {
    return (
        props.internetConnectivity == false
            ? <Text style={GlobalStyles.noConnectivityTitle}>No internet connection</Text>
            : props.waitingForNetwork == true ?
                <View style={{ flexDirection: 'row', }}>
                    <ActivityIndicator
                        animating={props.waitingForNetwork}
                        color='#fff'
                        size="small"
                    />
                    <Text style={GlobalStyles.noConnectivityTitle}>Connecting...</Text>
                </View>
                :
                <Text style={GlobalStyles.headerTitle}>{props.headerTitle}</Text>
    )
}

function fileNameFromUrl(url) {
    var matches = url.match(/\/([^\/?#]+)[^\/]*$/);
    if (matches.length > 1) {
        return matches[1];
    }
    return null;
}

async function makeDocumentDirectories() {

    let dir_media = `${RNFS.DocumentDirectoryPath}/media/`
    let dir_media_audio = `${dir_media}audios/`
    let dir_media_images = `${dir_media}images/`

    // Media
    let is_exits = await RNFS.exists(dir_media)
    if (is_exits == false) {
        await RNFS.mkdir(dir_media)
    }

    // Images
    is_exits = await RNFS.exists(dir_media_images)
    if (is_exits == false) {
        await RNFS.mkdir(dir_media_images)
    }

    // Audios
    is_exits = await RNFS.exists(dir_media_audio)
    if (is_exits == false) {
        await RNFS.mkdir(dir_media_audio)
    }
}

function format_duration(duration) {
    let total_seconds = duration,
        time = "0",
        minutes = 0,
        seconds = 0,
        total_duration = "0:00";
    if (total_seconds > 60) {
        minutes = parseInt(total_seconds / 60);
    }
    seconds = parseInt(total_seconds - minutes * 60);
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return total_duration = `${minutes}:${seconds}`;
}

function getTotalSecondsFromDuration(duration) {
    let arrTime = duration.split(":");
    return parseInt(arrTime[0] * 60) + parseInt(arrTime[1]);
}

function clearAllNotifications() {
    // Remove all notifications
    PushNotification.cancelAllLocalNotifications()
}


export const logErrorWithMessage = (message, errorSource) => {
    if (__DEV__) {
        console.log(message, errorSource);
    }
};

// Export Function
export default {
    getRandomString,
    setItem,
    getItem,
    removeItem,
    toastMsg,
    setData,
    getData,
    currency,
    socket,
    encodeStringAscii,
    CheckNetworkConnectivity,
    guid,
    convertToGMT,
    timestampFormat,
    isEmpty,
    isJSONString,
    currency_formatter,
    fileNameFromUrl,
    makeDocumentDirectories,
    format_duration,
    getTotalSecondsFromDuration,
    getHomeDirectoryPath,
    clearAllNotifications,
    isNull
}