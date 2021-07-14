//
//  CustomTextInput.js
//  Doclink
//
//  Created by Kashif Khatri on 06/23/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

import React from 'react';
import { View, TextInput, Image, Text, InputAccessoryView, Keyboard, Platform, Button, Alert, TouchableOpacity, } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import PropTypes from 'prop-types';
import { TextInputMask } from 'react-native-masked-text';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';


const inputAccessoryViewID = 'inputAccessoryView1';

export default class CustomTextInput extends React.Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        icon: PropTypes.any.isRequired,
        placeholder: PropTypes.string.isRequired,
        onChangeText: PropTypes.func,
        maxLength: PropTypes.number,
        editable: PropTypes.bool,
        error: PropTypes.bool,
        onPressButton: PropTypes.func,
        keyboardType: PropTypes.string,
        masking: PropTypes.bool,
        maskType: PropTypes.string,
        maskOptions: PropTypes.object,
    };

    // Default values for props
    static defaultProps = {
        title: "",
        text: "",
        icon: "",
        placeholder: "",
        onChangeText: () => { },
        maxLength: 30,
        editable: false,
        error: false,
        onBeginEditing: '',
        keyboardType: "default",
        masking: false,
        maskType: '',
        maskOptions: {}
    }

    state = {
        title: "",
        text: "",
        placeholder: "",
        keyboardType: "",
        maxLength: "",
        editable: false,
        error: false,
        masking: "",
        maskType: "",
        maskOptions: {}
    }

    constructor(props) {
        super(props);
    }

    async componentWillMount() {
        const { title, placeholder, text, keyboardType, icon, maxLength, masking, maskType, maskOptions } = this.props

        await this.setState({
            title: title,
            text: text,
            placeholder: placeholder,
            keyboardType: keyboardType,
            icon: icon,
            maxLength: maxLength,
            masking: masking,
            maskType: maskType,
            maskOptions: maskOptions,
        });
    }

    // componentDidMount() {
    //     console.log("EmptyView")
    // }

    validate = () => {

    }

    render() {
        const { title, placeholder, text, keyboardType, icon, maxLength, masking, maskType, maskOptions } = this.state
        const { editable, isVerified, error } = this.props
        return (
            <View style={{ height: "auto", width: "100%", marginBottom: wp(4), backgroundColor: "transparent", }}>
                <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, textTransform: 'capitalize', marginTop: wp(0), paddingBottom: hp(1.5), }}>{title}</Text>
                <View style={[error == true ? GlobalStyles.borderError : GlobalStyles.borderGray, { width: "100%", height: hp(7), borderRadius: wp(1), }]}>
                    {
                        (masking == true) ?
                            <TextInputMask
                                style={{
                                    fontFamily: Fonts.HelveticaNeue,
                                    fontSize: FontSize('small'),
                                    color: colors.black,
                                    backgroundColor: 'transparent',
                                    height: hp(7),
                                    paddingLeft: wp(4),
                                }}
                                placeholder={placeholder}
                                placeholderTextColor={colors.gray}
                                maxLength={maxLength}
                                editable={editable}
                                onChangeText={this.props.onChangeText}
                                onTouchStart={this.props.onBeginEditing}
                                value={this.props.value}
                                ref='_input'
                                type={maskType}
                                autoFocus={false}
                                options={maskOptions}
                                keyboardType={keyboardType}
                                inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                            />
                            :
                            (editable == true) ?
                                <TextInput
                                    style={{
                                        fontFamily: Fonts.HelveticaNeue,
                                        fontSize: FontSize('small'),
                                        color: colors.black,
                                        backgroundColor: 'transparent',
                                        height: hp(7),
                                        paddingLeft: wp(4),
                                    }}
                                    placeholder={placeholder}
                                    placeholderTextColor={"#888888"}
                                    maxLength={maxLength}
                                    editable={editable}
                                    onChangeText={this.props.onChangeText}
                                    value={this.props.value}
                                    onTouchStart={this.props.onBeginEditing}
                                    keyboardType={keyboardType}
                                    spellCheck={false}
                                    autoCorrect={false}
                                    inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                >
                                </TextInput>
                                :
                                <TouchableOpacity style={{ width: "100%", height: hp(5), }} onPress={this.props.onBeginEditing}>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text style={{
                                            fontFamily: fonts.latoLight,
                                            fontSize: FontStyles.style('xMini'),
                                            color: (this.props.value == "") ? colors.gray : colors.black,
                                            marginLeft: 3,
                                            textAlignVertical: 'center'
                                        }}>{(this.props.value == "") ? this.props.placeholder : this.props.value}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                    }

                </View>
                {
                    (Platform.OS === 'ios') ?
                        <InputAccessoryView nativeID={inputAccessoryViewID}>
                            <View style={{ backgroundColor: colors.grayFour, alignItems: 'flex-end', width: 100, height: 45, justifyContent: 'center' }}>
                                <Button
                                    color={colors.black}
                                    onPress={() =>
                                        // Hide that keyboard!
                                        Keyboard.dismiss()
                                    }
                                    title="Done"
                                />
                            </View>
                        </InputAccessoryView>
                        :
                        null
                }

            </View>
        )
    }
}