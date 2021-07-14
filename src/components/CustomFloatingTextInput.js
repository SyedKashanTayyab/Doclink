//
//  CustomFloatingTextInput.js
//  DocLink
//
//  Created by Kashif Khatri on 06/11/2020.
//  Copyright © 2020 Nexus Corporation LTD. All rights reserved.
//

'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import {
	StyleSheet,
	TextInput,
	Animated,
	Easing,
	Text,
	View,
	Platform,
	ViewPropTypes,
	InputAccessoryView,
	Button,
	Keyboard
} from 'react-native';
import { hp, wp } from '../utils/Utility';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { TextInputMask } from 'react-native-masked-text';

var textPropTypes = Text.propTypes || ViewPropTypes
var textInputPropTypes = TextInput.propTypes || textPropTypes
var propTypes = {
	...textInputPropTypes,
	inputStyle: textInputPropTypes.style,
	labelStyle: textPropTypes.style,
	disabled: PropTypes.bool,
	style: ViewPropTypes.style,
}

const inputAccessoryViewID = 'inputAccessoryView1';

var FloatingLabel = createReactClass({
	propTypes: propTypes,

	getInitialState() {
		var state = {
			text: this.props.value,
			dirty: (this.props.value || this.props.placeholder)
		};

		var style = state.dirty ? dirtyStyle : cleanStyle
		state.labelStyle = {
			fontSize: new Animated.Value(style.fontSize),
			top: new Animated.Value(style.top)
		}

		return state
	},

	componentWillReceiveProps(props) {
		if (typeof props.value !== 'undefined' && props.value !== this.state.text) {
			this.setState({ text: props.value, dirty: !!props.value })
			this._animate(!!props.value)
		}
	},

	_animate(dirty) {
		var nextStyle = dirty ? dirtyStyle : cleanStyle
		var labelStyle = this.state.labelStyle
		var anims = Object.keys(nextStyle).map(prop => {
			return Animated.timing(
				labelStyle[prop],
				{
					toValue: nextStyle[prop],
					duration: 200
				},
				Easing.ease
			)
		})

		Animated.parallel(anims).start()
	},

	_onFocus() {
		this._animate(true)
		this.setState({ dirty: true })
		if (this.props.onFocus) {
			this.props.onFocus(arguments);
		}
	},

	_onBlur() {
		if (!this.state.text) {
			this._animate(false)
			this.setState({ dirty: false });
		}

		if (this.props.onBlur) {
			this.props.onBlur(arguments);
		}
	},

	onChangeText(text) {
		this.setState({ text })
		if (this.props.onChangeText) {
			this.props.onChangeText(text)
		}
	},

	updateText(event) {
		var text = event.nativeEvent.text
		this.setState({ text })

		if (this.props.onEndEditing) {
			this.props.onEndEditing(event)
		}
	},

	_renderLabel() {
		const { callingCode, error } = this.props;
		// console.log("_renderLabel error :)", error);
		let errorValue = (error) ? error : null;
		let labelStyleColor = (this.state.dirty) ? (errorValue ? styles.labelStyleErrorColor : styles.labelStyleActiveColor) : styles.labelStyleDefaultColor;
		return (
			<Animated.Text
				ref='label'
				style={[this.state.labelStyle, styles.label, labelStyleColor, this.props.labelStyle,]}
			>
				{this.props.children}
			</Animated.Text>
		)
	},

	render() {
		const { callingCode, error, callingCodeStyle } = this.props;
		let callingCodeValue = callingCode ? callingCode : null;

		// console.log("callingCode", callingCode, typeof callingCode);

		// CHANGE FIELD STYLE ON FOCUS
		let textInputActive = this.state.dirty ? styles.textInputActiveStyle : styles.textInputDefaultStyle;

		var props = {
			autoCapitalize: this.props.autoCapitalize,
			autoCorrect: this.props.autoCorrect,
			autoFocus: this.props.autoFocus,
			bufferDelay: this.props.bufferDelay,
			clearButtonMode: this.props.clearButtonMode,
			clearTextOnFocus: this.props.clearTextOnFocus,
			controlled: this.props.controlled,
			editable: this.props.editable,
			enablesReturnKeyAutomatically: this.props.enablesReturnKeyAutomatically,
			keyboardType: this.props.keyboardType,
			maxLength: this.props.maxLength,
			multiline: this.props.multiline,
			numberOfLines: this.props.numberOfLines,
			onBlur: this._onBlur,
			onChange: this.props.onChange,
			onChangeText: this.onChangeText,
			onEndEditing: this.updateText,
			onFocus: this._onFocus,
			ref: this.props.myRef,
			onSubmitEditing: this.props.onSubmitEditing,
			password: this.props.secureTextEntry || this.props.password, // Compatibility
			placeholder: this.props.placeholder,
			secureTextEntry: this.props.secureTextEntry || this.props.password, // Compatibility
			returnKeyType: this.props.returnKeyType,
			selectTextOnFocus: this.props.selectTextOnFocus,
			selectionState: this.props.selectionState,
			selectionColor: this.props.selectionColor,
			style: [styles.input, textInputActive,],
			testID: this.props.testID,
			accessibilityLabel: this.props.accessibilityLabel,
			value: this.state.text,
			underlineColorAndroid: this.props.underlineColorAndroid, // android TextInput will show the default bottom border
			onKeyPress: this.props.onKeyPress,
		},
			elementStyles = [styles.element];

		if (this.props.inputStyle) {
			props.style.push(this.props.inputStyle);
		}

		if (this.props.style) {
			elementStyles.push(this.props.style);
		}

		if (this.props.masking == true) {
			props['masking'] = this.props.masking
			props['type'] = this.props.maskType
			props['autoFocus'] = this.props.autoFocus
			props['options'] = this.props.maskOptions
		}

		return (
			<View style={[elementStyles, { justifyContent: "center", marginBottom: 0, backgroundColor: colors.transparent, height: hp(7) }]}>
				{this._renderLabel()}
				<View style={{ height: (Platform.OS === 'ios') ? hp(7) : hp(7), width: "100%", backgroundColor: colors.transparent }}>
					{
						callingCodeValue ?
							<View style={{
								position: "absolute",
								color: colors.black,
								backgroundColor: colors.transparent,
								width: wp(13),
								margin: 0,
								height: hp(7),
								borderWidth: 1,
								borderColor: colors.borderColor,
								borderBottomLeftRadius: wp(1),
								borderTopLeftRadius: wp(1),
								borderBottomRightRadius: 0,
								borderTopRightRadius: 0,
								overflow: 'hidden',
								justifyContent: 'center',
								alignItems: 'center',
								left: 0,
								top: 0,
							}}>
								<Text style={[styles.callingCodeDefaultStyle, callingCodeStyle]}>{callingCodeValue}</Text>
							</View>
							:
							null
					}

					{
						this.props.masking == true ?
							<TextInputMask
								{...props}
								inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
							>
							</TextInputMask>
							:
							<TextInput
								{...props}
								inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
							>
							</TextInput>
					}
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
			</View>
		);
	},
});

