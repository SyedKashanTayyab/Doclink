//
//  NavigationBar.js
//  Doclink
//
//  Created by Kashif Khatri on 13/06/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

import React, { Component } from "react";
import { Text, Image, TouchableOpacity, Platform, StatusBar, Dimensions } from "react-native";
import { Header, Left, Right, Body, Icon, View, Title, Button } from "native-base";
import { NavigationActions } from 'react-navigation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PropTypes from 'prop-types';

import colors from "../utils/Colors";
import { Fonts } from "../utils/Fonts";
import Utility from "../utils/Utility";
import GlobalStyles from "../styles/GlobalStyles";
import FontSize from "../utils/FontSize";

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height, width } = Dimensions.get('window');

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const isIPhoneX = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? width === X_WIDTH && height === X_HEIGHT || width === XSMAX_WIDTH && height === XSMAX_HEIGHT
    : false;

const StatusBarHeight = Platform.select({
    ios: isIPhoneX ? 44 : 20,
    android: StatusBar.currentHeight,
    default: 0
})

export default class NavigationBar extends Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        context: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        modal: PropTypes.bool,
        right: PropTypes.object,
        exclusiveBg: PropTypes.string,
        tabs: PropTypes.bool,
        backButton: PropTypes.bool,
        removeBack: PropTypes.bool,
        transparent: PropTypes.bool,
        noShadow: PropTypes.bool,
        navigationBgColor: PropTypes.string,
        titleView: PropTypes.object,
        onBackButtonPress: PropTypes.func,
        statusBarBgColor: PropTypes.string
    };

    // Default values for props
    static defaultProps = {
        title: "",
        modal: false,
        right: null,
        tabs: false,
        backButton: false,
        removeBackButton: false,
        noShadow: false,
        transparent: false,
        navigationBgColor: colors.white,
        onBackButtonPress: undefined,
        exclusiveBg: null,
        statusBarBgColor: colors.primary
    }

    state = {
        left: ""
    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }

    render() {

        const { context, modal,
            backButton, removeBackButton, right, tabs, title,
            statusBarStyle, statusBarBgColor, transparent, noShadow,
            navigationBgColor, titleView, onBackButtonPress, exclusiveBg } = this.props

        let leftElement = null
        let rightElement = null
        let titleElement = null
        let ShadowStyle = null
        const leftMargin = (Platform.OS === "android") ? hp(0.5) : hp(0);

        if (modal == true && backButton == false) {
            leftElement = <Icon name="close" style={{ color: colors.white, height: 25, width: 20, marginLeft: leftMargin, }} onPress={() => {
                context.navigation.dispatch(NavigationActions.back());
            }}></Icon>
        }
        else if (modal == false && backButton == true) {
            let _onPress = (onBackButtonPress == undefined) ? () => { context.navigation.goBack(); } : onBackButtonPress
            leftElement = <TouchableOpacity style={{ width: "auto", height: 35, justifyContent: "center", alignItems: "center", marginLeft: leftMargin, }} onPress={_onPress}>
                <Image source={require("../assets/icons/back_button.png")} resizeMode="contain" style={{ height: 20, width: 30, }}></Image>
            </TouchableOpacity>
        } else {
            leftElement = <TouchableOpacity style={{ width: "auto", height: 35, justifyContent: "center", alignItems: "center", marginLeft: leftMargin, }} onPress={() => { context.navigation.openDrawer(); }}>
                <Image source={require('../assets/icons/back_button.png')} resizeMode="contain" style={{ height: 20, width: 30 }}></Image>
            </TouchableOpacity>
        }

        if (removeBackButton == true) {
            leftElement = null
        }

        if (right != null) {
            rightElement = right
        }

        if (titleView == null) {
            titleElement = <Title style={{ color: colors.white, fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('medium') }}>{title}</Title>
        } else {
            titleElement = titleView
        }

        if (noShadow == true) {
            ShadowStyle = null
        } else {
            ShadowStyle = GlobalStyles.shadowElevationSix
        }

        // console.log("StatusBar.currentHeight", STATUSBAR_HEIGHT, APPBAR_HEIGHT,)


        return (
            <Header
                style={[noShadow ? null : ShadowStyle, {
                    backgroundColor: exclusiveBg == null ? colors.primary : exclusiveBg,
                    margin: 0,
                    height: APPBAR_HEIGHT
                    // marginBottom: noShadow == false ? wp(0) : wp(0),
                }]}
                hasTabs={tabs}
                transparent={transparent}
                iosBarStyle="dark-content"
                noShadow={noShadow}
                androidStatusBarColor={statusBarBgColor}
            >
                <Left style={{ marginRight: (Platform.OS === "android") ? (removeBackButton == true) ? wp(-5) : wp(10) : 0 }}>
                    {leftElement}
                </Left>
                <Body style={{ flex: 6 }}>
                    {titleElement}
                </Body>
                <Right>
                    {rightElement}
                </Right>
            </Header>
        );
    }
}


//  <Body
// style={[
//     removeBackButton == true ? { flex: 6, paddingLeft: wp(0), marginLeft: -wp(4), } : { flex: 6, paddingLeft: wp(4), }
// ]}
// >
// {titleElement}
// </Body>
// <Right style={{ marginRight: hp(0.5), }}>
// {rightElement}
// </Right>