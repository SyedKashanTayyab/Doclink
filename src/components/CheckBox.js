//
//  CheckBox.js
//  DocLink
//
//  Created by Kashif Khatri on 10/03/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import React, { Component, Fragment } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import PropTypes from 'prop-types';

class CheckBox extends Component {

    _reset = false

    static propTypes = {
        checkedIcon: PropTypes.element,
        uncheckedIcon: PropTypes.element,
        checked: PropTypes.bool,
        onPress: PropTypes.func,
    };

    static defaultProps = {
        checked: false
    }

    state = {
    }

    constructor(props) {
        super(props);
    }

    render() {

        const CheckedIcon = this.props.checkedIcon;
        const UncheckedIcon = this.props.uncheckedIcon;

        return (
            <View style={[styles.container, this.props.customStyles,]}>
                {
                    (this.props.checked == true) ?
                        <Fragment>
                            <TouchableWithoutFeedback onPress={() => {
                                this.props.onPress(false)
                            }}>
                                {CheckedIcon}
                            </TouchableWithoutFeedback>
                        </Fragment>
                        :
                        <Fragment>
                            <TouchableWithoutFeedback onPress={() => {
                                this.props.onPress(true)
                            }}>
                                {UncheckedIcon}
                            </TouchableWithoutFeedback>

                        </Fragment>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: 20,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        // backgroundColor:"black",
    }
});

export default CheckBox;