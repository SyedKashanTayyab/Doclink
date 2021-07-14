import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, ImageBackground, Alert, TouchableWithoutFeedback, TouchableOpacity, AppState, Platform, Modal, ActionSheetIOS, Linking } from 'react-native';
import { Container, Icon, List, ListItem } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GiftedChat, Bubble, Send, Composer } from 'react-native-gifted-chat';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner, CheckNetworkConnectivity } from '../utils/AppHelper';
// import ImagePicker from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import Notification from '../components/Notifications';
import File from '../components/File'
import axios from 'axios';
import colors from '../utils/Colors'

import AppSocketManager from '../components/AppSocket';
import EventEmitManager from '../components/EventEmitManager';
import globalStyle from '../styles/GlobalStyles'
import { CHAT_COMMAND, API_URL, URL_IMAGE_UPLOAD, URL_AUDIO_UPLOAD } from '../utils/Constant'
import ChatRoomSessionModel from '../schemas/models/ChatRoomSessionModel'
import MessageModel from '../schemas/models/MessageModel';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import { SafeAreaView } from 'react-navigation'
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import AppButton from '../components/AppButton'
import StartNewSessionModal from "../components/StartNewSessionModal";
import PermissionPopup from '../components/PermissionPopup';

import API from '../services/API';

import permissions from '../components/Permissions'
import VoiceRecorder from '../components/VoiceRecorder'

import SlackMessage from '../ChatUI/SlackMessage'
import HeaderDropdownOptions from '../components/HeaderDropdownOptions';
import ProfileVerification from '../components/ProfileVerification';
import NewChatRequestPopup from '../components/NewChatRequestPopup';
import ImageViewer from 'react-native-image-zoom-viewer';
import DialogAndroid from 'react-native-dialogs';
import AsyncImageView from '../services/AsyncImageView';
import appSingleton from '../components/AppSingleton'

const _ = require('lodash');

var appSocket = null
var eventEmitManager = null
var moment = require('moment');
let arrMessages = null

let initial_timestamp_for_messages = null


let navlist = [
    {
        label: "View Profile",
        routeLink: "ProfileView",
    },
    {
        label: "View Media",
        routeLink: "Media",
    },
    {
        label: "My Prescriptions",
        routeLink: "MyPrescription"
    }
]


class ChatScreen extends Component {
    constructor(props) {
        super(props);

        this.openImageViewer = this.openImageViewer.bind(this);

        // Fetch Props
        let _chatroom = props.navigation.getParam('chatroom', null)
        let _internetConnectivity = props.navigation.getParam('internetConnectivity', null)
        let _chat_request = props.navigation.getParam('chat_request', null)

        // Fetch messages
        let chatroom_id = _chatroom.id
        arrMessages = MessageModel.fetch_message(chatroom_id, null) // id, timestamp
        if (arrMessages.length > 0) {
            initial_timestamp_for_messages = arrMessages[(arrMessages.length - 1)].created_at
            console.log("Message Last", arrMessages[0].created_at)
            console.log("Message First", arrMessages[(arrMessages.length - 1)].created_at)
        }

        this.state = {
            spinner: false,
            composerText: '',
            user_id: '',
            is_typing: false,
            conversation_id: '',
            messages: this.getMappedMessages(arrMessages),
            doctors: [],
            data: [],
            status: false,
            isLoadingEarlier: false,
            visibleSession: false,
            showpopupmenu: false,
            package: '',
            chat_session_requested: false,
            chat_session_requested_data: '',
            doctorPackgeInfo: '',

            chatroom: _chatroom,
            chat_request: _chat_request,

            waiting_for_network: false,
            data_online_status: '',
            appState: AppState.currentState,
            chatroom_session: null,
            visiblePermission: false,

            newSessionReqData: {
                audioData: null,
                description: null
            },

            isStartingRecording: false,
            cancelRecording: false,

            recordTime: "0:00",
            recordSecs: 0,

            showOptions: true,
            composerHeight: 45,

            toggleDropdown: false,
            navlistItems: navlist,
            profilePermission: {
                title: "Profile Verification",
                key: "",
                message: "Your profile is not verified. Please verify your mobile number through OTP verification.",
            },
            popupVisible: false,
            showChatRequestModal: false,

            showImageViewer: false,
            imageUrls: "",

            session_status: '',
            isInternetConnected: _internetConnectivity
        }

        // Socket Instance from singleton
        appSocket = AppSocketManager.getInstance()
        appSocket.register_callback(this._socketReponseHandler)

        // EventEmitManager Instance from singleton
        eventEmitManager = EventEmitManager.getInstance()
        eventEmitManager.register_callback(this._eventEmitManagerHandler)

        appSingleton.getInstance().set_new_player(null)
    }

    async componentDidMount() {
        try {

            AppState.addEventListener('change', this._handleAppStateChange);

            const { navigation } = this.props;
            const { chatroom } = this.state;

            let _composerText = await appHelper.getItem('CHAT_' + chatroom.id)
            _composerText = (_composerText == null) ? "" : _composerText

            await this.setState({
                composerText: _composerText,
                showOptions: (_composerText.length > 0) ? false : true,
            });

            // Set screen name for global access
            global.current_screen = 'Chat_' + chatroom.id

            // Check socket connection
            if (appSocket.is_disconnected() == true) {
                this.setState({
                    waiting_for_network: true
                })
            }

            // Online status
            appSocket.online_status({ user_id: chatroom.doctor.user_id })

            // Get Chat requested Details
            // await this.getChatRequestedDetail()

            // Get Active Chat Room Sesion
            await this.getChatRoomSession()

            // Chatroom Reset count
            ChatRoomModel.reset_count(chatroom.id)

            setTimeout(() => {
                // Get Active Chat Room Sesion
                this.syncMessages()
            }, 1000);


        } catch (error) {
            console.log("DoctorChatScreen ComponentDidMount", error)
        }
    }

