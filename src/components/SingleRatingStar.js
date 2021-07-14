//
//  SingleRatingStar.js
//  docklink
//
//

import React, { Component } from "react";
import { View, Text, TouchableOpacity, } from "react-native";
import PropTypes from 'prop-types';
import { Icon } from "native-base";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default class SingleRatingStar extends Component {

    state = {

    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // console.log("SingleRatingStar")
    }

    render() {
        return (
            <View style={[ {
                flexDirection: "row",
                justifyContent: "center", alignItems: "center",
                marginLeft: wp("1"),
            }]}>
                    <Icon
                        name="star"
                        type="FontAwesome"
                        style={{ color: this.props.starColor, fontSize: this.props.starSize, }}
                    />
                    <Text style={this.props.ratingStyle}>
                        {this.props.rating}
                    </Text>
            </View>
        );
    }
}


SingleRatingStar.propTypes = {
    rating: PropTypes.string.isRequired,
    ratingStyle: PropTypes.object,
    starColor: PropTypes.string
};

SingleRatingStar.defaultProps = {
    rating: "5.0",
    starSize: wp('4%'),
    starColor: 'white'
}
