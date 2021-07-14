//
//  Socket.js
//  DocLink
//
//  Created by Kashif Khatri on 1/1/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import appHelper from '../utils/AppHelper';
import io from "socket.io-client";
import { CHAT_COMMAND } from '../utils/Constant'

export default class AppSocketManager {

    static sharedInstance = null;

    _accessToken = null
    _userId = null
    static socket = null
    _callbacks = []

    setAccessToken(access_token) {
        this._accessToken = access_token
    }

    setUserId(user_id) {
        this._userId = user_id
    }

    /**
     * @returns {AppSocket}
     */
    static getInstance() {
        if (AppSocketManager.sharedInstance == null) {
            AppSocketManager.sharedInstance = new AppSocketManager();
        }
        return this.sharedInstance;
    }

    /**
     * Connect
     */
    connect() {
        try {
            // Socket Connection
            // console.log("Socket" + this.socket == null ? "true" : "false")
            // if (this.socket != null) {
            //     this.socket.disconnect()
            //     this.socket.close();
            //     global.socket = null
            // }

            this.socket = io.connect(global.BASE_HOST, {
                autoConnect: true,
                multiplex: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 2000,
                transports: ["websocket"],
                extraHeaders: {
                    access_token: this._accessToken
                }
            });
            this.socket.on('connect', async () => {
                global.socket = this.socket

                this.invoke_callbacks('authentication', this.socket.id)

                // this.socket.on('response', responseListner)

                // // Subscribe Event
                // await this.socket.on("reply", data => {
                //     console.log("reply", data)
                // });

                // Set User to online
                // await socket.emit("online", userId);
            });

            this.socket.on('connect_error', (error) => {
                console.log('Socket:  connect_error ' + error);
                // callback('disconnected', null)
            });
            this.socket.on('error', (error) => {
                console.log('Error: ' + error);
                if (error === 'websocket error') {

                    // this.socket.close();
                    // global.socket = null
                    //this.connect(callback);
                }
                // callback('disconnected', null)

            });
            this.socket.on('disconnect', (reason) => {
                console.log("disconnect", reason)
                // this.socket.close();
                // this.socket.disconnect()
                // global.socket = null
                // this.connect();
                if (reason === 'io server disconnect') {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    // socket.connect();
                }
                this.invoke_callbacks(CHAT_COMMAND.DISCONNECTED, null)

                // this.socket.connect()
            });
            this.socket.on('reconnect', (attemptNumber) => {
                console.log('Reconnect', attemptNumber);
                // callback('disconnected', null)
            });
            this.socket.on('reconnecting', (attemptNumber) => {
                console.log('Reconnecting', attemptNumber);
                // callback('disconnected', null)
            });

            // on reconnection, reset the transports option, as the Websocket
            // connection may have failed (caused by proxy, firewall, browser, ...)
            this.socket.on('reconnect_attempt', () => {
                socket.io.opts.transports = ['polling', 'websocket'];
            });

            this.socket.on('reconnect_error', (error) => {
                console.log("reconnect_error", error)
            });

            // Chat Requests
            this.socket.on(CHAT_COMMAND.CHAT_REQUESTS, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.CHAT_REQUESTS, data)
            })

