/**
 * @format
 */

import { AppRegistry } from 'react-native';
import PushNotification from 'react-native-push-notification';
import App from './App';
import { name as appName } from './app.json';

import AppInfo from './src/modules/AppInfoNativeModule';

PushNotification.channelExists('chat-request', (is_exists) => {
    console.log("chat-request", is_exists)
    if (is_exists == false) {
        PushNotification.createChannel(
            { channelId: "chat-request", channelName: "Chat Request", soundName: "new_request.mp3", importance: 4, vibrate: true },
            (created) => console.log(`createChannel chat-request returned '${created}'`)
        );
    }
})

PushNotification.channelExists('notifications', (is_exists) => {
    console.log("notifications", is_exists)
    if (is_exists == false) {
        PushNotification.createChannel(
            { channelId: "notifications", channelName: "notifications", soundName: "general.mp3", importance: 4, vibrate: true },
            (created) => console.log(`createChannel notifications returned '${created}'`)
        );
    }
})



var cl = console.log;
console.log = function (d) { //
    cl(AppInfo.TARGET + ': ', ...arguments);
    // console.log(moment().format('YYYY-MM-DD HH:mm:ss.SSSSS') + ':- ' + d);
};

AppRegistry.registerComponent(appName, () => App);
