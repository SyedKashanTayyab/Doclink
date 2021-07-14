/* eslint-disable no-underscore-dangle, no-use-before-define */

import PropTypes from 'prop-types'
import React from 'react'
import {
    Text,
    Clipboard,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewPropTypes,
    Platform,
    Image
} from 'react-native'

import {
    MessageText,
    MessageImage,
    Time,
    utils,
    SystemMessage,
} from 'react-native-gifted-chat'

import FontSize from '../utils/FontSize';
import colors from '../utils/Colors'
import { Fonts, BaseUrl } from '../utils/Fonts';
import { wp, hp } from '../utils/Utility';
import GlobalStyles from '../styles/GlobalStyles';
import { RATIO } from '../utils/Constant';
import VoicePlayer from '../components/VoicePlayer'

const { isSameUser, isSameDay } = utils

let imageTickSeen = require('../../src/assets/icons/tick-seen.png')
let imageTickDelivered = require('../../src/assets/icons/tick-delivered.png')
let imageTickSent = require('../../src/assets/icons/tick-sent.png')
let imageTickPending = require('../../src/assets/icons/tick-pending.png')

export default class Bubble extends React.Component {
    constructor(props) {
        super(props)
        this.onLongPress = this.onLongPress.bind(this)
    }

    onLongPress() {
        if (this.props.currentMessage.system) {
            return null
        }
        if (this.props.onLongPress) {
            this.props.onLongPress(this.context, this.props.currentMessage)
        } else {
            if (this.props.currentMessage.text) {
                const options = ['Copy Text', 'Cancel']
                const cancelButtonIndex = options.length - 1
                this.context.actionSheet().showActionSheetWithOptions(
                    {
                        options,
                        cancelButtonIndex,
                    },
                    buttonIndex => {
                        switch (buttonIndex) {
                            case 0:
                                Clipboard.setString(this.props.currentMessage.text)
                                break
                        }
                    },
                )
            }
        }
    }

    onStatusPress = (e) => {
        const touchX = e.nativeEvent.locationX;
        console.log(`touchX: ${touchX}`);
        const playWidth =
            (this.state.currentPositionSec / this.state.currentDurationSec) *
            (SCREEN_WIDTH - 56 * RATIO);
        console.log(`currentPlayWidth: ${playWidth}`);

        const currentPosition = Math.round(this.state.currentPositionSec);
        console.log(`currentPosition: ${currentPosition}`);

        if (playWidth && playWidth < touchX) {
            const addSecs = Math.round(currentPosition + 1000);
            this.audioRecorderPlayer.seekToPlayer(addSecs);
            console.log(`addSecs: ${addSecs}`);
        } else {
            const subSecs = Math.round(currentPosition - 1000);
            this.audioRecorderPlayer.seekToPlayer(subSecs);
            console.log(`subSecs: ${subSecs}`);
        }
    };

    renderMessageText() {
        // System Message
        if (this.props.currentMessage.system) {
            const {
                containerStyle,
                wrapperStyle,
                ...messageTextProps
            } = this.props
            if (this.props.renderSystemMessage) {
                return this.props.renderSystemMessage(messageTextProps)
            }
            return (
                <SystemMessage
                    {...messageTextProps}
                    containerStyle={styles.systemMessageContainer}
                    wrapperStyle={styles.systemMessageWrapper}
                    textStyle={[styles.systemMessageText, {
                        color: colors.primaryText,
                        fontSize: FontSize('small'),
                        fontFamily: Fonts.HelveticaNeue,
                    }]}
                />
            )
        }

        else if (this.props.currentMessage.audio) {
            // console.log("this.props.currentMessage.audio", this.props.currentMessage)
            return (
                <VoicePlayer
                    data={this.props.currentMessage}
                    containerStyle={{
                        width: wp(60),
                        height: hp(7),
                    }}
                />
            )
        }

        // User Message
        else if (this.props.currentMessage.text) {
            const {
                containerStyle,
                wrapperStyle,
                messageTextStyle,
                ...messageTextProps
            } = this.props
            if (this.props.renderMessageText) {
                return this.props.renderMessageText(messageTextProps)
            }
            // console.log("messageTextProps.textStyle", messageTextProps)
            return (
                <MessageText
                    {...messageTextProps}
                    containerStyle={{}}
                    textStyle={{
                        left: [
                            styles.slackMessageText,
                            // messageTextProps.textStyle,
                            {
                                textAlign: 'auto',
                                alignSelf: 'auto',
                            }
                        ],
                        right: [
                            styles.slackMessageText,
                            {
                                textAlign: 'auto',
                                alignSelf: 'auto'
                            }
                        ],
                    }}
                />
            )
        }
        return null
    }

