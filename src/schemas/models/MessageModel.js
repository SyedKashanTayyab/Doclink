import realm from '../../schemas/realm'
import { REALM } from '../../utils/Constant'
import ChatRoomModel from './ChatRoomModel'
import UserModel from './UserModel'
import ChatRoomSessionModel from './ChatRoomSessionModel'
import appHelper from '../../utils/AppHelper'
import MessageStatusModel from './MessageStatusModel'

var moment = require('moment');

export default class MessageModel {

    static fetch_message(chatroom_id, timestamp = null) {
        try {
            let arrMessages = []
            if (timestamp == null) {
                arrMessages = realm.objects(REALM.MESSAGE).filtered('chatroom.id == $0 SORT(created_at DESC) LIMIT(30)', chatroom_id)
            } else {
                let _newDate = new Date(timestamp)
                arrMessages = realm.objects(REALM.MESSAGE).filtered('chatroom.id == $0 AND created_at >= $1 SORT(created_at DESC)', chatroom_id, _newDate)
            }
            // let from_timestamp = (timestamp == null) ? "1970-01-01T00:00:00" : timestamp
            return arrMessages;
        } catch (error) {
            console.log(" ====  CATCH ==== MessageModel fetch_message", error)
            return [];
        }
    }

    static fetch_more_messages(chatroom_id, timestamp = null) {
        try {
            let from_timestamp = (timestamp == null) ? "1970-01-01T00:00:00" : timestamp
            let _newDate = new Date(from_timestamp)
            console.log("MessageModel fetch_more_messages from_timestamp", from_timestamp, chatroom_id, _newDate)
            let arrMessages = realm.objects(REALM.MESSAGE).filtered('chatroom.id == $0 AND created_at < $1 SORT(created_at DESC) LIMIT(12)', chatroom_id, _newDate)
            console.log("this.fetch_more_messages", arrMessages.length)
            return arrMessages;
        } catch (error) {
            console.log(" ====  CATCH ==== MessageModel fetch_more_messages", error)
            return [];
        }
    }

    static get_last_sent_timestamp(chatroom_id) {
        try {
            let _allMessagesLength = realm.objects(REALM.MESSAGE).sorted('sent_at', true)
            if (_allMessagesLength.length > 0) {
                let object = _allMessagesLength.slice(0, 1)
                return object[0].sent_at
            }
            return 0
        } catch (error) {
            console.log(" ====  CATCH ==== MessageModel get_last_sent_timestamp", error)
            return 0;
        }
    }

    static fetch_media(chatroom_id) {
        try {
            let arrMessages = realm.objects(REALM.MESSAGE).filtered('chatroom.id == $0 AND message_type == "image"', chatroom_id)
            return arrMessages;
        } catch (error) {
            console.log(" ====  CATCH ==== MessageModel fetch_media", error)
            return [];
        }
    }

    static fetch_pending_messages() {
        try {
            let arrMessages = realm.objects(REALM.MESSAGE).filtered('server_date_at == null')
            console.log("this.fetch_pending_messages", arrMessages.length)
            return arrMessages;
        } catch (error) {
            console.log(" ====  CATCH ==== MessageModel fetch_pending_messages", error)
            return [];
        }
    }

    static create(data) {
        // console.log(data)
        let chatrooms = realm.objects(REALM.CHAT_ROOM).filtered('id == $0 ', data.chatroom.id)
        let message_object = ''
        try {
            let params = {
                _id: data._id,
                id: (data.id != null) ? parseInt(data.id) : null,
                body: data.body,
                message_type: data.message_type,
                created_at: data.created_at,
                chatroom: chatrooms[0],
                chatroom_session: data.chatroom_session,
                local_url: data.local_url
            }

            if (data.sender != null) {
                params['sender'] = {
                    user_id: parseInt(data.sender.user_id),
                    name: data.sender.name,
                    image_url: data.sender.image_url,
                    email: data.sender.email,
                    rating: parseFloat(data.sender.rating),
                }
            }
            if (data.receiver != null) {
                params['receiver'] = {
                    user_id: parseInt(data.receiver.user_id),
                    name: data.receiver.name,
                    image_url: data.receiver.image_url,
                    email: data.receiver.email,
                    rating: parseFloat(data.receiver.rating),
                }
            }
            realm.write(() => {
                chatrooms[0].last_message = data.body
                chatrooms[0].last_message = data.message_type
                chatrooms[0].unread_count = 0
                message_object = realm.create(REALM.MESSAGE, params)
                let status = {
                    user: {
                        user_id: parseInt(data.status.user.user_id),
                        name: data.status.user.name,
                        image_url: data.status.user.image_url,
                        email: data.status.user.email,
                        rating: parseFloat(data.status.user.rating),
                    },
                    status: data.status.status,
                    created_at: data.status.created_at
                }
                chatrooms[0].updated_at = data.created_at
                message_object.status.push(status);

            });

        } catch (e) {
            console.log("Message Error on creation", e);
        }
        return message_object;
    }

