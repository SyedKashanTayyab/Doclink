import realm from '../../schemas/realm'
import { REALM } from '../../utils/Constant'
import appHelper from '../../utils/AppHelper'

export default class ChatRequestModel {

    static fetchAll() {
        try {
            return realm.objects(REALM.CHAT_REQUEST)
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRequestModel fetchAll", error)
            return [];
        }
    }

    static find_chat_request(id) {
        try {
            let data = realm.objects(REALM.CHAT_REQUEST).filtered('chat_request_id == $0', id)
            return data;
        } catch (error) {
            console.log(" ====  CATCH ==== ChatRequestModel find_chat_request", error)
            return [];
        }
    }

    static create(data) {
        try {

            let arrData = []
            if (data instanceof Array) {
                arrData = data
            } else {
                arrData.push(data)
            }

            var isNewRecord = false
            arrData.map((object) => {
                let requests = realm.objects(REALM.CHAT_REQUEST).filtered('chat_request_id == $0', object.id)
                let user = null
                if (requests.length > 0) {

                } else {

                    isNewRecord = true
                    realm.write(() => {
                        let chat_request = realm.create(REALM.CHAT_REQUEST, {
                            chat_request_id: parseInt(object.id),
                            patient: {
                                user_id: parseInt(object.patient_id),
                                name: object.name,
                                image_url: object.avatar
                            },
                            chief_complaint: object.chief_complaint,
                            package_id: parseInt(object.package_id),
                            package_amount: parseInt(object.package_amount),
                            status: object.status,
                            free_interaction: object.free_interaction,
                            request_data: object.request_data,
                            created_at: appHelper.convertToGMT(object.created_at)
                        }, false)
                    });
                }
            })
        } catch (e) {
            console.log("Chat Request Error on creation", e);
        }
        return isNewRecord
    }

    update() {

    }

    static delete(id) {
        try {
            let requests = realm.objects(REALM.CHAT_REQUEST).filtered('chat_request_id == $0', id)
            requests.map((object) => {
                realm.write(() => {
                    requests.map((object) => {
                        realm.delete(object.patient)
                        realm.delete(object)
                    })
                });
            })
        } catch (e) {
            console.log("Chat Request Model Delete", e);
        }
    }

    static deleteAll() {
        console.log("Chat Requests Deleting...")
        try {
            let arrData = realm.objects(REALM.CHAT_REQUEST)
            arrData.map((object) => {
                realm.write(() => {
                    if (object.patient != null && object.patient != undefined) {
                        realm.delete(object.patient)
                    }
                    realm.delete(object)
                })
            })
            console.log("Chat Requests Deleted")
        }
        catch (e) {
            console.log("Chat Requests Delete All", e);
        }
    }
}