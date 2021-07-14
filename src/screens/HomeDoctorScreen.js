import React, { Component, Fragment } from 'react';
import {
    View, ImageBackground, StyleSheet, FlatList, TouchableHighlight, TouchableOpacity, ScrollView,
    RefreshControl, Image, TouchableWithoutFeedback, Alert, AppState, BackHandler, Platform, Linking
} from 'react-native';
import { Icon, Container, Tabs, Tab, TabHeading, Text } from 'native-base';
import { Badge } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner, CheckNetworkConnectivity } from '../utils/AppHelper';
import Notification from '../components/Notifications';
import colors from '../utils/Colors'
import DeviceInfo from 'react-native-device-info';

var moment = require('moment');
import Sounds from '../components/Sound'
import { SafeAreaView } from 'react-navigation'

import AppSocketManager from '../components/AppSocket';
import EventEmitManager from '../components/EventEmitManager';
import { CHAT_COMMAND, API_URL, URL_IMAGE_UPLOAD, URL_AUDIO_UPLOAD } from '../utils/Constant'
import API from '../services/API';
import ChatRequestModel from '../schemas/models/ChatRequestModel';
import ChatRoomModel from '../schemas/models/ChatRoomModel'
import ChatRoomSessionModel from '../schemas/models/ChatRoomSessionModel'
import AppInfo from '../../src/modules/AppInfoNativeModule';

import firebase from '@react-native-firebase/app';

import BadgeBubble from '../components/BadgeBubble'
import MessageModel from '../schemas/models/MessageModel'
import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import HomeDoctorPlaceholder from '../components/HomeDoctorPlaceholder';
import FontSize from '../utils/FontSize';
import TimestampAgo from '../components/TimestampAgo';
import DoctorStoriesView from './Stories/DoctorStoriesView';
import NetInfo from '@react-native-community/netinfo';
import WhatNewModal from '../modals/WhatNewModal';

var appSocket = null
var eventEmitManager = null
const inputAccessoryViewID = 'inputAccessoryView1';

var RNFS = require('react-native-fs');

class HomeDoctorScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            spinner: false,
            refreshing: false,
            data: [],
            arrCompletedChats: [],
            error: null,
            refresh: true,
            modalitem: [],
            is_typing: false,
            appState: AppState.currentState,
            arrChatRequest: [],
            itemChatRequest: null,
            dataVersion: 0,
            waiting_for_network: true,
            showTour: false,
            isVerified: false,
            verified_status: "",
            count_requests: 0,
            count_chats: 0,
            sectionIndex: 0,
            initialPage: 0,
            isTabMoved: false,
            statistics_count: 0,
            isInternetConnected: true,
            whatsNewModal: false
        };

        this.arrayholder = [];

        this.props.navigation.addListener('didFocus', async () => {

            console.log("=======================")
            console.log("Home Doctor screen WIll Focus", appSocket != null, appSocket.is_connected())
            console.log("=======================")

            // console.log("this.state.isVerified", this.state.isVerified)
            // if (this.state.isVerified == true) {
            global.current_screen = 'Home'
            this.getChatRooms()

            this._fetchPendingClosingNotes();

            this.dashboard();

            if (appSocket != null && appSocket.is_connected() == true) {
                console.log("93 If")
                this.setState({
                    waiting_for_network: false
                })
            } else if (appSocket != null && appSocket.is_connected() == false) {
                console.log("======== 98 Else Connectiong.....")
                // appSocket.connect()
            }

            this.getUserProfileData()

            BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            let _messages = MessageModel.fetch_pending_messages()
            this.fetchPendingMessages(_messages, 0)
        })

        // Get singleton object of eventEmitManager
        eventEmitManager = EventEmitManager.getInstance()

        // Set global time
        global.appOpenTime = moment().utc(true)
        // console.log("global.appOpenTime", global.appOpenTime)
    }

    /* On Refresh */
    _onRefresh = async () => {

        // Get chatrooms
        this.getChatRooms()
        this.syncMessages();
    }

    async componentDidMount() {
        // console.log("componentDidMount")
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

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        AppState.addEventListener('change', this._handleAppStateChange);

        // Update FCM Token
        this.updateFCMToken()

        // Check App Version
        this.checkVersion();

        //Dashboard count
        this.dashboard();

        // starter
        this.starter();

        // Set listener to get the latest token
        this.fcmToken()

        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            // console.log("Connection type", state.type);
            // console.log("Is connected?", state.isConnected);
            this.watchMan(state.isConnected)
        });

        // show whatsnew popup
        this.whatsNew()
    }

    componentWillUnmount() {
        if (this.state.isVerified == true && appSocket != null) {
            appSocket.remove_callback(this._socketReponseHandler)
        }
        AppState.removeEventListener('change', this._handleAppStateChange);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
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
                await RNFS.writeFile(filePathSettings, JSON.stringify(settingsJson.patient))
            }
            // Read File
            let content = await RNFS.readFile(filePathSettings)
            let arrData = JSON.parse(content)
            if (settingsJson.patient.release_date > arrData.release_date) {
                arrData.show_popup = true
                arrData.release_date = settingsJson.patient.release_date
            } else {
                arrData.show_popup = show_popup
            }
            if (arrData.show_popup == true) {
                this.setState({
                    whatsNewModal: true
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
                    appSocket.connect()
                } else {
                    console.log("else 183")
                    appSocket.connect()
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



    /**
     * Request - Check app verfion from server
     */
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
            } else {

            }
        } catch (error) {

        }
    }

    async starter() {
        //Set global user data for navigation
        global.user_data = await appHelper.getData("user_data");

        let last_sync_timestamp = await appHelper.getItem("last_sync_timestamp");
        if (last_sync_timestamp != null) {
            global.last_sync_timestamp = appHelper.convertToGMT(last_sync_timestamp)
        } else {
            global.last_sync_timestamp = appHelper.convertToGMT("1970-01-01T00:00:00")
        }

        // Get chatrooms
        this.getChatRooms()

        // Start Socket
        this._socketHandler()

        // Fetch Doctor's pending closing notes
        this._fetchPendingClosingNotes()
    }

    getUserProfileData = async () => {
        let userId = await appHelper.getItem("user_id");
        const params = {
            user_id: userId,
            role: 'doctor',
        }
        try {
            const data = await API.get(API_URL.PROFILE_USER, params);
            // console.log("API_URL.PROFILE_USER", data)
            if (data.data.is_verified.toString() == "1") {
                global.user_data['is_verified'] = data.data.is_verified
                global.user_data['referral_code'] = data.data.referral_code
                await appHelper.setData("user_data", global.user_data);
                this.setState({ isVerified: true, verified_status: "verified" });

                if (this.state.showTour == false) {
                    let show_package = await appHelper.getItem('show_package');
                    if (data.data.packages.length > 0) {
                        if (parseInt(data.data.packages[0].price) == 0) {
                            this.props.navigation.navigate('ProfileEdit', { tabIndex: 1 })
                            await appHelper.setItem('show_package', 'false')
                        }
                    }
                }
            } else {
                if (data.data.is_verified.toString() == "2") {
                    this.setState({ isVerified: false, verified_status: "rejected", data: [] });
                } else {
                    global.user_data['is_verified'] = data.data.is_verified
                    global.user_data['referral_code'] = data.data.referral_code
                    await appHelper.setData("user_data", global.user_data);
                    this.setState({ isVerified: false, verified_status: "not_verified", data: [] });
                }
                // Disconnect
                if (appSocket != null) {
                    appSocket.disconnect()
                    appSocket.remove_callback(this._socketReponseHandler)
                }
            }
        } catch (error) {
            console.log("HDS getUserProfileData", error)
        }
    }

    /**
     * Fetch Pending messages from database and sync with server.
     * / let _messages = MessageModel.fetch_pending_messages()
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
     * Hardware Back Button pressed handler
     */
    handleBackButton() {
        console.log("Back button is pressed")
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

        console.log("HDS this.state.isInternetConnected", this.state.isInternetConnected)
        if (this.state.isInternetConnected == true) {
            console.log("HDS  Connecting....", this.state.isInternetConnected)
            appSocket.connect()
        }
    }

    /**
     * Socket Reponse Handler
     */
    _socketReponseHandler = async (event, data) => {
        console.log("==================")
        console.log("HomeDoctorScreen _socketReponseHandler", event)
        console.log("==================")
        let userId = await appHelper.getItem("user_id");
        if (event == CHAT_COMMAND.AUTHENTICATION) {

            this.setState({ waiting_for_network: false })

            // Go online
            appSocket.goOnline()

        } else if (event == CHAT_COMMAND.DISCONNECTED) {
            this.setState({ waiting_for_network: true })
        } else if (event == CHAT_COMMAND.ONLINE) {

            let params = { timestamp: 0, user_id: userId, app_user: 'doctor' }
            appSocket.chat_requests(params);

            this.syncMessages()

            this.setState({
                waiting_for_network: false
            })

            // send pending messages to server
            let _messages = MessageModel.fetch_pending_messages()
            this.fetchPendingMessages(_messages, 0)

        } else if (event == CHAT_COMMAND.CHAT_REQUESTS) {

            this.setState({ arrChatRequest: [] })

            // Delete all chat requests
            ChatRequestModel.deleteAll();

            if (data.length == 0) {
                if (this.state.isTabMoved == false) {
                    // setTimeout(() => {
                    //     this.setState({ sectionIndex: 1, isTabMoved: true })
                    // }, 100);
                }
            } else {
                this.setState({ isTabMoved: true })
            }
            let isNewRecord = ChatRequestModel.create(data)
            // if (isNewRecord == true) {
            //     Sounds.newRequest()
            // }

            setTimeout(() => {
                this.getChatRequest()
            }, 200);

            eventEmitManager.invoke_callbacks(CHAT_COMMAND.CHAT_REQUESTS, data)

        } else if (event == CHAT_COMMAND.CHAT_ROOMS) {

            console.log("HomeDoctorScreen CHAT_COMMAND.CHAT_ROOMS messages length", data.length)
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

            eventEmitManager.invoke_callbacks('update_messages', null)
            eventEmitManager.invoke_callbacks(CHAT_COMMAND.CHAT_ROOM_SESSION, data)

        } else if (event == CHAT_COMMAND.MESSAGES) {

            // Dump new messages
            if (data.length > 0) {
                MessageModel.create_from_array(data)
                // Sounds.newRequest()

                // send delivered status to server
                this.sendDeliveredStatusToServer()

                eventEmitManager.invoke_callbacks('update_messages', true)
            }

            this.getChatRooms()

        } else if (event == CHAT_COMMAND.MESSAGE_SEND) {

            if (data.length > 0) {
                MessageModel.create_from_array(data)
                eventEmitManager.invoke_callbacks('update_messages', true)
            }

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
            }
            eventEmitManager.invoke_callbacks('update_messages', null)

            this.getChatRooms()
        } else if (event == CHAT_COMMAND.SESSION_END) {

            let _chatroom_session = ChatRoomSessionModel.update(data)

            eventEmitManager.invoke_callbacks('session_end', _chatroom_session)

            // Sync Messages
            this.syncMessages()

            this._fetchPendingClosingNotes()
        } else if (event == "sync_messages") {
            // let _messages = MessageModel.fetch_pending_messages()
            // this.fetchPendingMessages(_messages, 0)
        }
    }

    _handleAppStateChange = async (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            appHelper.clearAllNotifications()

            console.log("AppSocket connection status", appSocket.is_connected())

            if (appSocket != null && appSocket.is_connected() == true) {
                console.log("469 If")
                this.setState({
                    waiting_for_network: false
                })
            } else if (appSocket != null && appSocket.is_connected() == false) {
                console.log("======== 474 Else Connectiong.....")
                appSocket.disconnect()
                appSocket.connect()
            }

        } else {
            //await global.socket.emit('set_screen', { user_id: await appHelper.getItem('user_id'), screen: '' })
        }
        this.setState({ appState: nextAppState });
    };

    /**
    * Sync Messages from server
    * @param timestamp last timestamp of message
    */
    async syncMessages() {
        try {
            let userId = await appHelper.getItem("user_id");
            let max_timestamp = MessageModel.get_last_sent_timestamp(null)
            let params = {
                timestamp: moment(max_timestamp).utc(false).format('YYYY-MM-DD HH:mm:ss'),
                user_id: userId,
                app_user: 'doctor',
            }
            // console.log("Doctor syncMessages params", params)
            appSocket.messages(params)
        } catch (error) {
            console.log("Doctor SyncMessages catch", error)
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
            if (result.status == "Success") {
                appHelper.setItem('fcmToken', fcmToken);
            }
        }
        catch (error) {
            console.log(error)
        }
    }

    getChatRequest() {
        let requests = ChatRequestModel.fetchAll()
        this.setState({
            arrChatRequest: requests,
            count_requests: requests.length,
        })
    }

    fetchChatRequest = async () => {
        console.log("appSocket.is_connected()", appSocket.is_connected())
        let userId = await appHelper.getItem("user_id");
        let params = { timestamp: 0, user_id: userId, app_user: 'doctor' }
        appSocket.chat_requests(params);
    }

    async sendDeliveredStatusToServer() {
        let userId = await appHelper.getItem("user_id");
        let chatroom_ids = []
        this.state.data.map((object) => {
            chatroom_ids.push(object.id)
        })

        let params_x = {
            app_user: 'doctor',
            status: 'delivered',
            type: 'chatrooms',
            user_id: userId,
            ids: chatroom_ids
        }

        appSocket.message_delivered(params_x)
    }

    getChatRooms() {
        let arrActiveChatrooms = ChatRoomModel.fetchActiveChats()
        let arrCompletedChatrooms = ChatRoomModel.fetchCompletedChats()
        this.setState({
            data: arrActiveChatrooms,
            arrCompletedChats: arrCompletedChatrooms,
            count_chats: ChatRoomModel.fetchActiveChatsUnReadCount().length + ChatRoomModel.fetchCompletedChatsUnReadCount().length,
        })

        this.getChatRequest()
    }

    async goBack() {
        global.screen = 'Home'
    }

    /**
     * Fetch Closing notes detail
     */
    _fetchPendingClosingNotes = async () => {

        if (global.screen == 'Home') {
        }

        const user_id = await appHelper.getItem("user_id");
        const access_token = await appHelper.getItem("access_token");
        try {
            var params = {
                access_token: access_token,
                doctor_id: user_id,
            }
            const res = await API.get(API_URL.DOCTOR_PENDING_CLOSING_NOTES, params);
            if (res) {
                const data = res;
                if (data.status == 'Success' && data.data != null) {
                    let _params = {
                        chatroom_session_id: data.data.id
                    }
                    this.props.navigation.navigate('DoctorClosingNote', { data: _params })
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

    handleSettingPress = () => {
        // NAVIAGTE TO SETTINGS PAGE
        this.props.navigation.navigate('SettingStack');
    }

    handleConnectWithPatient = () => {
        if (this.state.isVerified == true) {
            this.props.navigation.navigate("ConnectPatient");
        }
    }

    navigateToChatScreen = async (chat_request) => {
        let user_id = await appHelper.getItem("user_id");
        let chatrooms = ChatRoomModel.find_chatroom(parseInt(user_id), parseInt(chat_request.patient.user_id))
        if (chatrooms == 0) {
            return;
        }
        let _item = chat_request
        this.props.navigation.navigate('Chat', { chatroom: chatrooms[0], chat_request: _item, onGoBack: () => this.goBack(), internetConnectivity: this.state.isInternetConnected })

    }

    renderSeparator = () => {
        return <View style={{ height: 1, width: "100%", backgroundColor: "#e3e3e3", marginLeft: wp(16.5) }} />;
    }

    dashboard = async () => {
        try {
            let params = {};
            const res = await API.get(API_URL.DOCTOR_DASHBOARD, params);
            if (res.status == 'Success') {
                this.setState({ statistics_count: res.data.statistics_count });
            } else {
                alert(res.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        const { itemChatRequest, dataVersion, arrChatRequest, waiting_for_network, isVerified, verified_status, count_chats, count_requests, sectionIndex, isInternetConnected } = this.state

        let DoctorPlaceholder = null;
        let chatRequestCard = null;
        let chatcard = null

        // Get active and completed chats
        let chatsCount = this.state.data.length + this.state.arrCompletedChats.length

        // Chats UI 
        if (chatsCount > 0) {
            chatcard = <>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp(0), marginTop: hp(0.5) }}>
                    <View style={{ width: hp(1), height: hp(1), borderRadius: hp(1 / 2), backgroundColor: colors.completedColor }} />
                    <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize("medium"), paddingLeft: wp(1), color: colors.gray }}>Active</Text>
                </View>
                {
                    this.state.data.length > 0
                        ? <FlatList
                            data={this.state.data}
                            istEmptyComponent={null}
                            ItemSeparatorComponent={this.renderSeparator}
                            renderItem={({ item }) => (
                                <View style={{ height: hp(9.5), }}>
                                    <TouchableHighlight style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', padding: 0, }} onPress={() => this.props.navigation.navigate('Chat', { chatroom: item, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })} underlayColor='transparent' >
                                        <View style={{ flexDirection: 'row' }}>

                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('ProfileView', { profile: { user_id: item.patient.user_id }, })}>
                                                <View style={{ marginRight: hp(1.4) }}>
                                                    <View style={[GlobalStyles.imageContainer, { width: wp(14), height: wp(14), borderWidth: 1, }]}>
                                                        <Image style={styles.profileImage} source={{ uri: item.patient.image_url }} />
                                                    </View>
                                                </View>
                                            </TouchableWithoutFeedback>

                                            <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>

                                                <View style={{ justifyContent: "center", paddingRight: hp(0), width: "100%" }}>

                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                        <View style={{ width: wp(55), paddingRight: wp(1.5) }}>
                                                            <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: 16, color: '#3f3f3f', }}>
                                                                {item.patient.name}
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: wp(17), justifyContent: "center", alignItems: "flex-end" }}>
                                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: colors.grayTwo, }} ellipsizeMode="tail" numberOfLines={1}>
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
                                                                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>
                                                                            {"Image"}
                                                                        </Text>
                                                                        :
                                                                        (item.message.message_type == 'voice')
                                                                            ?
                                                                            <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>
                                                                                {"Voice " + JSON.parse(item.message.body).duration}
                                                                            </Text>
                                                                            : (item.message.sub_message_type == 'chief_complaint')
                                                                                ? <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>{"Chief complaint"}</Text>
                                                                                : <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>
                                                                                    {item.message.body}
                                                                                </Text>
                                                                    :
                                                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayTwo }}>No Session Conducted</Text>
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
                            keyExtractor={(item, index) => index.toString()}
                            //ListHeaderComponent={this.renderHeader}
                            refreshing={this.state.refresh}
                        />
                        : <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.pendingColor, marginBottom: hp(2) }}>You have no active sessions</Text>
                }
                <Fragment>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp(0), marginTop: hp(1) }}>
                        <View style={{ width: hp(1), height: hp(1), borderRadius: hp(1 / 2), backgroundColor: colors.completedColor }} />
                        <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize("medium"), paddingLeft: wp(1), color: colors.gray }}>Completed</Text>
                    </View>
                </Fragment>
                {
                    this.state.arrCompletedChats.length > 0
                        ? <FlatList
                            data={this.state.arrCompletedChats}
                            ItemSeparatorComponent={this.renderSeparator}
                            renderItem={({ item }) => (
                                <View style={{ height: hp(9.5), }}>
                                    <TouchableHighlight style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', padding: 0, }} onPress={() => this.props.navigation.navigate('Chat', { chatroom: item, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })} onPress={() => this.props.navigation.navigate('Chat', { chatroom: item, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })} underlayColor='transparent' >
                                        <View style={{ flexDirection: 'row', }}>

                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('ProfileView', { profile: { user_id: item.patient.user_id }, })}>
                                                <View style={{ marginRight: hp(1.4), }}>
                                                    <View style={[GlobalStyles.imageContainer, { width: wp(14), height: wp(14), borderWidth: 1, }]}>
                                                        <Image style={styles.profileImage} source={{ uri: item.patient.image_url }} />
                                                    </View>
                                                </View>
                                            </TouchableWithoutFeedback>

                                            <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>

                                                <View style={{ justifyContent: "center", paddingRight: hp(0), width: "100%" }}>

                                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", }}>
                                                        <View style={{ width: wp(55), paddingRight: wp(1.5), }}>
                                                            <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: 16, color: '#3f3f3f', }}>
                                                                {item.patient.name}
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: wp(17), justifyContent: "center", alignItems: "flex-end", }}>
                                                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: colors.grayTwo, }} ellipsizeMode="tail" numberOfLines={1}>
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
                                                                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>
                                                                            {"Image"}
                                                                        </Text>
                                                                        :
                                                                        (item.message.message_type == 'voice')
                                                                            ?
                                                                            <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>
                                                                                {"Voice " + JSON.parse(item.message.body).duration}
                                                                            </Text>
                                                                            : (item.message.sub_message_type == 'chief_complaint')
                                                                                ? <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>{"Chief complaint"}</Text>
                                                                                : <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: '#000000', paddingRight: 3 }}>
                                                                                    {item.message.body}
                                                                                </Text>
                                                                    :
                                                                    <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayTwo }}>No Session Conducted</Text>
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
                            keyExtractor={(item, index) => index.toString()}
                            //ListHeaderComponent={this.renderHeader}
                            refreshing={this.state.refresh}
                        />
                        : <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.pendingColor }}>You have no completed sessions</Text>

                }
            </>
        }

        // Place holder for new doctor
        DoctorPlaceholder = <HomeDoctorPlaceholder onConnectWithPatientPress={this.handleConnectWithPatient} isVerified={isVerified} status={verified_status} />

        // Chat Request
        if (arrChatRequest.length > 0) {
            chatRequestCard = <FlatList
                data={arrChatRequest}
                extraData={dataVersion}
                ItemSeparatorComponent={this.renderSeparator}
                renderItem={({ item }) => {
                    return (
                        <View style={{ marginBottom: hp(0), height: hp(9.5) }}>
                            <TouchableHighlight style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', padding: 0, }} onPress={() => this.navigateToChatScreen(item)} underlayColor='transparent'>
                                <View style={{ flexDirection: 'row' }}>

                                    <TouchableWithoutFeedback onPress={() => { }}>
                                        <View style={{ marginRight: hp(1.4) }}>
                                            <View style={[GlobalStyles.imageContainer, { width: wp(14), height: wp(14), borderWidth: 1, }]}>
                                                <Image style={styles.profileImage} source={{ uri: (item.patient == null) ? "" : item.patient.image_url }} />
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>
                                        <View style={{ justifyContent: "center", paddingRight: hp(0), width: "100%" }}>

                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                <View style={{ width: wp(55), }}>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: 16, color: '#3f3f3f' }}>
                                                        {item.patient.name}
                                                    </Text>
                                                </View>
                                                <View style={{ width: wp(17), paddingTop: 5, justifyContent: "center", alignItems: "flex-end" }}>
                                                    <TimestampAgo timestamp={item.created_at} />
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: 'row', }}>
                                                <View style={{ width: wp(60), paddingRight: wp(1.5), justifyContent: "center" }}>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), paddingRight: 3 }}>
                                                        {item.chief_complaint == "" ? "Audio" : item.chief_complaint}
                                                    </Text>
                                                </View>
                                            </View>

                                        </View>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    )
                }}
                keyExtractor={(item, index) => index.toString()}
            //ListHeaderComponent={this.renderHeader}
            // refreshing={this.state.refresh}
            />
        }
        else if (arrChatRequest.length < 1) {
            chatRequestCard = <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.pendingColor, marginTop: hp(2), }}>You have no pending sessions</Text>
        }

        const { statistics_count, whatsNewModal } = this.state;
        return (
            <Container>
                <SafeAreaView style={GlobalStyles.AndroidSafeArea} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar title={"DocLink"}
                        context={this.props}
                        removeBackButton={true}
                        tabs={true}
                        transparent={Platform.OS === 'ios' ? true : false}
                        noShadow={true}
                        titleView={
                            // CHECK NETWORK CONNECTIVITY
                            // (this.state.isVerified == true)
                            //     ? 
                            <CheckNetworkConnectivity
                                headerTitle={"DocLink"}
                                waitingForNetwork={waiting_for_network}
                                internetConnectivity={isInternetConnected}
                            />
                            // : null
                        }
                        right={
                            <View style={{ flexDirection: 'row', width: wp(15), justifyContent: 'space-between' }}>
                                <View>
                                    <Badge visible={statistics_count > 0 ? true : false} size={wp(2)} style={{ position: 'absolute', bottom: wp(5), right: wp(-1), zIndex: 9999999 }} />
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Statistics')}>
                                        <Image style={{ width: wp(6), height: wp(6) }} source={require('../assets/icons/stats.png')} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={this.handleSettingPress} style={{ paddingHorizontal: wp(2) }}>
                                    <Icon type="Entypo" style={{ color: 'white', fontSize: hp(2.5), }} name="dots-three-vertical" />
                                </TouchableOpacity>
                            </View>
                        }
                    />
                    {/* NAVIGATION HEADER END*/}

                    {/* MAIN CONTENT SECTION */}

                    <View style={{ flex: 1, }}>
                        {/* Spinner */}
                        <CustomSpinner visible={this.state.spinner} />

                        <Notification onChange={(data) => {
                            if (data.type == "new_request_chat") {
                                console.log("============================================");
                                console.log("============================================");
                                console.log("-----\n NEW CHAT REQUEST \n-----")
                                console.log("============================================");
                                console.log("============================================");
                                this.getChatRooms()
                            }
                            if (data.type == "delete_request_chat") {
                                this.closePopup()

                                eventEmitManager.invoke_callbacks(CHAT_COMMAND.CHAT_REQUEST_DELETED, parseInt(data.request_id))

                                ChatRequestModel.delete(parseInt(data.request_id))
                                this.setState({
                                    itemChatRequest: null
                                })
                                setTimeout(() => {
                                    this.getChatRooms()
                                }, 500);
                            }
                            if (data.type == "message") {
                                let chatroom_id = data.chatroom_id
                                let _chatRoom = ChatRoomModel.find_by_id(parseInt(chatroom_id))

                                if (_chatRoom != null) {
                                    this.props.navigation.navigate('Chat', { chatroom: _chatRoom, onGoBack: () => this.goBack(), internetConnectivity: isInternetConnected })
                                }
                            }
                        }} />


                        <Tabs
                            initialPage={this.state.initialPage}
                            page={this.state.sectionIndex}
                            onChangeTab={({ i }) => {
                                this.setState({ sectionIndex: i })
                                if (i == 1) {
                                    if (this.state.data.length == 0) {
                                        console.log("Tabs changed - Chat sync Messages")
                                        this.syncMessages()
                                    }
                                }
                            }}
                            tabBarUnderlineStyle={{ backgroundColor: "#ffffff", paddingHorizontal: 30, height: 2 }}
                            tabContainerStyle={{ elevation: 0 }}
                        >
                            <Tab
                                textStyle={{ color: colors.white, textTransform: "uppercase", }}
                                heading={
                                    <TabHeading style={{ backgroundColor: colors.primary, shadowColor: colors.transparent, shadowOpacity: 0 }}>
                                        <Text style={(sectionIndex == 0) ? styles.tabSelectText : styles.tabDefaultText}>Requests</Text>
                                        {
                                            (count_requests > 0) ?
                                                <View><BadgeBubble count={parseInt(count_requests)} style={(sectionIndex == 0) ? null : { opacity: 0.8 }} textColor={colors.primaryText} badgeBgColor={colors.white} /></View>
                                                : null
                                        }
                                    </TabHeading>
                                }>
                                <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                    <ScrollView
                                        style={{ marginTop: hp(0), marginHorizontal: hp(1.4) }}
                                        refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                                            this.fetchChatRequest()
                                        }} />}
                                    >
                                        {chatRequestCard}
                                    </ScrollView>
                                </ImageBackground>
                            </Tab>
                            <Tab
                                textStyle={{ color: colors.white, textTransform: "uppercase", }}
                                heading={
                                    <TabHeading style={{ backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                        <Text style={(sectionIndex == 1) ? styles.tabSelectText : styles.tabDefaultText} >Chats</Text>
                                        {
                                            (count_chats > 0) ?
                                                <View><BadgeBubble count={count_chats} style={(sectionIndex == 1) ? null : { opacity: 0.8 }} textColor={colors.primaryText} badgeBgColor={colors.white} /></View>
                                                : null
                                        }
                                    </TabHeading>
                                }
                            >
                                <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                    {
                                        chatsCount > 0
                                            ? <ScrollView
                                                style={{ marginTop: hp(0), marginHorizontal: hp(1.4) }}
                                                refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
                                            >
                                                {chatcard}
                                            </ScrollView>
                                            : DoctorPlaceholder
                                    }
                                </ImageBackground>
                            </Tab>
                            <Tab
                                textStyle={{ color: colors.white, textTransform: "uppercase", }}
                                heading={
                                    <TabHeading style={{ backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                        <Text style={(sectionIndex == 2) ? styles.tabSelectText : styles.tabDefaultText} >Stories</Text>
                                        {
                                            // (count_chats > 0) ?
                                            //     <View><BadgeBubble count={count_chats} style={(sectionIndex == 1) ? null : { opacity: 0.8 }} textColor={colors.primaryText} badgeBgColor={colors.white} /></View>
                                            //     : null
                                        }
                                    </TabHeading>
                                }
                            >
                                <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                    <DoctorStoriesView {...this.props} />
                                </ImageBackground>
                            </Tab>
                        </Tabs>
                    </View>
                </SafeAreaView>
                <WhatNewModal visible={whatsNewModal}
                    onClosePress={(show) => {
                        if (show == false) {
                            this.setState({ whatsNewModal: show })
                        }
                    }}
                />
            </Container>
        );
    }
}

export default HomeDoctorScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {

        height: hp('12%'),
        justifyContent: 'center',
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: hp('3%')
    },
    headerIcon: {
        color: '#fff'
    },
    headerTitle: {
        fontSize: wp('5%'),
        fontFamily: Fonts.RobotoRegular,
        color: '#fff',
        marginLeft: hp('3%')
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    heading: {
        color: '#cecece',
        fontSize: wp('5%'),
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
        backgroundColor: 'transparent',
        justifyContent: 'center',
    },
    centeredView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 25,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    btn: {
        width: wp(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(13),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
        marginVertical: wp(2)
    },
    btnText: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase'
    },
});
