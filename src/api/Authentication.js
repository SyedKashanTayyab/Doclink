import { axiosClient } from '../utils/Constant';

//Login
export const Login = (params) => {
    return axiosClient.post('auth/mobile', {
        mobile: params.mobile,
        device_identifier: params.device_identifier,
        device_token: params.device_token,
        device_type: params.device_type,
        device_name: params.device_name,
        flavor: params.flavor
    }).then(response => {
        return response;
    }).catch(error => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//verify
export const Verify = (params) => {
    return axiosClient.post('auth/verify', {
        auth_code: params.auth_code,
        device_identifier: params.device_identifier
    }).then(response => {
        return response;
    }).catch(error => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Register
export const Register = (params) => {
    console.log(params);
    return axiosClient.post('auth/register', {
        name: params.name,
        email: params.email,
        phone: params.phone,
        gender: params.gender,
        avatar: params.avatar,
        cnic: params.cnic,
        device_identifier: params.device_identifier,
        device_token: params.device_token,
        device_type: params.device_type,
        device_name: params.device_name
    }).then(response => {
        return response;
    }).catch(error => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

export const RegisterDoctor = (params) => {
    console.log(params);
    return axiosClient.post('auth/register_doctor', {
        name: params.name,
        email: params.email,
        phone: params.phone,
        gender: params.gender,
        avatar: params.avatar,
        cnic: params.cnic,
        pmdc: params.pmdc,
        device_identifier: params.device_identifier,
        device_token: params.device_token,
        device_type: params.device_type,
        device_name: params.device_name,
        specialization: params.specialization,
    }).then(response => {
        return response;
    }).catch(error => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}

//Check Redirection CheckRedirection
export const CheckRedirection = async (user_id) => {
    return axiosClient.get('auth/check_redirection', {
        params: {
            user_id: user_id
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