    static create_from_array(data) {

        let new_message = false
        data.map((object) => {
            let message_object = ''
            try {
                let messages = realm.objects(REALM.MESSAGE).filtered('_id == $0 ', object._id)

                // Chat room
                let chatroom = ChatRoomModel.createOrUpdate(object.chatroom)

                // Chat room session
                let session = ChatRoomSessionModel.createOrUpdate(object.session)

                if (messages.length > 0) {
                    let sender = (object.sender != null) ? UserModel.createOrUpdate(object.sender) : null
                    let receiver = (object.receiver != null) ? UserModel.createOrUpdate(object.receiver) : null

                    let _body = object.body
                    if (_body.includes("{")) {
                        let jsonData = JSON.parse(_body)
                        jsonData['local_url'] = (messages[0].local_url == null) ? "" : messages[0].local_url
                        _body = JSON.stringify(jsonData)
                    }
                    // console.log("_body", _body)
                    realm.write(() => {
                        messages[0].body = _body
                        messages[0].message_type = object.message_type
                        messages[0].sub_message_type = object.sub_message_type
                        messages[0].created_at = appHelper.convertToGMT(object.created_at)
                        messages[0].server_date_at = appHelper.convertToGMT(object.created_at)
                        messages[0].sent_at = (object.updated_at != null) ? appHelper.convertToGMT(object.updated_at) : appHelper.convertToGMT(object.created_at)
                        messages[0].chatroom = chatroom
                        messages[0].chatroom_session = session

                        if (object.id > messages[0].id) {
                            chatroom.message = messages[0]
                        }

                        chatroom.updated_at = appHelper.convertToGMT(object.created_at)
                        messages[0].sender = sender
                        messages[0].receiver = receiver
                    });
                    // console.log("messages[0]", messages[0])

                    // Message status array
                    let last_status_object = ''
                    object.status.map((_status) => {
                        let status_object = MessageStatusModel.createOrUpdate(_status)
                        last_status_object = status_object
                        realm.write(() => {
                            messages[0].status.push(status_object);
                        });
                    })

                    // if (last_status_object.status != 'read') {
                    //     if (messages[0].receiver != null && messages[0].receiver.user_id == global.user_data.id) {
                    //         let count = messages[0].chatroom.unread_count + 1
                    //         realm.write(() => {
                    //             messages[0].chatroom.unread_count = count
                    //         });
                    //     }
                    // }
                    return;
                }

                new_message = true;

                // Message param
                let message_params = {
                    _id: object._id,
                    id: (object.id != null) ? parseInt(object.id) : null,
                    body: object.body,
                    message_type: object.message_type,
                    sub_message_type: object.sub_message_type,
                    created_at: appHelper.convertToGMT(object.created_at),
                    updated_at: appHelper.convertToGMT(object.created_at),
                    server_date_at: appHelper.convertToGMT(object.created_at),
                    sent_at: (object.updated_at != null) ? appHelper.convertToGMT(object.updated_at) : appHelper.convertToGMT(object.created_at),
                    chatroom: chatroom,
                    chatroom_session: session
                }

                // Sender
                if (object.sender != null) {
                    message_params['sender'] = UserModel.createOrUpdate(object.sender)
                }

                // Receiver
                if (object.receiver != null) {
                    message_params['receiver'] = UserModel.createOrUpdate(object.receiver)
                }

                realm.write(() => {

                    if (object.sub_message_type == "request_accepted") {
                        chatroom.is_active = true
                    }
                    else if (object.sub_message_type == "session_ended") {
                        chatroom.is_active = false
                    }

                    // Create message objet
                    message_object = realm.create(REALM.MESSAGE, message_params)
                    chatroom.message = message_object
                    chatroom.updated_at = appHelper.convertToGMT(object.created_at)
                });

                let last_status_object = ''

                // Message status array
                object.status.map((_status) => {
                    let status_object = MessageStatusModel.createOrUpdate(_status)
                    last_status_object = status_object
                    realm.write(() => {
                        message_object.status.push(status_object);
                    });
                })

                // Check - If new message timestamp is greater than user last sync time
                // Message timestamp > user last sync timestamp
                // console.log(moment(message_params.sent_at).utc(true), moment(global.last_sync_timestamp).utc(true))
                if (moment(message_params.sent_at).utc(true) > moment(global.last_sync_timestamp).utc(true)) {
                    if (last_status_object.status != 'read') {
                        if (global.current_screen != 'Chat_' + chatroom.id) {
                            if (message_object.receiver != null && message_object.receiver.user_id == global.user_data.id) {
                                let count = message_object.chatroom.unread_count + 1
                                realm.write(() => {
                                    message_object.chatroom.unread_count = count
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                console.log("Message Error on creation", e, object);
            }
        })
        return new_message;
    }

    static update(data) {

        try {
            let arrData = []
            if (data instanceof Array) {
                arrData = data
            } else {
                arrData.push(data)
            }

            arrData.map((object) => {
                let arrMessages = realm.objects(REALM.MESSAGE).filtered('_id == $0', object._id)
                if (arrMessages.length > 0) {
                    realm.write(() => {
                        arrMessages[0].created_at = appHelper.convertToGMT(object.created_at)
                        arrMessages[0].sent_at = appHelper.convertToGMT(object.created_at)
                        arrMessages[0].id = object.id
                        arrMessages[0].server_date_at = appHelper.convertToGMT(object.created_at)
                        arrMessages[0].sub_message_type = (object.sub_message_type != null) ? object.sub_message_type : null

                        if (arrMessages[0].message_type == 'image') {
                            arrMessages[0].body = object.body
                        }

                        for (let i = 0; i < object.status.length; i++) {
                            let _status = object.status[i]
                            let arrStatus = arrMessages[0].status.filtered('id == $0', _status.id)
                            // console.log("--- arrStatus", arrStatus.length)
                            if (arrStatus.length > 0) {
                                let statusParams = {
                                    user: {
                                        user_id: parseInt(_status.user_id.id),
                                        name: _status.user_id.name,
                                        image_url: _status.user_id.avatar,
                                        email: _status.user_id.email,
                                        rating: parseFloat(_status.user_id.ratings),
                                    },
                                    status: _status.status,
                                    created_at: appHelper.convertToGMT(_status.created_at),
                                    server_date_at: appHelper.convertToGMT(_status.created_at)
                                }
                                arrStatus[0] = statusParams;
                                console.log("statusParams Updated", arrStatus[0])
                            } else {
                                let statusParams = {
                                    user: {
                                        user_id: parseInt(_status.user.id),
                                        name: _status.user.name,
                                        image_url: _status.user.avatar,
                                        email: _status.user.email,
                                        rating: parseFloat(_status.user.ratings),
                                    },
                                    status: _status.status,
                                    created_at: appHelper.convertToGMT(_status.created_at),
                                    server_date_at: appHelper.convertToGMT(_status.created_at)
                                }
                                console.log("statusParams Created", statusParams)
                                arrMessages[0].status.push(statusParams);
                            }
                        }
                    })
                }
            })
        } catch (e) {
            console.log("Message Model Update - Error on updation", e);
        }

        return true
    }

    static delete(id) {

    }

    static deleteAll() {
        console.log("Deleting...")
        try {

            let arrData = realm.objects(REALM.MESSAGE)
            arrData.map((object) => {
                realm.write(() => {
                    if (object.sender_id != null) {
                        realm.delete(object.sender_id)
                    }
                    if (object.receiver_id != null) {
                        realm.delete(object.receiver_id)
                    }
                    if (object.reply_id != null) {
                        realm.delete(object.reply_id)
                    }
                    if (object.chatroom != null) {
                        realm.delete(object.chatroom)
                    }
                    if (object.chatroom_session != null) {
                        realm.delete(object.chatroom_session)
                    }
                    realm.delete(object)
                })
            })
            console.log("Deleted")
        }
        catch (e) {
            console.log("Chatroom Delete All", e);
        }
    }
}