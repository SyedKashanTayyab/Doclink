import { axiosClient } from '../utils/Constant';

export const getDoctorProfile = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/profile', {
        params: {
            user_id: params.doctor_id
        },
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}


//Get Doctor List
export const DoctorList = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_doctor_list', {
        params: {
            manager_id: params.user_id
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

export const getSpecializationList = async (params) => {
    //axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_specializations_list').then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

// Get Messages
export const GetDoctorMessages = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_doctor_messages', {
        params: {
            doctor_id: params.doctor_id,
            patient_id: params.patient_id,
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

// Check Chat Session
export const CheckSession = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/check_chat_session', {
        params: {
            doctor_id: params.doctor_id,
            patient_id: params.patient_id
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

// Add New Session
export const AddNewSession = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/add_new_session', {
        doctor_id: params.doctor_id,
        patient_id: params.patient_id,
        description: params.description,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

// Get Chief Complaint Message
export const GetChiefComplaint = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_chief_complaint', {
        params: {
            chatroom_session_id: params.chatroom_session_id
        }
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

// Fetch Pending closing notes
export const FetchPendingClosingNotes = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/fetch_pending_closing_notes', {
        params: {
            doctor_id: params.doctor_id
        }
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}


//POST Add Session Details
export const AddSessionDetails = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/add_session_details', {
        session_id: params.session_id,
        patient_id: params.patient_id,
        doctor_id: params.doctor_id,
        chief_complaint: params.chief_complaint,
        diagnosis: params.diagnosis,
        note: params.note,
        doctor_name: params.doctor_name
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const AddClosingNotes = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('chat/add_closing_notes', {
        chatroom_session_id: params.chatroom_session_id,
        doctor_id: params.doctor_id,
        notes: params.notes,
        return_session_charges: params.return_session_charges,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//GET  Session Details
export const GetSessionDetails = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;

    return axiosClient.get('chat/get_session_details', {
        params: {
            chatroom_session_id: params.chatroom_session_id,
        }
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//POST Add Schedule
export const AddDoctorSchedule = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/add_doctor_schedule', {
        schedule_id: params.schedule_id,
        doctor_id: params.doctor_id,
        day: params.day,
        start_time: params.start_time,
        end_time: params.end_time,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const EditProfile = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/edit_doctor_profile', {
        user_id: params.user_id,
        name: params.name,
        email: params.email,
        gender:  params.gender,
        specialty:  params.specialty,
        avatar: params.avatar,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Get Packages
export const GetPackage = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_packages', {
        params: {
            user_id: params.user_id
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



//Get Payments
export const GetPayments = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_payments', {
        params: {
            user_id: params.user_id
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

export const AddDoctorPackages = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('doctor/add_doctor_packages', {
        packages_id:params.packages_id,
        user_id: params.user_id , 
        prices: params.prices, 
        is_active: params.is_active 
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}


export const DeleteDoctorSchedule = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/delete_doctor_schedule', {
        params: {
            id: params.id
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


export const getDoctorSpecialization = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/get_doctor_specialization', {
        params: {
            user_id: params.user_id
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


export const EndChatSession = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('doctor/end_chat_session', {
        params: {
            patient_id:params.patient_id,
            doctor_id:  params.doctor_id,
            conversation_id:params.conversation_id
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


// Get FCM Token
export const GetFcmToken = async (params) => {
 
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
 
    return axiosClient.get('doctor/get_fcm_token', {
        params: {
            user_id: params.user_id
        }
 
    }).then(function (response) {
 
        return response
 
    }).catch((error) => {
 
        if (error.request) {
 
            throw error.request._response;
 
        }
 
        throw error.message;
 
    });
 
}


/*export const getSpecializationList = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_wallet_amount').then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}*/