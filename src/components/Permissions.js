
import {
    Platform,
} from 'react-native';
import { check, PERMISSIONS, RESULTS, openSettings, request } from 'react-native-permissions';


const NOT_AVAILABLE = "This feature is not available on this device"
const DENIED = "Permission denied"
const GRANTED = "Permission granted"
const BLOCKED = "Permission denied"

/**
 * Check Microhpone
 */
async function microphone(callback) {
    // Android
    if (Platform.OS === 'android') {
        check(PERMISSIONS.ANDROID.RECORD_AUDIO)
            .then((result) => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        console.log('==== PERMISSIONS.ANDROID.MICROPHONE This feature is not available (on this device / in this context)',);
                        callback("unavailable", NOT_AVAILABLE)
                        break;
                    case RESULTS.DENIED:
                        console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission has not been requested / is denied but requestable',);

                        request(PERMISSIONS.ANDROID.RECORD_AUDIO).then((result_inner) => {
                            switch (result_inner) {
                                case RESULTS.GRANTED:
                                    console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission is granted');
                                    callback("granted", GRANTED)
                                    break;
                                case RESULTS.BLOCKED:
                                    console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission is denied and not requestable anymore');
                                    callback("blocked", BLOCKED)
                                    break;
                            }
                        });

                        break;
                    case RESULTS.GRANTED:
                        console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission is granted');
                        callback("granted", GRANTED)
                        break;
                    case RESULTS.BLOCKED:
                        console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission is denied and not requestable anymore');
                        callback("blocked", BLOCKED)
                        break;
                }
            })
            .catch((error) => {
                console.log('==== PERMISSIONS.ANDROID.MICROPHONE Catch Error');
                console.log(error);
                callback("error", error.message)
            });
    }
    else if (Platform.OS === 'ios') {
        check(PERMISSIONS.IOS.MICROPHONE)
            .then((result) => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        console.log('==== PERMISSIONS.IOS.MICROPHONE This feature is not available (on this device / in this context)',);
                        callback("unavailable", NOT_AVAILABLE)
                        break;
                    case RESULTS.DENIED:
                        console.log('==== PERMISSIONS.IOS.MICROPHONE The permission has not been requested / is denied but requestable',);

                        request(PERMISSIONS.IOS.MICROPHONE).then((result_inner) => {
                            switch (result_inner) {
                                case RESULTS.GRANTED:
                                    console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission is granted');
                                    callback("granted", GRANTED)
                                    break;
                                case RESULTS.BLOCKED:
                                    console.log('==== PERMISSIONS.ANDROID.MICROPHONE The permission is denied and not requestable anymore');
                                    callback("blocked", BLOCKED)
                                    break;
                            }
                        });

                        break;
                    case RESULTS.GRANTED:
                        console.log('==== PERMISSIONS.IOS.MICROPHONE The permission is granted');
                        callback("granted", GRANTED)
                        break;
                    case RESULTS.BLOCKED:
                        console.log('==== PERMISSIONS.IOS.MICROPHONE The permission is denied and not requestable anymore');
                        callback("blocked", BLOCKED)
                        break;
                }
            })
            .catch((error) => {
                console.log('==== PERMISSIONS.IOS.MICROPHONE Catch Error');
                console.log(error);
                callback("error", error.message)
            });
    }
}

/**
 * Write External Storage for Android
 * @param callback callback 
 */
async function write_external_storage(callback) {
    // Android
    if (Platform.OS === 'android') {
        check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
            .then((result) => {
                switch (result) {
                    case RESULTS.UNAVAILABLE:
                        console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE This feature is not available (on this device / in this context)',);
                        callback("unavailable", NOT_AVAILABLE)
                        break;
                    case RESULTS.DENIED:
                        console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE The permission has not been requested / is denied but requestable',);

                        request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((result_inner) => {
                            switch (result_inner) {
                                case RESULTS.GRANTED:
                                    console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE The permission is granted');
                                    callback("granted", GRANTED)
                                    break;
                                case RESULTS.BLOCKED:
                                    console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE The permission is denied and not requestable anymore');
                                    callback("blocked", BLOCKED)
                                    break;
                            }
                        });

                        break;
                    case RESULTS.GRANTED:
                        console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE The permission is granted');
                        callback("granted", GRANTED)
                        break;
                    case RESULTS.BLOCKED:
                        console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE The permission is denied and not requestable anymore');
                        callback("blocked", BLOCKED)
                        break;
                }
            })
            .catch((error) => {
                console.log('==== PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE Catch Error');
                console.log(error);
                callback("error", error.message)
            });
    } else {
        // By default true
        callback("granted", "")
    }
}

// Export Function
export default {
    microphone,
    write_external_storage
}