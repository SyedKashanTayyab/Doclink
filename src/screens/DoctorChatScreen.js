import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, ImageBackground, Alert, TouchableWithoutFeedback, TouchableOpacity, Platform, Modal, ActionSheetIOS, Linking, AppState, RefreshControlBase } from 'react-native';
import { Container, Icon, List, ListItem } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GiftedChat, Bubble, Composer, Send } from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';

import { Fonts, BaseUrl } from '../utils/Fonts';
import appHelper, { CustomSpinner, CheckNetworkConnectivity } from '../utils/AppHelper';
import File from '../components/File'
import colors from '../utils/Colors'
const _ = require('lodash');

import AppSocketManager from '../components/AppSocket';
import EventEmitManager from '../components/EventEmitManager';
import globalStyle from '../styles/GlobalStyles'
import { CHAT_COMMAND, API_URL, URL_IMAGE_UPLOAD, URL_AUDIO_UPLOAD } from '../utils/Constant'
import API from '../services/API';
import ChatRoomSessionModel from '../schemas/models/ChatRoomSessionModel'
import MessageModel from '../schemas/models/MessageModel';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import { SafeAreaView } from 'react-navigation'
import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import NewChatRequestPopup from '../components/NewChatRequestPopup';
import ChatRequestModel from '../schemas/models/ChatRequestModel';

import SlackMessage from '../ChatUI/SlackMessage'
import HeaderDropdownOptions from '../components/HeaderDropdownOptions';
import permissions from '../components/Permissions'

import VoiceRecorder from '../components/VoiceRecorder'
import AppButton from '../components/AppButton';
import ImageViewer from 'react-native-image-zoom-viewer';
import DialogAndroid from 'react-native-dialogs';
import AsyncImageView from '../services/AsyncImageView';
import appSingleton from '../components/AppSingleton'

var appSocket = null
var eventEmitManager = null
var moment = require('moment');
let arrMessages = null

let initial_timestamp_for_messages = null

var timer = null

let navlist = [
    {
        label: "View Profile",
        routeLink: "ProfileView",
    },
    {
        label: "View Media",
        routeLink: "Media",
    },
]

var session_follow_up_query = 'inspect'

// https://github.com/taskrabbit/react-native-parsed-text

