import realm from '../../schemas/realm'
import { REALM } from '../../utils/Constant'
import ChatRoomModel from './ChatRoomModel'
import appHelper from '../../utils/AppHelper'

export default class ChatRoomSessionModel {

    static fetchAll() {
        try {
            return realm.objects(REALM.CHAT_ROOM_SESSION)
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomSessionModel fetchAll", error)
            return [];
        }
    }

    static fetchActive() {
        try {
            return realm.objects(REALM.CHAT_ROOM_SESSION).filtered('started_at != $0 && ended_at == $1 SORT(chatroom.updated_at DESC) DISTINCT(chatroom.id)', null, null)
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomSessionModel fetchActive", error)
            return [];
        }
    }

    static fetchCompleted() {
        try {
            return realm.objects(REALM.CHAT_ROOM_SESSION).filtered('started_at != $0 && ended_at != $1 SORT(chatroom.updated_at DESC) ', null, null)
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomSessionModel fetchCompleted", error)
            return [];
        }
    }

    static fetch_active_session(chatroom_id) {
        try {
            return realm.objects(REALM.CHAT_ROOM_SESSION).filtered('started_at != $0 && ended_at == $1 and chatroom.id == $2', null, null, chatroom_id)
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomSessionModel fetch_active_session", error)
            return [];
        }
    }

    static createOrUpdate(data) {
        let return_object = ''
        try {
            let arrData = realm.objects(REALM.CHAT_ROOM_SESSION).filtered('chatroom_session_id == $0', data.id)
            if (arrData.length > 0) {
                realm.write(() => {

                    arrData[0].created_at = appHelper.convertToGMT(data.created_at)

                    arrData[0].session_type = data.session_type
                    if (arrData[0].session_expired_at != null) {
                        arrData[0].session_expired_at = appHelper.convertToGMT(data.session_expired_at)
                    }

                    if (data.doctor_closing_notes_given_at != null) {
                        arrData[0].doctor_closing_notes_given_at = appHelper.convertToGMT(data.doctor_closing_notes_given_at)
                    }

                    if (data.patient_rating_given_at != null) {
                        arrData[0].patient_rating_given_at = appHelper.convertToGMT(data.patient_rating_given_at)
                    }

                    if (data.started_by != null && data.started_by instanceof Object) {
                        arrData[0].started_by = {
                            user_id: parseInt(data.started_by.id),
                            name: data.started_by.name,
                            image_url: data.started_by.avatar,
                            rating: data.started_by.ratings
                        }
                        arrData[0].chatroom.is_active = true
                        arrData[0].started_at = appHelper.convertToGMT(data.started_at)
                    }

                    if (data.ended_by != null && data.ended_by instanceof Object) {
                        arrData[0].ended_by = {
                            user_id: parseInt(data.ended_by.id),
                            name: data.ended_by.name,
                            image_url: data.ended_by.avatar,
                            rating: data.ended_by.ratings
                        }
                        arrData[0].chatroom.is_active = false
                        arrData[0].ended_at = data.ended_at
                    }
                });
                return_object = arrData[0];

            } else {
                // Get chatroom object
                let chatroom = ChatRoomModel.find_by_id(data.chatroom_id)

                var params = {
                    chatroom_session_id: parseInt(data.id),
                    chatroom: chatroom,
                    created_at: appHelper.convertToGMT(data.created_at),
                }

                if (data.doctor_closing_notes_given_at != null) {
                    params['doctor_closing_notes_given_at'] = appHelper.convertToGMT(data.doctor_closing_notes_given_at)
                }

                if (data.patient_rating_given_at != null) {
                    params['patient_rating_given_at'] = appHelper.convertToGMT(data.patient_rating_given_at)
                }

                params['session_type'] = data.session_type
                if (data.session_expired_at != null) {
                    params['session_expired_at'] = appHelper.convertToGMT(data.session_expired_at)
                }

                if (data.started_by != null && data.started_by instanceof Object) {
                    params['started_by'] = {
                        user_id: parseInt(data.started_by.id),
                        name: data.started_by.name,
                        image_url: data.started_by.avatar,
                        rating: data.started_by.ratings
                    }
                    chatroom.is_active = true
                    params['started_at'] = appHelper.convertToGMT(data.started_at)
                }

                if (data.ended_by != null && data.ended_by instanceof Object) {
                    params['ended_by'] = {
                        user_id: parseInt(data.ended_by.id),
                        name: data.ended_by.name,
                        image_url: data.ended_by.avatar,
                        rating: data.ended_by.ratings
                    }
                    chatroom.is_active = false
                    params['ended_at'] = appHelper.convertToGMT(data.ended_at)
                }
                // console.log("ChatRoomSession createorupdate", params)
                realm.write(() => {
                    return_object = realm.create(REALM.CHAT_ROOM_SESSION, params)
                })
            }
        } catch (e) {
            console.log("Chatroom Session Error on creation", e);
        }
        return return_object;
    }

