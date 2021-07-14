import { axiosClient } from '../utils/Constant';

//POST Add Patient
export const EditProfile = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('profile/edit_profile', {
        name: params.name,
        email: params.email,
        phone: params.phone,
        avatar: (params.avatar.length > 0) ? params.avatar : '',
        user_id: params.user_id,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}


//POST Connect with Doctor
export const ConnectDoctor = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('profile/connect_doctor', {
        code: params.code,
        user_id: params.user_id,
    }).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const ProfileDevice = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('profile/update_device', params).then(function (response) {
        return response
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const ProfileUser = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('profile/user', {
        params: {
            user_id: params.user_id,
            role: params.role,
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

