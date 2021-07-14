//
//  AppTextField.js
//  DocLink
//
//  Created by Kashif Khatri on 18/06/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

import React, { Fragment } from 'react';
import { View, TextInput, Image, Text, TouchableOpacity, } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PropTypes from 'prop-types';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import GlobalStyles from '../styles/GlobalStyles';
import colors from '../utils/Colors';
import FloatingLabel from './CustomFloatingTextInput';


export default class AppTextInput extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        mode: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        verifyLabel: PropTypes.string,
        icon: PropTypes.any.isRequired,
        placeholder: PropTypes.string.isRequired,
        onChangeText: PropTypes.func,
        onBlur: PropTypes.func,
        maxLength: PropTypes.number,
        editable: PropTypes.bool,
        onPressButton: PropTypes.func,
        keyboardType: PropTypes.string,
        masking: PropTypes.bool,
        maskType: PropTypes.string,
        maskOptions: PropTypes.object,
    };

    // Default values for props
    static defaultProps = {
        title: "",
        mode: "textinput", // type: "textinput" | "textinput-code" | "floating-label-input" | "label-view" : | "icon-label-view" | "icon-label-edit-view"
        label: "",
        value: "",
        verifyLabel: "",
        icon: "",
        placeholder: "",
        onChangeText: () => { },
        onBlur: () => { },
        maxLength: 30,
        editable: false,
        onBeginEditing: '',
        keyboardType: "default",
        masking: false,
        maskType: '',
        maskOptions: {}
    }

    state = {
        title: "",
        mode: "",
        label: "",
        value: "",
        verifyLabel: "",
        text: "",
        placeholder: "",
        keyboardType: "",
        maxLength: "",
        editable: false,
        masking: "",
        maskType: "",
        maskOptions: {}
    }

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        const { title, mode, label, text, placeholder, value, error, keyboardType, icon, maxLength, masking, maskType, maskOptions, verifyLabel } = this.props

        await this.setState({
            title: title,
            mode: mode,
            label: label,
            value: value,
            verifyLabel: verifyLabel,
            error: error,
            text: value,
            placeholder: placeholder,
            keyboardType: keyboardType,
            icon: icon,
            maxLength: maxLength,
            masking: masking,
            maskType: maskType,
            maskOptions: maskOptions,
        });
    }

    static getDerivedStateFromProps(props, state) {
        // console.log("=========================");
        // console.log("getDerivedStateFromProps onChangeText", props.value, props.state);
        // console.log("=========================");

        if (props.mode && props.mode !== state.mode) {
            return {
                title: props.title,
                mode: props.mode,
                label: props.label,
                value: props.value,
                verifyLabel: props.verifyLabel,
                icon: props.icon,
                onChangeText: props.onChangeText,
                error: props.error,
                onBlur: props.onValidatePress,
                maxLength: props.maxLength,
            };
        }
        if (typeof props.value !== 'undefined' && props.value !== state.value) {
            return {
                title: props.title,
                mode: props.mode,
                label: props.label,
                value: props.value,
                verifyLabel: props.verifyLabel,
                icon: props.icon,
                onChangeText: props.onChangeText,
                error: props.error,
                onBlur: props.onValidatePress,
                maxLength: props.maxLength,
            };
        }

        // Return null to indicate no change to state.
        return null;
    }


    // componentDidMount() {
    //     console.log("EmptyView")
    // }

    validate = () => {

    }

    render() {
        const { title, mode, label, placeholder, value, verifyLabel, error, keyboardType, icon, maxLength, masking, maskType, maskOptions } = this.state
        const { } = this.props
        // console.log("=========================");
        // console.log("mode", mode, " \n value ==>", value, "=====", " \n error ==> ", error, "======");
        // console.log("=========================");

        return (
            <>
                {
                    (mode == "icon-label-view") ?
                        ////////////////////////
                        // TEXT INPUT LABEL VIEW
                        <View style={{ flexDirection: "row", justifyContent: 'center', }}>
                            <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), }]}>
                                <Image source={icon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                            </View>
                            <View style={[{ flex: 1, paddingVertical: hp(1.5), borderBottomColor: colors.strokeColor4, borderBottomWidth: 1, }]}>
                                <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: '#aaaaaa', marginBottom: hp(0.3), }]}>
                                    {label}
                                </Text>
                                <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, }]}>
                                    {value}
                                </Text>
                            </View>
                        </View>
                    :
                    (mode == "icon-label-row-view") ?
                        ////////////////////////
                        // TEXT INPUT LABEL ROW VIEW
                        <View style={{ flexDirection: "row", justifyContent: 'center', }}>
                            <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), }]}>
                                <Image source={icon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                            </View>
                            <View style={[{ flex: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: hp(1.5), borderBottomColor: colors.strokeColor4, borderBottomWidth: 1, }]}>
                                <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, marginBottom: hp(0.3), }]}>
                                    {label}
                                </Text>
                                <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, }]}>
                                    {value}
                                </Text>
                            </View>
                        </View>
                        :
                        (mode == "icon-label-edit-view") ?
                            ////////////////////////
                            // TEXT INPUT LABEL VIEW WITH ICON
                            <View style={{ flexDirection: "row", justifyContent: 'center', marginTop: 10, minHeight: hp(7), height: 'auto' }}>
                                <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), }]}>
                                    <Image source={icon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                </View>
                                <View style={[{ flex: 1, flexDirection: "row", borderBottomColor: colors.strokeColor4, borderBottomWidth: 1 }]}>
                                    <View style={{ flex: 1, justifyContent: "center", marginBottom: 10 }}>
                                        <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: '#aaaaaa', marginBottom: hp(0.3), }]}>
                                            {label}
                                        </Text>
                                        <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, }]}>
                                            {value}
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.props.onEditPress()} style={[{ justifyContent: "center", alignItems: "flex-end", width: wp(10), paddingLeft: wp(0), marginBottom: 10}]}>
                                        <Image source={require('../assets/icons/edit_icon.png')} resizeMode='contain' style={{ width: wp(5), height: wp(5), }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            (mode == "icon-label-verify-view") ?
                                ////////////////////////
                                // TEXT INPUT LABEL VIEW WITH VERIFICATION VIEW
                                <View style={{ flexDirection: "row", justifyContent: 'center', marginTop: hp(0.5), minHeight: hp(7), height: 'auto' }}>
                                    <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), }]}>
                                        <Image source={icon} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                    </View>
                                    <View style={[{ flex: 1, flexDirection: "row", borderBottomColor: colors.strokeColor4, borderBottomWidth: 1, }]}>
                                        <View style={{ flex: 1, justifyContent: "center", marginBottom: hp(0.5), }}>
                                            <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: '#aaaaaa', marginBottom: hp(0.3), }]}>
                                                {label}
                                            </Text>
                                            <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, }]}>
                                                {value}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => this.props.onEditPress()} style={[{ justifyContent: "center", alignItems: "center", width: wp(10), paddingLeft: wp(0), marginBottom: hp(0.5) }]}>
                                            <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.primaryText, textTransform: "capitalize", textDecorationLine: "underline" }]}>
                                                {verifyLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                :
                                // (mode == "floating-label-input") ?
                                //     ////////////////////////
                                //     // FLOATING LABEL TEXT INPUT FIELD
                                //     <FloatingLabel
                                //         labelStyle={[GlobalStyles.labelStyle,]}
                                //         inputStyle={[GlobalStyles.inputStyle, (error) ? GlobalStyles.inputErrorStyle : {} ]}
                                //         style={[ GlobalStyles.inputWrapper ]}
                                //         value={value}
                                //         onChangeText={this.props.onChangeText}
                                //         onBlur={() => this.props.onValidatePress()}
                                //         error={error} 
                                //     >
                                //         {/* PLACEHOLDER */}
                                //         {(error) ? error : label }
                                //     </FloatingLabel>
                                //     :
                                // (mode == "textinput") ?
                                //     ////////////////////////
                                //     // TEXT INPUT FIELD
                                //     <Fragment>
                                //         <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, }}>{title}</Text>
                                //         <TextInput
                                //             style={{
                                //                 fontFamily: Fonts.latoLight,
                                //                 fontSize: FontSize('xMini'),
                                //                 color: colors.black,
                                //                 // backgroundColor: '#f1f1f1',
                                //             }}
                                //             placeholder={placeholder}
                                //             placeholderTextColor={colors.gray}
                                //             maxLength={maxLength}
                                //             // editable={true}
                                //             onChangeText={this.props.onChangeText}
                                //             value={this.props.value}
                                //             onTouchStart={this.props.onBeginEditing}
                                //             keyboardType={keyboardType}
                                //             spellCheck={false}
                                //             autoCorrect={false}
                                //             inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                //         >
                                //         </TextInput>
                                //     </Fragment>
                                //     :
                                null
                }
            </>
        )
    }
}
