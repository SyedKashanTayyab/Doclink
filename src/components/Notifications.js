import React, { Component } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import appHelper from '../utils/AppHelper';
//import { NotificationToken } from '../api/Patient';
import RatingScreen from '../screens/RatingScreen';
import AppInfo from '../modules/AppInfoNativeModule';
import PushNotification from "react-native-push-notification";
import ShortcutBadge from 'react-native-app-badge';

/**
 * React native badge for both iOS and Android
 * https://github.com/hoang-nguyen2-niteco/react-native-app-badge
 * 
 * Reference
 * https://rnfirebase.io
 * 
 * @react-native-community/push-notification-ios
 * https://github.com/react-native-push-notification-ios/push-notification-ios
 */

export default class Notification extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            visible: false
        }
    }

    async componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners();
    }

    async componentDidMount() {

        this.checkPermission();

        // Create notification listerner
        this.createNotificationListeners();
    }

    componentWillUnmount() {
        // this.notificationListener();
        // console.warn('notification component unmounted')
        // await firebase.notifications().unsubscribe();
        // this.notificationDisplayedListener();
        // this.notificationOpenedListener();
        // this.notificationListener()
    }

    async checkPermission() {
        const enabled = await messaging().hasPermission()
        if (enabled == 1) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    async getToken() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        if (!fcmToken) {
            fcmToken = await messaging().getToken()
            if (fcmToken) {
                // user has a device token
                await AsyncStorage.setItem('fcmToken', fcmToken);
                // Add Token To User Table
            }
        }
    }

    async requestPermission() {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled == 1) {
                console.log('Authorization status:', authStatus);
                this.getToken();
            }
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }

    async notificationBadge(number) {
        if (Platform.OS === 'android') {
            if (number == 0) {
                ShortcutBadge.setCount(number);
            } else {
                ShortcutBadge.getCount((count) => {
                    ShortcutBadge.setCount(count + number);
                });
            }
        } else {
            console.log("notificationBadge", number)
            if (number == 0) {
                PushNotificationIOS.setApplicationIconBadgeNumber(number);
            } else {
                console.log("else")
                PushNotificationIOS.getApplicationIconBadgeNumber(count => {
                    console.log("else set")
                    PushNotificationIOS.setApplicationIconBadgeNumber(number + count);
                    console.log("else set ok")
                });
            }
        }
    }

    /**
     * Triggered when a particular notification has been received in foreground 
     */
    async createNotificationListeners() {

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        // console.warn("--- 0 ")

        messaging()
            .getInitialNotification()
            .then(remoteMessage => {

                // console.warn("--- 0.1", remoteMessage)
                // Remove all notifications
                PushNotification.cancelAllLocalNotifications()

                // reset count
                this.notificationBadge(0)

                if (remoteMessage) {
                    console.warn("--- 1 ")
                    const { title, body, data, notification } = remoteMessage;

                    console.log(remoteMessage)
                    console.log("* Triggered when a particular notification has been received in foreground ")
                    this.handleNotifications(data, true);
                }
            });

        // console.warn("--- 1")
        /**
         * Android Channel
         */

        // const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
        //     .setDescription('My apps test channel');
        // // Create the channel
        // firebase.notifications().android.createChannel(channel);

        /**
         * App is in foreground
         */
        messaging().onMessage(async remoteMessage => {
            console.log("--- 2", JSON.stringify(remoteMessage))
            //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
            if (remoteMessage) {
                const { title, body, data } = remoteMessage;
                console.log("title", title)
                console.log("body", body)
                console.log("data", data)
                this.handleNotifications(data, false);
            }
        });

        /**
         * App is in Background
         */
        // console.warn("--- 3 ")
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log("==================================================");
            console.log("--- 3", JSON.stringify(remoteMessage))
            console.log('Message handled in the background!', remoteMessage);
            console.log("==================================================");

            // increase count
            this.notificationBadge(1)

            // console.log(`////////////////////////////////////////////////////////
            // ////////////////////////////////////////////////////////`);
            // console.warn('Message handled in the background! remoteMessage.data.chatroom_id ==>', remoteMessage.data.chatroom_id);

            ////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////

            // try {
            //     // POP UP NOTIFICATION
            //     PushNotification.localNotification({
            //         data: remoteMessage.data,
            //         showWhen: true, // (optional) default: true
            //         autoCancel: true, // (optional) default: true
            //         smallIcon: '@drawable/ic_stat_name', // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
            //         // subText: notification.subText, // (optional) default: none
            //         // color: '#8000ff', // (optional) default: system default
            //         vibrate: true, // (optional) default: true
            //         vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
            //         group: remoteMessage.data.chatroom_id, // (optional) add group to message
            //         ongoing: false, // (optional) set whether this is an "ongoing" notification
            //         priority: "high", // (optional) set notification priority, default: high
            //         visibility: "private", // (optional) set notification visibility, default: private
            //         importance: "high", // (optional) set notification importance, default: high
            //         allowWhileIdle: false, // (optional) set notification to work while on doze, default: false
            //         ignoreInForeground: false, // (optional) if true, the notification will not be visible when the app is in the foreground (useful for parity with how iOS notifications appear)
            //         channelId: remoteMessage.data.chatroom_id, // (optional) custom channelId, if the channel doesn't exist, it will be created with options passed above (importance, vibration, sound). Once the channel is created, the channel will not be update. Make sure your channelId is different if you change these options. If you have created a custom channel, it will apply options of the channel.
            //         onlyAlertOnce: false, //(optional) alert will open only once with sound and notify, default: false
            //         messageId: remoteMessage.messageId,
            //         invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true
            //         alertAction: "view", // (optional) default: view
            //         category: "", // (optional) default: empty string
            //         title: remoteMessage.notification.title, // (optional)
            //         message: remoteMessage.notification.body, // (required)
            //         userInfo: {}, // (optional) default: {} (using null throws a JSON value '<null>' error)
            //         playSound: true, // (optional) default: true
            //         soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
            //     });

            //     // GROUP SUMMARY 
            //     const groupObj = PushNotification.localNotification({
            //         channelId: remoteMessage.data.chatroom_id,
            //         id: remoteMessage.data.chatroom_id,
            //         group: remoteMessage.data.chatroom_id,
            //         // subText: notification.subText,
            //         // smallIcon: '@drawable/ic_stat_name',
            //         // color: '#8000ff',
            //         groupSummary: true,
            //         title: remoteMessage.notification.title, // (optional)
            //         message: remoteMessage.notification.body, // (required)
            //         data: remoteMessage.data,

            //     });

            //     PushNotification.getDeliveredNotifications((_all_noti) => {
            //         console.log("=======================");
            //         console.log("getDeliveredNotifications", _all_noti);
            //         console.log("=======================");
            //     })

            // } catch (error) {
            //     console.log("=======================");
            //     console.log("error ==>", error);
            //     console.log("=======================");
            // }



            // try {
            //     PushNotification.setbac
            //     const groupNotificationId = remoteMessage.messageId
            //     const body = remoteMessage.notification.body
            //     const smallIcon = 'ic_launcher'
            //     const color = '#FF00FF'

            //     const groupNotification = new firebase.notifications.Notification()
            //         .setNotificationId(groupNotificationId)
            //         .setSubtitle(body) // This is setSubText(..) in Android
            //     groupNotification
            //         .android.setGroup(groupNotificationId)
            //         .android.setGroupSummary(true)
            //         .android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)
            //         .android.setChannelId('chat')
            //         .android.setSmallIcon(smallIcon)
            //         .android.setAutoCancel(true)
            //         .android.setColor(color)

            //     const title = 'Test Chat'
            //     const desc = 'User A added comment: Hello'
            //     const nid = '1001' // nid + tag is a composite key to identify the notification
            //     const tag = 'Test tag'

            //     const notification = new firebase.notifications.Notification()
            //         .setNotificationId(nid)
            //         .setTitle(title)
            //         .setBody(desc)
            //     notification
            //         .android.setBigText(desc)
            //         .android.setAutoCancel(true)
            //         .android.setChannelId('chat')
            //         .android.setTag(tag)
            //         .android.setGroup(groupNotificationId)
            //         .android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)


            //     firebase.notifications().displayNotification(groupNotification)
            //     firebase.notifications().displayNotification(notification)
            // } catch (error) {
            //     console.log("=======================");
            //     console.log("error ==>", error);
            //     console.log("=======================");
            // }
            ////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////
        });


        /**
         * When user tapped on notification
         */
        messaging().onNotificationOpenedApp(remoteMessage => {

            // Remove all notifications
            PushNotification.cancelAllLocalNotifications()

            // reset count
            this.notificationBadge(0)

            console.warn("--- 4", JSON.stringify(remoteMessage))
            // console.log(
            //     'Notification caused app to open from background state:',
            //     remoteMessage.notification,
            // );

            if (remoteMessage) {
                const { title, body, data } = remoteMessage;
                this.handleNotifications(data, true);
            }
        });


        // this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification) => {
        //     // Process your notification as required
        //     // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
        //     console.warn("--- 2.1 ")

        //     // Remove All delivered notifcation
        //     setTimeout(() => {
        //         firebase.notifications().removeAllDeliveredNotifications();
        //     }, 1000);
        // });

        /**
         * Hanlde custom things
         */
        // console.warn("--- 3 ")
        // this.notificationListener = firebase.notifications().onNotification((notification) => {

        //     console.warn("--- 3.1 ")

        //     const { title, body, data, notificationId } = notification;

        //     // notification
        //     //     .android.setChannelId('test-channel')
        //     //     .android.setSmallIcon('ic_launcher');

        //     // firebase.notifications()
        //     //     .displayNotification(notification)
        //     //     .catch(err => console.error(err));

        //     this.handleNotifications(data, false);

        //     // // Remove All delivered notifcation
        //     // firebase.notifications().removeAllDeliveredNotifications()

        // });

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        // console.warn("--- 4 ")
        // this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {

        //     console.warn("--- 4.1")
        //     if (notificationOpen) {
        //         const { title, body, data, notificationId } = notificationOpen.notification;
        //         this.handleNotifications(data, true);
        //     }

        //     // Remove All delivered notifcation
        //     firebase.notifications().removeAllDeliveredNotifications()
        //     //firebase.notifications().removeDeliveredNotification(notification.notificationId);
        // });

        /*
        * Triggered for data only payload in foreground
        * */
        // this.messageListener = await firebase.messaging().onMessage((message) => {
        //     //process data message
        //     // Alert.alert("Notification", JSON.stringify(message))
        //     // console.warn('messages ---- ');
        // });
    }

    async handleNotifications(data, opened) {

        if (data.type) {
            console.log("handleNotifications", opened, data)
            if (data.type == "delete_request_chat") {
                // Data passed on home screen
                this.props.onChange(data)
            }
            if (data.type == "new_request_chat") {
                // Data passed on home screen
                this.props.onChange(data)
            }
            if (data.type == "follow_up_session") {
                // Data passed on home screen
                this.props.onChange(data)
            }
            if (data.type == "rejected_request_chat") {
                // Data passed on home screen
                this.props.onChange(data)
            }

            if (data.type == "accepted_request_chat") {
                // Data passed on home screen
                this.props.onChange(data)
            }

            if (data.type == "message" && opened == true) {
                this.props.onChange(data)
            }

            if (data.type == "reminder_follow_up" && opened == true) {
                this.props.onChange(data)
            }

            if (data.type == "reminder_follow_up" && opened == true) {
                this.props.onChange(data)
            }

            if (data.type == "doctor_stats" && opened == true) {
                this.props.onChange(data)
            }

            return;
            // Notification Type


            if (data.type == "session_ended") {
                global.navigation.navigate('Rating', { data: data });
            }
            if (data.type == "closing_note" && !opened) {
                console.warn(global.navigation.state)
                // this.props.onChange(data)
                this.setState({
                    data: data,
                    visible: true
                });


                // global.navigation.navigate('DoctorSessionEnded', { data: data.session_id });
            }
            if (data.type == "message" && !opened) {
                // console.error(data);
                if (data.patient_id) {
                    global.navigation.navigate('Chat', { doctors: data });
                }

                if (data.doctor_id) {
                    global.navigation.navigate('Chat', { patients: data });
                }
            }
            if (data.type == "top_up" && !opened) {
                global.navigation.navigate('Wallet');
            }
            if (data.type == "closing_note" && opened) {

                global.navigation.navigate('Home');

                this.setState({
                    data: data,
                    visible: true
                });

            }


            return;
        }
    }

    showAlert(title, body, data) {
        console.warn('notification', title, body)
    }

    handleCloseModal = () => {


        this.setState({
            data: [],
            visible: false
        })
    }

    render() {

        return (
            AppInfo.TARGET == "patient" && this.props.screenName == "PatientHome" ?
                // <RatingScreen data={this.state.data} visible={this.state.visible} onCloseModal={this.handleCloseModal} />
                <></>
                :
                null
        );
    }
}