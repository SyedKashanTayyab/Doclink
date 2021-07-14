////////////////////////////////////////////////////////////////////////////
//
// Copyright 2016 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Reference
// https://stackoverflow.com/questions/40195371/how-to-organize-react-native-with-realm-project-files
////////////////////////////////////////////////////////////////////////////

'use strict';

import Realm from 'realm';
import { REALM } from '../utils/Constant'

const USER_SCHEMA = String(REALM.USER)
const CHAT_ROOM_SCHEMA = String(REALM.CHAT_ROOM)
const CHAT_ROOM_SESSION_SCHEMA = String(REALM.CHAT_ROOM_SESSION)
const MESSAGE_SCHEMA = String(REALM.MESSAGE)
const MESSAGE_STATUS_SCHEMA = String(REALM.MESSAGE_STATUS)
const CHAT_REQUEST_SCHEMA = String(REALM.CHAT_REQUEST)

/**
 * Users
 */
class User extends Realm.Object { }
User.schema = {
    name: USER_SCHEMA,
    properties: {
        user_id: 'int',
        name: 'string',
        image_url: 'string',
        email: { type: 'string', optional: true },
        rating: { type: 'double', optional: true }
    },
};

/**
 * ChatRoom
 */
class ChatRoom extends Realm.Object { }
ChatRoom.schema = {
    name: CHAT_ROOM_SCHEMA,
    properties: {
        id: { type: 'int', default: 0 },
        patient: 'User',
        doctor: 'User',
        unread_count: { type: 'int', default: 0 },
        message: { type: 'Message', optional: true },
        sender: { type: 'User', optional: true },
        created_at: 'date',
        updated_at: { type: 'date', optional: true },
        is_active: { type: 'bool', optional: true }
    },
};

/**
 * ChatRoomSession
 */
class ChatRoomSession extends Realm.Object { }
ChatRoomSession.schema = {
    name: CHAT_ROOM_SESSION_SCHEMA,
    properties: {
        chatroom_session_id: { type: 'int' },
        chatroom: 'ChatRoom',
        started_at: { type: 'date', optional: true },
        ended_at: { type: 'date', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
        started_by: { type: 'User', optional: true },
        ended_by: { type: 'User', optional: true },
        doctor_closing_notes_given_at: { type: 'date', optional: true },
        patient_rating_given_at: { type: 'date', optional: true },
        session_type: { type: 'string', optional: true },
        session_expired_at: { type: 'date', optional: true }
    },
};

/**
 * Message
 */
class Message extends Realm.Object { }
Message.schema = {
    name: MESSAGE_SCHEMA,
    properties: {
        id: { type: 'int', optional: true },
        _id: { type: 'string', optional: true },
        body: { type: 'string', optional: true },
        local_url: { type: 'string', optional: true },
        sender: { type: 'User', optional: true },
        receiver: { type: 'User', optional: true },
        message_type: { type: 'string', optional: true },
        sub_message_type: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
        reply_id: { type: 'Message', optional: true },
        chatroom: 'ChatRoom',
        chatroom_session: 'ChatRoomSession',
        sent_at: { type: 'date', optional: true },
        status: { type: 'list', objectType: 'MessageStatus' },
        server_date_at: { type: 'date', optional: true },
    },
};

/**
 * Message Status
 */
class MessageStatus extends Realm.Object { }
MessageStatus.schema = {
    name: MESSAGE_STATUS_SCHEMA,
    properties: {
        id: { type: 'int', optional: true },
        user: 'User',
        status: 'string',
        created_at: 'date',
        server_date_at: { type: 'date', optional: true },
    },
};

/**
 * Chat Requests
 */
class ChatRequest extends Realm.Object { }
ChatRequest.schema = {
    name: CHAT_REQUEST_SCHEMA,
    primaryKey: "chat_request_id",
    properties: {
        chat_request_id: { type: 'int', default: 0 },
        patient: 'User',
        chief_complaint: 'string',
        package_id: { type: 'int', default: 0 },
        package_amount: { type: 'int', default: 0 },
        status: 'string',
        action_id: { type: 'date', optional: true },
        created_at: 'date',
        free_interaction: { type: 'int', default: 0 },
        request_data: { type: 'string', optional: true },
    },
};

export default new Realm({
    schema: [User.schema, ChatRoom.schema, ChatRoomSession.schema, Message.schema, MessageStatus.schema, ChatRequest.schema],
    schemaVersion: 36,
    migration: (oldRealm, newRealm) => {
        console.log("asdfasdfassafsd")
    }
});

/**
 * References
 * Multi-thread
 * https://academy.realm.io/posts/threading-deep-dive/
 */