            // Chat rooms
            this.socket.on(CHAT_COMMAND.CHAT_ROOMS, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.CHAT_ROOMS, data)
            })

            // Online
            this.socket.on(CHAT_COMMAND.ONLINE, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.ONLINE, data)
            })

            // Online status
            this.socket.on(CHAT_COMMAND.ONLINE_STATUS, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.ONLINE_STATUS, data)
            })

            // All Messages
            this.socket.on(CHAT_COMMAND.MESSAGES, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.MESSAGES, data)
            })

            // Message Received        
            this.socket.on(CHAT_COMMAND.MESSAGE_RECEIVED, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.MESSAGE_RECEIVED, data)
            })

            // Message Send        
            this.socket.on(CHAT_COMMAND.MESSAGE_SEND, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.MESSAGE_SEND, data)
            })

            // Message Delivered        
            this.socket.on(CHAT_COMMAND.MESSAGE_DELIVERED, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.MESSAGE_DELIVERED, data)
            })

            // User Typing
            this.socket.on(CHAT_COMMAND.USER_TYPING, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.USER_TYPING, data)
            })

            // Chatroom session 
            this.socket.on(CHAT_COMMAND.CHAT_ROOM_SESSION, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.CHAT_ROOM_SESSION, data)
            })

            // Session End
            this.socket.on(CHAT_COMMAND.SESSION_END, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.SESSION_END, data)
            })

            // Pending Rating
            this.socket.on(CHAT_COMMAND.RATING_PENDING, (data) => {
                this.invoke_callbacks(CHAT_COMMAND.RATING_PENDING, data)
            })

        } catch (error) {
            console.log("==============================")
            console.log("AppSocket - connect() - ", error)
            console.log("==============================")
        }
    }

    /**
     * Online
     */
    goOnline(params = {}) {
        // Subscribe Event
        let event_name = CHAT_COMMAND.ONLINE
        params['user_id'] = this._userId
        this.socket.emit(event_name, params);
    }
    /**
     * Offline
     */
    offline() {

    }

    /**
     * Disconnect
     */
    disconnect() {
        if (this.socket == undefined) {
            // do nothing.
        } else {
            this.socket.disconnect()
        }
    }

    /**
     * Synchronize data
     * @param timestamp Accept timestamp or 0
     */
    // messages(timestamp = "0", callback) {
    //     // Subscribe Event
    //     let event_name = CHAT_COMMAND.MESSAGES
    //     if (this.socket.hasListeners(event_name) == false) {
    //         this.socket.addEventListener(event_name, function (data) {
    //             callback(event_name, data)
    //         });
    //     }
    //     this.socket.emit(event_name, { "timestamp": timestamp });
    // }

    /**
     * Chat Requests data
     * @param timestamp Accept timestamp or 0
     */
    chat_requests(params) {
        let event_name = CHAT_COMMAND.CHAT_REQUESTS
        this.socket.emit(event_name, params);
    }

    /**
     * Chat Room data
     * @param timestamp Accept timestamp or 0
     */
    chat_rooms(params) {
        let event_name = CHAT_COMMAND.CHAT_ROOMS
        this.socket.emit(event_name, params);
    }

    /**
     * Check User Online
     * @param data user_id of the opposit user
     */
    online_status(params) {
        let event_name = CHAT_COMMAND.ONLINE_STATUS
        this.socket.emit(event_name, params);
    }

    /**
     * Chat Room Session
     * @param timestamp Accept timestamp or 0
     */
    chat_room_session(params) {
        let event_name = CHAT_COMMAND.CHAT_ROOM_SESSION
        this.socket.emit(event_name, params);
    }

    /**
     * Messages
     * @param timestamp Accept timestamp or 0
     */
    messages(params) {
        let event_name = CHAT_COMMAND.MESSAGES
        this.socket.emit(event_name, params);
    }

    /**
     * Message Received
     * @param timestamp Accept timestamp or 0
     */
    message_received(params) {
        let event_name = CHAT_COMMAND.MESSAGE_RECEIVED
        this.socket.emit(event_name, params);
    }

    /**
     * Message Received
     * @param timestamp Accept timestamp or 0
     */
    message_delivered(params) {
        let event_name = CHAT_COMMAND.MESSAGE_DELIVERED
        this.socket.emit(event_name, params);
    }

    /**
     * Message Send
     * @param timestamp Accept timestamp or 0
     */
    message_send(params) {
        let event_name = CHAT_COMMAND.MESSAGE_SEND
        this.socket.emit(event_name, params);
    }

    /**
     * End Session
     * @param timestamp Accept timestamp or 0
     */
    session_end(params) {
        let event_name = CHAT_COMMAND.SESSION_END
        this.socket.emit(event_name, params);
    }

    /**
     * Check Connection
     */
    is_connected() {
        return this.socket.connected
    }

    is_disconnected() {
        return this.socket.disconnect
    }

    /**
     * User Typing
     * @param user_id Editing user Id
     */
    user_typing(params) {
        let event_name = CHAT_COMMAND.USER_TYPING
        this.socket.emit(event_name, params);
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
     * @param {*} event Name of the event
     * @param {*} data Results set
     */
    invoke_callbacks(event, data) {
        //console.log("Callbacks count", this._callbacks.length)
        this._callbacks.map((cb) => {
            cb(event, data)
        })
    }

    /**
     * Remove Callbacks
     * @param {} event_name 
     * @param {*} callback 
     */
    remove_callback(cb) {
        this._callbacks.pop(cb)
        //console.log("Remove Callbacks count", this._callbacks.length)
    }

    /**
     * Listener
     * @param {*} event_name 
     * @param {*} callback 
     */
    add_listener(event_name, callback = null) {
        if (this.socket.hasListeners(event_name) == false) {
            this.socket.addEventListener(event_name, callback)
            console.log("AppSocket - add_listener : New registered: ", event_name)
            // function (data) {

            // console.log("add_listener", event_name, data)

            // if (event_name == CHAT_COMMAND.MESSAGE_SEND) {
            //     let arrListeners = this.socket.listeners(event_name)
            //     console.log("arrListeners.length" , arrListeners.length)
            // }
            // callback(event_name, data)
            // });
        } else {
            console.log("AppSocket - add_listener : Already registerd : ", event_name)
        }
    }

    remove_listener(event_name, callback = null) {
        this.socket.off(event_name);
    }

}

/**
 * https://stackoverflow.com/questions/24100218/socket-io-send-packet-to-sender-only
 * https://gist.github.com/alexpchin/3f257d0bb813e2c8c476
 * https://dev.to/moz5691/socketio-for-simple-chatting---1k8n
 */