var labelStyleObj = {
	//marginTop: hp(2.7),
	paddingLeft: 9,
	color: '#AAA',
	position: 'absolute',
	backgroundColor: colors.white,
	fontFamily: Fonts.HelveticaNeue,
	left: wp(4.5),
}

if (Platform.OS === 'web') {
	labelStyleObj.pointerEvents = 'none'
}

const styles = StyleSheet.create({

	element: {
		position: 'relative'
	},
	input: {
		fontFamily: Fonts.HelveticaNeue,
		height: hp(7),
		borderColor: colors.borderColor,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		borderWidth: 1,
		color: colors.black,
		fontSize: FontSize('small'),
		borderRadius: wp(1),
		paddingLeft: 29,
		marginTop: 0,
	},

	label: labelStyleObj,

	labelStyleErrorColor: {
		color: colors.errorColor,
		zIndex: 1,
	},
	labelStyleActiveColor: {
		color: colors.primary,
		zIndex: 1,
	},
	labelStyleDefaultColor: {
		color: colors.placeholderColor,
	},
	textInputDefaultStyle: {
		borderColor: colors.borderColor
	},
	textInputActiveStyle: {
		borderColor: colors.primary,
	},
	callingCodeDefaultStyle: {
		backgroundColor: colors.transparent,
		textAlignVertical: "center",
		textAlign: "center",
		fontFamily: Fonts.HelveticaNeue,
		fontSize: FontSize('small'),
		lineHeight: FontSize('small'),
		paddingHorizontal: wp(0),
	}
})

var cleanStyle = {
	fontSize: FontSize('small'),
	top: hp(2.2),
}

var dirtyStyle = {
	fontSize: 12,
	top: -9,
}


module.exports = FloatingLabel;