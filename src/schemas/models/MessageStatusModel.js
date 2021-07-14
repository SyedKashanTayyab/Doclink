import realm from '../realm'
import { REALM } from '../../utils/Constant'
import appHelper from '../../utils/AppHelper'
import UserModel from './UserModel'

export default class MessageStatusModel {

    static fetchAll() {
        try {
            return realm.objects(REALM.USER)
        } catch (error) {
            console.log(" ====  CATCH ==== MessageStatusModel fetchAll", error)
            return [];
        }
    }

    static find_status(id) {
        try {
            let arrData = realm.objects(REALM.MESSAGE_STATUS).filtered('id == $0', id)
            return arrData;
        } catch (error) {
            console.log(" ====  CATCH ==== MessageStatusModel find_status", error)
            return [];
        }
    }

    static createOrUpdate(data) {

        let return_object = ''
        try {
            let arrData = realm.objects(REALM.MESSAGE_STATUS).filtered('id == $0', data.id)

            if (arrData.length > 0) {
                realm.write(() => {
                    arrData[0].name = data.name
                    arrData[0].image_url = data.avatar
                    arrData[0].email = data.email
                    arrData[0].rating = parseFloat(data.ratings)
                    return_object = arrData[0];
                });
            } else {

                let status = {
                    user: UserModel.createOrUpdate(data.user),
                    id: data.id,
                    status: data.status,
                    created_at: appHelper.convertToGMT(data.created_at),
                    server_date_at: appHelper.convertToGMT(data.created_at)
                }
                realm.write(() => {
                    return_object = realm.create(REALM.MESSAGE_STATUS, status)
                });
            }
        } catch (e) {
            console.log("Message Status Error on creation", e);
        }
        return return_object;
    }

    static delete(id) {
        let arrData = realm.objects(REALM.USER).filtered('user_id == $0', id)
        if (arrData.length > 0) {
            try {
                realm.write(() => {
                    realm.delete(arrData[0])
                })
            }
            catch (e) {
                console.log("User Model Delete", e);
            }
        }
    }
}