    componentWillUnmount() {
        appSocket.remove_callback(this._socketReponseHandler)
        eventEmitManager.remove_callback(this._eventEmitManagerHandler)
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    /**
     * Socket Handler
     */
    _socketReponseHandler = async (event, data) => {
        console.log("==================")
        console.log("PatientChatScreen _socketReponseHandler", event)
        console.log("==================")

        if (event == CHAT_COMMAND.AUTHENTICATION) {
            // console.log(screen_name, " Connceted", data)

            this.setState({
                waiting_for_network: false
            })

            // // Get Active Chat Room Sesion
            await this.getChatRoomSession()

        } else if (event == CHAT_COMMAND.ONLINE) {

            // Online status
            appSocket.online_status({ user_id: this.state.chatroom.doctor.user_id }, this._socketReponseHandler);

            this.setState({
                waiting_for_network: false
            })

        } else if (event == CHAT_COMMAND.MESSAGES) {
            // console.log(screen_name, " Messages", data, "\n")
            // MessageModel.create_from_array(data)

            //await this.fetchChatMessages(true)

        } else if (event == CHAT_COMMAND.CHAT_REQUESTS) {
            // console.log(screen_name, " Chat Requests", data)
        } else if (event == CHAT_COMMAND.DISCONNECTED) {
            // console.log(screen_name, " Disconnected")
            this.setState({
                waiting_for_network: true
            })
        } else if (event == CHAT_COMMAND.ONLINE_STATUS) {
            this.setState({
                data_online_status: data
            })
        } else if (event == CHAT_COMMAND.MESSAGE_SEND) {
            // console.log(" Update ID of message")

        } else if (event == CHAT_COMMAND.SESSION_END) {


        } else if (event == CHAT_COMMAND.USER_TYPING) {
            if (parseInt(data.chatroom_id) == parseInt(this.state.chatroom.id)) {
                this.setState({ is_typing: data.typing });
            }
        } else if (event == CHAT_COMMAND.MESSAGE_RECEIVED) {
            // console.log("New Messages received")
        }
    }

    /**
     * Event Emit Manager
     */
    _eventEmitManagerHandler = async (event, data) => {
        console.log("==================")
        console.log("PatientChatScreen _eventEmitManagerHandler", event)
        console.log("==================")
        try {
            if (event == 'update_messages') {
                console.log("Patient Chat Screen", event, data)
                this.fetchChatMessages()

                this.sendSeenStatusToServer()

            } else if (event == 'session_end') {
                await this.setState({
                    chatroom_session: data
                })
                if (data.started_by != null && data.ended_by == null) {
                    this.setState({
                        session_status: 'ongoing'
                    })
                    // console.log("==== IF 1")
                    // Message listener
                    this.syncMessages()

                } else {
                    // console.log("==== IF 2")
                    this.setState({
                        session_status: 'empty'
                    })
                }
            } else if (event == "accepted_request_chat") {
                setTimeout(() => {
                    this.setState({
                        chat_session_requested: false,
                        chat_session_requested_data: ''
                    })
                    this.getChatRoomSession()
                }, 500);
            } else if (event == CHAT_COMMAND.CHAT_ROOM_SESSION) {
                // console.log("eventEmitManager", CHAT_COMMAND.CHAT_ROOM_SESSION, JSON.stringify(data))
                let _chatroom_session = ChatRoomSessionModel.update(data)

                // if requested is in pending
                if (data.chat_request.length > 0) {
                    this.setState({
                        chat_session_requested: true,
                        chat_session_requested_data: data.chat_request[0],
                        session_status: 'empty'
                    })
                } else if (data.session == null) {
                    // if 
                    this.setState({
                        chatroom_session: null,
                        chat_session_requested: false,
                        chat_session_requested_data: '',
                        session_status: 'empty'
                    })
                    // /await this.getChatRequestedDetail()
                } else {
                    this.setState({
                        chatroom_session: _chatroom_session,
                        // chat_session_requested: false,
                        // chat_session_requested_data: ''
                    })
                    if (_chatroom_session.started_by != null && _chatroom_session.ended_by == null) {
                        // console.log("==== IF")
                        this.setState({
                            chat_session_requested: false,
                            chat_session_requested_data: '',
                            session_status: 'ongoing'
                        })
                    } else {
                        // console.log("==== ELSE")
                        this.setState({
                            session_status: 'empty'
                        })
                    }
                }
            } else if (event == 'internet_connectivity') {
                console.log("eventEmitManager", event, data)
                this.setState({
                    isInternetConnected: data,
                    waiting_for_network: (data == false) ? true : false
                })
            }
        } catch (error) {
            console.log("PatientChatScreen _eventEmitManagerHandler: ", error)
        }
    }

    /**
     * App State listener
     * @param nextAppState forward next app state
     */
    _handleAppStateChange = async (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log("\nChat Screen Foreground\n")

            if (appSocket.is_connected() == true) {
                await this.getChatRoomSession()
            }

        } else {
            // console.log("\nChat Screen Background\n")
        }
        this.setState({ appState: nextAppState });
    };

    async getChatRoomSession() {
        let userId = await appHelper.getItem("user_id");
        let params = {
            timestamp: 0,
            user_id: userId,
            app_user: 'patient',
            chatroom_id: this.state.chatroom.id.toString()
        }
        appSocket.chat_room_session(params)
    }

    /**
     * Sync Messages from server
     * @param timestamp last timestamp of message
     */
    async syncMessages() {
        let userId = await appHelper.getItem("user_id");
        let max_timestamp = MessageModel.get_last_sent_timestamp(this.state.chatroom.id)
        // console.log("max_timestamp", max_timestamp)
        let params = {
            timestamp: moment(max_timestamp).utc(false).format('YYYY-MM-DD HH:mm:ss'),
            user_id: userId,
            app_user: 'patient',
            chatroom_id: this.state.chatroom.id.toString(),
        }
        // console.log("params", params)
        appSocket.messages(params)
    }

    async fetchChatMessages() {
        let chatroom_id = ''
        if (this.state.chatroom == null) {
            const { navigation } = this.props;
            const chatroom = await navigation.getParam('chatroom', null);
            chatroom_id = chatroom.id
        } else {
            chatroom_id = this.state.chatroom.id
        }
        // console.log("==== fetchChatMessages", initial_timestamp_for_messages)
        arrMessages = MessageModel.fetch_message(chatroom_id, initial_timestamp_for_messages)

        if (arrMessages.length > 0) {
            initial_timestamp_for_messages = arrMessages[(arrMessages.length - 1)].created_at
            // console.log("Message Last", arrMessages[0].created_at)
            // console.log("Message First", arrMessages[(arrMessages.length - 1)].created_at)
        }

        // arrMessages = MessageModel.fetch_message(chatroom_id)
        await this.setState({
            messages: this.getMappedMessages(arrMessages),
        })
    }

    async loadMoreMessage() {

        // console.log("Timestamp", initial_timestamp_for_messages)
        arrMessages = MessageModel.fetch_more_messages(this.state.chatroom.id, initial_timestamp_for_messages)
        if (arrMessages.length > 0) {
            initial_timestamp_for_messages = arrMessages[(arrMessages.length - 1)].created_at
            // console.log("Load NM Initial", arrMessages[0].created_at)
            // console.log("Load NM Last", arrMessages[(arrMessages.length - 1)].created_at)
        }
        await this.setState(previousState => ({
            messages: GiftedChat.append(this.getMappedMessages(arrMessages), previousState.messages),
            isLoadingEarlier: false,
        }))

        // console.log("Message 0 Index timestamp", this.state.messages[(this.state.messages.length - 1)].createdAt)
        // console.log("Message last Index timestamp", this.state.messages[0].createdAt)
    }

    async getChatRequestedDetail() {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");

        try {
            var params = {
                access_token: access_token,
                patient_id: user_id,
                doctor_id: this.state.chatroom.doctor.user_id
            }
            // console.warn(params)
            const res = await API.post(API_URL.PATIENT_CHAT_REQUESTS, params)
            if (res) {
                const data = res
                if (data.status == "Success") {
                    if (data.data.length > 0) {
                        this.setState({
                            chat_session_requested: true,
                            chat_session_requested_data: data.data[0]
                        })
                    }
                }
            }
        } catch (error) {
            console.log("ChatScreen getChatRequestedDetail", error)
        }
    }

