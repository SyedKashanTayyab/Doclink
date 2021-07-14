import { axiosClient } from '../utils/Constant';

//GET Doctor Chat
export const DoctorChat = async (params) => {
    return axiosClient.get('chat/get_doctor_chatrooms', {
        params: {
            doctor_id: params.user_id
        },
        headers: {
            access_token: params.access_token,
        },
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Get Patient Chat
export const PatientChat = async (params) => {
    return axiosClient.get('chat/get_patient_chatrooms', {
        params: {
            patient_id: params.user_id
        },
        headers: {
            access_token: params.access_token,
        },
    }).then(function (response) {
        return response
    }).catch(function (error) {
        if (error.request) {
            throw error.request._response;
        }
        throw error._response;
    });
}

//Get Messages
export const GetMessages = async (params) => {
    return axiosClient.get('chat/get_messages', {
        params: {
            user_id: params.user_id,
            patient_id: params.patient_id,
            flavor: params.flavor,
        },
        headers: {
            access_token: params.access_token,
        },
    }).then(function(response) {
        return response
    }).catch(function(error) {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}


//Get Media
export const ChatMedia = async (params) => {
    return axiosClient.get('chat/get_chat_media', {
        params: {
            conversation_id: params.conversation_id
        },
        headers: {
            access_token: params.access_token,
        },
    }).then(function (response) {
        return response
    }).catch(function (error) {
        if (error.request) {
            throw error.request._response;
        }
        throw error._response;
    });
}


//Get Media
export const ChatStatus = async (params) => {
    return axiosClient.get('chat/get_chat_status', {
       
        headers: {
            access_token: params.access_token,
        },
    }).then(function (response) {
        return response
    }).catch(function (error) {
        if (error.request) {
            throw error.request._response;
        }
        throw error._response;
    });
}

export const FetchDoctorChatRequests = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/fetch_chat_requests', {
        doctor_id: params.user_id,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const RejectChatRequest = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/reject_chat_request', {
        request_id: params.request_id,
        status: params.status,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const AcceptChatRequest = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/accept_chat_request', {
        request_id: params.request_id,
        status: params.status,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}
