import axios from 'axios';
import appHelper from '../utils/AppHelper'
import File from '../components/File'
import { KEYS, API_URL, BASE_URL, METHOD } from '../utils/Constant';

const RNFS = require('react-native-fs');
var moment = require('moment');

//
// Axios Client Const
//
const axiosClient = axios.create({ baseURL: BASE_URL })

/**
 * Timezone offset
 */
let _m = moment().utcOffset()
var quotient = Math.floor(_m / 60)
var reminder = Math.round(_m) % 60
let hours = (quotient > 9) ? quotient : "0" + quotient
let minutes = (reminder > 9) ? reminder : "0" + reminder
const timezoneUtcOffset = '+' + hours + ':' + minutes


//
// Request Headers
//
function getHeaders() {
    if (global.accessToken != null) {
        return {
            'access_token': global.accessToken,
            Accept: "application/json",
            timestamp: moment().utc(false).format('YYYY-MM-DD HH:mm:ss'),
            '_id': appHelper.guid(),
            timezone_offset: timezoneUtcOffset
        }
    }
    return {
        timestamp: moment().utc(false).format('YYYY-MM-DD HH:mm:ss'),
        '_id': appHelper.guid(),
        timezone_offset: timezoneUtcOffset
    }
}

/* DEBUG
console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
        console.log(response.headers);
        console.log(response.config);
*/



//
//  Get Request
// 	https://gist.github.com/fgilio/230ccd514e9381fafa51608fcf137253
// 
async function get(url, params) {
    try {
        let res = await axiosClient.get(url, { params: params, headers: getHeaders() })
        const { data, status } = await res;

        if (data.meta != null) {
            if (data.meta.count != null) {
                if (data.meta.count.notification_count != null) {
                    var notificationCount = data.meta.count.notification_count.toString()
                    await appHelper.setItem(KEYS.UNREAD_NOTIFICATION_COUNT, notificationCount)
                    global.notificationCount = parseInt(notificationCount);
                }
                if (data.meta.count.request_count != null) {
                    var requestCount = data.meta.count.request_count.toString()
                    await appHelper.setItem(KEYS.REQUEST_COUNT, requestCount)
                    global.request_count = parseInt(requestCount);
                }
            }
        }
        return data
    } catch (error) {
        // alert(error.message)
        // // console.log("b: " +error.request)
        if (error.response == null) {
            if (error.request.responseText == undefined) {
                console.log('a')
                throw error.message
            }
            throw error.request.responseText
        }
        var json = JSON.parse(error.request._response)
        throw json.message
    }
}

//
// Post Request
//
async function post(url, params, headers = null) {
    var _headers = (headers == null) ? getHeaders() : { ...getHeaders(), ...headers, }
    // Add Additional Information
    // params["device_identifier"] = global.deviceIdentifier
    try {
        let res = await axiosClient.post(url, params, { headers: _headers })
        const { data, status } = await res;
        return data
    } catch (error) {
        console.log(error.request)
        if (error.response == null) {
            console.log("Error 1")
            throw error.request.responseText
        }
        console.log("Error 2")
        var json = JSON.parse(error.request._response)
        throw json.message
    }
}

async function remove(url, params) {
    // Add Additional Information
    // params["device_identifier"] = global.deviceIdentifier
    try {
        let res = await axiosClient.delete(url, { params: params, headers: getHeaders() })
        const { data, status } = await res;
        return data
    } catch (error) {
        console.log(error.request)
        if (error.response == null) {
            console.log("Error 1")
            throw error.request.responseText
        }
        console.log("Error 2")
        var json = JSON.parse(error.request._response)
        throw json.message
    }
}


async function postMultipart(url, file_path, fields, callback = null, field_name = 'file') {

    const formData = new FormData();

    // Multipart form data fields
    fields.map((item) => (
        formData.append(item.key, item.value)
    ))

    if (file_path != null) {
        // URI
        const uri = file_path

        // Split with period '.'
        const uriParts = uri.split('.');
        const fileType = File.type(uriParts[uriParts.length - 1])
        console.log('fileType:', fileType)

        // Split with slash '/'
        const uriPartsSlash = uri.split('/');
        const fileName = uriPartsSlash[uriPartsSlash.length - 1];

        formData.append(field_name, {
            uri: uri,
            type: fileType,
            name: fileName
        });
    }

    console.log(formData)

    // Headers
    const _headers = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'access_token': global.accessToken,
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
        let res = await axiosClient.post(url, formData, _headers)
        const { data, status } = await res;
        // Return reponse
        return data
    } catch (error) {
        console.log(error.request)
        if (error.response == null) {
            throw error.request.responseText
        }
        var json = JSON.parse(error.request._response)
        return json.message
    }
}




async function download(url, file_type, callback = null) {

    let downlooad_destination = ""

    let dir_media = `${appHelper.getHomeDirectoryPath()}media/`
    let dir_media_audio = `${dir_media}audios/`
    let dir_media_images = `${dir_media}images/`

    let is_exits = await RNFS.exists(dir_media)
    if (is_exits == false) {
        await RNFS.mkdir(dir_media)
    }
    if (file_type == 'images') {
        is_exits = await RNFS.exists(dir_media_images)
        if (is_exits == false) {
            await RNFS.mkdir(dir_media_images)
        }
        downlooad_destination = dir_media_images
    } else if (file_type == 'audios') {
        is_exits = await RNFS.exists(dir_media_audio)
        if (is_exits == false) {
            await RNFS.mkdir(dir_media_audio)
        }
        downlooad_destination = dir_media_audio
    }

    const progress = data => {
        const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
        const text = `Progress ${percentage}%`;
        console.log('Progress', text)
    };

    const begin = res => {
        console.log("Download has begun")
    };

    let file_name = appHelper.fileNameFromUrl(url)
    let destination = `${downlooad_destination}${file_name}`
    console.log("Destination", destination);

    const progressDivider = 1;

    await RNFS.downloadFile({ fromUrl: url, toFile: destination, begin, progress, progressDivider })
        .promise.then(res => {
            console.log("download", JSON.stringify(res))
            console.log("download", destination)
            callback({ status: "success", path: destination })
            // return destination
            // RNFS.exists('file://' + destination)
            //     .then(data => {
            //         console.log("file exists", data)
            //     }).catch(error => {
            //         console.log("file exists Error", error)
            //         return ""
            //     })

            // jobId = -1;
        }).catch(err => {
            callback({ status: "error", message: err })
            console.log("Error", err)
            // jobId = -1;
        });
}



// Export
export default {
    get,
    post,
    remove,
    postMultipart,
    download
}