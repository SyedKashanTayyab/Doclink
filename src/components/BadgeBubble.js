import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import PropTypes from 'prop-types';
import { Badge, Text } from 'native-base';
import colors from '../utils/Colors'
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';

class BadgeBubble extends Component {
    render() {
        let badgeCount = this.props.count;
        let width = (badgeCount > 99) ? 30 : (badgeCount > 9) ? 23 : 18
        return (
            <View style={{ backgroundColor: colors.transparent, alignItems: "center", right: 0, marginRight: 0, marginLeft: 5 }}>
                <View style={{ backgroundColor: this.props.badgeBgColor, borderRadius: width / 2, width: width, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ marginTop: Platform.OS == 'ios' ? 2 : 0, width: "100%", height: "100%", color: this.props.textColor, fontFamily: Fonts.HelveticaNeue, fontSize: Platform.OS == 'ios' ? FontSize('xMini') : FontSize('xMini'), textAlign: 'center', textAlignVertical: 'center' }}>
                        {badgeCount}
                    </Text>
                </View>
            </View >
        )
    }
}
export default BadgeBubble

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})



BadgeBubble.propTypes = {
    textColor: PropTypes.string,
    count: PropTypes.string,
    badgeBgColor: PropTypes.string,
};

BadgeBubble.defaultProps = {
    count: PropTypes.string.isRequired,
    badgeBgColor: colors.btnBgColor,
    textColor: colors.white,
}
