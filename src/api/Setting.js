import { axiosClient } from '../utils/Constant';

export const getAbout = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('setting/get_about').then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const getPrivacy = (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('setting/get_privacy').then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const getTerms = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('auth/get_terms').then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const reportProblem = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('setting/report_problem', {
        user_id: params.user_id,
        subject: params.subject,
        category: params.category,
        description: params.description,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}