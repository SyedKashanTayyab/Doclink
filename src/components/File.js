//
//  File.js
//  GhoomCar
//
//  Created by Kashif Khatri on 1/1/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import React, { Component } from 'react';

function type(ext) {
    var _extension = String(ext).toLowerCase();
    console.log('Extension: ', _extension)
    if (_extension == "jpeg") {
        return "image/jpeg"
    } else if (_extension == "jpg") {
        return "image/jpeg"
    } else if (_extension == "mp4") {
        return "audio/mpeg"
    } else if (_extension == "aac") {
        return "audio/aac"
    }
    return ""
}

// Export
export default {
    type,
}