    getMappedMessages = (data) => {
        if (!data) return
        return data.map((object) => {
            // console.log("Message", object.body)
            // var filename = (object.filename) ? BaseUrl.url + 'images/' + object.filename : '';
            // console.log("Chat Screen - getMappedMessages", object.body, JSON.stringify(object.status))
            // console.log("Message Type", object.body, object.sub_message_type, object.message_type)
            // console.log(JSON.stringify(object.status))
            let data = {
                _id: object._id + Math.round(Math.random() * 100000000),
                createdAt: moment(object.created_at).utc(true).format('YYYY-MM-DDTHH:mm:ss'),
                // is_diagnosis: object.is_diagnosis,
                // is_notes: object.is_notes,
                // system: (object.message_type == "system") ? true : false,
                system: false,
                message_type: object.message_type,
            };

            let _time = moment(object.created_at).utc(true).format('hh:mm A')

            if (object.sender != null) {
                data['user'] = {
                    _id: object.sender.user_id,
                    name: object.sender.name,
                    avatar: object.sender.image_url,
                }
            }

            if (object.sub_message_type == "chief_complaint" && object.message_type == "system") {
                data['is_cheif_complain'] = true
                data['text'] = object.body
            }

            if (object.sub_message_type == "chat_requested" && object.message_type == "system") {
                data['system'] = true
                data['system_key'] = "chat_requested"
                data['time'] = _time
                data['text'] = object.body
            }

            if (object.sub_message_type == "request_rejected" && object.message_type == "system") {
                data['system'] = true
                data['system_key'] = "request_rejected"
                data['time'] = _time
                data['text'] = object.body
            }

            if (object.sub_message_type == "request_accepted" && object.message_type == "system") {
                data['system'] = true
                data['system_key'] = "request_accepted"
                data['time'] = _time
                data['text'] = object.body
            }

            if (object.sub_message_type == "request_deleted" && object.message_type == "system") {
                data['system'] = true
                data['system_key'] = "request_deleted"
                data['time'] = _time
                data['text'] = object.body
            }

            if (object.sub_message_type == "session_ended" && object.message_type == "system") {
                data['system'] = true
                data['system_key'] = "session_ended"
                data['time'] = _time
                data['text'] = object.body
            }

            if (object.sub_message_type == "closing_notes" && object.message_type == "system") {
                data['is_notes'] = true
                data['text'] = object.body
            }

            if (object.sub_message_type == "medicine_prescribed" && object.message_type == "system") {
                data['medicine_prescribed'] = true
                data['chatroom_session_id'] = object.chatroom_session.chatroom_session_id
                data['medicinePrescribedCallback'] = this.callbackHandlerMedicinePrescribed
                data['text'] = "Prescription"
            }

            if (object.message_type == 'text') {
                data['text'] = object.body
            } else if (object.message_type == 'image') {
                data['image'] = (object.body != null) ? object.body : object.local_url;
            } else if (object.message_type == 'voice') {
                data['audio'] = (object.body != null) ? object.body : object.local_url;
            }

            // Status 
            let pendingFilteredData = object.status.filter(x => String(x.status).includes("pending"));
            let sentFilteredData = object.status.filter(x => String(x.status).includes("sent"));
            let deliveredFilteredData = object.status.filter(x => String(x.status).includes("delivered"));
            let seenFilteredData = object.status.filter(x => String(x.status).includes("seen"));

            if (seenFilteredData.length > 0) {
                data['pending'] = false
                data['sent'] = true
                data['received'] = true
            } else if (deliveredFilteredData.length > 0) {
                data['sent'] = false
                data['pending'] = false
                data['received'] = true
            } else if (sentFilteredData.length > 0) {
                data['pending'] = false
                data['sent'] = true
            } else if (pendingFilteredData.length > 0) {
                data['pending'] = true
            } else {
                data['pending'] = false //when message pending
                data['sent'] = false //when message sent
                data['received'] = false //when message seen condition (object.received) ? true : false
            }
            // console.log("getMapped", JSON.stringify(data))
            return data;
        });
    }

    async onSend(messages) {

        //console.log("Chat Screen - onSend", messages)

        // Store local message
        let message_object = this.create_message_object(messages, 'text')

        // Send message to server 
        // appSocket.invoke_callbacks('sync_messages', null)

        // Send message to server 
        this.send_message(messages, 'text')

        // console.log("\n")
        // console.log("\n", this.state.chatroom_session.chatroom.patient)
        // console.log("\n", this.state.chatroom_session.chatroom.doctor)
        // console.log("\n")

        // Set Message listener 


        // console.log("New Message", params)

        // let user_data = JSON.parse(await appHelper.getItem('user_data'));
        // messages[0]['doctor_id'] = this.state.doctors.doctor_id;
        // messages[0]['name'] = user_data.name ? user_data.name : 'User';
        // messages[0]['avatar'] = user_data.avatar ? user_data.avatar : BaseUrl.url + 'images/dummy.png';

        // await global.socket.emit("send message", messages);
        // this._fetchData();
        // await global.socket.emit("chat_reload", this.state.doctors.doctor_id.toString());

        this.setState({
            composerText: "",
            showOptions: true
        })
    }

