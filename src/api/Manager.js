import { axiosClient } from '../utils/Constant';

export const topupHistory = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_topup_history', {
        params: {
            manager_id: params.user_id,
            limit: params.limit
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

export const getCount = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_dashboard_count', {
        params: {
            manager_id: params.user_id
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

export const ReferPatient = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('manager/refer_patient', {
        name: params.name,
        phone: params.phone,
        reference_id: params.user_id,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const GetWalletAmount = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_wallet_amount').then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const SearchPatient = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/search_patient', {
        params:{
            phone: params.phone
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

export const AddWallet = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('manager/topup_patient', {
        credit: params.credit,
        reference_id: params.reference_id,
        patient_id: params.patient_id,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const getDoctorList = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_doctor_list', {
        params: {
            manager_id: params.user_id
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

export const getDoctorSchedule = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_doctor_schedule', {
        params: {
            doctor_id: params.doctor_id
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

export const getPatientList = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_patient_list', {
        params: {
            manager_id: params.manager_id
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

export const EditProfile = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('manager/edit_manager_profile', {
        user_id: params.user_id,
        name: params.name,
        email: params.email,
        gender: params.gender,
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

export const getDoctorConnected = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_doctor_connected', {
        params: {
            manager_id: params.user_id,
            patient_id: params.patient_id
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

export const ConnectPatient = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('manager/connect_patient', {
        patient_id: params.patient_id,
        doctors: params.doctors,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const getDoctorProfile = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('manager/get_doctor_profile', {
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
