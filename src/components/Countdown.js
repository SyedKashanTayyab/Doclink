//
//  Countdown.js
//
//  Created by Kashif Khatri on 11/03/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import React, { Component } from "react";
import { View, Text, Button, StyleSheet, TouchableWithoutFeedback } from "react-native";
import PropTypes from 'prop-types';
import { Fonts } from "../utils/Fonts";
import { hp, wp } from "../utils/Utility";
import colors from "../utils/Colors";
import FontSize from "../utils/FontSize";

/*
Reference: https://github.com/talalmajali/react-native-countdown-component/blob/master/index.js
*/
var _reset = 'hi';
class Countdown extends React.Component {

    _reset = false

    static propTypes = {
        internal: PropTypes.number,
        onChange: PropTypes.func,
        onPress: PropTypes.func,
        onFinish: PropTypes.func,
    };

    state = {
        remainingTime: Number(this.props.intervalTime),
        counterReset: false
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // console.log("componentDidMount")
        this.startInterval()
        _reset = true
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.interval = null
    }

    componentWillReceiveProps(props) {
        var resetTime = props.resetTime
        // console.log(resetTime, _reset, this.props.resetTime)
        // Condition
        if (resetTime == true && _reset == false && this.props.resetTime == false) {
            _reset = true;
            this.setState({ remainingTime: Number(this.props.intervalTime) })
            this.startInterval()
        }
        else if (resetTime == false && _reset == false && this.props.resetTime == true) {
            clearInterval(this.interval);
            this.interval = null
        }
    }

    startInterval() {
        this.interval = setInterval(() => {
            var _time = this.state.remainingTime - 1
            if (_time < 0) {
                clearInterval(this.interval)
                this.timerInterval = null;
                if (this.props.onFinish) {
                    _reset = false
                    this.props.onFinish();
                }
            } else {
                this.setState({ remainingTime: String(_time).padStart(2, 0) })
            }
        }, 1000); //1 seconds
    }

    render() {
        console.log("showCounter", this.props.showCounter, this.props.type);
        return (
            this.props.showCounter && (this.props.type == "text")
                ? <View style={styles.container}>
                    <Text>{this.props.title} 0:{String(this.state.remainingTime).padStart(2, 0)}</Text>
                </View>
                : (this.props.showCounter && this.props.type == "button") ?
                    <TouchableWithoutFeedback onPress={this.props.onPressButton}>
                        <View style={styles.counterBtn}>
                            <Text style={[styles.btnText]}>{this.props.title} 0:{String(this.state.remainingTime).padStart(2, 0)}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    :
                    null
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop: hp(2),
        // marginBottom: hp(1),
        fontFamily: Fonts.HelveticaNeue,
        height: hp(7),
    },
    counterBtn: {
        backgroundColor: colors.grayFour,
        width: wp(80), height: hp(7),
        alignSelf: 'center',
        marginTop: hp(4),
        justifyContent: 'center',
        borderRadius: wp(2) / 2,
        zIndex: 0,
    },
    btnText: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeueBold,
        textTransform: "uppercase",
        fontSize: FontSize('small'),
        textAlign: "center",
    },

});

export default Countdown;