    async create_message_object(messages, type) {
        // Set Message listener 
        let params = {
            sender: this.state.chatroom_session.chatroom.patient,
            receiver: this.state.chatroom_session.chatroom.doctor,
            body: messages[0].text,
            message_type: type,
            _id: messages[0]._id,
            chatroom: this.state.chatroom_session.chatroom,
            chatroom_session: this.state.chatroom_session,
            created_at: moment(messages[0].createdAt).utc(false).format('YYYY-MM-DDTHH:mm:ss'),
            status: {
                user: this.state.chatroom_session.chatroom.patient,
                status: 'pending',
                created_at: messages[0].createdAt,
            },
            local_url: (messages[0].local_url != null) ? messages[0].local_url : null
        }
        // console.log(params)

        let message = MessageModel.create(params)

        let a = this.getMappedMessages([message])
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, a),
        }))
        return message;
    }
    async send_message(messages, type) {

        // console.log("Chat Screen - send_message", messages)

        // Message param for server
        var paramsMessage = {
            body: messages[0].text,
            sender_id: this.state.chatroom_session.chatroom.patient.user_id,
            receiver_id: this.state.chatroom_session.chatroom.doctor.user_id,
            message_type: type,
            chatroom_id: this.state.chatroom_session.chatroom.id,
            chatroom_session_id: this.state.chatroom_session.chatroom_session_id,
            _id: messages[0]._id,
            app_user: 'patient',
        }
        appSocket.message_send(paramsMessage)
    }


    is_typing(text) {
        //console.log("is_typing", (text.length > 0) ? true : false)
        if (this.state.chatroom != null) {
            this.setState({ composerText: text }, function () {
                appSocket.user_typing({
                    is_typing: (text.length > 0) ? true : false,
                    user_id: this.state.chatroom.doctor.user_id,
                    chatroom_id: this.state.chatroom.id,
                    app_user: 'patient'
                })
                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                    appSocket.user_typing({
                        is_typing: false,
                        user_id: this.state.chatroom.doctor.user_id,
                        chatroom_id: this.state.chatroom.id,
                        app_user: 'patient'
                    })
                }, 5000);
            })
        }

        if (text.length > 0) {
            if (this.state.showOptions == true) {
                this.setState({ showOptions: false })
            }
        } else {
            this.setState({ showOptions: true })
        }
    }

    async sendSeenStatusToServer(chatroom = null) {

        let chatroom_id = 0
        if (this.state.chatroom.id != null) {
            chatroom_id = this.state.chatroom.id
        } else if (chatroom != null) {
            chatroom_id = chatroom
        }

        let userId = await appHelper.getItem("user_id");
        let chatroom_ids = []
        chatroom_ids.push(chatroom_id)
        let params_x = {
            app_user: "patient",
            status: "seen",
            type: "chatrooms",
            user_id: userId,
            ids: chatroom_ids
        }

        // console.log("params", params_x)
        appSocket.message_delivered(params_x)
    }

    async processImage(response) {
        try {
            // console.log(response)
            let _arrMessage = [{
                _id: appHelper.guid(),
                createdAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
                local_url: response.path,
            }]
            let message_object = await this.create_message_object(_arrMessage, 'image')
            // console.log("Message Object", message_object)

            const _res = await API.postMultipart(URL_IMAGE_UPLOAD, message_object.local_url, [], null, 'image')
            let final_url = `${_res.data.base_url}/${_res.data.image_name}`
            // console.log(final_url, _res)
            _arrMessage[0].text = final_url
            this.send_message(_arrMessage, 'image')

        } catch (error) {
            console.log("Chat Screen - _onImage - camera - Upload Error", error)
        }
    }

    async _onImage() {
        if (Platform.OS === 'ios') {
            const imageCropOptions = {
                cropping: true,
                width: 1080,
                height: 1920,
                freeStyleCropEnabled: true,
                compressImageQuality: 1,
                smartAlbums: ['UserLibrary', 'PhotoStream', 'Panoramas']
            }
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    title: 'Choose Option',
                    options: ["Cancel", "Take Photo", "Choose from Library"],
                    cancelButtonIndex: 0
                },
                buttonIndex => {
                    if (buttonIndex === 0) {
                        // cancel action
                    } else if (buttonIndex === 1) {
                        ImagePicker.openCamera(imageCropOptions).then(async (response) => {
                            this.processImage(response)
                        }).catch((e) => console.log(e));
                    } else if (buttonIndex === 2) {
                        ImagePicker.openPicker(imageCropOptions).then(async (response) => {
                            this.processImage(response)
                        }).catch((e) => console.log(e));
                    }
                }
            );
        } else {
            const imageCropOptions = {
                cropping: true,
                freeStyleCropEnabled: true,
                cropperStatusBarColor: colors.primary,
                cropperToolbarColor: colors.primary,
                cropperToolbarWidgetColor: colors.white
            }
            const { selectedItem } = await DialogAndroid.showPicker('Choose Option', null, {
                positiveText: 'Cancel',
                items: [
                    { label: 'Take Photo', id: 'camera' },
                    { label: 'Choose from Library', id: 'gallery' }
                ]
            });
            if (selectedItem.id === 'camera') {
                ImagePicker.openCamera(imageCropOptions).then(async (response) => {
                    this.processImage(response)
                }).catch((e) => console.log(e));

            } else if (selectedItem.id === 'gallery') {
                ImagePicker.openPicker(imageCropOptions).then(async (response) => {
                    this.processImage(response)
                }).catch((e) => console.log(e));
            }
        }
    }

    _showPopupMenu = () => this.setState({ showpopupmenu: !this.state.showpopupmenu });

    //Session Modal
    _showSessionModal = () => this.setState({ visibleSession: true });
    _hideSessionModal = () => this.setState({ visibleSession: false, newSessionReqData: { audioData: null, description: null } });

    _session_modal = async () => {

        // if (this.state.chatroom_session != null) {
        //     return;
        // }

        const access_token = await appHelper.getItem("access_token");
        var params = {
            access_token: access_token,
            patient_id: this.state.chatroom.patient.user_id,
            doctor_id: this.state.chatroom.doctor.user_id,
        }
        console.log("_session_modal prams=>", params);
        try {
            const res = await API.get(API_URL.PATIENT_CHECK_WALLET, params)
            console.log(res)
            const data = res
            if (data.error === 10)
                this.showProfileVerificationPopup();
            else if (data.status == "Success") {
                console.log("======")
                console.log(data.data)
                this.setState({ doctorPackgeInfo: data.data })
                this._showSessionModal()
            } else if (data.error === 2) {
                // console.log("======")
                // console.log(data.data)
                Alert.alert(
                    '',
                    data.message,
                    [
                        {
                            text: 'No',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        {
                            text: 'Yes', onPress: () => {
                                // this.props.navigation.navigate('Wallet', { 'route': 'Chat' })
                                this.setState({ doctorPackgeInfo: data.data })
                                this._showSessionModal()
                            }
                        }
                    ]
                );
            } else if (data.error === 5) {
                Alert.alert(
                    '',
                    data.message,
                    [
                        { text: 'OK', onPress: () => { } }
                    ]
                );
            }
        }
        catch (error) {
            console.log("CS _session_modal", error)
        }
    }

    // Kashif
    _createSessionRequest = async () => {
        // CLOSE PERMISSION POPUP

        const { newSessionReqData, doctorPackgeInfo } = this.state;

        this.setState({
            visiblePermission: false,
            visibleSession: false
        })

        const user_id = await appHelper.getItem("user_id");
        try {


            let paramsChatRequest = {}
            if (newSessionReqData.audioData != null) {
                const _res = await API.postMultipart(URL_AUDIO_UPLOAD, object.local_url, [], null, 'audio')
                let final_url = `${_res.data.base_url}/${_res.data.audio_name}`
                // console.log(final_url)
                paramsChatRequest['url'] = final_url
                paramsChatRequest['duration'] = newSessionReqData.audioData.duration
            }

            let chatRequestData = {
                audioData: paramsChatRequest,
                description: newSessionReqData.description,
                emergency_session: doctorPackgeInfo.emergency_session
            }

            var params = {
                patient_id: user_id,
                doctor_id: this.state.chatroom.doctor.user_id,
                data: JSON.stringify(chatRequestData),
            }

            const data = await API.post(API_URL.PATIENT_REQUEST_NEW_SESSION, params)
            console.log("===================");
            console.log("_createSessionRequest data.data =", data);
            console.log("===================");
            if (data.status == 'Success') {
                this.setState({
                    chat_session_requested: true,
                    chat_session_requested_data: data.data[0],
                    newSessionReqData: {
                        audioData: null,
                        description: null
                    }
                })
                this.syncMessages()
            }
            else if (data.status == 'Error') {
                Alert.alert('', data.message);
            }
        }
        catch (error) {
            console.log("CS _createSessionRequest", error)
        }
    }

    closePermissionPopup = () => {
        this.setState({ visiblePermission: false, visibleSession: true });
    }


    handleSessionPermission = async (data) => {
        try {
            // console.log(data)
            this.setState({ visibleSession: false, visiblePermission: true, newSessionReqData: data, })
        } catch (error) {
            console.log("handleSessionPermission\n", error)
        }
    }


    renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                textStyle={{
                    right: {
                        color: 'black',
                    },
                }}
                wrapperStyle={{
                    right: {
                        backgroundColor: colors.chatBalloonRightBg,
                    },
                    left: {
                        backgroundColor: colors.chatBalloonLeftBg,
                    },
                }}
                tickStyle={{
                    color: '#3cc929',
                }}
            />
        );
    }

    _endSession = async () => {
        Alert.alert(
            '',
            'Do you want to end the session?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Yes', onPress: () => this._requestEndSession() },
            ],
            { cancelable: false },
        );
    }


    handleDeleteRequest = () => {
        this.closeChatRequestPopup();
        // DELETE REQUEST
        this._requestDeleteChatRequest()
    }

    closeChatRequestPopup = () => {
        this.setState({ showChatRequestModal: false, });
    }

    _requestDeleteChatRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { chat_session_requested_data } = this.state
        try {
            var params = {
                access_token: access_token,
                status: 'deleted',
                doctor_id: this.state.chatroom.doctor.user_id,
                request_id: chat_session_requested_data.id,
            }
            // console.log(params)
            const res = await API.post(API_URL.PATIENT_DELETE_REQUEST, params)
            if (res) {
                const data = res;
                if (data.status == 'Success') {

                    this.setState({
                        chat_session_requested: false,
                        chat_session_requested_data: ''
                    })

                    this.syncMessages()
                }
                else if (data.status == 'Error') {
                    Alert.alert(' ', data.message);
                }
            }
        }
        catch (error) {
            // console.warn(error)
        }
    }

    _requestEndSession = async () => {

        // Check socket is connected
        if (appSocket.is_connected() != true) {
            return;
        }

        let userId = await appHelper.getItem("user_id");
        let params = {
            timestamp: 0,
            user_id: userId,
            app_user: 'patient',
            chatroom_id: this.state.chatroom.id.toString(),
            chatroom_session_id: this.state.chatroom_session.chatroom_session_id.toString()
        }
        appSocket.session_end(params)
    }


    handleBack = () => {

        global.socket.off('recieve message', this.recieveMessage);
        global.socket.off('recieve_image', this.fetchMessages);
        global.socket.off('recieve_end_session', this.fetchNotes);
        // this.props.navigation.dispatch(StackActions.reset({
        //     index: 0,
        //     key: null,
        //     actions: [NavigationActions.navigate({ routeName: 'Chat' })],
        // }));
        this.props.navigation.goBack(null);
        let { onGoBack } = this.props.navigation.state.params;
        if (onGoBack) {
            onGoBack();

        }
        return;
    }


    // Upload Photo
    async postMultipart(url, image_path) {

        // console.log(url, image_path)
        // URI
        let uri = image_path

        // Split with period '.'
        let uriParts = uri.split('.');
        let fileType = File.type(uriParts[uriParts.length - 1])
        // console.log('fileType:', fileType)

        // Split with slash '/'
        let uriPartsSlash = uri.split('/');
        let fileName = uriPartsSlash[uriPartsSlash.length - 1];

        // Multipart form data fields
        const formData = new FormData();
        formData.append('image', {
            uri: uri,
            type: fileType,
            name: fileName
        });

        // console.log(formData)

        // Headers
        const _headers = {
            headers: {
                'Content-Type': 'multipart/form-data',
                //'access_token': global.accessToken,
                'Accept': 'application/json',
            },
            onUploadProgress: progressEvent => {
                // console.log("Percentage:" + percentCompleted)
                // do whatever you like with the percentage complete
                // maybe dispatch an action that will update a progress bar or something
            }
        }

        // Request
        try {
            let res = axios.post(url, formData, _headers)
            const { data } = await res;
            // console.log(data, status)
            return data.data
        } catch (error) {
            console.log("Chat Screen - postMultipart - Error", error)
            if (error.response == null) {
                throw error.request.responseText
            }
            var json = JSON.parse(error.request._response)
            throw json.message
        }
    }

    async postMultipartAudio(url, path) {

        // console.log("postMultipartAudio", url, path)
        // URI
        let uri = path

        // Split with period '.'
        let uriParts = uri.split('.');
        let fileType = File.type(uriParts[uriParts.length - 1])
        // console.log('fileType:', fileType)

        // Split with slash '/'
        let uriPartsSlash = uri.split('/');
        let fileName = uriPartsSlash[uriPartsSlash.length - 1];

        // Multipart form data fields
        const formData = new FormData();
        formData.append('audio', {
            uri: uri,
            type: fileType,
            name: fileName
        });

        // console.log(formData)

        // Headers
        const _headers = {
            headers: {
                'Content-Type': 'multipart/form-data',
                //'access_token': global.accessToken,
                'Accept': 'application/json',
            },
            onUploadProgress: progressEvent => {
                // console.log("Percentage:" + percentCompleted)
                // do whatever you like with the percentage complete
                // maybe dispatch an action that will update a progress bar or something
            }
        }

        // Request
        try {
            let res = axios.post(url, formData, _headers)
            const { data } = await res;
            // console.log(data, status)
            return data.data
        } catch (error) {
            console.log("Chat Screen - postMultipartAudio - Error", error)
            if (error.response == null) {
                throw error.request.responseText
            }
            var json = JSON.parse(error.request._response)
            throw json.message
        }
    }

    isCloseToTop({ layoutMeasurement, contentOffset, contentSize }) {
        const paddingToTop = 80;
        return contentSize.height - layoutMeasurement.height - paddingToTop <= contentOffset.y;
    }

    renderMessage(props) {
        // const {
        //     currentMessage: { text: currText },
        // } = props

        let messageTextStyle

        // // Make "pure emoji" messages much bigger than plain text.
        // if (currText && emojiUtils.isPureEmojiString(currText)) {
        messageTextStyle = {
            fontSize: 28,
            // Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
            lineHeight: Platform.OS === 'android' ? 34 : 30,
        }
        // }

        return <SlackMessage {...props} messageTextStyle={messageTextStyle} />
    }

    voiceRecordingHandler(param) {
        permissions.write_external_storage((key) => {
            if (key == "granted") {
                permissions.microphone((key, message) => {
                    if (key == "granted") {
                        this.setState({
                            isStartingRecording: param,
                            cancelRecording: false,
                        })
                    } else {
                        Alert.alert(key.capitalize(), message)
                    }
                })
            } else {
                Alert.alert(key.capitalize(), "message")
            }
        })
    }

    audioOutputHandler = async (data) => {
        // console.log("audioOutputHandler", data)

        if (data == null) return;

        // // Create image message object
        let _arrMessage = [{
            _id: appHelper.guid(),
            createdAt: moment().format('YYYY-MM-DDTHH:mm:ss'),
            local_url: data.path,
            text: JSON.stringify({
                url: "",
                duration: data.duration
            })
        }]
        let object = await this.create_message_object(_arrMessage, 'voice')
        // console.log("Message Object", object)

        try {
            const _res = await API.postMultipart(URL_AUDIO_UPLOAD, object.local_url, [], null, 'audio')
            let final_url = `${_res.data.base_url}/${_res.data.audio_name}`
            // console.log(final_url, _res)
            _arrMessage[0].text = JSON.stringify({
                url: final_url,
                duration: data.duration,
            })
            this.send_message(_arrMessage, 'voice')

        } catch (error) {
            console.log('====================================');
            console.log("audioOutputHandler - Upload Error", error)
            console.log('====================================');
        }

    }

    renderComposer = props => {
        // console.log(props)
        // console.log("================================");
        // console.log(props);
        // console.log("================================");
        if (this.state.chat_session_requested == true) {
            return (
                <View style={{ height: hp(5.2), backgroundColor: colors.aliceBlue, flexDirection: 'row', flex: 1, justifyContent: 'flex-end', paddingRight: wp(2), borderTopWidth: 0, borderColor: colors.white }} >
                    <View style={{ width: 'auto', backgroundColor: colors.btnBgColor, borderRadius: wp(1.5), paddingHorizontal: wp(3), marginVertical: wp(1.5) }}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                            onPress={() => this.setState({ showChatRequestModal: true, })}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), color: colors.white, textAlign: 'center' }}>SHOW REQUEST</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        } else if (this.state.session_status == 'empty') {
            return (
                <View style={{ height: hp(5.2), backgroundColor: colors.aliceBlue, flexDirection: 'row', flex: 1, justifyContent: 'flex-end', paddingRight: wp(2), borderTopWidth: 0, borderColor: colors.white }} >
                    <View style={{ width: 'auto', backgroundColor: colors.btnBgColor, borderRadius: wp(1.5), paddingHorizontal: wp(3), marginVertical: wp(1.5) }}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                            onPress={() => {
                                this._session_modal()
                            }}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), color: colors.white, textAlign: 'center' }}>START SESSION</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        } else if (this.state.session_status == '') {
            // Show empty view
            return (
                <></>
            )
        }

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: colors.white, marginTop: 0, marginBottom: -3, marginLeft: 0, marginRight: 0 }}>
                <View
                    style={{
                        flexDirection: "row", flex: 1,
                    }}>
                    <Composer
                        {...props}
                        textInputStyle={{
                            width: (this.state.isStartingRecording == false) ? "95%" : 0,
                            zIndex: (this.state.isStartingRecording == false) ? 999 : 0,
                            textAlignVertical: "center",
                            alignContent: "center",
                            overflow: 'hidden',
                            // padding: 10,
                            fontFamily: Fonts.HelveticaNeue,
                            lineHeight: 19.5,
                        }}
                        maxComposerHeight={25}
                        multiline={true}
                        disableComposer={this.state.isStartingRecording}
                        onTextChanged={(text) => {
                            this.is_typing(text)
                        }}
                    />
                    <View style={{
                        position: (this.state.isStartingRecording == true) ? 'absolute' : 'relative',
                        zIndex: (this.state.isStartingRecording == true) ? 999 : 0,
                        width: (this.state.isStartingRecording == true) ? "95%" : 0,
                        marginLeft: 10,
                        marginTop: Platform.select({
                            ios: 6,
                            android: 0,
                        }),
                        marginBottom: Platform.select({
                            ios: 5,
                            // android: 0,
                        }),
                        height: hp(5.2),
                        justifyContent: 'center',
                        backgroundColor: colors.white
                    }}>
                        <View style={{ flex: 1, backgroundColor: colors.transparent, flexDirection: 'column', justifyContent: 'center' }}>
                            <VoiceRecorder
                                recording={this.state.isStartingRecording}
                                output={this.audioOutputHandler}
                                cancelRecording={this.state.cancelRecording}
                                textStyle={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.gray }}
                            />
                        </View>
                    </View>
                </View>

                {
                    (this.state.isStartingRecording == true) ?
                        // ON START RECORDING SHOW - SHOW CANCEL AND STOP BUTTON
                        <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, marginRight: wp(1.5), }]}>
                            <AppButton
                                onPressButton={() => { this.setState({ cancelRecording: true, isStartingRecording: false, }) }}
                                styles={{ marginRight: hp(0.7), marginBottom: hp(0.5), height: hp(4), width: wp(18), backgroundColor: "#d1eafe", }}
                                title={"cancel"}
                                textColor={colors.primaryText}
                                textSize={FontSize('xMini')}
                            ></AppButton>
                            <AppButton
                                onPressButton={() => this.voiceRecordingHandler(false)}
                                styles={{ marginTop: hp(0), marginBottom: hp(0.5), height: hp(4), width: wp(18), }}
                                title={"send"}
                                textSize={FontSize('xMini')}
                            ></AppButton>
                        </View>
                        :

                        (this.state.showOptions == true)
                            ? <>
                                <Icon type="MaterialIcons" onPress={() => this._onImage()} name='image' style={{ width: wp(8), color: '#999', fontSize: wp("6%"), paddingHorizontal: 5, marginRight: 0 }} />
                                <Icon type="MaterialIcons" onPress={() => this.voiceRecordingHandler(true)} name='mic' style={{ width: wp(8), fontSize: wp("6%"), color: (this.state.isStartingRecording == true) ? colors.primary : '#999', paddingHorizontal: 5, marginRight: 5 }} />
                            </>
                            : null
                }
            </View>
        );
    }

    /**
     * Save Composer Text
     */
    async saveComposerText() {
        await appHelper.setItem('CHAT_' + this.state.chatroom.id, this.state.composerText)
    }

    toggleDropdown = () => {
        // console.log("toggleDropdown show");
        // NAVIAGTE TO SETTINGS PAGE
        this.setState({ toggleDropdown: !this.state.toggleDropdown, })
    }

    handleDropdownNavPress = (route) => {
        // NAVIAGTE TO *** PAGE
        let params = null
        if (route == "Media") {
            params = { chatroom: this.state.chatroom }
        } else if (route == "ProfileView") {
            params = { profile: this.state.chatroom.doctor, }
        }
        this.setState({
            toggleDropdown: false
        })
        this.props.navigation.navigate(route, params);
    }

    handleNumberVerification = () => {
        const userData = global.user_data;
        this.setState({ popupVisible: false, });
        // REDIRECT TO VERIFICATION SCREEN
        this.props.navigation.navigate('VerifyNumber', { phoneNumber: userData.phone, redirection: 'Chat' });
    }

    closePopup = () => {
        this.setState({ popupVisible: false, });
    }

    showProfileVerificationPopup = () => {
        // console.log("showProfileVerificationPopup fired()");
        this.setState({ popupVisible: true, });
    }

    // Function for ImageView if user click on image
    openImageViewer(images) {
        // set state of showImageViewer === true
        // set state of imageUrls === images

        // console.log("Clicked ===== ")

        // let arr = []
        // arr.push(images[0]['url'])
        // console.log("==========")
        // console.log("images", arr)
        // console.log("==========")

        this.setState({
            showImageViewer: true,
            imageUrls: images[0]['url']
        })
    }

    handleUrlPress(url /*: number*/) {
        // console.log(url);
        Linking.openURL(url);
        // const options = ['Copy Text', 'Cancel']
        // const cancelButtonIndex = options.length - 1
        // this.giftedChatRef.current.actionSheet().showActionSheetWithOptions(
        //     {
        //         options,
        //         cancelButtonIndex,
        //     },
        //     buttonIndex => {
        //         switch (buttonIndex) {
        //             case 0:
        //                 Clipboard.setString("asfdas")
        //                 break
        //         }
        //     },
        // )
    }

    handlePhonePress( /*: number*/) {
        // console.log(`${phone} has been pressed!`);
    }

    handleEmailPress( /*: number*/) {
        // console.log(`Hello ${email}`);
    }

    // Prescription View Handler
    callbackHandlerMedicinePrescribed = (data) => {
        this.props.navigation.navigate('PrescriptionView', data)
    }

    render() {
        const { visibleSession, chatroom, visiblePermission, toggleDropdown, navlistItems, profilePermission, popupVisible, chat_session_requested_data, showChatRequestModal, newSessionReqData, isInternetConnected } = this.state;
        // console.log("=================================");
        // console.log("render() messages", messages);
        // console.log("=================================");

        let requestSessionConfirmationMessage = ""
        if (this.state.doctorPackgeInfo.free_session == true) {
            // requestSessionConfirmationMessage = `Charges for the first session are PKR ${parseInt(this.state.doctorPackgeInfo.price) / 2} as you get 50% off. Proceed?`
            requestSessionConfirmationMessage = `Congratulations, this session has no charges. Proceed?`
        } else if (this.state.doctorPackgeInfo.free_session == true) {
            requestSessionConfirmationMessage = `This is emergency session. Proceed?`
        } else {
            requestSessionConfirmationMessage = `Charges for this session are PKR ${this.state.doctorPackgeInfo.price}. Proceed?`
        }


        let status = null
        if (this.state.session_status == 'ongoing') {
            if (this.state.text == '') {
                var imageIcon = <View style={{ backgroundColor: 'transparent', flexDirection: 'row', position: 'absolute', right: 0, bottom: 0, }} >
                    <Icon type="MaterialIcons" onPress={() => this._onImage()} name='image' style={{ color: '#999', padding: 10, fontSize: wp('6%'), marginRight: 6 }} />
                    {/* <Icon type="MaterialIcons" onPress={() => alert('audio')} name='mic' style={{ color: '#999', padding: 6, fontSize: wp('6%'), marginRight: 6 }} /> */}
                </View>
            }
        }

        if (this.state.data_online_status != '') {
            if (this.state.is_typing == true) {
                status = <View style={{ flexDirection: 'row', alignItems: 'center', height: hp('2%') }}>
                    <Text style={{ color: '#fff', fontSize: FontSize('xMini'), }}>typing...</Text>
                </View>
            } else {
                status = null
                if (this.state.data_online_status.status == "online") {
                    status = <View style={{ flexDirection: 'row', alignItems: 'center', height: hp('2%') }}>
                        <Text style={{ color: '#fff', fontSize: FontSize('xMini'), }}>Online</Text>
                    </View>
                }
            }
        }

        if (this.state.showpopupmenu) {
            var sideMenu = <View style={styles.listContainer} >
                <List style={{ marginLeft: -7 }}>
                    <ListItem noIndent>
                        <Text style={styles.listItems} onPress={() => {
                            this.setState({ showpopupmenu: false })
                            this.props.navigation.navigate('DoctorProfile', { doctor_id: this.state.chatroom.doctor.user_id })
                        }
                        }>View Profile</Text>
                    </ListItem>
                    <ListItem noIndent style={{ borderBottomWidth: 0 }}>
                        <Text style={styles.listItems} onPress={() => {
                            this.setState({ showpopupmenu: false })
                            this.props.navigation.navigate('Media', { chatroom: this.state.chatroom })
                        }
                        }>View Media</Text>
                    </ListItem>
                </List>
            </View>;
        }

        return (
            <TouchableWithoutFeedback style={{ backgroundColor: "red", }} onPress={() => {
                this.setState({ showpopupmenu: false, toggleDropdown: false, })
            }}>
                <Container>
                    <SafeAreaView style={[globalStyle.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                        {/* NAVIGATION HEADER */}
                        <NavigationBar
                            //title={(chatroom == null) ? "" : chatroom.patient.name}
                            context={this.props}
                            removeBackButton={false}
                            backButton={true}
                            transparent={Platform.OS === 'ios' ? true : false}
                            onBackButtonPress={() => {
                                this.saveComposerText()
                                this.props.navigation.navigate('Home')
                            }}
                            noShadow={true}
                            // transparent={true}
                            titleView={
                                // CHECK NETWORK CONNECTIVITY
                                <View style={{ width: "100%", height: "100%", backgroundColor: colors.transparent }}>
                                    {
                                        (this.state.waiting_for_network == true)
                                            ? <View style={{ width: "100%", height: "100%", flexDirection: 'row', alignItems: 'center', marginLeft: Platform.OS == 'ios' ? 0 : wp(-5) }}>
                                                <CheckNetworkConnectivity
                                                    headerTitle={(chatroom == null) ? "" : chatroom.patient.name}
                                                    waitingForNetwork={this.state.waiting_for_network}
                                                    internetConnectivity={isInternetConnected}
                                                />
                                            </View>
                                            : <View style={{ width: "100%", height: "100%", flexDirection: 'row', alignItems: 'center', marginLeft: Platform.OS == 'ios' ? 0 : wp(-5) }}>
                                                <View style={[styles.imageContainer]}>
                                                    <AsyncImageView
                                                        style={styles.profileImage}
                                                        width={"100%"}
                                                        height={"100%"}
                                                        directory={"images"}
                                                        url={chatroom == null ? "" : chatroom.doctor.image_url}
                                                        placeholderImage={require('../assets/images/dummy.png')}
                                                        onBegin={(res) => {
                                                            console.log("Begin", res)
                                                        }}
                                                        onProgress={(res) => {
                                                            console.log("Chat ScreenProgress", res)
                                                        }}
                                                        onFinish={(res) => {
                                                            console.log("Finish", res)
                                                        }}
                                                    />
                                                </View>
                                                <View style={{ marginLeft: 10, width: (this.state.session_status == 'ongoing') ? "45%" : "90%" }}>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ color: '#fff', fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold }}>Dr. {(chatroom == null) ? "" : chatroom.doctor.name}</Text>
                                                    {status}
                                                </View>
                                                {
                                                    (this.state.session_status == 'ongoing')
                                                        ? <View style={{ justifyContent: 'flex-end', width: 'auto', height: hp(3.5), backgroundColor: colors.btnBgColor1, borderRadius: wp(1.5), paddingHorizontal: wp(2), marginLeft: Platform.OS == 'ios' ? 0 : wp(5) }}>
                                                            <TouchableOpacity
                                                                style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                                                                onPress={() => {
                                                                    this._endSession()
                                                                }}>
                                                                <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), color: colors.white, textAlign: 'center' }}>END SESSION</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        : null
                                                }
                                            </View>
                                    }
                                </View>
                            }
                            right={
                                <>
                                    <HeaderDropdownOptions toggleDropdown={this.toggleDropdown} />
                                </>
                            }
                        />
                        {/* NAVIGATION HEADER END*/}


                        {this.state.showpopupmenu && sideMenu}
                        {/* Spinner */}
                        <CustomSpinner visible={this.state.spinner} />

                        <View style={{ flex: 1 }} onStartShouldSetResponder={() => { this.setState({ showpopupmenu: false }); return true; }}>
                            <ImageBackground style={styles.chatBackground} source={require('../assets/images/chat_background.png')} resizeMode="cover">
                                {
                                    (this.state.chatroom == null) ?
                                        null :
                                        <GiftedChat
                                            messages={this.state.messages}
                                            onSend={messages => this.onSend(messages)}
                                            user={{
                                                _id: this.state.chatroom.patient.user_id,
                                                avatar: this.state.chatroom.patient.image_url,
                                                conversation_id: this.state.conversation_id
                                            }}
                                            renderMessage={this.renderMessage}
                                            imageProps={{
                                                openImageViewer: this.openImageViewer
                                            }}
                                            scrollToBottom={true}
                                            renderAvatar={null}
                                            maxInputLength={500}
                                            text={this.state.composerText}
                                            // onInputTextChanged={(text) => { this.is_typing(text) }}
                                            listViewProps={{
                                                scrollEventThrottle: 400,
                                                onScroll: ({ nativeEvent }) => {
                                                    if (this.isCloseToTop(nativeEvent)) {
                                                        // console.log("load new messages")
                                                        // this.setState({ refreshing: true });
                                                        this.loadMoreMessage();
                                                    }
                                                }
                                            }}
                                            parsePatterns={() => [
                                                { type: 'phone', style: styles.phone, onPress: this.handlePhonePress },
                                                { type: 'url', style: styles.url, onPress: this.handleUrlPress },
                                                { type: 'email', style: styles.email, onPress: this.handleEmailPress },
                                                // { pattern: /#(\w+)/, style: { ...linkStyle, styles.hashtag }, onPress: this.onPressHashtag },
                                            ]}
                                            isCustomViewBottom={false}
                                            // renderBubble={this.renderBubble}
                                            scrollToBottomComponent={() => {
                                                return <Text><Icon type="MaterialIcons" name='keyboard-arrow-down' /></Text>
                                            }}
                                            renderSend={(props) => {
                                                return <Send
                                                    {...props}
                                                    containerStyle={{
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        height: (Platform.OS === 'ios') ? hp(5.2) : hp(4),
                                                    }}
                                                    textStyle={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), lineHeight: 19.5 }} />
                                            }}
                                            shouldUpdateMessage={(props, nextProps) => {
                                                return !_.isEqual(props.currentMessage, nextProps.currentMessage);
                                            }}
                                            renderComposer={this.renderComposer}
                                        />
                                }
                            </ImageBackground>
                            {this.state.session_status == 'ongoing' && imageIcon}
                        </View>

                        {/* START NEW SESSION PERMISSION POPUP */}
                        <PermissionPopup message={requestSessionConfirmationMessage} showPopup={visiblePermission} onPressYes={this._createSessionRequest} onPressNo={this.closePermissionPopup} />

                        <Notification onChange={(data) => {
                            if (data.type == "rejected_request_chat") {
                                this.setState({
                                    chat_session_requested: false,
                                    chat_session_requested_data: ''
                                })
                                //this._fetchData();
                            }
                            if (data.type == "accepted_request_chat") {
                                // console.warn("Chat screen accepted")
                                // setTimeout(() => {
                                //     this.setState({
                                //         chat_session_requested: false,
                                //         chat_session_requested_data: ''
                                //     })

                                // }, 1000);
                                //this._fetchData();
                            }
                        }} />

                        {/* START NEW SESSION MODAL */}
                        {
                            visibleSession ?
                                <StartNewSessionModal record_time={this.state.doctorPackgeInfo.record_time} enable_voice_cc={this.state.doctorPackgeInfo.enable_voice_cc} data={newSessionReqData} doctor={chatroom.doctor} visible={visibleSession} onSubmitPress={this.handleSessionPermission} onClosePress={this._hideSessionModal} />
                                :
                                null
                        }
                        {/* DROPDOWN NAVLIST */}
                        {
                            toggleDropdown ?
                                <View style={[globalStyle.shadowElevationThree, { backgroundColor: colors.white, position: "absolute", right: wp(2), top: hp(5.5), width: wp(40), paddingHorizontal: 0, paddingVertical: hp(0), borderRadius: wp(1), zIndex: 9999999, }]}>
                                    {
                                        navlistItems.map((item, i) => (
                                            <View key={i}>
                                                <TouchableOpacity onPress={() => this.handleDropdownNavPress(item.routeLink)} style={[
                                                    ((navlistItems.length - 1) == i) ? null : globalStyle.borderBottomGray,
                                                    { padding: wp(1.5), }]}>
                                                    <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), color: '#888c90', }}>{item.label}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    }
                                </View>
                                :
                                null
                        }

                        <ProfileVerification
                            permission={profilePermission}
                            visible={popupVisible}
                            onPressYes={this.handleNumberVerification}
                            onPressNo={this.closePopup}
                        />

                        {/* NEW CHAT REQUEST POPUP */}
                        <NewChatRequestPopup
                            showPopup={showChatRequestModal}
                            onPressReject={this.handleDeleteRequest}
                            data={chat_session_requested_data}
                            onPressCancel={this.closeChatRequestPopup}
                        />
                        {/* Modal ImageView */}
                        <Modal
                            visible={this.state.showImageViewer}
                            transparent={true}
                        >
                            <ImageViewer
                                imageUrls={[{ url: this.state.imageUrls }]}
                                onCancel={() => {
                                    this.setState({ showImageViewer: false });
                                }}
                                // backgroundColor={"green"}
                                renderIndicator={() => null}
                                renderImage={(props) => {
                                    return (
                                        <AsyncImageView
                                            style={{}}
                                            width={"100%"}
                                            height={"100%"}
                                            directory={"images"}
                                            url={props.source.uri}
                                            // placeholderImage={require('../assets/images/dummy.png')}
                                            onBegin={(res) => {
                                                console.log("Begin", res)
                                            }}
                                            onProgress={(res) => {
                                                console.log("ChatScreen Progress", res)
                                            }}
                                            onFinish={(res) => {
                                                console.log("Finish", res)
                                            }}
                                        />
                                    )
                                }}
                                enableSwipeDown
                                renderHeader={() => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({ showImageViewer: false });
                                        }}
                                        style={{ position: "absolute", right: 0, zIndex: 9, }}
                                    >
                                        {/* <Text style={[styles.closeButton]}>Close</Text> */}
                                        <Icon type="AntDesign" name='close' style={[styles.closeButton]} />
                                    </TouchableOpacity>
                                )}
                            />
                        </Modal>
                    </SafeAreaView>
                </Container>
            </TouchableWithoutFeedback >
        );
    }
}