    renderMessageImage() {
        if (this.props.currentMessage.image) {
            const { containerStyle, wrapperStyle, ...messageImageProps } = this.props
            if (this.props.renderMessageImage) {
                return this.props.renderMessageImage(messageImageProps)
            }

            const images = [{
                // Simplest usage.
                url: this.props.currentMessage.image,
                // You can pass props to <Image />.
                props: {
                    // headers: ...
                }
            }, {
                props: {
                    // Or you can set source directory.
                    //   source: require('../background.png')
                }
            }];
            // console.log("renderMessageImage", this.props.messageImageProps)
            return (
                <TouchableOpacity onPress={() => this.props.imageProps.openImageViewer(images)}>
                    <Image
                        source={{ uri: this.props.currentMessage.image }}
                        style={[containerStyle, styles.slackImage, messageImageProps.imageStyle]}
                    />
                </TouchableOpacity>
            );
        }

        // if (this.props.currentMessage.image) {
        //     const { containerStyle, wrapperStyle, ...messageImageProps } = this.props
        //     if (this.props.renderMessageImage) {
        //         return this.props.renderMessageImage(messageImageProps)
        //     }
        //     return (
        //         <MessageImage

        //             {...messageImageProps}
        //             imageStyle={[styles.slackImage, messageImageProps.imageStyle]}
        //             lightboxProps={{
        //                 onClick: (data) => {
        //                     console.log("Clicked akdfjalksdfjlaksjdlkf")
        //                 },
        //                 onLongPress: (context, message) => {
        //                     console.log("clicked lightboxprops")
        //                 }
        //             }}
        //         />
        //     )
        // }
        return null
    }

