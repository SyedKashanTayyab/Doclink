import { Alert, Dimensions } from 'react-native';
import axios from 'axios';
import AppInfo from '../modules/AppInfoNativeModule';

let environment = "staging" // live, staging, testing, development

let apiHost = ""
let apiVersion = "api/v1.3.18/" // Api version
let adminHost = ""

if (__DEV__) {
	if (environment == "live") {
		apiHost = "http://admin.doclink.health:3000/"
		adminHost = "https://admin.doclink.health/"
	} else if (environment == "staging") {
		apiHost = "http://45.249.8.93:3500/"
		adminHost = "http://45.249.8.93/doclink-admin/public/"
	} else {
		apiHost = "http://192.168.1.174:3000/"
		adminHost = "http://45.249.8.93/doclink-admin/public/"
	}
} else {
	if (environment == "live") {
		apiHost = "http://admin.doclink.health:3000/"
		adminHost = "https://admin.doclink.health/"
	} else if (environment == "staging") {
		apiHost = "http://45.249.8.93:3500/"
		adminHost = "http://45.249.8.93/doclink-admin/public/"
	} else {
		apiHost = "http://192.168.1.174:3000/"
		adminHost = "https://admin.doclink.health/"
	}
}

export const BASE_HOST = apiHost
export const BASE_API_VER = apiVersion
export const BASE_URL = apiHost + apiVersion

const BASE_URL_ADMIN = adminHost
export const BASE_URL_IMAGE = BASE_URL_ADMIN + "images/"
export const URL_IMAGE_UPLOAD = BASE_URL_ADMIN + "api/imageupload"
export const URL_MEDIA_UPLOAD = BASE_URL_ADMIN + "api/mediaupload"
export const URL_AUDIO_UPLOAD = BASE_URL_ADMIN + "api/audioupload"
export const URL_HBL_HOSTED_CHECKOUT = BASE_URL_ADMIN + "hbl/payment_form.php"
export const URL_EASYPAISA_HOSTED_CHECKOUT = BASE_URL_ADMIN + "hbl/easypaisa.php"

export const APP_STORE_URL = {
	ANDROID_PATIENT: "https://play.google.com/store/apps/details?id=com.doclink.patient",
	ANDROID_DOCTOR: "https://play.google.com/store/apps/details?id=com.doclink.doctor",
	IOS_PATIENT: "https://apps.apple.com/us/app/doclink-patient-app/id1510926079",
	IOS_DOCTOR: "https://apps.apple.com/us/app/doclink-doctor-app/id1510926246"
}

global.BASE_HOST = BASE_HOST
global.BASE_API_VER = BASE_API_VER
global.BASE_URL = BASE_URL
global.BASE_URL_IMAGE = BASE_URL_IMAGE

export const axiosClient = axios.create({
	baseURL: BASE_URL,
	timeout: 20000
});

global.error_count = 0;
global.last_error_time = 0;

axiosClient.interceptors.response.use(function (response) {
	// Just return if successfull
	return response;
}, function (error) {
	let error_reponse = error.request ? error.request : error.response;
	let time_diff = global.last_error_time !== 0 ? ((new Date()).getTime() / 1000) - global.last_error_time : false;
	error_reponse = error_reponse._response ? error_reponse._response : error_reponse.response;
	if (error_reponse && error_reponse.toLowerCase().indexOf('failed to connect to /') > -1 && (time_diff === false || time_diff >= 5)) {
		Alert.alert('Connection error', 'Please check your internet connection.');
		global.last_error_time = (new Date()).getTime() / 1000;
	}
	return Promise.reject(error);
});

export class REALM {
	static CHAT_REQUEST = 'ChatRequest'
	static USER = 'User'
	static CHAT_ROOM = 'ChatRoom'
	static CHAT_ROOM_SESSION = "ChatRoomSession"
	static MESSAGE = "Message"
	static MESSAGE_STATUS = "MessageStatus"
}

export class CHAT_COMMAND {
	static AUTHENTICATION = 'authentication'
	static ONLINE = 'online'
	static ONLINE_STATUS = 'online_status'
	static CHAT_REQUESTS = 'chat_requests'
	static DISCONNECTED = 'disconnected'
	static CHAT_ROOMS = 'chat_rooms'
	static CHAT_ROOM_SESSION = 'chat_room_session'
	static MESSAGES = 'messages'
	static MESSAGE_DELIVERED = 'message/delivered'
	static MESSAGE_RECEIVED = 'message/received'
	static MESSAGE_SEND = 'message/send'
	static SESSION_END = "session/end"
	static USER_TYPING = "user/typing"
	static RATING_PENDING = "rating/pending"
	static CHAT_REQUEST_DELETED = "chat_request_deleted"
}

// class Constant {
//     static BASE_URL = 'https://xxxxx';
//     static URL_API_SERVER = Constant.BASE_URL + '/api/v2';
//     static STATIC_BASEURL = Constant.BASE_URL + '/static';
//     static URLSTRING_FAQ = Constant.STATIC_BASEURL + '/FAQ.html';
//     static URLSTRING_TOU = Constant.STATIC_BASEURL + '/TOU.html';
// }

// export default Constant;


// App Text Size 
// Values -3, -2, -1, 0, 1, 2, 3
export const APP_TEXT_SIZE = 0

