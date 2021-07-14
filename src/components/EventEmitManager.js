//
//  EventEmitManager.js
//  DocLink
//
//  Created by Kashif Khatri on 1/1/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import appHelper from '../utils/AppHelper';

export default class EventEmitManager {

    static sharedInstance = null;

    _callbacks = []

    /**
     * @returns {EventEmitManager}
     */
    static getInstance() {
        if (EventEmitManager.sharedInstance == null) {
            EventEmitManager.sharedInstance = new EventEmitManager();
        }
        return this.sharedInstance;
    }

    /**
     * Register new callback
     * A callback function is a function passed into another function as an argument, which is then invoked inside the outer function to complete some kind of routine or action.
     * @param cb 
     */
    register_callback(cb) {
        this._callbacks.push(cb);
    }

    /**
     * Invoked all registered callback
     * @param {string} event Name of the event
     * @param {json} data Results set
     */
    invoke_callbacks(event, data) {
        //console.log("Callbacks count", this._callbacks.length)
        this._callbacks.map((cb) => {
            cb(event, data)
        })
    }

    /**
     * Remove Callbacks
     * @param {function} callback 
     */
    remove_callback(cb) {
        this._callbacks.pop(cb)
        //console.log("Callbacks count", this._callbacks.length)
    }

    // this.invoke_callbacks('authentication', this.socket.id)

}