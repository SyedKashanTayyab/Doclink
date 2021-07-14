//
//  FiveStarRating.js
//  docklink
//
//

import React, { Component } from "react";
import { View, Text, } from "react-native";
import PropTypes from 'prop-types';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import StarRating from 'react-native-star-rating';

export default class FiveStarRating extends Component {

    state = {

    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // console.log("FiveStarRating")
    }

    render() {
        return (
            <View style={[ {
                flexDirection: "row",
                justifyContent: "center", alignItems: "center",
            }]}>
                    <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={this.props.rating}
                        starSize={this.props.starSize}
                        fullStarColor={this.props.starColor}
                        emptyStarColor={this.props.emptyStarColor}
                        starStyle={{ marginLeft: 5, }}
                    />
                    <Text style={this.props.ratingStyle}>
                        {this.props.rating}
                    </Text>
            </View>
        );
    }
}


FiveStarRating.propTypes = {
    rating: PropTypes.string.isRequired,
    ratingStyle: PropTypes.object,
    starColor: PropTypes.string,
    
};

FiveStarRating.defaultProps = {
    rating: "5.0",
    starSize: 20,
    starColor: 'white',
    emptyStarColor: 'white',
}