class DoctorChatScreen extends Component {
    constructor(props) {
        super(props);

        this.openImageViewer = this.openImageViewer.bind(this);

        // Fetch Props
        let _chatroom = props.navigation.getParam('chatroom', null)
        let _internetConnectivity = props.navigation.getParam('internetConnectivity', null)
        let _chat_request = props.navigation.getParam('chat_request', null)
        // console.log("_chat_reques")
        // console.log(_chat_request)

        // Fetch messages
        let chatroom_id = _chatroom.id
        arrMessages = MessageModel.fetch_message(chatroom_id, null) // id, timestamp
        console.log("DCS Constructure", arrMessages.length)
        if (arrMessages.length > 0) {
            initial_timestamp_for_messages = arrMessages[(arrMessages.length - 1)].created_at
            console.log("DCS 1", initial_timestamp_for_messages)
            console.log("Message Last", arrMessages[0].created_at)
            console.log("Message First", arrMessages[(arrMessages.length - 1)].created_at)
        }

        this.state = {
            spinner: false,
            composerText: "",
            user_id: '',
            is_typing: false,

            messages: this.getMappedMessages(arrMessages),

            patients: {},

            status: null,
            isLoadingEarlier: false,
            visibleSession: false,
            description: '',
            showpopupmenu: false,
            socket: '',
            package: '',
            package_id: '',
            fcmToken: '',
            waiting_for_network: false,
            data_online_status: '',

            chatroom: _chatroom,
            chatroom_session: null,

            isStartingRecording: false,
            cancelRecording: false,

            recordTime: "0:00",
            recordSecs: 0,

            showOptions: false,
            composerHeight: 45,

            toggleDropdown: false,
            navlistItems: navlist,

            chat_request: _chat_request,
            showChatRequestModal: false,

            showImageViewer: false,
            imageUrls: "",

            appState: AppState.currentState,

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

    onValueChange(value) {
        this.setState({
            selected: value
        });
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
            appSocket.online_status({ user_id: chatroom.patient.user_id })


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

    componentDidUpdate() {
        // console.log("componentDidUpdate \n", this.state.messages)
    }

    componentWillUnmount() {
        console.log("Doctor Chat Screen componentWillUnmount")
        appSocket.remove_callback(this._socketReponseHandler)
        eventEmitManager.remove_callback(this._eventEmitManagerHandler)
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    /**
     * Socket Handler
     */
    _socketReponseHandler = async (event, data) => {
        console.log("==================")
        console.log("DoctorChatScreen _socketReponseHandler", event)
        console.log("==================")

        const userId = await appHelper.getItem("user_id");
        let screen_name = "Doctor Chat Screen"

        if (event == CHAT_COMMAND.AUTHENTICATION) {
            console.log(screen_name, " Connceted", data)

            this.setState({
                waiting_for_network: false
            })

            // Get Active Chat Room Sesion
            await this.getChatRoomSession()

        } else if (event == CHAT_COMMAND.ONLINE) {

            // Online status
            appSocket.online_status({ user_id: this.state.chatroom.patient.user_id })

            this.setState({
                waiting_for_network: false
            })

        } else if (event == CHAT_COMMAND.MESSAGES) {

            // console.log(screen_name, " Messages", data, "\n")

        } else if (event == CHAT_COMMAND.CHAT_REQUESTS) {
            // console.log(screen_name, " Chat Requests", data)
        } else if (event == CHAT_COMMAND.DISCONNECTED) {
            console.log(screen_name, " Disconnected")
            this.setState({
                waiting_for_network: true
            })
        } else if (event == CHAT_COMMAND.ONLINE_STATUS) {
            // console.log("Online status ", data)

            this.setState({
                data_online_status: data
            })
        } else if (event == CHAT_COMMAND.CHAT_ROOM_SESSION) {

            // Chat room session
        } else if (event == CHAT_COMMAND.MESSAGE_SEND) {
            console.log(" Update ID of message")

        } else if (event == CHAT_COMMAND.SESSION_END) {
            console.log("Doctor Chat Screen - Session End")

        } else if (event == CHAT_COMMAND.USER_TYPING) {
            if (parseInt(data.chatroom_id) == parseInt(this.state.chatroom.id)) {
                this.setState({ is_typing: data.typing });
            }
        } else if (event == CHAT_COMMAND.MESSAGE_RECEIVED) {
            console.log("New Messages received")
        }
    }

    /**
     * Event Emit Manager
     */
    _eventEmitManagerHandler = async (event, data) => {
        console.log("==================")
        console.log("DoctorChatScreen _eventEmitManagerHandler", event)
        console.log("==================")
        try {
            if (event == 'update_messages') {
                console.log("update_messages", data)
                // if (data == true) {
                // console.log("update_messages: ", data)
                this.fetchChatMessages()
                this.syncMessages()
                this.sendSeenStatusToServer()
                // }

            } else if (event == 'session_end') {
                await this.setState({
                    chatroom_session: data,
                    spinner: false
                })
                if (data.started_by != null && data.ended_by == null) {
                    this.setState({
                        session_status: 'ongoing'
                    })

                    // Message listener
                    this.syncMessages()

                } else {
                    console.log("==== IF 2")
                    this.setState({
                        session_status: 'empty'
                    })
                }
            } else if (event == CHAT_COMMAND.CHAT_ROOM_SESSION) {
                // console.log("eventEmitManager", CHAT_COMMAND.CHAT_ROOM_SESSION, JSON.stringify(data))
                let _chatroom_session = ChatRoomSessionModel.update(data)

                // if (data.chat_request.length > 0) {
                //     this.setState({
                //         session_start: true,
                //         chatroom_session: data.chat_request[0]
                //     })
                // } else 
                if (data.session == null) {
                    this.setState({
                        chatroom_session: null,
                        session_status: 'empty'
                    })
                } else {
                    this.setState({
                        chatroom_session: _chatroom_session,
                    })
                    if (_chatroom_session.started_by != null && _chatroom_session.ended_by == null) {
                        console.log("==== IF")
                        this.setState({
                            session_status: 'ongoing'
                        })
                    } else {
                        console.log("==== ELSE")
                        this.setState({
                            session_status: 'empty'
                        })
                    }
                }
            } else if (event == CHAT_COMMAND.CHAT_REQUESTS) {
                // console.log("EventEmitManager Chat request", data)
                if (data.length > 0) {
                    let item = data[0]
                    if (parseInt(this.state.chatroom.patient.user_id) == parseInt(item.patient_id)) {
                        let _requests = ChatRequestModel.find_chat_request(parseInt(item.id))
                        if (_requests.length > 0) {
                            this.setState({
                                chat_request: _requests[0]
                            })
                        }
                    }
                }
            } else if (event == CHAT_COMMAND.CHAT_REQUEST_DELETED) {
                try {
                    // console.log("EventEmitManager Chat request deleted", data)
                    if (data == parseInt(this.state.chat_request.chat_request_id)) {
                        // Delete chat request fields
                        this.setState({
                            chat_request: null,
                            showChatRequestModal: false
                        })
                    }
                } catch (error) {
                    console.log("DoctorChat Screen - CHAT_COMMAND.CHAT_REQUEST_DELETED")
                    console.log(error)
                    this.setState({
                        chat_request: null,
                        showChatRequestModal: false
                    })
                }
            } else if (event == 'internet_connectivity') {
                console.log("eventEmitManager", event, data)
                this.setState({
                    isInternetConnected: data,
                    waiting_for_network: (data == false) ? true : false
                })
            }
        } catch (error) {
            console.log("DoctorChatScreen _eventEmitManagerHandler: ", error)
        }
    }

    /**
    * App State listener
    * @param nextAppState forward next app state
    */
    _handleAppStateChange = async (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log("\nChat Screen Foreground\n")

            //initial_timestamp_for_messages = null
            if (appSocket.is_connected() == true) {
                await this.getChatRoomSession()
            }

        } else {
            // console.log("\nChat Screen Background\n")
        }
        this.setState({ appState: nextAppState });
    };

    async getChatRoomSession() {
        // this.setState({ spinner: true })
        const userId = await appHelper.getItem("user_id");
        let params = {
            timestamp: 0,
            user_id: userId,
            app_user: 'doctor',
            chatroom_id: this.state.chatroom.id.toString()
        }
        // console.log("getChatRoomSession", this.state.chatroom.id)
        appSocket.chat_room_session(params)
        // this.setState({ spinner: false })
    }

    /**
     * Sync Messages from server
     * @param timestamp last timestamp of message
     */
    async syncMessages() {
        let userId = await appHelper.getItem("user_id");
        let max_timestamp = MessageModel.get_last_sent_timestamp()
        // console.log(max_timestamp)
        let params = {
            timestamp: moment(max_timestamp).utc(false).format('YYYY-MM-DD HH:mm:ss'),
            user_id: userId,
            app_user: 'doctor',
        }
        // console.log(params)
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
        // console.log("fetchChatMessages", this.state.chatroom.id)
        arrMessages = MessageModel.fetch_message(chatroom_id, initial_timestamp_for_messages)

        if (arrMessages.length > 0) {
            initial_timestamp_for_messages = arrMessages[(arrMessages.length - 1)].created_at
            console.log("Message Last", arrMessages[0].created_at)
            console.log("Message First", arrMessages[(arrMessages.length - 1)].created_at)
        }

        await this.setState({
            messages: this.getMappedMessages(arrMessages),
        })
        // console.log("this.state.messages")
        // console.log(this.state.messages);
    }

    async loadMoreMessage() {

        // console.log("DoctorChatScreen initial_timestamp_for_messages Timestamp", initial_timestamp_for_messages)
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

        // console.log("this.state.messages")
        // console.log(this.state.messages);
    }

    /**
     * Send Seen status to server
     */
    async sendSeenStatusToServer(chatroom) {
        // console.log("sendSeenStatusToServer",this.state.chatroom.id)

        let chatroom_id = 0
        if (this.state.chatroom.id != null) {
            chatroom_id = this.state.chatroom.id
        } else if (chatroom != null) {
            chatroom_id = chatroom
        }

        let userId = await appHelper.getItem("user_id");
        let chatroom_ids = []
        // console.log(" ==== After sendSeenStatusToServer", chatroom_id)
        chatroom_ids.push(chatroom_id)

        let params_x = {
            app_user: 'doctor',
            status: 'seen',
            type: 'chatrooms',
            user_id: userId,
            ids: chatroom_ids
        }
        // console.log("params", params_x)
        appSocket.message_delivered(params_x)
    }

    getMappedMessages = (data) => {
        if (!data) return
        return data.map((object) => {
            // var filename = (object.filename) ? BaseUrl.url + 'images/' + object.filename : '';
            // console.log("Chat Screen - getMappedMessages", object.body, JSON.stringify(object.status))
            // console.log("Message Type", object.body, object.sub_message_type, object.message_type)
            // console.log(object.chatroom_session.chatroom_session_id)
            // console.log(JSON.stringify(object.status))
            let data = {
                _id: object._id + Math.round(Math.random() * 100000000),
                createdAt: moment(object.created_at).utc(true).format('YYYY-MM-DDTHH:mm:ss'),
                // is_diagnosis: object.is_diagnosis,
                // is_notes: object.is_notes,
                // system: (object.message_type == "system") ? true : false,
                system: false,
                message_type: object.message_type,
                sub_message_type: object.sub_message_type
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
            return data;
        });
    }

    async onSend(messages) {
        //console.log("Chat Screen - onSend", messages)

        // Store local message
        let message_object = this.create_message_object(messages, 'text')

        // Send message to server 
        // appSocket.invoke_callbacks('sync_messages', null)

        this.send_message(messages, 'text')

        // let user_data = JSON.parse(await appHelper.getItem('user_data'));
        // messages[0]['patient_id'] = this.state.patients.patient_id;
        // messages[0]['name'] = user_data.name;
        // messages[0]['avatar'] = user_data.avatar ? user_data.avatar : BaseUrl.url + 'images/dummy.png';

        // await global.socket.emit("send message", messages);
        // this._fetchData();
        // await global.socket.emit("chat_reload", this.state.patients.patient_id.toString());

        this.setState({
            composerText: "",
            showOptions: true
        })
    }

    async create_message_object(messages, type) {
        let user_id = await appHelper.getItem("user_id");
        // Set Message listener 
        let params = {
            sender: this.state.chatroom_session.chatroom.doctor,
            receiver: this.state.chatroom_session.chatroom.patient,
            body: messages[0].text,
            message_type: type,
            _id: messages[0]._id,
            chatroom: this.state.chatroom_session.chatroom,
            chatroom_session: this.state.chatroom_session,
            created_at: moment(messages[0].createdAt).utc(false).format('YYYY-MM-DDTHH:mm:ss'),
            status: {
                user: this.state.chatroom_session.chatroom.doctor,
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
            sender_id: this.state.chatroom_session.chatroom.doctor.user_id,
            receiver_id: this.state.chatroom_session.chatroom.patient.user_id,
            message_type: type,
            chatroom_id: this.state.chatroom_session.chatroom.id,
            chatroom_session_id: this.state.chatroom_session.chatroom_session_id,
            _id: messages[0]._id,
            app_user: 'doctor',
        }
        appSocket.message_send(paramsMessage)
    }


    is_typing(text) {
        //console.log("is_typing", (text.length > 0) ? true : false)
        if (this.state.chatroom != null) {
            this.setState({ showpopupmenu: false })
            // console.warn('user_id', this.state.user_id)
            // console.log("is_typing", this.state.chatroom.id)
            this.setState({ composerText: text }, function () {
                appSocket.user_typing({
                    is_typing: (text.length > 0) ? true : false,
                    user_id: this.state.chatroom.patient.user_id,
                    chatroom_id: this.state.chatroom.id,
                    app_user: 'doctor'
                })
                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                    appSocket.user_typing({
                        is_typing: false,
                        user_id: this.state.chatroom.patient.user_id,
                        chatroom_id: this.state.chatroom.id,
                        app_user: 'doctor'
                    })
                }, 5000);
            })

            if (text.length > 0) {
                if (this.state.showOptions == true) {
                    this.setState({ showOptions: false })
                }
            } else {
                this.setState({ showOptions: true })
            }
        }
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
    _hideSessionModal = () => this.setState({ visibleSession: false });

    renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                textStyle={{
                    right: {
                        color: 'black',
                    },
                    left: {
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
        // this._showPopupMenu();
        // console.log(this.state.chatroom_session.session_expired_at)
        // console.log(this.state.chatroom_session.session_type)

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

    _requestEndSession = async () => {
        this.setState({ spinner: true })
        // Check socket is connected
        if (appSocket.is_connected() != true) {
            this.setState({ spinner: false })
            return;
        }

        let userId = await appHelper.getItem("user_id");
        let params = {
            timestamp: 0,
            user_id: userId,
            app_user: 'doctor',
            chatroom_id: this.state.chatroom.id.toString(),
            chatroom_session_id: this.state.chatroom_session.chatroom_session_id.toString()
        }
        // console.log("_requestEndSession", this.state.chatroom.id)
        appSocket.session_end(params)
        return;
    }

    _viewMedia = () => {
        this._showPopupMenu();
        this.props.navigation.navigate('Media', { chatroom: this.state.chatroom })
    }

    _viewProfile = () => {
        this._showPopupMenu();
        this.props.navigation.navigate('PatientProfileChat', { patient_id: this.state.chatroom.patient.user_id })
    }

    handleBack = () => {

        this.props.navigation.goBack(null);
        let { onGoBack } = this.props.navigation.state.params;
        if (onGoBack) {
            onGoBack();
        }
        return;
    }

    // Upload Photo
    async postMultipart(url, image_path, callback = null) {

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
                let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                console.log("Percentage:" + percentCompleted)
                // do whatever you like with the percentage complete
                // maybe dispatch an action that will update a progress bar or something
            }
        }

        // Request
        try {
            let res = axios.post(url, formData, _headers)
            const { data, status } = await res;
            // console.log(data, status)
            let final_url = data.data.base_url + data.data.image_name
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

    async postMultipartAudio(url, path, callback = null) {

        // console.log(url, path)
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
                let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                console.log("Percentage:" + percentCompleted)
                // do whatever you like with the percentage complete
                // maybe dispatch an action that will update a progress bar or something
            }
        }

        // Request
        try {
            let res = axios.post(url, formData, _headers)
            const { data, status } = await res;
            // console.log(data, status)
            let final_url = data.data.base_url + data.data.audio_name
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

    renderFooter(props) {

        const { currentMessage } = props

        if (currentMessage.system) {
            return null
        }

        if (currentMessage.received) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={require('../../src/assets/icons/tick-delivered.png')} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        }
        else if (currentMessage.sent) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={require('../../src/assets/icons/tick-sent.png')} style={{ width: 10, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        } else if (currentMessage.pending) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={require('../../src/assets/icons/tick-pending.png')} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        }
    }

    voiceRecordingHandler(param) {
        permissions.write_external_storage((key, message) => {
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
            console.log("Chat Screen - audioOutputHandler - Upload Error", error)
        }

    }

    renderComposer = props => {
        const { isStartingRecording } = this.state

        if (this.state.chat_request != null) {
            return (
                <View style={{ height: hp(5.2), backgroundColor: colors.aliceBlue, flexDirection: 'row', flex: 1, justifyContent: 'flex-end', paddingRight: wp(2), borderTopWidth: 0, borderColor: colors.white }} >
                    <View style={{ width: 'auto', backgroundColor: colors.btnBgColor, borderRadius: wp(1.5), paddingHorizontal: wp(3), marginVertical: wp(1.5) }}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                            onPress={() => {
                                if (this.state.chat_request != null) {
                                    this.setState({
                                        showChatRequestModal: true
                                    })
                                }
                            }}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: hp('2%'), color: colors.white, textAlign: 'center', textTransform: "uppercase", }}>Show Request</Text>
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
                                this._requestStartFollowUpSession()
                            }}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: hp('2%'), color: colors.white, textAlign: 'center', textTransform: "uppercase", }}>Start Session</Text>
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
        console.log("toggleDropdown show");
        // NAVIAGTE TO SETTINGS PAGE
        this.setState({ toggleDropdown: !this.state.toggleDropdown, })
    }

    handleDropdownNavPress = (route) => {
        // NAVIAGTE TO *** PAGE
        let params = null
        if (route == "Media") {
            params = { chatroom: this.state.chatroom }
        } else if (route == "ProfileView") {
            params = { profile: this.state.chatroom.patient, }
        }
        this.setState({
            toggleDropdown: false
        })
        this.props.navigation.navigate(route, params);
    }

    /**
     * Request
     */
    handleAcceptRequest = async () => {

        try {
            const { chat_request } = this.state;

            // let message = "";
            if (chat_request != null) {

                // this.closePopup();
                // this._requestAcceptChatRequest()

                let message = ''
                
                if (parseInt(chat_request.free_interaction) == 1) {
                    message = `You will receive PKR ${chat_request.package_amount} for this session. The patient gets a free chat session with you.`
                    // message = `Charges for this session are PKR ${chat_request.package_amount} as first session is 50% off. Proceed?`
                } else {
                    message = strings.doctor.freeInteractionConfirmation
                }
                Alert.alert(
                    '',
                    message,
                    [
                        {
                            text: 'No',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        {
                            text: 'Yes', onPress: () => {
                                this.closePopup();
                                this._requestAcceptChatRequest()
                            }
                        },
                    ],
                    { cancelable: false },
                );
            }
        }
        catch (error) {
            console.log("DoctorChatScreen - handleAcceptRequest", error)
        }
    }

    handleRejectRequest = async () => {
        Alert.alert(
            '',
            'Confirm Reject?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Yes', onPress: () => {
                        this.closePopup();
                        this._requestRejectChatRequest()
                    }
                },
            ],
            { cancelable: false },
        );
        // this.closePopup();
        // this._requestRejectChatRequest()
    }

    closePopup = () => {
        this.setState({ showChatRequestModal: false, });
    }

    /**
     * Reject Chat request
     */
    _requestRejectChatRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { chat_request } = this.state
        try {
            var params = {
                access_token: access_token,
                status: 'rejected',
                request_id: chat_request.chat_request_id,
            }
            // this.setState({ spinner: true })
            // console.log("Param", params)
            const res = await API.post(API_URL.DOCTOR_REJECT_REQUEST, params)
            if (res) {
                const data = res;
                console.warn(data)
                if (data.status == 'Success') {
                    this.closePopup()
                    this.setState({
                        chat_request: null,
                    })
                    this.deleteChatRequest(parseInt(params.request_id))
                    ChatRoomModel.set_active_inactive_chatroom(parseInt(data.data.chatroom_id), false)
                    this.getChatRoomSession()

                    this.syncMessages()
                }
                else if (data.status == 'Error') {
                    Alert.alert(' ', data.message);
                }
            }
            // setTimeout(() => {
            //     this.setState({ spinner: false })
            // }, 200);

        }
        catch (error) {
            // this.setState({ spinner: false })
            console.log(error)
        }
    }

    /**
     * Accept Chat request
     */
    _requestAcceptChatRequest = async () => {
        const user_id = await appHelper.getItem("user_id");
        const access_token = await appHelper.getItem("access_token");
        const { chat_request } = this.state
        try {
            // this.setState({ spinner: true }) // spinner removed for now on session accept
            var params = {
                access_token: access_token,
                status: 'accepted',
                request_id: parseInt(chat_request.chat_request_id),
            }
            const res = await API.post(API_URL.DOCTOR_ACCEPT_REQUEST, params)
            if (res) {
                const data = res;
                if (data.status == 'Success') {

                    // console.log(data)

                    this.closePopup()
                    this.setState({
                        chat_request: null
                    })

                    let chatroom = ChatRoomModel.find_chatroom(parseInt(user_id), parseInt(chat_request.patient.user_id))
                    this.deleteChatRequest(params.request_id)

                    if (chatroom.length > 0) {
                        let _chatroom = ChatRoomModel.set_active_inactive_chatroom(chatroom[0].id, true)
                    }

                    this.syncMessages()

                    // Creating Session
                    ChatRoomSessionModel.create(data.data)

                    this.getChatRoomSession()
                }
                else if (data.status == 'Error') {
                    Alert.alert(' ', data.message);
                }
            }
            // this.setState({ spinner: false }) // spinner removed for now on session accept
        }
        catch (error) {
            // this.setState({ spinner: false }) // spinner removed for now on session accept
            console.warn(error)
        }
    }

    deleteChatRequest(id) {
        // console.log("chat_request_id = " + id)
        ChatRequestModel.delete(id)
    }

    /**
     * Follow up session by Doctor
     */
    _requestStartFollowUpSession = async () => {
        this.setState({ spinner: true })
        const params = {
            query: session_follow_up_query,
            chatroom_id: parseInt(this.state.chatroom.id),
            patient_id: parseInt(this.state.chatroom.patient.user_id),
            doctor_id: parseInt(this.state.chatroom.doctor.user_id),
        }
        // console.log(params)

        try {
            const data = await API.post(API_URL.DOCTOR_FOLLOW_UP, params)
            console.log("===================");
            console.log("_requestStartFollowUpSession data.data =", data);
            console.log("===================");

            this.setState({ spinner: false }, () => {
                if (data.error == 10) {
                    session_follow_up_query = 'start'
                    // show popup
                    Alert.alert("Follow Up",
                        'You can now follow up with your patients in a free, timed session which will expire automatically if not ended within 12 hours.',
                        [
                            { text: 'Cancel', onPress: () => { return null } },
                            {
                                text: 'Continue', onPress: () => {
                                    this._requestStartFollowUpSession()
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                } else if (data.error == 0) {

                    // console.log("Started")

                    let chatroom = ChatRoomModel.find_chatroom(parseInt(this.state.chatroom.doctor.user_id), parseInt(this.state.chatroom.patient.user_id))
                    if (chatroom.length > 0) {
                        let _chatroom = ChatRoomModel.set_active_inactive_chatroom(chatroom[0].id, true)
                    }

                    this.syncMessages()

                    // Creating Session
                    ChatRoomSessionModel.create(data.data)

                    this.getChatRoomSession()
                } else {
                    this.setState({ spinner: false })
                    Alert.alert("",
                        data.message,
                        [
                            { text: 'Ok', onPress: () => { return null } },
                        ],
                        { cancelable: false }
                    )
                }
            })

        } catch (error) {
            this.setState({ spinner: false })
            console.log("_requestStartFollowUpSession", error)
        }
    }

    // Function for ImageView if user click on image
    openImageViewer(images) {
        // set state of showImageViewer === true
        // set state of imageUrls === images

        console.log("Clicked ===== ")

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

    handleUrlPress(url, matchIndex /*: number*/) {
        console.log(url);
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

    handlePhonePress(phone, matchIndex /*: number*/) {
        // console.log(`${phone} has been pressed!`);
    }

    handleEmailPress(email, matchIndex /*: number*/) {
        // console.log(`Hello ${email}`);
    }

    // Prescription View Handler
    callbackHandlerMedicinePrescribed = (data) => {
        this.props.navigation.navigate('PrescriptionView', data)
    }

    render() {
        const { navigation } = this.props;
        const { chatroom, waiting_for_network, toggleDropdown, navlistItems, isInternetConnected } = this.state;
        var status = null

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
                <List>
                    <ListItem noIndent>
                        <Text style={styles.listItems} onPress={() => this._viewProfile()}>View Profile</Text>
                    </ListItem>
                    <ListItem noIndent>
                        <Text style={styles.listItems} onPress={() => this._viewMedia()}>View Media</Text>
                    </ListItem>
                </List>
            </View>;
        }

        return (
            <TouchableWithoutFeedback onPress={() => { this.setState({ showpopupmenu: false }) }}>
                <Container>
                    <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                        {/* NAVIGATION HEADER */}
                        <NavigationBar
                            //title={(chatroom == null) ? "" : chatroom.patient.name}
                            context={this.props}
                            removeBackButton={false}
                            backButton={true}
                            onBackButtonPress={() => {
                                // if user comes from doctor closing notes screen.
                                let closing_notes_chatroom_session_id = navigation.getParam('closing_notes_chatroom_session_id', null);
                                if (closing_notes_chatroom_session_id != null) {
                                    let _params = {
                                        chatroom_session_id: closing_notes_chatroom_session_id
                                    }
                                    this.props.navigation.navigate('DoctorClosingNote', { data: _params })
                                } else {
                                    // normal navigation
                                    this.saveComposerText()
                                    this.props.navigation.navigate('Home')
                                }
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
                                                <View style={styles.imageContainer}>

                                                    <AsyncImageView
                                                        style={styles.profileImage}
                                                        width={"100%"}
                                                        height={"100%"}
                                                        directory={"images"}
                                                        url={chatroom == null ? "" : chatroom.patient.image_url}
                                                        placeholderImage={require('../assets/images/dummy.png')}
                                                        onBegin={(res) => {
                                                            console.log("Begin", res)
                                                        }}
                                                        onProgress={(res) => {
                                                            console.log("DoctorChat Screen Progress", res)
                                                        }}
                                                        onFinish={(res) => {
                                                            console.log("Finish", res)
                                                        }}
                                                    />
                                                </View>
                                                <View style={{ marginLeft: 10, width: (this.state.session_status == 'ongoing') ? "45%" : "90%" }}>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ color: '#fff', fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold }}>{(chatroom == null) ? "" : chatroom.patient.name}</Text>
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
                                                _id: this.state.chatroom.doctor.user_id,
                                                avatar: this.state.chatroom.doctor.image_url,
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
                                                        console.log("load new messages")
                                                        // this.setState({ refreshing: true });
                                                        this.loadMoreMessage();
                                                    }
                                                }
                                            }}
                                            parsePatterns={(linkStyle) => [
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
                        </View>
                        {/* DROPDOWN NAVLIST */}
                        {
                            toggleDropdown ?
                                <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, position: "absolute", right: wp(2), top: hp(5.5), width: wp(30), paddingHorizontal: 0, paddingVertical: hp(0), borderRadius: wp(1), zIndex: 9999999, }]}>
                                    {
                                        navlistItems.map((item, i) => (
                                            <View key={i}>
                                                <TouchableOpacity onPress={() => this.handleDropdownNavPress(item.routeLink)} style={[
                                                    ((navlistItems.length - 1) == i) ? null : globalStyle.borderBottomGray,
                                                    { paddingVertical: hp(1.5), paddingHorizontal: wp(1.5), }]}>
                                                    <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), color: '#888c90', }}>{item.label}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    }
                                </View>
                                :
                                null
                        }

                        {/* NEW CHAT REQUEST POPUP */}
                        {
                            this.state.chat_request == null
                                ? null
                                : <NewChatRequestPopup
                                    showPopup={this.state.showChatRequestModal}
                                    onPressAccept={this.handleAcceptRequest}
                                    onPressReject={this.handleRejectRequest}
                                    data={this.state.chat_request}
                                    onPressCancel={this.closePopup}
                                />
                        }

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
                                                console.log("Doctor Chat Screen  Progress", res)
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
            </TouchableWithoutFeedback>
        );
    }
}

export default DoctorChatScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    chatBackground: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
    },
    headerBackground: {
        backgroundColor: '#ffffff',
        height: hp('12%'),
        justifyContent: 'center',
    },
    headerView: {
        flex: 1,
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