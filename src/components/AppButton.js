//
//  AppFooterButton.js
//  Docklink
//
//  Created by Kashif Khatri on 06/04/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

import React, { Component } from "react";
import { Text, StyleSheet, Image, View, ActivityIndicator } from "react-native";
import PropTypes from 'prop-types';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Button } from "native-base";
import colors from "../utils/Colors";
import { Fonts } from "../utils/Fonts";
import FontSize from "../utils/FontSize";
import GlobalStyles from "../styles/GlobalStyles";

export default class AppButton extends Component {

    state = {
        requesting: false
    }

    constructor(props) {
        super(props);
    }
    componentDidMount() {
        // console.log("AppButton")
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <>
                {/* CUSTOM APP BUTTON */}
                <Button
                    disabled={false}
                    ref={'btn'}
                    // ref={ref => this.camera = ref}
                    style={[{ width: wp(80), height: hp(7), alignSelf: 'center', margin: 0, justifyContent: 'center', borderRadius: wp('2%') / 2, backgroundColor: colors.btnBgColor, zIndex: 0 }, this.props.styles]}
                    onPress={() => {
                        if (this.state.requesting == false) {
                            this.props.onPressButton()
                        }
                    }}
                    onStartRequesting={() => {
                        this.setState({
                            requesting: true
                        })
                    }}
                    onClear={() => {
                        this.setState({
                            requesting: false
                        })
                    }}
                >
                    {this.props.icon ?
                        <View style={{ width: wp(6), height: wp(6), marginRight: wp(3), }}>
                            <Image source={this.props.icon} style={[GlobalStyles.imgContain]} />
                        </View>
                        :
                        null
                    }
                    {
                        (this.state.requesting == true)
                            ? <ActivityIndicator animating={true} color='#fff' size="small" />
                            : <Text style={{ color: this.props.textColor, fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase", fontSize: this.props.textSize, }}>{this.props.title}</Text>
                    }

                </Button>
            </>
        );
    }
}

const styles = StyleSheet.create({

});

AppButton.propTypes = {
    title: PropTypes.string.isRequired,
    textColor: PropTypes.string,
    textSize: PropTypes.number,
    onPressButton: PropTypes.func,
    icon: PropTypes.object,
};

AppButton.defaultProps = {
    title: "",
    icon: null,
    textColor: colors.white,
    textSize: FontSize('small'),
    onPressButton: () => { },
}
