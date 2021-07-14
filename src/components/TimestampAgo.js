//
//  TimestampAgo.js
//  Docklink
//
//  Created by Kashif Khatri on 06/04/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

import React, { Component } from "react";
import { Text, StyleSheet, } from "react-native";
import PropTypes from 'prop-types';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import colors from "../utils/Colors";
import { Fonts } from "../utils/Fonts";
import FontSize from "../utils/FontSize";
var moment = require('moment');

class TimestampAgo extends Component {

    state = {
        timestamp: ''
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.timeDifference(this.props.timestamp)

        clearInterval(this.timerInterval);
        this.timerInterval = null;

        this.timerInterval = setInterval(() => {
            this.timeDifference(this.props.timestamp)
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    /**
     * Timestamp to relative time
     */

    timeDifference(previous) {

        let current = moment().utc(false)

        // console.log("Current timestamp", current)

        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        let finalString = ''
        if (elapsed < msPerMinute) {
            // finalString = Math.round(elapsed / 1000) + ' sec ago';
            finalString = moment(elapsed).format('mm:ss');
        }

        else if (elapsed < msPerHour) {
            // finalString = Math.round(elapsed / msPerMinute) + ' min ago';
            finalString = moment(elapsed).format('mm:ss');
        }

        else if (elapsed < msPerDay) {
            let hours = Math.round(elapsed / msPerHour);
            finalString = moment(elapsed).format(hours + ':mm:ss');
        }

        else if (elapsed < msPerMonth) {
            finalString = Math.round(elapsed / msPerDay) + ' days';
        }

        else if (elapsed < msPerYear) {
            finalString = Math.round(elapsed / msPerMonth) + ' months';
        }

        else {
            finalString = Math.round(elapsed / msPerYear) + ' years';
        }
        this.setState({
            timestamp: finalString
        })
    }

    render() {
        return (
            <Text style={{ fontFamily: Fonts.HelveticaNeue, flex: 1, fontSize: FontSize('xMini'), color: colors.grayTwo, marginTop: hp(0), }} ellipsizeMode="tail" numberOfLines={1}>
                {this.state.timestamp}
            </Text>
        );
    }
}

export default TimestampAgo;