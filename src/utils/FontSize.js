import React, { Component } from 'react';
import Utility from './Utility';
import { APP_TEXT_SIZE } from './Constant';

function FontSize(key) {
    const fontStyleList = require('./fontStyles.json');
    if (fontStyleList[key] != null) {
        let ratio = Utility.converToRatio(fontStyleList[key])
        let size = (ratio) + APP_TEXT_SIZE * 0.6
        return size
    } else {
        throw Error(`font style key : ${key} not found\n`)
    }
}

export default FontSize;
