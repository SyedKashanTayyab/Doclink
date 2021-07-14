import { axiosClient } from '../utils/Constant';

//GET Add Patient
export const GetAllPlans = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('plan/get_all_plans', {
        params: {
            doctor_id: params.doctor_id
        }
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Get Current Package
export const GetCurrentPackage = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('plan/get_current_package', {
        params: {
            user_id: params.user_id,
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

//Delete Package
export const DeletePlan = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('plan/delete_plan', {
        plan_id: params.plan_id
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Add Package
export const AddPlan = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('plan/add_plan', {
        name: params.name,
        price: params.price,
        days: params.days,
        description: params.description,
        doctor_id: params.doctor_id,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Edit Package
export const EditPlan = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('plan/edit_plan', {
        plan_id: params.plan_id,
        name: params.name,
        price: params.price,
        days: params.days,
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

//Add Subscription
export const AddSubscription = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('plan/add_subscription', {
        plan_id: params.plan_id,
        doctor_id: params.doctor_id,
        user_id: params.user_id,
        duration: params.duration,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}