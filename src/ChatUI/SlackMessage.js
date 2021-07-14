/* eslint-disable no-underscore-dangle, no-use-before-define */

import PropTypes from 'prop-types'
import React from 'react'
import { View, ViewPropTypes, StyleSheet } from 'react-native'

import { Avatar, Day, utils } from 'react-native-gifted-chat'
import Bubble from './SlackBubble'

import FontSize from '../utils/FontSize';
import colors from '../utils/Colors'
import { Fonts, BaseUrl } from '../utils/Fonts';
import { wp } from '../utils/Utility';

const { isSameUser, isSameDay } = utils

export default class Message extends React.Component {
    getInnerComponentProps() {
        const { containerStyle, ...props } = this.props
        return {
            ...props,
            position: (this.props.currentMessage.user._id == this.props.user._id) ? 'right' : 'left',
            isSameUser,
            isSameDay,
        }
    }

    renderDay() {
        if (this.props.currentMessage.createdAt) {
            const dayProps = this.getInnerComponentProps()
            if (this.props.renderDay) {
                return this.props.renderDay(dayProps)
            }
            return <Day {...dayProps}
                textStyle={[
                    styles.dayStyle
                ]} />
        }
        return null
    }

    renderBubble() {
        const bubbleProps = this.getInnerComponentProps()
        // if (this.props.renderBubble) {
        //   return this.props.renderBubble(bubbleProps)
        // }
        return <Bubble {...bubbleProps} />
    }

    renderAvatar() {
        let extraStyle
        if (
            isSameUser(this.props.currentMessage, this.props.previousMessage) &&
            isSameDay(this.props.currentMessage, this.props.previousMessage)
        ) {
            // Set the invisible avatar height to 0, but keep the width, padding, etc.
            extraStyle = { height: 0 }
        }

        const avatarProps = this.getInnerComponentProps()
        return (
            <Avatar
                {...avatarProps}
                imageStyle={{
                    left: [styles.slackAvatar, avatarProps.imageStyle, extraStyle],
                }}
            />
        )
    }

    render() {
        const marginBottom = isSameUser(
            this.props.currentMessage,
            this.props.nextMessage,
        )
            ? 3
            : 5

        return (
            <View>
                {this.renderDay()}
                <View
                    style={[
                        (this.props.currentMessage.system == true) ? styles.containerForSystem : styles.container,
                        { marginBottom },
                        this.props.containerStyle,
                    ]}
                >
                    {/* {this.renderAvatar()} */}
                    {this.renderBubble()}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: 'gray',
        // height: 50,
        flexDirection: 'row',
        // alignItems: 'flex-end',
        // justifyContent: 'flex-start',
        marginLeft: 0,
        marginRight: 0,
    },
    containerForSystem: {
        // height: 40,
        // flexDirection: 'row',
        // alignItems: 'flex-end',
        // justifyContent: 'flex-start',
        marginLeft: 0,
        marginRight: 0,
    },
    slackAvatar: {
        // The bottom should roughly line up with the first line of message text.
        height: 40,
        width: 40,
        borderRadius: 3,
    },
    dayStyle: {
        color: colors.primaryText,
        fontSize: FontSize('xMini'),
        fontFamily: Fonts.HelveticaNeue,
        textTransform: 'uppercase',
        backgroundColor: colors.aliceBlue,
        paddingHorizontal: wp(3),
        paddingVertical: wp(1),
        borderRadius: wp(2)
    }
})

Message.defaultProps = {
    renderAvatar: undefined,
    renderBubble: null,
    renderDay: null,
    currentMessage: {},
    nextMessage: {},
    previousMessage: {},
    user: {},
    containerStyle: {},
}

Message.propTypes = {
    renderAvatar: PropTypes.func,
    renderBubble: PropTypes.func,
    renderDay: PropTypes.func,
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    user: PropTypes.object,
    containerStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
}