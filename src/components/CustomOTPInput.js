import React from 'react';
import { StyleSheet, View, ViewPropTypes, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import colors from '../utils/Colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CustomOTPInput = function (props) {
    const {
        containerStyle,
        style,
        LeftComponent,
        RightComponent,
        refCallback,
        ...remainingProps
    } = props;

    return (
        <View style={[styles.containerStyle, containerStyle]}>
            {LeftComponent}
            <TextInput
                {...remainingProps}
                style={[styles.textInputStyle, style]}
                ref={refCallback}
            />
            {RightComponent}
        </View>
    );
};

const styles = StyleSheet.create({
    containerStyle: {
        flexDirection: 'row',
        borderColor: colors.borderColor,
        borderRadius: wp(1),
        borderWidth: 1,
        padding: 8,
    },
    textInputStyle: {
        padding: 0,
    },
});

CustomOTPInput.defaultProps = {
    LeftComponent: <></>,
    RightComponent: <></>,
};

CustomOTPInput.propTypes = {
    containerStyle: ViewPropTypes.style,
    style: ViewPropTypes.style,
    LeftComponent: PropTypes.object,
    RightComponent: PropTypes.object,
    refCallback: PropTypes.func,
};

export default CustomOTPInput;
