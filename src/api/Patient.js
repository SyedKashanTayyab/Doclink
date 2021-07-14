import { axiosClient } from '../utils/Constant';

//Get Clinic List getClinic
export const getClinic = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_clinic_list', {
        params: {
            specialization_id: params.specialization_id
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

//Get Clinic Detail 
export const getClinicDetail = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_clinic_detail', {
        params: {
            clinic_id: params.clinic_id
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

//Get Clinic Specialization 
export const getClinicSpecialization = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_clinic_specialization', {
        params: {
            clinic_id: params.clinic_id
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

//Get Clinic Timing 
export const getClinicTiming = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_clinic_timing', {
        params: {
            clinic_id: params.clinic_id
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


//Get Patient List
export const PatientList = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_patient_list', {
        params: {
            doctor_id: params.doctor_id
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

//POST Add Patient
export const AddPatient = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/add_patient', {
        name: params.name,
        email: params.email,
        phone: params.phone,
        avatar: (params.avatar.length > 0) ? params.avatar : '',
        doctor_id: params.doctor_id,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Edit Patient
export const EditProfile = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('profile/update', {
        user_id: params.user_id,
        name: params.name,
        email: params.email,
        avatar: (params.avatar != null) ? params.avatar : '',
        role: params.role
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Check Patient Package
export const PatientPackage = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/check_patient_package', {
        params: {
            patient_id: params.patient_id,
            doctor_id: params.doctor_id
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

export const PatientCheckWalletAmount = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/check_wallet_amount', {
        params: {
            patient_id: params.patient_id,
            doctor_id: params.doctor_id
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

//Get Packages
export const GetPackage = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_packages', {
        params: {
            doctor_id: params.doctor_id
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

// Get Wallet Amount
export const CheckWallet = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_wallet_amount', {
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

// Add Subscription
export const AddSubscription = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/add_subscription', {
        patient_id: params.patient_id,
        doctor_id: params.doctor_id,
        package_id: params.package_id,
        package_amount: params.package_amount,
        duration: params.duration
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

// Get Messages
export const GetPatientMessages = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_patient_messages', {
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
    return axiosClient.get('patient/check_chat_session', {
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
    return axiosClient.post('patient/add_new_session', {
        doctor_id: params.doctor_id,
        patient_id: params.patient_id,
        description: params.description,
        name: params.name
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const RequestChatSession = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/request_new_session', {
        doctor_id: params.doctor_id,
        patient_id: params.patient_id,
        description: params.description,
        name: params.name
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Get Patient List
export const GetCurrentPackage = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_current_package', {
        params: {
            patient_id: params.patient_id,
            doctor_id: params.doctor_id,
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

// Add Notification Token
export const NotificationToken = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/add_notification_token', {
        user_id: params.user_id,
        fcm_token: params.fcm_token,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

// Add Rating
export const SubmitRating = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/add_review_and_rating', {
        given_by: params.given_by,
        given_to: params.given_to,
        session_id: params.session_id,
        review: params.review,
        rating: params.rating,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

// Add FCM Token
export const AddFcmToken = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/add_fcm_token', {
        user_id: params.user_id,
        fcmToken: params.fcmToken,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Get Wallet
export const GetWallet = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_wallet_data', {
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

//Get Wallet Amount
export const GetWalletAmount = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_wallet_amount', {
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

//Get Doctor Schedules 
export const GetSchedules = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/get_doctor_schedules', {
        params: {
            doctor_id: params.doctor_id
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

//POST Update Messages
export const UpdateSeenMessages = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/update_message_seen', {
        message_id_array: params.message_id_array,
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
    return axiosClient.post('patient/end_chat_session', {
        patient_id: params.patient_id,
        doctor_id: params.doctor_id,
        conversation_id: params.conversation_id
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const FetchChatRequests = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/fetch_chat_requests', {
        patient_id: params.patient_id,
        doctor_id: params.doctor_id,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const DeleteChatRequest = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('patient/delete_chat_request', {
        request_id: params.request_id,
        status: params.status,
        doctor_id: params.doctor_id
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const FetchPendingUserRating = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('patient/fetch_pending_user_rating', {
        params: {
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