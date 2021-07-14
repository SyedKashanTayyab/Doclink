//
//  AppSingleton.js
//  DocLink
//
//  Created by Kashif Khatri on 1/1/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import appHelper from '../utils/AppHelper';

export default class AppSingleton {

    static sharedInstance = null;

    currentPlayerObject = null

    /**
     * @returns {object} AppSingleton
     */
    static getInstance() {
        if (AppSingleton.sharedInstance == null) {
            AppSingleton.sharedInstance = new AppSingleton();
        }
        return this.sharedInstance;
    }

    get_current_player() {
        return this.currentPlayerObject
    }

    set_new_player(object) {
        this.currentPlayerObject = object
    }
}