    renderTicks() {
        const { currentMessage } = this.props

        if (this.props.currentMessage.system) {
            return null
        }
        if (this.props.renderTicks) {
            return this.props.renderTicks(currentMessage)
        }
        if (currentMessage.user._id !== this.props.user._id) {
            return null
        }

        if (currentMessage.sent == true && currentMessage.received == true) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={imageTickSeen} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        } else if (currentMessage.received) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={imageTickDelivered} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        }
        else if (currentMessage.sent) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={imageTickSent} style={{ width: 10, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        } else if (currentMessage.pending) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={imageTickPending} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        }
        // if (currentMessage.sent || currentMessage.received) {
        //     return (
        //         <View style={[styles.headerItem, styles.tickView]}>
        //             {currentMessage.sent && (
        //                 <Image source={require('../../src/assets/icons/tick-sent.png')} />
        //             )}
        //             {currentMessage.received && (
        //                 <Image source={require('../../src/assets/icons/tick-delivered.png')} />
        //             )}
        //         </View>
        //     )
        // }
        return null
    }

    //   renderUsername() {
    //     const username = this.props.currentMessage.user.name
    //     if (username) {
    //       const { containerStyle, wrapperStyle, ...usernameProps } = this.props
    //       if (this.props.renderUsername) {
    //         return this.props.renderUsername(usernameProps)
    //       }
    //       return (
    //         <Text
    //           style={[
    //             styles.standardFont,
    //             styles.headerItem,
    //             styles.username,
    //             this.props.usernameStyle,
    //           ]}
    //         >
    //           {username}
    //         </Text>
    //       )
    //     }
    //     return null
    //   }

    renderTime() {
        if (this.props.currentMessage.system) {
            return null
        }
        // console.log("====", this.props.currentMessage.createdAt, this.props.currentMessage.text)
        if (this.props.currentMessage.createdAt) {
            const { containerStyle, wrapperStyle, position, ...timeProps } = this.props
            if (this.props.renderTime) {
                return this.props.renderTime(timeProps)
            }
            return (

                <Time
                    {...timeProps}
                    position={position}
                    containerStyle={{ left: [styles.timeContainer], right: [styles.timeContainer,] }}
                    timeTextStyle={{
                        left: [
                            // styles.standardFont,
                            // styles.headerItem,
                            styles.time,
                            {
                                // marginLeft: wp(7),

                            }
                        ],
                        right: [
                            // styles.standardFont,
                            // styles.headerItem,
                            styles.time,
                        ],
                    }}
                />
            )
        }
        return null
    }

    renderCustomView() {
        if (this.props.renderCustomView) {
            return this.props.renderCustomView(this.props)
        }
        return (
            (this.props.currentMessage.is_cheif_complain) ?
                <View style={{ marginLeft: 0 }}><Text style={{ fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold, color: colors.primaryText }}>Chief Complaint</Text></View>
                :
                (this.props.currentMessage.is_diagnosis) ?
                    <View style={{ marginLeft: 0 }}>
                        <Text style={{ fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold, color: colors.primaryText }}>Doctor's Advice</Text>
                    </View>
                    :
                    (this.props.currentMessage.is_notes) ?
                        <View style={{ marginLeft: 0 }}>
                            <Text style={{ fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold, color: colors.primaryText }}>Doctor's Note</Text>
                        </View>
                        :
                        <View></View>
        )
    }

    render() {
        // const isSameThread =
        //     isSameUser(this.props.currentMessage, this.props.previousMessage) &&
        //     isSameDay(this.props.currentMessage, this.props.previousMessage)

        // const messageHeader = isSameThread ? null : (
        //     <View style={styles.headerView}>
        //         {/* {this.renderUsername()} */}
        //         {this.renderTime()}
        //         {this.renderTicks()}
        //     </View>
        // )
        if (this.props.currentMessage.medicine_prescribed) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        this.props.currentMessage.medicinePrescribedCallback({ "chatroom_session_id": this.props.currentMessage.chatroom_session_id })
                    }}>
                        <View style={{ backgroundColor: colors.primaryText, paddingHorizontal: wp(2), paddingVertical: wp(1.5), flexDirection: 'row', alignItems: 'center', borderRadius: wp(2) }}>
                            <Image source={require('../assets/icons/prescription.png')} style={{ width: 15, height: 15, marginRight: wp(2) }} />
                            <Text style={{ color: colors.white, fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }}>{this.props.currentMessage.text}</Text>
                        </View>

                    </TouchableOpacity>
                </View>
            )
        }

        const messageHeader = <View style={styles.headerView}>
            {/* {this.renderUsername()} */}
            {this.renderTime()}
            {this.renderTicks()}
        </View>

        let _justifyContent = (this.props.currentMessage.system)
            ? "center"
            : (this.props.currentMessage.user._id !== this.props.user._id)
                ? "flex-start"
                : "flex-end"


        let card = <View
            style={[
                (this.props.currentMessage.system)
                    ? null
                    : (this.props.currentMessage.user._id !== this.props.user._id) ? styles.wrapperLeft : styles.wrapperRight, this.props.wrapperStyle
                , {

                }]}
        >
            <View>
                {this.renderCustomView()}
                {this.renderMessageImage()}
                {this.renderMessageText()}
                {messageHeader}
            </View>
        </View>

        return (
            <View
                style={[styles.container, this.props.containerStyle, {
                    // backgroundColor: 'green',
                    flexDirection: 'row',
                    justifyContent: _justifyContent,
                    flex: 1,
                }]}
            >
                {
                    (this.props.currentMessage.system)
                        ? card
                        : (this.props.currentMessage.audio)
                            ? card
                            : <TouchableOpacity
                                onLongPress={this.onLongPress}
                                accessibilityTraits='text'
                                {...this.props.touchableProps}
                            >
                                {card}
                            </TouchableOpacity>
                }


            </View>
        )
    }
}