    static create(data) {
        try {
            let arrData = []
            if (data instanceof Array) {
                arrData = data
            } else {
                arrData.push(data)
            }

            arrData.map((object) => {
                let arrSession = realm.objects(REALM.CHAT_ROOM_SESSION).filtered('chatroom_session_id == $0', object.id)
                let user = null
                if (arrSession.length > 0) {

                    realm.write(() => {

                        arrSession[0].started_at = object.started_at
                        arrSession[0].created_at = object.created_at
                        arrSession[0].started_by = object.started_by
                        arrSession[0].ended_by = object.ended_by
                        arrSession[0].ended_at = object.ended_at

                    });

                } else {

                    let chatroom = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', object.chatroom_id)

                    realm.write(() => {
                        chatroom[0].is_active = true
                        let session = realm.create(REALM.CHAT_ROOM_SESSION, {
                            chatroom_session_id: parseInt(object.id),
                            chatroom: chatroom[0],
                            started_at: object.started_at,
                            created_at: object.created_at,
                            started_by: {
                                user_id: parseInt(object.started_by.id),
                                name: object.started_by.name,
                                image_url: object.started_by.avatar,
                                rating: object.started_by.ratings
                            },
                            session_type: object.session_type,
                            session_expired_at: (object.session_expired_at != null) ? appHelper.convertToGMT(object.session_expired_at) : null
                        })
                    });
                }
            })
        } catch (e) {
            console.log("Chat Room Session - Creation - Error on creation", e);
        }
        return true
    }

    static update(data) {

        try {
            if (data instanceof Array) {
                return false
            }

            // Find Chat room
            let arrChatroom = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', data.id)
            if (arrChatroom.length == 0) {
                return false
            }

            let chatroom = arrChatroom[0]
            let session = null;

            if (data.session == null) {
                return;
            }

            // Find Chat room session
            let arrSession = realm.objects(REALM.CHAT_ROOM_SESSION).filtered('chatroom_session_id == $0', data.session.id)
            if (arrSession.length == 0) {


                // New Object
                realm.write(() => {

                    var params = {
                        chatroom_session_id: parseInt(data.session.id),
                        chatroom: chatroom,
                        started_at: data.session.started_at,
                        created_at: data.session.created_at,
                        started_by: {
                            user_id: parseInt(data.session.started_by.id),
                            name: data.session.started_by.name,
                            image_url: data.session.started_by.avatar,
                            rating: data.session.started_by.ratings
                        }
                    }
                    params.chatroom.is_active = true

                    params.session_type = data.session.session_type
                    params.session_expired_at = (data.session.session_expired_at != null) ? appHelper.convertToGMT(data.session.session_expired_at) : null

                    if (data.session.ended_by != null) {
                        params['ended_by'] = {
                            user_id: parseInt(data.session.ended_by.id),
                            name: data.session.ended_by.name,
                            image_url: data.session.ended_by.avatar,
                            rating: data.session.ended_by.ratings
                        }
                        ms['ended_at'] = data.session.ended_at
                        chatroom.is_active = false
                    }

                    session = realm.create(REALM.CHAT_ROOM_SESSION, params)

                });
                return session
            }

            // Exists
            realm.write(() => {
                arrSession[0].started_at = data.session.started_at
                arrSession[0].created_at = data.session.created_at
                arrSession[0].started_by = {
                    user_id: parseInt(data.session.started_by.id),
                    name: data.session.started_by.name,
                    image_url: data.session.started_by.avatar,
                    rating: data.session.started_by.ratings
                }

                arrSession[0].session_type = data.session.session_type
                arrSession[0].session_expired_at = (data.session.session_expired_at != null) ? appHelper.convertToGMT(data.session.session_expired_at) : null

                if (data.session.ended_by != null) {
                    arrSession[0].ended_by = {
                        user_id: parseInt(data.session.ended_by.id),
                        name: data.session.ended_by.name,
                        image_url: data.session.ended_by.avatar,
                        rating: data.session.ended_by.ratings
                    }
                    arrSession[0].ended_at = data.session.ended_at
                    arrSession[0].chatroom.is_active = false
                }
            });

            return arrSession[0]

        } catch (e) {
            console.log("Chat Room Session - Updation - Error on creation", e);
        }
        return true
    }

    static delete(id) {

    }

    static deleteAll() {
        console.log("Deleting...")
        try {
            let arrData = realm.objects(REALM.CHAT_ROOM_SESSION)
            arrData.map((object) => {
                realm.write(() => {
                    if (object.chatroom != null) {
                        realm.delete(object.chatroom)
                    }
                    if (object.started_by != null) {
                        realm.delete(object.started_by)
                    }
                    if (object.ended_by != null) {
                        realm.delete(object.ended_by)
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