export const SCREEN_WIDTH = Dimensions.get('window').width
export const SCREEN_HEIGHT = Dimensions.get('window').height

export const API_URL = {
	// MOBILE_SIGNUP: 'auth/mobile',
	AUTH_REGISTER: 'auth/register',
	PROFILE_USER: 'profile/user',
	PATIENT_FEEDBACK: "patient/feedback",
	PATIENT_ADD_FCM_TOKEN: "patient/add_fcm_token",
	PROFILE_UPDATE: "profile/update",
	DOCTOR_SPECIALIZATIONS_LIST: 'doctor/get_specializations_list',
	DOCTOR_INVITE: 'patient/invite_doctor',
	AUTH_LOGOUT: 'auth/logout',
	AUTH_MOBILE: "auth/mobile",
	AUTH_VERIFY: "auth/verify",
	AUTH_REGISTER_DOCTOR: "auth/register_doctor",
	AUTH_PROFILE_UPDATE: "auth/profile_update",
	CHAT_ADD_CLOSING_NOTES: "chat/add_closing_notes",
	PATIENT_COUPON: "patient/coupon",
	AUTH_SKIP: "auth/skip",
	AUTH_VOICE_OTP: "auth/voice_otp",
	DOCTOR_SEARCH: "doctor/search",
	DOCTOR_FOLLOW_UP: "doctor/follow_up",
	SETTING_CSR_NUMBER: "setting/csr_number",
	DOCTOR_EARNINGS: "doctor/earnings",
	DOCTOR_PAYOUTS: "doctor/payouts",
	DOCTOR_SCHEDULE: "doctor/schedule",
	PRESCRIBE_MEDICINE: "patient/prescribed_medicine",
	PROFILE_NOTIFICATION: "profile/notification",
	MY_DOCTOR: "patient/doctors",
	API_VERSION: "auth/app_version",
	LAB_NAMES: "lab/names",
	REMINDER_FOLLOWUP: "reminder/follow_ups",
	REMINDER_MEDICINE: "reminder/medicines",
	REMINDER_SETTINGS: "reminder/setting",
	DOCTOR_BROADCAST: "doctor/broadcast",
	DOCTOR_STATISTICS: "doctor/statistics",
	DOCTOR_DASHBOARD: "doctor/dashboard",
	PATIENT_REQUEST_NEW_SESSION: "patient/request_new_session",
	DOCTOR_CHIEF_COMPLAINT: "doctor/get_chief_complaint",
	PATIENT_PRESCRIPTIONS: 'patient/prescriptions',
	MEDICAL_RECORDS: 'medical/records',
	DOCTOR_STORIES: 'doctor/stories',
	PATIENT_STORIES: 'patient/stories',
	DOCTOR_CONNECT: 'profile/connect_doctor',
	PATIENT_PENDING_USER_RATING: 'patient/fetch_pending_user_rating',
	PATIENT_CHAT_REQUESTS: 'patient/fetch_chat_requests',
	PATIENT_CHECK_WALLET: 'patient/check_wallet_amount',
	PATIENT_WALLET: 'patient/wallet',
	PATIENT_DELETE_REQUEST: 'patient/delete_chat_request',
	SETTING_ABOUT: 'setting/about',
	SETTING_PRIVACY: 'setting/privacy',
	SETTING_TERMS_AND_CONDI: 'setting/terms',
	SETTING_REPORT_PROBLEM: 'setting/report_problem',
	DOCTOR_PENDING_CLOSING_NOTES: "doctor/fetch_pending_closing_notes",
	DOCTOR_REJECT_REQUEST: "doctor/reject_chat_request",
	DOCTOR_ACCEPT_REQUEST: "doctor/accept_chat_request",
	FOLLOW_UP_MESSAGE: "doctor/follow_up_message"

}



export const TARGET = {
	PATIENT: "patient",
	DOCTOR: "doctor"
}

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isPatient = AppInfo.TARGET === 'patient';
export const isDoctor = AppInfo.TARGET === 'doctor';


export const KEYS = {
	ACCESS_TOKEN: "access_token",
	USER_ID: "user_id",
	UNREAD_NOTIFICATION_COUNT: "unread_notification_count",
	REQUEST_COUNT: "request_count",
	USER_PROFILE: "user_profile",
	CHARGES: "charges",
	PAY_PER_INTERACTION: "pay_per_interaction",
}

export const METHOD = {
	GET: 'get',
	POST: 'post',
	DELETE: 'delete'
}

export const GET_STRING = {
	TITLE: 'Audio Recorder Player',
	PLAY: 'Play',
	PAUSE: 'Pause',
	STOP: 'Stop',
	RECORD: 'Record',
};



let calRatio = SCREEN_WIDTH <= SCREEN_HEIGHT ? 16 * (SCREEN_WIDTH / SCREEN_HEIGHT) : 16 * (SCREEN_HEIGHT / SCREEN_WIDTH);
if (SCREEN_WIDTH <= SCREEN_HEIGHT) {
	if (calRatio < 9) {
		calRatio = SCREEN_WIDTH / 9;
	} else {
		calRatio = SCREEN_HEIGHT / 18;
	}
} else {
	if (calRatio < 9) {
		calRatio = SCREEN_HEIGHT / 9;
	} else {
		calRatio = SCREEN_WIDTH / 18;
	}
}

export const RATIO = calRatio / (360 / 9);
