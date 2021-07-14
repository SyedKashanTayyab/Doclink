import realm from '../../schemas/realm'
import { REALM } from '../../utils/Constant'
import appHelper from '../../utils/AppHelper'
import ChatRequestModel from './ChatRequestModel'

export default class ChatRoomModel {

    static fetchAll() {
        try {
            return realm.objects(REALM.CHAT_ROOM).sorted('updated_at', true)
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel fetchAll", error)
            return [];
        }
    }

    static fetchActiveChats() {
        try {
            let arrReturn = []
            let arrUserIds = []
            let arrChatRequest = ChatRequestModel.fetchAll()
            arrChatRequest.map((item) => {
                arrUserIds.push(item.patient.user_id)
            })

            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered(`is_active = true AND message != nil`).sorted('updated_at', true)
            arrChatRooms.map((item) => {
                if (arrUserIds.includes(item.patient.user_id) == false) {
                    arrReturn.push(item)
                }
            })
            return arrReturn
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel fetchActiveChats", error)
            return [];
        }
    }

    static fetchCompletedChats() {
        try {
            let arrReturn = []
            let arrUserIds = []
            let arrChatRequest = ChatRequestModel.fetchAll()
            arrChatRequest.map((item) => {
                arrUserIds.push(item.patient.user_id)
            })

            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered(`is_active = false AND message != nil`).sorted('updated_at', true)
            arrChatRooms.map((item) => {
                if (arrUserIds.includes(item.patient.user_id) == false) {
                    arrReturn.push(item)
                }
            })
            return arrReturn;
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel fetchCompletedChats", error)
            return [];
        }
    }

    static fetchActiveChatsUnReadCount() {
        try {
            let arrReturn = []
            let arrUserIds = []
            let arrChatRequest = ChatRequestModel.fetchAll()
            arrChatRequest.map((item) => {
                arrUserIds.push(item.patient.user_id)
            })

            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered(`is_active = true and unread_count > 0`).sorted('updated_at', true)
            arrChatRooms.map((item) => {
                if (arrUserIds.includes(item.patient.user_id) == false) {
                    arrReturn.push(item)
                }
            })
            return arrReturn
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel fetchActiveChatsUnReadCount", error)
            return [];
        }
    }

    static fetchCompletedChatsUnReadCount() {
        try {
            let arrReturn = []
            let arrUserIds = []
            let arrChatRequest = ChatRequestModel.fetchAll()
            arrChatRequest.map((item) => {
                arrUserIds.push(item.patient.user_id)
            })

            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered(`is_active = false and unread_count > 0`).sorted('updated_at', true)
            arrChatRooms.map((item) => {
                if (arrUserIds.includes(item.patient.user_id) == false) {
                    arrReturn.push(item)
                }
            })
            return arrReturn
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel fetchCompletedChatsUnReadCount", error)
            return [];
        }
    }

    static find_chatroom(doctor_id, patient_id) {
        try {
            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered('patient.user_id == $0 && doctor.user_id == $1', patient_id, doctor_id)
            return arrChatRooms;
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel find_chatroom", error)
            return [];
        }
    }

    static find_by_id(id) {
        try {
            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', id)
            return (arrChatRooms.length > 0) ? arrChatRooms[0] : null
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel find_by_id", error)
            return [];
        }
    }

    static set_active_inactive_chatroom(id, is_active) {
        try {
            let chat_room_object = null
            try {
                let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', id)
                if (arrChatRooms.length > 0) {
                    realm.write(() => {
                        arrChatRooms[0].is_active = is_active
                    });
                    chat_room_object = arrChatRooms[0]
                }
            } catch (e) {
                console.log("Chatroom Error on creation", e);
            }
            return chat_room_object
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRoomModel set_active_inactive_chatroom", error)
            return [];
        }
    }