// Note: Everything is forced to be "left" positioned with this component.
// The "right" position is only used in the default Bubble.
const styles = StyleSheet.create({
    standardFont: {
        fontSize: 15,
        color: 'brown'
    },
    slackMessageText: {
        color: 'black',
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        maxWidth: wp(75)
    },
    container: {
        // flex: 1,
        // alignItems: 'flex-start',
        backgroundColor: colors.transparent,
    },
    wrapperLeft: {
        marginLeft: wp(2),
        paddingHorizontal: wp(1),
        // marginRight: 60,
        // minHeight: 20,
        // justifyContent: 'flex-end',
        backgroundColor: "#eceff2",
        borderRadius: 5,
    },
    wrapperRight: {
        marginRight: wp(2),
        paddingHorizontal: wp(1),
        // marginRight: 60,
        // minHeight: 20,
        // justifyContent: 'flex-end',
        backgroundColor: "#cbf6ff",
        borderRadius: 5,
    },
    username: {
        fontWeight: 'bold',
    },
    time: {
        color: colors.grayTwo,
        textAlign: 'right',
    },
    timeContainer: {
        // backgroundColor: 'blue',
        marginTop: -2,
        marginLeft: 0,
        marginRight: wp(0.5),
        marginBottom: 1,
    },
    headerItem: {
        marginRight: 0,
    },
    headerView: {
        // Try to align it better with the avatar on Android.
        // marginTop: Platform.OS === 'android' ? -2 : 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    /* eslint-disable react-native/no-color-literals */
    tick: {
        backgroundColor: 'transparent',
        color: 'black',
    },
    /* eslint-enable react-native/no-color-literals */
    tickView: {
        flexDirection: 'row',
    },
    slackImage: {
        borderRadius: 3,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 3,
        width: wp(60),
        height: hp(30)
    },
    slackAudio: {
        borderRadius: 3,
        marginLeft: 0,
        marginRight: 0,
        width: wp(60),
        height: hp(7)
    },
    systemMessageText: {
        fontSize: FontSize('small'),
        fontFamily: Fonts.HelveticaNeue,
        color: colors.black,
    },
    systemMessageWrapper: {
        backgroundColor: colors.transparent,
    },
    systemMessageContainer: {
        height: hp(2.5),
        // width: wp(100),
    }
})

Bubble.contextTypes = {
    actionSheet: PropTypes.func,
}

Bubble.defaultProps = {
    touchableProps: {},
    onLongPress: null,
    renderMessageImage: null,
    renderMessageText: null,
    renderCustomView: null,
    renderTime: null,
    currentMessage: {
        text: null,
        createdAt: null,
        image: null,
    },
    nextMessage: {},
    previousMessage: {},
    containerStyle: {},
    wrapperStyle: {},
    tickStyle: {},
    containerToNextStyle: {},
    containerToPreviousStyle: {},
}

Bubble.propTypes = {
    touchableProps: PropTypes.object,
    onLongPress: PropTypes.func,
    renderMessageImage: PropTypes.func,
    renderMessageText: PropTypes.func,
    renderCustomView: PropTypes.func,
    renderUsername: PropTypes.func,
    renderTime: PropTypes.func,
    renderTicks: PropTypes.func,
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    user: PropTypes.object,
    containerStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    wrapperStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    messageTextStyle: Text.propTypes.style,
    usernameStyle: Text.propTypes.style,
    tickStyle: Text.propTypes.style,
    containerToNextStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
    containerToPreviousStyle: PropTypes.shape({
        left: ViewPropTypes.style,
        right: ViewPropTypes.style,
    }),
}