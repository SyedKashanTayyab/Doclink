import { axiosClient } from '../utils/Constant';

//Get Ticket Category
export const GetCategory = async (access_token) => {
    axiosClient.defaults.headers.common['access_token'] = access_token;
    return axiosClient.get('ticket/get_category').then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}
//POST Add Ticket
export const AddTicket = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('ticket/add_ticket', {
        subject: params.subject,
        category_id: params.category_id,
        description: params.description,
        user_id: params.user_id,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}
//Get Ticket
export const GetTicket = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('ticket/get_tickets', {
        params: {
            user_id: params.user_id,
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
//Get Ticket Detail
export const GetTicketDetail = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.get('ticket/get_ticket_detail', {
        params: {
            id: params.id,
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
//Add Ticket Comment AddComment
export const AddComment = async (params) => {
    axiosClient.defaults.headers.common['access_token'] = params.access_token;
    return axiosClient.post('ticket/add_ticket_comment', {
        user_id: params.user_id,
        ticket_id: params.ticket_id,
        content: params.content,
    }).then(function (response) {
        return response;
    }).catch((error) => {
        if (error.request) {
            throw error.request._response;
        }
        throw error.message;
    });
}