    static createOrUpdate(data) {

        let chat_room_object = ''
        try {
            // console.log("Chatroom ID: ", data.id)
            // console.log("Chatroom ID: ", JSON.stringify(data))
            let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', data.id)
            if (arrChatRooms.length > 0) {
                realm.write(() => {

                    arrChatRooms[0].doctor = {
                        user_id: parseInt(data.doctor.id),
                        name: data.doctor.name,
                        image_url: data.doctor.avatar,
                        email: data.doctor.email,
                        rating: parseFloat(data.doctor.ratings),
                    }
                    arrChatRooms[0].patient = {
                        user_id: parseInt(data.patient.id),
                        name: data.patient.name,
                        image_url: data.patient.avatar,
                        email: data.patient.email,
                        rating: parseFloat(data.patient.ratings),
                    }
                    if (!appHelper.isEmpty(data.sender)) {
                        arrChatRooms[0].sender = {
                            user_id: parseInt(data.sender.id),
                            name: data.sender.name,
                            image_url: data.sender.avatar,
                            email: data.sender.email,
                            rating: parseFloat(data.sender.ratings),
                        }
                    }
                    arrChatRooms[0].created_at = appHelper.convertToGMT(data.created_at)
                    arrChatRooms[0].updated_at = (data.updated_at == null) ? appHelper.convertToGMT(data.created_at) : appHelper.convertToGMT(data.updated_at)
                    chat_room_object = arrChatRooms[0];
                });
            } else {
                let params = {
                    id: parseInt(data.id),
                    doctor: {
                        user_id: parseInt(data.doctor.id),
                        name: data.doctor.name,
                        image_url: data.doctor.avatar,
                        email: data.doctor.email,
                        rating: parseFloat(data.doctor.ratings),
                    },
                    patient: {
                        user_id: parseInt(data.patient.id),
                        name: data.patient.name,
                        image_url: data.patient.avatar,
                        email: data.patient.email,
                        rating: parseFloat(data.patient.ratings),
                    },
                    created_at: appHelper.convertToGMT(data.created_at),
                    updated_at: (data.updated_at == null) ? appHelper.convertToGMT(data.created_at) : appHelper.convertToGMT(data.updated_at),
                    is_active: true
                }
                if (!appHelper.isEmpty(data.sender)) {
                    params['sender'] = {
                        user_id: parseInt(data.sender.id),
                        name: data.sender.name,
                        image_url: data.sender.avatar,
                        email: data.sender.email,
                        rating: parseFloat(data.sender.ratings),
                    }
                }
                //console.log("chatroom", params)
                realm.write(() => {
                    chat_room_object = realm.create(REALM.CHAT_ROOM, params)
                });
            }
        } catch (e) {
            console.log("Chatroom Error on creation", e);
            console.log(data)
        }
        return chat_room_object;
    }

    static reset_count(id) {
        let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', id)
        realm.write(() => {
            arrChatRooms[0].unread_count = 0
        })
        return arrChatRooms[0]
    }

    static delete(id) {
        let arrChatRooms = realm.objects(REALM.CHAT_ROOM).filtered('id == $0', data.id)
        if (arrChatRooms.length > 0) {
            try {
                realm.write(() => {
                    if (arrChatRooms[0].doctor != null) {
                        realm.delete(arrChatRooms[0].doctor)
                    }
                    if (arrChatRooms[0].patient != null) {
                        realm.delete(arrChatRooms[0].patient)
                    }
                    if (arrChatRooms[0].v != null) {
                        realm.delete(arrChatRooms[0].sender)
                    }
                    realm.delete(arrChatRooms[0])
                })
            }
            catch (e) {
                console.log("Chatroom Delete", e);
            }
        }
    }

    static deleteAll() {
        console.log("Deleting...")
        try {
            let arrChatRooms = realm.objects(REALM.CHAT_ROOM)
            arrChatRooms.map((object) => {
                realm.write(() => {
                    if (object.doctor != null) {
                        realm.delete(object.doctor)
                    }
                    if (object.patient != null) {
                        realm.delete(object.patient)
                    }
                    if (object.v != null) {
                        realm.delete(object.sender)
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