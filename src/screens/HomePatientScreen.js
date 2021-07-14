import React, { Component, Fragment } from 'react';
import {
    View, Text, ImageBackground, StyleSheet, FlatList, TouchableHighlight, TouchableWithoutFeedback,
    ScrollView, RefreshControl, Modal, Image, Alert, AppState, Platform, Linking, ActivityIndicator
} from 'react-native';
import { Icon, Container, Tabs, Tab, TabHeading, Button } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner, CheckNetworkConnectivity } from '../utils/AppHelper';
import Notification from '../components/Notifications';
import AppSocketManager from '../components/AppSocket';
import EventEmitManager from '../components/EventEmitManager';
import { CHAT_COMMAND, API_URL, URL_IMAGE_UPLOAD, URL_AUDIO_UPLOAD } from '../utils/Constant'
import ChatRoomModel from '../schemas/models/ChatRoomModel'
import ChatRoomSessionModel from '../schemas/models/ChatRoomSessionModel'

import firebase from '@react-native-firebase/app';
import Sounds from '../components/Sound'

var appSocket = null
var eventEmitManager = null
var moment = require('moment');

import BadgeBubble from '../components/BadgeBubble'
import MessageModel from '../schemas/models/MessageModel'
import RatingScreen from '../screens/RatingScreen';

import GlobalStyles from '../styles/GlobalStyles';
import HomePatientPlaceholder from '../components/HomePatientPlaceholder';
import { SafeAreaView } from 'react-navigation'
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import colors from '../utils/Colors';
import AppInfo from '../modules/AppInfoNativeModule';
import API from '../services/API';
import { TouchableOpacity } from 'react-native-gesture-handler';
import PatientStoriesView from './Stories/PatientStoriesView';
import NetInfo from '@react-native-community/netinfo';
import WhatNewModal from '../modals/WhatNewModal';

var RNFS = require('react-native-fs');

class HomePatientScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            data: [],
            error: null,
            refresh: true,
            isModalVisible: false,
            modalitem: [],
            is_typing: false,
            appState: AppState.currentState,
            waiting_for_network: true,
            showRatingPopup: false,
            ratingData: null,
            arrCompletedChats: [],
            initialPage: 0,
            count_chats: 0,
            sectionIndex: 0,
            myDoctors: [],
            isInternetConnected: true,
            whatsNewModal: false
        };

        this.arrayholder = [];

        this.props.navigation.addListener('willFocus', async () => {

            console.log("=======================")
            console.log("Home Patient screen WIll Focus", appSocket != null, appSocket.is_connected())
            console.log("=======================")

            global.current_screen = 'Home'

            this.getChatRooms()

            this._fetchPendingUserRating()

            if (appSocket != null && appSocket.is_connected() == true) {
                console.log("83 If")
                this.setState({
                    waiting_for_network: false
                })
            } else if (appSocket != null && appSocket.is_connected() == false) {
                console.log("88 Else")
                // appSocket.connect()
            }

            let _messages = MessageModel.fetch_pending_messages()
            this.fetchPendingMessages(_messages, 0)
        })

        // Get singleton object of eventEmitManager
        eventEmitManager = EventEmitManager.getInstance()

        // Set global time
        global.appOpenTime = moment().utc(true)
        console.log("global.appOpenTime", global.appOpenTime)

        Sounds.newRequest()
    }

    /* On Refresh */
    _onRefresh = async () => {

        // Get chatrooms
        this.getChatRooms();
        this.syncMessages();

    }

    async componentDidMount() {

        global.target = await AppInfo.TARGET;

        //Set global user data for navigation
        global.user_data = await appHelper.getData("user_data");

        //console.log("Home Patient Screen - Component Dic Mount")

        let last_sync_timestamp = await appHelper.getItem("last_sync_timestamp");
        if (last_sync_timestamp != null) {
            global.last_sync_timestamp = appHelper.convertToGMT(last_sync_timestamp)
            // console.log("Last sync timestamp", moment(global.last_sync_timestamp).utc(true), moment().utc(true))
        } else {
            global.last_sync_timestamp = appHelper.convertToGMT("1970-01-01T00:00:00")
        }

        // this.setState({ spinner: true });
        global.screen = 'Home';

        AppState.addEventListener('change', this._handleAppStateChange);

        // Get chatrooms
        this.getChatRooms()

        // Start Socket
        this._socketHandler()

        // Update FCM Token
        this.updateFCMToken()

        // Check App Version
        this.checkVersion();

        // Get My Current Doctors
        this.getDoctors();

        // Set listener to get the latest token
        this.fcmToken()

        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            // console.log("Connection type", state.type);
            // console.log("Is connected?", state.isConnected);
            this.watchMan(state.isConnected)
        });

        // setTimeout(() => {
        //     const fontStyleList = require('../utils/fontStyles.json');

        //     // RNFS.readDirAssets
        //     // RNFS.copyFileAssets('assets/fontStyles.json', RNFS.DocumentDirectoryPath + 'settings.txt') 
        //     // .then((result) => console.log(result)) 
        //     // .catch((error) => console.log(error));

        //     // var path = appHelper.getHomeDirectoryPath() + "settings.json"
        //     // console.log("asdfasdf", RNFS.MainBundlePath)

        //     // RNFS.readDirAssets('images')
        //     // RNFS.readFile('./fontStyles.json', 'utf8')
        //     RNFS.readFileAssets('fontStyles.json')
        //         .then((result) => {
        //             console.log('GOT RESULT', result);

        //             // stat the first file
        //             // return Promise.all([RNFS.stat(result[0].path), result[0].path]);
        //         })
        //         .catch((err) => {
        //             console.log(err.message);
        //         });
        //     // RNFS.copyFileAssets('./fontStyles.json', path)
        //     //     .then((success) => {
        //     //         console.log('FILE copied!');
        //     //     })
        //     //     .catch((err) => {
        //     //         console.log(err.message);
        //     //     });
        //     // console.log("fontStyleLis", fontStyleList)
        //     // fontStyleList['large'] = 1000;
        //     // console.log("fontStyleLis new", fontStyleList)
        // }, 2000);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        if (appSocket != null) {
            appSocket.remove_callback(this._socketReponseHandler)
        }
    }

    // whatsNew
    whatsNew = async () => {

        try {
            // Generate path of home director settings.json file
            var filePathSettings = appHelper.getHomeDirectoryPath() + 'settings.json';

            // await RNFS.unlink(filePathSettings)

            // // load local settings.json file
            const settingsJson = require('../res/settings.json');

            // // Check is file exists
            let show_popup = false
            let isExists = await RNFS.exists(filePathSettings)
            if (isExists == false) {
                show_popup = true
                await RNFS.writeFile(filePathSettings, JSON.stringify(settingsJson.doctor))
            }
            // Read File
            let content = await RNFS.readFile(filePathSettings)
            let arrData = JSON.parse(content)
            if (settingsJson.doctor.release_date > arrData.release_date) {
                arrData.show_popup = true
                arrData.release_date = settingsJson.doctor.release_date
            } else {
                arrData.show_popup = show_popup
            }
            if (arrData.show_popup == true) {
                this.setState({
                    modalVisible: true
                })
                console.log("new new new new new")
            } else {
                console.log("old old old old old")
            }
            await RNFS.writeFile(filePathSettings, JSON.stringify(arrData))
        } catch (error) {
            console.log("HDS whatsNew Catch", error)
        }
    }

    // WatchMan
    watchMan = async (isConnected) => {
        try {
            console.log("HPS watchMan isConnected", isConnected)
            // console.log("appSocket", appSocket)
            this.setState({
                isInternetConnected: isConnected
            })
            eventEmitManager.invoke_callbacks('internet_connectivity', isConnected)
            if (isConnected == true) {
                console.log("Innert 172")
                if (appSocket != null) {
                    appSocket.disconnect()
                    this.setState({
                        isInternetConnected: isConnected
                    }, () => {
                        appSocket.connect()
                    })
                } else {
                    console.log("else 183")
                    this.setState({
                        isInternetConnected: isConnected
                    }, () => {
                        console.log("callback ------")
                        // console.log("connecting 187")
                        // appSocket.connect()
                    })
                }
            }
        } catch (error) {
            console.log("HPS watchMan Catch", error)
        }
    }

    // FCM token refresh()
    fcmToken = async () => {
        console.log("fcmToken called")
        try {
            firebase.messaging().onTokenRefresh((token) => {
                console.log("=======================================")
                console.log("    New FCM TOken", token)
                console.log("=======================================")
                this.updateFCMToken(token)
            })
        } catch (error) {
            console.log("HomePatientScreen fcmToken", error)
        }
    }

    //Get My Doctors
    getDoctors = async () => {
        try {
            let params = {};
            const res = await API.get(API_URL.MY_DOCTOR, params);

            if (res.status == "Success") {
                await this.setState({ myDoctors: res.data, refresh: false })
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }

    //Check App Version
    checkVersion = async () => {
        try {
            let params = {
                app_version: DeviceInfo.getVersion(),
                build_number: DeviceInfo.getBuildNumber(),
                platform: Platform.OS,
                flavor: AppInfo.TARGET
            };
            const res = await API.get(API_URL.API_VERSION, params);

            if (res.status == "Success") {
                if (parseInt(res.data.new_version) == 1) {
                    Alert.alert(
                        "",
                        res.data.popup_message,
                        [
                            {
                                text: "Cancel",
                                onPress: () => console.log('cancel pressed'),
                                style: "cancel"
                            },
                            { text: "Update", onPress: () => Linking.openURL(res.data.store_url) }
                        ],
                        { cancelable: false }
                    )
                }
            }
        } catch (error) {

        }
    }

    async updateFCMToken(new_token = "") {
        try {
            let userId = await appHelper.getItem("user_id");
            let access_token = await appHelper.getItem("access_token");
            let fcmToken = (new_token == "") ? await firebase.messaging().getToken() : new_token
            let tokenParams = {
                user_id: userId.toString(),
                access_token: access_token,
                fcmToken: fcmToken,
                "device_name": await DeviceInfo.getDeviceName(),
                "device_model": DeviceInfo.getModel(),
                "device_brand": DeviceInfo.getBrand(),
                "platform": Platform.OS === "android" ? "android" : "ios",
                "app_version": DeviceInfo.getVersion(),
                "device_os": DeviceInfo.getSystemVersion(),
                "timzone_offset": moment().format("Z")
            }
            const result = await API.post(API_URL.PATIENT_ADD_FCM_TOKEN, tokenParams);
            // console.log('response.data', result)
            if (result.status == "Success") {
                appHelper.setItem('fcmToken', fcmToken);
            }
        }
        catch (error) {
            console.log(error)
        }
    }


    /**
     * Socket
     */
    _socketHandler = async () => {
        let access_token = await appHelper.getItem("access_token");
        let userId = await appHelper.getItem("user_id");
        appSocket = AppSocketManager.getInstance()
        appSocket.setAccessToken(access_token)
        appSocket.setUserId(userId)
        appSocket.register_callback(this._socketReponseHandler)

        console.log("HPS this.state.isInternetConnected", this.state.isInternetConnected)
        if (this.state.isInternetConnected == true) {
            console.log("HPS  Connecting....", this.state.isInternetConnected)
            appSocket.connect()
        }
    }

    /**
     * Socket Reponse Handler
     */
    _socketReponseHandler = async (event, data) => {

        console.log("HomePatientScreen _socketReponseHandler", event)
        const userId = await appHelper.getItem("user_id");
        if (event == CHAT_COMMAND.AUTHENTICATION) {
            console.log("Socket Connceted")

            this.setState({
                waiting_for_network: false
            })

            // Go online
            appSocket.goOnline()

        } else if (event == CHAT_COMMAND.DISCONNECTED) {
            //console.log("SRH Disconnected")
            // if (this.state.appState == 'active' && this.state.waiting_for_network == false) {
            //     appSocket.connect_socket()
            //     // appSocket.connect(this._socketReponseHandler)
            // }
            this.setState({
                waiting_for_network: true
            })

            // appSocket.remove_callback(this._socketReponseHandler)

        } else if (event == CHAT_COMMAND.ONLINE) {

            console.log("SRH online", data)

            // Synchronize data
            // appSocket.messages("0", this._socketReponseHandler)
            this.syncMessages()

            this.setState({
                waiting_for_network: false
            })

            // send pending messages to server
            let _messages = MessageModel.fetch_pending_messages()
            this.fetchPendingMessages(_messages, 0)

        } else if (event == CHAT_COMMAND.CHAT_REQUESTS) {

            // realm.write(() => {
            //     realm.create('')
            // })
            //console.log("SRH Chat Requests", data)

        } else if (event == CHAT_COMMAND.CHAT_ROOMS) {

            // console.log("SRH PATIENT - CHAT ROOMS", data)

            if (data instanceof Array) {
                data.map((v) => {
                    let object = ChatRoomModel.createOrUpdate(v)
                });
            } else {
                let object = ChatRoomModel.createOrUpdate(data)
            }

            // Refresh ChatRooms
            setTimeout(() => {
                this.getChatRooms()
            }, 1000);

        } else if (event == CHAT_COMMAND.CHAT_ROOM_SESSION) {
            // console.log("SRH PATIENT - CHAT ROOMS SESSION \n", data)


            eventEmitManager.invoke_callbacks('update_messages', null)
            eventEmitManager.invoke_callbacks(CHAT_COMMAND.CHAT_ROOM_SESSION, data)

        } else if (event == CHAT_COMMAND.MESSAGES) {

            //console.log("SRH PATIENT - Messages: ", data.length)

            // Dump new messages
            // console.log(data)
            if (data.length > 0) {
                let is_new_message = MessageModel.create_from_array(data)
                if (is_new_message == true) {
                    Sounds.newRequest()
                }
            }

            // send delivered status to server
            this.sendDeliveredStatusToServer()

            eventEmitManager.invoke_callbacks('update_messages', null)

            console.log("called 1")
            this.getChatRooms()

        } else if (event == CHAT_COMMAND.MESSAGE_SEND) {

            // console.log("CHAT_COMMAND.MESSAGE_SEND", data)
            if (data.length > 0) {
                MessageModel.create_from_array(data)
            }
            eventEmitManager.invoke_callbacks('update_messages', null)

            this.getChatRooms()

        } else if (event == CHAT_COMMAND.MESSAGE_RECEIVED) {

            if (data.length > 0) {
                MessageModel.create_from_array(data)
                Sounds.newRequest()
            }
            eventEmitManager.invoke_callbacks('update_messages', null)

            // send delivered status to server
            this.sendDeliveredStatusToServer()

            this.getChatRooms()

        } else if (event == CHAT_COMMAND.MESSAGE_DELIVERED) {

            if (data.length > 0) {
                MessageModel.create_from_array(data)
                console.log("Message delivered update")
            }
            // eventEmitManager.invoke_callbacks('update_messages', null)

            this.getChatRooms()
        } else if (event == CHAT_COMMAND.SESSION_END) {

            let _chatroom_session = ChatRoomSessionModel.update(data)

            ChatRoomModel.set_active_inactive_chatroom(parseInt(data.id), false)

            eventEmitManager.invoke_callbacks('session_end', _chatroom_session)

            // Sync Messages
            this.syncMessages()
        } else if (event == CHAT_COMMAND.RATING_PENDING) {
            //console.log("rating/pending", JSON.stringify(data))
            this._fetchPendingUserRating()
        } else if (event == "sync_messages") {
            // let _messages = MessageModel.fetch_pending_messages()
            // this.fetchPendingMessages(_messages, 0)
        }
    }

    _handleAppStateChange = async (nextAppState) => {
        console.log("HomePatientScreen _handleAppStateChange", nextAppState)
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            appHelper.clearAllNotifications()

            console.log("AppSocket connection status", appSocket.is_connected())
            if (appSocket != null && appSocket.is_connected() == true) {
                console.log("411 If")
                this.setState({
                    waiting_for_network: false
                })
            } else if (appSocket != null && appSocket.is_connected() == false) {
                console.log("416 Else")
                appSocket.disconnect()
                appSocket.connect()
            } else {

            }
        } else {
            // If app goes in background then become foreground syncMessages should be fired
            global.updateShouldFetch = true
            //await global.socket.emit('set_screen', { user_id: await appHelper.getItem('user_id'), screen: '' })
        }
        this.setState({ appState: nextAppState });
    };


    /**
     * Fetch Pending User rating
     */
    _fetchPendingUserRating = async () => {

        if (global.screen != 'Home') {
        }

        const user_id = await appHelper.getItem("user_id");
        const access_token = await appHelper.getItem("access_token");
        try {
            var params = {
                access_token: access_token,
                patient_id: user_id,
            }
            const res = await API.get(API_URL.PATIENT_PENDING_USER_RATING, params);
            if (res) {
                const data = res;
                if (data.status == 'Success' && data.data != null) {

                    // console.log(data.data)

                    setTimeout(() => {
                        this.setState({
                            ratingData: data.data,
                            showRatingPopup: true
                        })
                    }, 1000);
                }

                else if (data.status == 'Error') {
                    // Alert.alert(' ', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error)
        }
    }

    /**
     * Fetch Pending messages from database and sync with server.
     * @param {[MessageModel]} data Pending Messages
     * @param {int} index array index
     */
    fetchPendingMessages = async (data, index) => {
        try {
            if (data.length > index) {
                let messageObject = data[index]

                let bodyText = ""
                if (messageObject.message_type == 'text') {
                    bodyText = messageObject.body
                } else if (messageObject.message_type == 'image') {
                    const response = await API.postMultipart(URL_IMAGE_UPLOAD, messageObject.local_url, [], null, 'image')
                    if (response.error == 0) {
                        let final_url = `${response.data.base_url}/${response.data.image_name}`
                        bodyText = final_url
                    }
                } else if (messageObject.message_type == 'voice') {
                    bodyText = messageObject.body
                    let urlData = JSON.parse(bodyText)
                    const response = await API.postMultipart(URL_AUDIO_UPLOAD, messageObject.local_url, [], null, 'audio')
                    if (response.error == 0) {
                        let final_url = `${response.data.base_url}/${response.data.audio_name}`
                        urlData['url'] = final_url
                        bodyText = JSON.stringify(urlData)
                    }
                }

                console.log("-----------")
                console.log(messageObject._id, bodyText)
                console.log("-----------")

                if (bodyText != "") {
                    var paramsMessage = {
                        body: bodyText,
                        sender_id: messageObject.chatroom.doctor.user_id,
                        receiver_id: messageObject.chatroom.patient.user_id,
                        message_type: messageObject.message_type,
                        chatroom_id: messageObject.chatroom_session.chatroom.id,
                        chatroom_session_id: messageObject.chatroom_session.chatroom_session_id,
                        _id: messageObject._id,
                        app_user: 'doctor',
                    }
                    // console.log("paramsMessages", paramsMessage)
                    if (appSocket != null && appSocket.is_connected() == true) {
                        appSocket.message_send(paramsMessage)
                        this.fetchPendingMessages(data, (index + 1))
                    }
                }
            }
        } catch (error) {
            this.fetchPendingMessages(data, (index + 1))
            console.log("HDS fetchPendingMessages", error)
        }
    }

    /**
    * Sync Messages from server
    * @param timestamp last timestamp of message
    */
    async syncMessages() {
        let userId = await appHelper.getItem("user_id");
        let max_timestamp = MessageModel.get_last_sent_timestamp(null)
        // console.log(max_timestamp)
        let params = {
            timestamp: moment(max_timestamp).utc(false).format('YYYY-MM-DD HH:mm:ss'),
            user_id: userId,
            app_user: 'patient',
        }
        console.log("HomePatientScreen syncMessages: ", params)
        appSocket.messages(params)
    }

    async getChatRooms() {
        let arrActiveChatrooms = ChatRoomModel.fetchActiveChats()
        let arrCompletedChatrooms = ChatRoomModel.fetchCompletedChats()

        this.setState({
            spinner: false,
            data: arrActiveChatrooms,
            arrCompletedChats: arrCompletedChatrooms,
            count_chats: ChatRoomModel.fetchActiveChatsUnReadCount().length + ChatRoomModel.fetchCompletedChatsUnReadCount().length,
        })
    }

    async getChatRoomSession(data) {
        const userId = await appHelper.getItem("user_id");
        console.log("requestAccepted", data)
        let params = {
            timestamp: 0,
            user_id: userId,
            app_user: 'patient',
            chatroom_id: data.chatroom_id
        }
        appSocket.chat_room_session(params)
    }

    async sendDeliveredStatusToServer() {
        let userId = await appHelper.getItem("user_id");
        let chatroom_ids = []
        this.state.data.map((object) => {
            chatroom_ids.push(object.id)
        })

        let params_x = {
            app_user: 'patient',
            status: 'delivered',
            type: 'chatrooms',
            user_id: userId,
            ids: chatroom_ids
        }
        console.log("params", params_x)
        appSocket.message_delivered(params_x)
    }

    async goBack() {
        global.screen = 'Home'
        let data = { user_id: await appHelper.getItem('user_id'), screen: global.screen }
        await global.socket.emit('set_screen', data)
    }

    /**
     * Format to show today, yesterday, day name and date
     * @param {timestamp} timestamp 
     */
    formatTimestamp(timestamp) {

        let date = moment(timestamp).utc(true)
        var reference = moment().utc(true); // fixed just for testing, use moment();
        var today = reference.clone().startOf('day');
        var yesterday = reference.clone().subtract(1, 'days').startOf('day');
        var a_week_old = reference.clone().subtract(7, 'days').startOf('day');

        if (date.isSame(today, 'd')) {
            return date.format('hh:mm A')
        } else if (date.isSame(yesterday, 'd')) {
            return "Yesterday"
        } else if (date.isAfter(a_week_old)) {
            return date.format('dddd')
        } else {
            return date.format('DD/MM/YY')
        }
    }

    handleConnectWithDoctor = () => {
        this.props.navigation.navigate("SearchDoctor");
    }

    handleSettingPress = () => {
        // NAVIAGTE TO SETTINGS PAGE
        this.props.navigation.navigate('SettingStack');
    }

    handleCloseModal = (params, showFeedbackScreen = true) => {
        // console.log("handleCloseModal fired", { ratingParams: params,});
        this.setState({
            showRatingPopup: false,
            ratingData: null,
        })

        if (showFeedbackScreen == true && params != null) {
            this.props.navigation.navigate("Feedback", { ratingParams: params, });
        }

    }

    renderSeparator = () => {
        return <View style={styles.separator} />;
    }

    render() {
        const { waiting_for_network, showRatingPopup, count_chats, sectionIndex, myDoctors, isInternetConnected, whatsNewModal } = this.state;

        let patientPlaceholder = null;
        let completedCard = null;
        var chatcard = null;
        let myDoctorsCard = null;

        let total_records = parseInt(this.state.data.length) + parseInt(this.state.arrCompletedChats.length);
        // console.log("total_records", total_records);

        if (this.state.data.length > 0) {
            chatcard = <FlatList
                data={this.state.data}
                ItemSeparatorComponent={this.renderSeparator}
                keyExtractor={(item, index) => index.toString()}
                refreshing={this.state.refresh}
                renderItem={({ item }) => (
                    <View style={{ height: hp(9.5), }}>
                        <TouchableHighlight style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', padding: 0, }} onPress={() => this.props.navigation.navigate('Chat', { chatroom: item, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })} underlayColor='transparent' >
                            <View style={{ flexDirection: 'row' }}>

                                <TouchableWithoutFeedback onPress={() => {
                                    this.props.navigation.navigate('ProfileView', { profile: { user_id: item.doctor.user_id } })
                                }}>
                                    <View style={{ marginRight: hp(1.4) }}>
                                        <View style={[GlobalStyles.imageContainer, { width: wp(14), height: wp(14), borderWidth: 1, }]}>
                                            <Image style={styles.profileImage} source={{ uri: item.doctor.image_url }} />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>

                                    <View style={{ justifyContent: "center", paddingRight: hp(0), width: "100%" }}>

                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <View style={{ width: wp(55), paddingRight: wp(1.5) }}>
                                                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.patientName}>
                                                    Dr. {item.doctor.name}
                                                </Text>
                                            </View>
                                            <View style={[{ width: wp(17), justifyContent: "center", alignItems: "flex-end" }]}>
                                                <Text style={styles.datetime} ellipsizeMode="tail" numberOfLines={1}>
                                                    {
                                                        item.message != null
                                                            ? this.formatTimestamp(item.message.created_at)
                                                            : this.formatTimestamp(item.updated_at)
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                            <View style={{ width: wp(60), justifyContent: 'center' }}>
                                                {
                                                    (item.message != null)
                                                        ? (item.message.message_type == 'image')
                                                            ? <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{"Image"}</Text>
                                                            : (item.message.message_type == 'voice')
                                                                ? <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{"Voice " + JSON.parse(item.message.body).duration}</Text>
                                                                : (item.message.sub_message_type == 'chief_complaint')
                                                                    ? <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{"Chief complaint"}</Text>
                                                                    : <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{item.message.body}</Text>
                                                        : <Text style={{ color: colors.grayTwo }}>No Session Conducted</Text>
                                                }
                                            </View>
                                            <View style={{ justifyContent: 'center', borderWidth: 0, borderColor: 'black', right: 0 }}>
                                                {
                                                    (item.unread_count > 0)
                                                        ? <BadgeBubble count={item.unread_count} />
                                                        : null
                                                }
                                            </View>
                                        </View>

                                    </View>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </View>
                )}
            />
        } else {
            chatcard = <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.pendingColor }}>You have no active sessions</Text>
            patientPlaceholder = <HomePatientPlaceholder onConnectWithDoctorPress={this.handleConnectWithDoctor} />
        }

        // Completed
        if (this.state.arrCompletedChats.length > 0) {
            completedCard = <FlatList
                data={this.state.arrCompletedChats}
                ItemSeparatorComponent={this.renderSeparator}
                keyExtractor={(item, index) => index.toString()}
                refreshing={this.state.refresh}
                renderItem={({ item }) => (
                    <View style={{ height: hp(9.5), }}>
                        <TouchableHighlight style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', padding: 0, }} onPress={() => this.props.navigation.navigate('Chat', { chatroom: item, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })} onPress={() => this.props.navigation.navigate('Chat', { chatroom: item, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })} underlayColor='transparent' >
                            <View style={{ flexDirection: 'row', }}>

                                <TouchableWithoutFeedback onPress={() => {
                                    this.props.navigation.navigate('ProfileView', { profile: { user_id: item.doctor.user_id } })
                                }}>
                                    <View style={{ marginRight: hp(1.4), }}>
                                        <View style={[GlobalStyles.imageContainer, { width: wp(14), height: wp(14), borderWidth: 1, }]}>
                                            <Image style={styles.profileImage} source={{ uri: item.doctor.image_url }} />
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>

                                    <View style={{ justifyContent: "center", paddingRight: hp(0), width: "100%" }}>

                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                            <View style={{ width: wp(55), paddingRight: wp(1.5), }}>
                                                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.patientName}>
                                                    Dr. {item.doctor.name}
                                                </Text>
                                            </View>
                                            <View style={[{ width: wp(17), justifyContent: "center", alignItems: "flex-end", }]}>
                                                <Text style={styles.datetime} ellipsizeMode="tail" numberOfLines={1}>
                                                    {
                                                        item.message != null
                                                            ? this.formatTimestamp(item.message.created_at)
                                                            : this.formatTimestamp(item.updated_at)
                                                    }
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                            <View style={{ width: wp(60), justifyContent: 'center' }}>
                                                {
                                                    (item.message != null)
                                                        ? (item.message.message_type == 'image')
                                                            ?
                                                            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{"Image"}</Text>
                                                            : (item.message.message_type == 'voice')
                                                                ? <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{"Voice " + JSON.parse(item.message.body).duration}</Text>
                                                                : (item.message.sub_message_type == 'chief_complaint')
                                                                    ? <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{"Chief complaint"}</Text>
                                                                    : <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{item.message.body.substring(0, 30).replace(/\n|\r/g, " ")}</Text>
                                                        : <Text style={{ color: colors.grayTwo }}>No Session Conducted</Text>
                                                }
                                            </View>
                                            <View style={[{ justifyContent: 'center', borderWidth: 0, borderColor: 'black', right: 0 }]}>
                                                {
                                                    (item.unread_count > 0)
                                                        ? <BadgeBubble count={item.unread_count} />
                                                        : null
                                                }
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableHighlight>
                    </ View>
                )}
            />
        }

        if (this.state.isModalVisible) {
            var modal = (
                <Modal isVisible={this.state.isModalVisible} animationIn="slideInLeft" onBackdropPress={() => this.setState({ isModalVisible: false })}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{ width: wp('60%'), height: hp('40%') }}>
                            <View style={{ flex: 4, backgroundColor: '#000' }}>
                                <ImageBackground source={{ uri: this.state.modalitem.avatar }}
                                    resizeMode="stretch" style={{ flex: 1 }}>
                                    <View style={{ backgroundColor: '#00000060', height: hp('4%'), justifyContent: 'center' }}>
                                        <Text style={{ color: '#fff', marginLeft: 20 }}>{this.state.modalitem.name}</Text>
                                    </View>
                                </ImageBackground>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', }}>
                                <Icon type="MaterialIcons" name='sms' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewChat()} />
                                <Icon type="MaterialIcons" name='person' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewProfile()} />
                                <Icon type="MaterialIcons" name='payment' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewPlan()} />
                            </View>
                        </View>
                    </View>
                </Modal>
            );
        }

        // My Doctors
        if (myDoctors.length > 0) {
            myDoctorsCard =
                <FlatList
                    data={myDoctors}
                    ItemSeparatorComponent={this.renderSeparator}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ marginHorizontal: hp(1.4) }}
                    ListEmptyComponent={() => (

                        <View style={{ marginTop: 10 }}>
                            <Text style={{ textAlign: 'center', color: '#999999' }}>No doctor connections</Text>
                        </View>
                    )
                    }
                    onRefresh={() => {
                        this.getDoctors()
                    }}
                    refreshing={this.state.refresh}
                    renderItem={({ item }) => (
                        <View style={{ height: hp(9.5), }}>
                            <TouchableHighlight
                                onPress={() => {
                                    this.props.navigation.navigate('ProfileView', { profile: { user_id: item.id }, route: 'home_patient' });
                                }}
                                style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', padding: 0, }} underlayColor='transparent'
                            >
                                <View style={{ flexDirection: 'row' }}>

                                    <View style={{ marginRight: hp(1.4) }}>
                                        <View style={[GlobalStyles.imageContainer, { width: wp(14), height: wp(14), borderWidth: 1, }]}>
                                            <Image style={styles.profileImage} source={{ uri: item.avatar }} />
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>

                                        <View style={{ justifyContent: "center", paddingRight: hp(0), width: "100%" }}>

                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                <View style={{ width: wp(55), paddingRight: wp(1.5) }}>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={styles.patientName}>
                                                        {item.title + ' ' + item.doctor_name}
                                                    </Text>
                                                </View>
                                                <View style={[{ width: wp(17), justifyContent: "center", alignItems: "flex-end" }]}>

                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.itemMessageBody}>{item.specialization}</Text>
                                            </View>

                                        </View>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    )}
                />
        }

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}

                    <NavigationBar
                        // title={"DocLink"}
                        context={this.props}
                        removeBackButton={true}
                        backButton={true}
                        transparent={Platform.OS === 'ios' ? true : false}
                        noShadow={true}
                        titleView={
                            // CHECK NETWORK CONNECTIVITY
                            <CheckNetworkConnectivity
                                headerTitle={"DocLink"}
                                waitingForNetwork={waiting_for_network}
                                internetConnectivity={isInternetConnected}
                            />
                        }
                        right={
                            <>
                                <TouchableOpacity onPress={() => {
                                    this.props.navigation.navigate('SearchDoctor', { 'route': 'Home' })
                                }} style={{ paddingHorizontal: wp(2), height: hp(2.5) }}>
                                    <Image source={require("../assets/icons/connect_with_doctor_white.png")} style={{ height: hp(3), width: hp(3), resizeMode: 'contain' }} />
                                    {/* <Icon type="FontAwesome" name='search' style={{ color: 'white', fontSize: hp(2.5) }} /> */}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.handleSettingPress} style={{ paddingHorizontal: wp(2) }}>
                                    <Icon type="Entypo" style={{ color: 'white', fontSize: hp(2.5), height: hp(2.5) }} name="dots-three-vertical" />
                                </TouchableOpacity>
                            </>
                        }
                    />

                    {/* NAVIGATION HEADER END*/}

                    {/* MAIN CONTENT SECTION */}
                    <View style={{ flex: 1, }}>

                        {/* Spinner */}
                        <CustomSpinner visible={this.state.spinner} />

                        <Tabs
                            initialPage={this.state.initialPage}
                            onChangeTab={({ i }) => {
                                this.setState({ sectionIndex: i })
                                if (i == 1) {
                                    if (myDoctors.length == 0) {
                                        this.getDoctors()
                                    }
                                }
                            }}
                            tabBarUnderlineStyle={{ backgroundColor: "#ffffff", paddingHorizontal: 30, height: 2 }}
                            tabContainerStyle={{ elevation: 0 }}
                        >
                            {/* Chats */}
                            <Tab
                                textStyle={[{ color: colors.white, textTransform: "uppercase", }]}
                                heading={
                                    <TabHeading style={styles.tabHeading}>
                                        <Text style={[(sectionIndex == 0) ? styles.tabSelectText : styles.tabDefaultText]}>Chats</Text>
                                        {
                                            (count_chats > 0) ?
                                                <View><BadgeBubble count={parseInt(count_chats)} style={(sectionIndex == 0) ? null : { opacity: 0.8 }} textColor={colors.primaryText} badgeBgColor={colors.white} /></View>
                                                : null
                                        }
                                    </TabHeading>
                                }>
                                <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                    {
                                        (total_records > 0) ?
                                            <>
                                                <ScrollView style={{ marginTop: hp(0), marginHorizontal: hp(1.4) }}
                                                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}>

                                                    {/* ACTIVE DOCTORS LIST */}
                                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp(0), marginTop: hp(0.5), }}>
                                                        <View style={{ width: hp(1), height: hp(1), borderRadius: hp(1 / 2), backgroundColor: colors.completedColor }}></View>
                                                        <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize("medium"), paddingLeft: wp(1), color: colors.gray }}>Active</Text>
                                                    </View>
                                                    {chatcard}

                                                    {
                                                        (this.state.arrCompletedChats.length > 0)
                                                            ? <Fragment>
                                                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp(0), marginTop: hp(1.5) }}>
                                                                    <View style={{ width: hp(1), height: hp(1), borderRadius: hp(1 / 2), backgroundColor: colors.completedColor }}></View>
                                                                    <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize("medium"), paddingLeft: wp(1), color: colors.gray }}>Completed</Text>
                                                                </View>
                                                                {completedCard}
                                                            </Fragment>
                                                            : null
                                                    }

                                                </ScrollView>
                                                {modal}
                                            </>
                                            : (parseInt(global.user_data.total_connected_users) > 0)
                                                ? <View style={{ width: "100%", height: "100%", justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                                    <ActivityIndicator
                                                        animating={true}
                                                        color='#1994fb'
                                                        size="large"
                                                    />
                                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize("medium"), color: colors.black }}>Loading messages...</Text>
                                                </View>
                                                : < ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                                    {patientPlaceholder}
                                                </ImageBackground>
                                    }
                                </ImageBackground>
                            </Tab>

                            {/* My Doctors */}
                            <Tab
                                textStyle={[{ color: colors.white, textTransform: "uppercase", }]}
                                heading={
                                    <TabHeading style={styles.tabHeading}>
                                        <Text style={[(sectionIndex == 1) ? styles.tabSelectText : styles.tabDefaultText]} >My Doctors</Text>
                                    </TabHeading>
                                }
                            >
                                <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                    {
                                        (myDoctorsCard != null)
                                            ? myDoctorsCard
                                            : <View style={{ flex: 1, paddingLeft: wp(2), paddingTop: wp(2), }}>
                                                <Text style={{ color: colors.grayTwo }}>No doctors found</Text>
                                            </View>
                                    }
                                </ImageBackground>
                            </Tab>

                            {/* Stories */}
                            <Tab
                                textStyle={{ color: colors.white, textTransform: "uppercase", }}
                                heading={
                                    <TabHeading style={{ backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                        <Text style={(sectionIndex == 2) ? styles.tabSelectText : styles.tabDefaultText} >Stories</Text>
                                    </TabHeading>
                                }
                            >
                                <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                    <PatientStoriesView {...this.props} />
                                </ImageBackground>
                            </Tab>

                        </Tabs>
                        <Notification onChange={(data) => {
                            if (data.type == "rejected_request_chat") {
                                this._onRefresh()
                                this.syncMessages()
                                ChatRoomModel.set_active_inactive_chatroom(parseInt(data.chatroom_id), false)
                            }
                            if (data.type == "follow_up_session") {
                                this.getChatRoomSession(data)
                                ChatRoomModel.set_active_inactive_chatroom(parseInt(data.chatroom_id), true)
                                this.syncMessages()
                                eventEmitManager.invoke_callbacks('accepted_request_chat', null)
                                this._onRefresh()
                            }
                            if (data.type == "accepted_request_chat") {
                                this.getChatRoomSession(data)
                                ChatRoomModel.set_active_inactive_chatroom(parseInt(data.chatroom_id), true)
                                this.syncMessages()
                                eventEmitManager.invoke_callbacks('accepted_request_chat', null)
                                this._onRefresh()
                            }
                            if (data.type == "message") {
                                // console.log("=============================")
                                // console.log("Payload", JSON.stringify(data))
                                // console.log("=============================")
                                let chatroom_id = data.chatroom_id
                                let _chatRoom = ChatRoomModel.find_by_id(parseInt(chatroom_id))
                                // console.log("=============================")
                                // console.log("Payload", _chatRoom)
                                // console.log("=============================")
                                if (_chatRoom != null) {
                                    this.props.navigation.navigate('Chat', { chatroom: _chatRoom, onGoBack: () => this.goBack() })
                                }
                            }
                            if (data.type == "reminder_follow_up") {
                                this.props.navigation.navigate('Reminder', { "route": "Home" })
                            }
                        }} screenName="PatientHome" />




                        {
                            (this.state.showRatingPopup == true) ?
                                <RatingScreen
                                    data={this.state.ratingData}
                                    app_user={"patient"}
                                    visible={this.state.showRatingPopup}
                                    onCloseModal={this.handleCloseModal}
                                    showRatingPopup={showRatingPopup}
                                />
                                :
                                null
                        }

                    </View>
                </SafeAreaView>
                <WhatNewModal visible={whatsNewModal}
                    onClosePress={(show) => {
                        if (show == false) {
                            this.setState({ whatsNewModal: show })
                        }
                    }}
                />
            </Container >

        );
    }
}

export default HomePatientScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {
        backgroundColor: '#ffffff',
        height: hp('12%'),
        justifyContent: 'center',
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: hp('3%')
    },
    headerIcon: {
        color: '#fff'
    },
    imageContainer: {
        alignItems: 'center',
        width: wp(18),
        height: wp(18),
        backgroundColor: '#000000',
        borderRadius: wp('18%') / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.strokeColor3,
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    tabSelectText: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    tabDefaultText: {
        color: colors.white,
        opacity: 0.8,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    chatBackground: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
    },
    itemMessageBody: {
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        color: '#000000'
    },
    datetime: {
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('xMini'),
        color: colors.grayTwo
    },
    patientName: {
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: 16,
        color: '#3f3f3f'
    },
    separator: {
        height: 1,
        width: "100%",
        backgroundColor: "#e3e3e3",
        marginLeft: wp(16.5)
    },
    tabHeading: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    }
});