export default ChatScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    chatBackground: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
    },
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
    container: {
        flex: 1,
        minHeight: wp('20%'),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#33333310',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
        resizeMode: 'cover',
    },
    imageContainer: {
        width: wp(8),
        height: wp(8),
        backgroundColor: colors.transparent,
        borderRadius: wp(8) / 2,
        borderWidth: 1,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    rightIcon: {
        fontSize: hp('3%'),
        color: '#fff',
        padding: 10
    },
    listItems: {
        fontFamily: Fonts.RobotoRegular,
        color: '#5b5b5b',
        fontSize: wp('4%'),
    },
    listContainer: {
        backgroundColor: '#fff',
        position: 'absolute',
        right: wp('5%'),
        top: wp('15%'),
        zIndex: 1,
        borderRadius: wp('3%') / 2,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#d9d9d9',
        textAlign: 'left',
        alignItems: 'flex-start',
    },
    closeButton: {
        color: colors.white,
        textAlign: "right",
        paddingTop: 20,
        paddingRight: 20,
        fontSize: hp(3),
    },
    phone: {
        color: colors.primaryText,
        textDecorationLine: 'underline',
    },
    url: {
        color: colors.primaryText,
        textDecorationLine: 'underline',
    },

    email: {
        color: colors.primaryText,
        textDecorationLine: 'underline',
    },
});