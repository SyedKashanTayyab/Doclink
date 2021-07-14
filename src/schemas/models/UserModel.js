import realm from '../../schemas/realm'
import { REALM } from '../../utils/Constant'
import appHelper from '../../utils/AppHelper'

export default class UserModel {

    static fetchAll() {
        try {
            return realm.objects(REALM.USER)
        } catch (error) {
            console.log(" ====  CATCH ==== UserModel fetchAll", error)
            return [];
        }
    }

    static find_user(user_id) {
        try {
            let arrData = realm.objects(REALM.USER).filtered('user_id == $0', user_id)
            return arrData;
        } catch (error) {
            console.log(" ====  CATCH ==== UserModel find_user", error)
            return [];
        }
    }

    static createOrUpdate(data) {

        let return_object = ''
        try {
            let arrData = realm.objects(REALM.USER).filtered('user_id == $0', data.id)

            if (arrData.length > 0) {
                realm.write(() => {
                    arrData[0].name = data.name
                    arrData[0].image_url = data.avatar
                    arrData[0].email = data.email
                    arrData[0].rating = parseFloat(data.ratings)
                    return_object = arrData[0];
                });
            } else {
                let params = {
                    user_id: parseInt(data.id),
                    name: data.name,
                    image_url: data.avatar,
                    email: data.email,
                    rating: parseFloat(data.ratings),
                }
                realm.write(() => {
                    return_object = realm.create(REALM.USER, params)
                });
            }
        } catch (e) {
            console.log("User Model Error on creation", e);
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