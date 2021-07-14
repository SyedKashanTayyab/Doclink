import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RATIO } from '../utils/Constant';

// import NativeButton from 'apsl-react-native-button';

const styles = StyleSheet.create({
    btn: {
        backgroundColor: 'transparent',
        alignSelf: 'center',
        borderRadius: 4 * RATIO,
        borderWidth: 2 * RATIO,
        width: 320 * RATIO,
        height: 52 * RATIO,
        borderColor: 'white',

        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDisabled: {
        backgroundColor: 'rgb(243,243,243)',
        alignSelf: 'center',
        borderRadius: 4 * RATIO,
        borderWidth: 2 * RATIO,
        width: 320 * RATIO,
        height: 52 * RATIO,
        borderColor: '#333',

        alignItems: 'center',
        justifyContent: 'center',
    },
    txt: {
        fontSize: 14 * RATIO,
        color: 'white',
    },
    imgLeft: {
        width: 24 * RATIO,
        height: 24 * RATIO,
        position: 'absolute',
        left: 16 * RATIO,
    },
});

class AudioButton extends Component {

    static propTypes = {
        isLoading: PropTypes.bool,
        isDisabled: PropTypes.bool,
        onPress: () => { },
        style: PropTypes.object,
        disabledStyle: PropTypes.object,
        textStyle: PropTypes.object,
        imgLeftSrc: PropTypes.object,
        imgLeftStyle: PropTypes.object,
        indicatorColor: PropTypes.string,
        activeOpacity: PropTypes.number,
    };

    // Default values for props
    static defaultProps = {
        isLoading: false,
        isDisabled: false,
        style: styles.btn,
        textStyle: styles.txt,
        imgLeftStyle: styles.imgLeft,
        indicatorColor: 'white',
        activeOpacity: 0.5,
    }


    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (this.props.isDisabled) {
            return (
                <View style={this.props.disabledStyle}>
                    <Text style={this.props.textStyle}>{this.props.children}</Text>
                </View>
            );
        }
        if (this.props.isLoading) {
            return (
                <View style={this.props.style}>
                    <ActivityIndicator size='small' color={this.props.indicatorColor} />
                </View>
            );
        }
        return (
            <TouchableOpacity
                activeOpacity={this.props.activeOpacity}
                onPress={this.props.onPress}
            >
                <View style={this.props.style}>
                    {this.props.imgLeftSrc ? (
                        <Image
                            style={this.props.imgLeftStyle}
                            source={this.props.imgLeftSrc}
                        />
                    ) : null}
                    <Text style={this.props.textStyle}>{this.props.children}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default AudioButton;