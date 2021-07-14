/* eslint-disable no-underscore-dangle, no-use-before-define */

import PropTypes from 'prop-types'
import React from 'react'
import {
    Text,
    Clipboard,
    StyleSheet,
    TouchableOpacity,
    View,
    Animated,
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
import AppHelper from '../utils/AppHelper';
import AsyncImageView from '../services/AsyncImageView';

const { isSameUser, isSameDay } = utils

let imageTickSeen = require('../../src/assets/icons/tick-seen.png')
let imageTickDelivered = require('../../src/assets/icons/tick-delivered.png')
let imageTickSent = require('../../src/assets/icons/tick-sent.png')
let imageTickPending = require('../../src/assets/icons/tick-pending.png')

let imageTickDeliveredForImage = require('../../src/assets/icons/tick-delivered-image.png')
let imageTickSentForImage = require('../../src/assets/icons/tick-icon-image.png')
let imageTickPendingForImage = require('../../src/assets/icons/tick-pending-image.png')

let imageSessionRequested = require('../../src/assets/icons/icon_session_requested.png')
let imageSessionAccepted = require('../../src/assets/icons/icon_session_accepted.png')
let imageSessionDeleted = require('../../src/assets/icons/icon_session_deleted.png')
let imageSessionRejected = require('../../src/assets/icons/icon_session_rejected.png')
let imageSessionEnded = require('../../src/assets/icons/icon_session_ended.png')

let imageBroadcast = require('../../src/assets/icons/broadcast_gray.png')

import VoicePlayerChatRequestPopup from '../components/VoicePlayerChatRequestPopup';

export default class Bubble extends React.Component {
    constructor(props) {
        super(props)
        this.onLongPress = this.onLongPress.bind(this)

        this.state = {
            x: new Animated.Value(wp(100)),
        };
    }

    slide = (currentMessage) => {
        let decreaseWidth = (currentMessage.text.length > 14) ? (currentMessage.text.length * 8 + 10) : (currentMessage.text.length * 8)
        // console.log(decreaseWidth)
        Animated.spring(this.state.x, {
            toValue: (wp(100) - (decreaseWidth) - wp(1.5 * 2)),
            bounciness: 0
        }).start(() => {
            Animated.spring(this.state.x, {
                toValue: wp(100),
                bounciness: 0
            }).start()
        });
    };


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
        // console.log(`touchX: ${touchX}`);
        const playWidth =
            (this.state.currentPositionSec / this.state.currentDurationSec) *
            (SCREEN_WIDTH - 56 * RATIO);
        // console.log(`currentPlayWidth: ${playWidth}`);

        const currentPosition = Math.round(this.state.currentPositionSec);
        // console.log(`currentPosition: ${currentPosition}`);

        if (playWidth && playWidth < touchX) {
            const addSecs = Math.round(currentPosition + 1000);
            this.audioRecorderPlayer.seekToPlayer(addSecs);
            // console.log(`addSecs: ${addSecs}`);
        } else {
            const subSecs = Math.round(currentPosition - 1000);
            this.audioRecorderPlayer.seekToPlayer(subSecs);
            // console.log(`subSecs: ${subSecs}`);
        }
    };

    renderSystemText() {
        const {
            containerStyle,
            wrapperStyle,
            ...messageTextProps
        } = this.props
        if (this.props.renderSystemMessage) {
            return this.props.renderSystemMessage(messageTextProps)
        }

        let imgIcon = imageSessionRequested
        switch (this.props.currentMessage.system_key) {
            case "chat_requested":
                imgIcon = imageSessionRequested
                break;
            case "request_rejected":
                imgIcon = imageSessionRejected
                break;
            case "request_accepted":
                imgIcon = imageSessionAccepted
                break;
            case "request_deleted":
                imgIcon = imageSessionDeleted
                break;
            case "session_ended":
                imgIcon = imageSessionEnded
                break;
            default:
                break;
        }
        return (
            <View style={{
                height: hp(4.5), width: wp(100), justifyContent: 'flex-start', backgroundColor: colors.transparent, alignItems: 'center', flexDirection: 'row'
            }}>
                <Animated.View style={{ width: this.state.x, backgroundColor: colors.transparent, height: "100%", flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', }}>
                    <TouchableOpacity
                        style={{ backgroundColor: colors.chatBalloonLeftBg, paddingHorizontal: wp(2), borderRadius: wp(2), paddingVertical: wp(1.5) }}
                        onPress={() => {
                            if (this.state.x._value > parseInt(wp(99))) {
                                this.slide(this.props.currentMessage)
                            }
                        }}>
                        <Image source={imgIcon} style={{ width: 14, height: 14, resizeMode: 'cover' }} />
                    </TouchableOpacity>
                    <View style={{ backgroundColor: colors.chatBalloonLeftBg, width: wp(1), height: "100%", marginLeft: wp(1.5), borderTopLeftRadius: wp(2), borderBottomLeftRadius: wp(2) }}>
                    </View>
                </Animated.View>
                <View style={{
                    backgroundColor: colors.transparent,
                    height: "100%",
                    flexDirection: 'column',
                    marginHorizontal: wp(1.5),
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    height: hp(5.5)
                }} onLayout={(event) => {
                    // var { x, y, width, height } = event.nativeEvent.layout;
                    // boxWidth = width
                    // console.log("width", width)
                }}>
                    <Text style={{ fontFamily: Fonts.HelveticaNeueMedium, fontSize: FontSize('small'), color: colors.primary }}>{this.props.currentMessage.text}</Text>
                    <Text style={{ fontFamily: Fonts.HelveticaNeueMedium, fontSize: FontSize('xMini'), color: colors.grayTwo }}>{this.props.currentMessage.time}</Text>
                </View>
            </View >
            // <SystemMessage
            //     {...messageTextProps}
            //     containerStyle={styles.systemMessageContainer}
            //     wrapperStyle={styles.systemMessageWrapper}
            //     textStyle={[styles.systemMessageText, {
            //         color: colors.primaryText,
            //         fontSize: FontSize('small'),
            //         fontFamily: Fonts.HelveticaNeue,
            //     }]}
            // />
        )
    }

    renderAudio(childElements) {
        // System Message
        if (this.props.currentMessage.audio) {
            // console.log("this.props.currentMessage.audio", this.props.currentMessage)
            return (
                <VoicePlayer
                    data={this.props.currentMessage}
                    containerStyle={{
                        width: wp(60),
                        height: hp(7),
                    }}
                    childElements={childElements}
                />
            )
        }
    }

    renderMessageText(childElements) {
        // User Message
        if (this.props.currentMessage.text) {
            const {
                containerStyle,
                wrapperStyle,
                messageTextStyle,
                ...messageTextProps
            } = this.props
            if (this.props.renderMessageText) {
                return this.props.renderMessageText(messageTextProps)
            }

            if (this.props.currentMessage.is_cheif_complain == true) {

                let isJSONString = AppHelper.isJSONString(this.props.currentMessage.text)

                let description = ""
                let json_request_data = null

                if (isJSONString == true) {
                    json_request_data = JSON.parse(this.props.currentMessage.text)
                    description = json_request_data.description == null ? "" : json_request_data.description
                } else {
                    description = this.props.currentMessage.text
                }

                return (
                    <View style={{ width: wp(60), paddingHorizontal: wp(2) }} >
                        {
                            (description != "")
                                ? <Text style={{ color: colors.black, fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue }}>{description}</Text>
                                : null
                        }
                        {
                            (isJSONString == true && AppHelper.isEmpty(json_request_data.audioData) == false)
                                ? <VoicePlayerChatRequestPopup
                                    data={json_request_data.audioData}
                                    containerStyle={{
                                        width: wp(50),
                                        height: hp(7),
                                        marginBottom: hp(1)
                                    }}
                                    childElements={<></>}>
                                </VoicePlayerChatRequestPopup>
                                : null
                        }
                        <View style={{ marginRight: wp(0) }}>
                            {childElements}
                        </View>
                    </ View >
                )
            }

            return (
                <View>
                    <MessageText
                        {...messageTextProps}
                        containerStyle={{
                            left: [{
                                paddingHorizontal: wp(1),
                                paddingRight: (this.props.currentMessage.text.length < 12) ? wp(15) : wp(1.5),
                            }],
                            right: [{
                                paddingHorizontal: wp(1),
                                paddingRight: (this.props.currentMessage.text.length < 12) ? wp(15) : wp(1.5),
                            }]
                        }}
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
                    <View style={{ marginRight: wp(1) }}>
                        {childElements}
                    </View>
                </View >
            )
        }
        return null
    }

    renderMessageImage(childElements) {
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
                <View style={[styles.slackImageContainer, { backgroundColor: colors.transparent }]}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => this.props.imageProps.openImageViewer(images)}>
                        <Image
                            source={{ uri: this.props.currentMessage.image }}
                            style={[messageImageProps.imageStyle, styles.slackImage, { resizeMode: "cover" }]}
                        />
                        {/* ImageView
                            style={{}}
                            width={"100%"}
                            height={"100%"}
                            directory={"images"}
                            resizeMode={"cover"}
                            url={this.props.currentMessage.image}
                            onBegin={(res) => {
                                console.log("Begin", res)
                            }}
                            onProgress={(res) => {
                                console.log("Slack bubble Progress", res)
                            }}
                            onFinish={(res) => {
                                console.log("Finish", res)
                            }}
                        /> */}
                    </TouchableOpacity>
                    <View
                        style={{
                            alignSelf: 'flex-end',
                            backgroundColor: colors.transparent,
                            marginTop: '-26%',
                            marginRight: wp(0),
                            width: '100%',
                            height: '30%',
                            borderBottomEndRadius: wp(2),
                            overflow: 'hidden'
                        }}>
                        <View style={{
                            position: 'absolute',
                            opacity: 1,
                            right: 0,
                            bottom: 0,
                        }}>
                            <Image source={require('../assets/images/bottom_shadow.png')} style={{ width: 120, height: 45 }}></Image>
                        </View>
                        <View style={{ position: 'absolute', right: 8, bottom: 3 }}>
                            {childElements}
                        </View>
                    </View>
                </View>
                // <TouchableOpacity onPress={() => this.props.imageProps.openImageViewer(images)}>
                //     <Image
                //         source={{ uri: this.props.currentMessage.image }}
                //         style={[containerStyle, styles.slackImage, messageImageProps.imageStyle]}
                //     />
                // </TouchableOpacity>
            );
        }

        // if (this.props.currentMessage.image) {
        //     const {containerStyle, wrapperStyle, ...messageImageProps } = this.props
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
                    <Image source={(this.props.currentMessage.image) ? imageTickDeliveredForImage : imageTickDelivered} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        }
        else if (currentMessage.sent) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={(this.props.currentMessage.image) ? imageTickSentForImage : imageTickSent} style={{ width: 10, height: 10, resizeMode: 'contain' }} />
                </View>
            )
        } else if (currentMessage.pending) {
            return (
                <View style={[styles.headerItem, styles.tickView]}>
                    <Image source={(this.props.currentMessage.image) ? imageTickPendingForImage : imageTickPending} style={{ width: 15, height: 10, resizeMode: 'contain' }} />
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

    renderTime(customStyle) {
        if (this.props.currentMessage.system) {
            return null
        }
        // console.log("====", this.props.currentMessage.createdAt, this.props.currentMessage.text)
        // console.log("====", this.props.currentMessage.text)
        if (this.props.currentMessage.createdAt) {
            const { containerStyle, wrapperStyle, position, ...timeProps } = this.props
            if (this.props.renderTime) {
                return this.props.renderTime(timeProps)
            }
            return (
                <>
                    {
                        global.target == "doctor" && this.props.currentMessage.sub_message_type == 'broadcast'
                            ? <Image source={imageBroadcast} style={{ width: 10, height: 10, resizeMode: 'cover', marginHorizontal: wp(1), marginBottom: 1 }} />
                            : null
                    }

                    <Time
                        {...timeProps}
                        position={position}
                        containerStyle={{ left: [styles.timeContainer], right: [styles.timeContainer,] }}
                        timeTextStyle={{
                            left: [
                                // styles.standardFont,
                                // styles.headerItem,
                                styles.time,
                                customStyle,
                                {
                                    // marginLeft: wp(7),

                                }
                            ],
                            right: [
                                // styles.standardFont,
                                // styles.headerItem,
                                styles.time,
                                customStyle
                            ],
                        }}
                    />
                </>
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
                <View style={{ marginLeft: 0, paddingHorizontal: wp(0.7) }}>
                    <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold, color: colors.primaryText }}>Chief Complaint</Text></View>
                :
                (this.props.currentMessage.is_diagnosis) ?
                    <View style={{ marginLeft: 0, paddingHorizontal: wp(0.7) }}>
                        <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold, color: colors.primaryText }}>Doctor's Advice</Text>
                    </View>
                    :
                    (this.props.currentMessage.is_notes) ?
                        <View style={{ marginLeft: 0, paddingHorizontal: wp(0.7) }}>
                            <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold, color: colors.primaryText }}>Doctor's Note</Text>
                        </View>
                        :
                        <View></View>
        )
    }

    render() {
        const isSameThread =
            isSameUser(this.props.currentMessage, this.props.previousMessage) &&
            isSameDay(this.props.currentMessage, this.props.previousMessage)

        // const messageHeader = isSameThread ? null : (
        //     <View style={styles.headerView}>
        //         {/* {this.renderUsername()} */}
        //         {this.renderTime()}
        //         {this.renderTicks()}
        //     </View>
        // )

        // Medicine prescribed
        if (this.props.currentMessage.medicine_prescribed) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        this.props.currentMessage.medicinePrescribedCallback({ "chatroom_session_id": this.props.currentMessage.chatroom_session_id })
                    }}>
                        <View style={{ backgroundColor: colors.primaryText, paddingHorizontal: wp(2), paddingVertical: wp(1.5), flexDirection: 'row', alignItems: 'center', borderRadius: wp(2) }}>
                            <Image source={require('../assets/icons/prescription.png')} style={{ width: 15, height: 15, marginRight: wp(2), resizeMode: 'contain' }} />
                            <Text style={{ color: colors.white, fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }}>{this.props.currentMessage.text}</Text>
                        </View>

                    </TouchableOpacity>
                </View>
            )
        }
        // System generated messages
        if (this.props.currentMessage.system) {
            return (
                this.renderSystemText()
            )
        }

        const messageHeader = <View style={styles.headerView}>
            {/* {this.renderUsername()} */}
            {this.renderTime(this.props.currentMessage.image ? { color: 'white' } : null)}
            {this.renderTicks()}
        </View>

        let _justifyContent = (this.props.currentMessage.system)
            ? "center"
            : (this.props.currentMessage.user._id !== this.props.user._id)
                ? "flex-start"
                : "flex-end"

        let card = <View style={[
            (this.props.currentMessage.user._id !== this.props.user._id) ? styles.containerLeft : styles.containerRight
            , { backgroundColor: colors.transparent, flexDirection: "row" }]
        }>
            <View style={{ width: 12, height: 20, justifyContent: "flex-start", alignItems: "flex-start", overflow: "hidden" }}>
                {
                    (this.props.currentMessage.user._id !== this.props.user._id)
                        ? (isSameThread == true) ? null : <Image source={require('../../src/assets/images/left_top_corner.png')} style={{ width: 23, height: 15 }} ></Image>
                        : null
                }
            </View>
            <View
                style={[
                    (isSameThread == true)
                        ? (this.props.currentMessage.user._id !== this.props.user._id)
                            ? styles.wrapperLeft
                            : styles.wrapperRight
                        : (this.props.currentMessage.user._id !== this.props.user._id)
                            ? styles.wrapperLeftParentIsNotSame
                            : styles.wrapperRightParentIsNotSame
                    , this.props.wrapperStyle,
                    , {

                    }]}
            >
                <View style={{}}>
                    {this.renderCustomView()}
                    {this.renderAudio(messageHeader)}
                    {this.renderMessageImage(messageHeader)}
                    {this.renderMessageText(messageHeader)}
                    {/* {
                        (this.props.currentMessage.text)
                            ? messageHeader
                            : null
                    } */}

                </View>
            </View>

            <View style={{ width: 12, height: 20, justifyContent: "flex-start", alignItems: "flex-end", overflow: "hidden" }}>
                {
                    (this.props.currentMessage.user._id !== this.props.user._id)
                        ? null
                        : (isSameThread == true) ? null : <Image source={require('../../src/assets/images/right_top_corner.png')} style={{ width: 23, height: 15 }} ></Image>
                }
            </View>

        </View >

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
                            : (this.props.currentMessage.image)
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
    containerLeft: {
        marginLeft: wp(1.5),
        paddingHorizontal: wp(1),
    },
    containerRight: {
        marginRight: wp(1.5),
        paddingHorizontal: wp(1),
    },
    wrapperLeft: {
        // marginLeft: wp(4),
        paddingHorizontal: wp(0.7),
        // marginRight: 60,
        // minHeight: 20,
        // justifyContent: 'flex-end',
        backgroundColor: colors.chatBalloonLeftBg,
        borderRadius: wp(2)
    },
    wrapperRight: {
        // marginRight: wp(-4),
        paddingHorizontal: wp(0.7),
        // marginRight: 60,
        // minHeight: 20,
        // justifyContent: 'flex-end',
        backgroundColor: colors.chatBalloonRightBg,
        borderRadius: wp(2)
    },
    wrapperLeftParentIsNotSame: {
        // marginLeft: wp(4),
        paddingHorizontal: wp(0.7),
        // marginRight: 60,
        // minHeight: 20,
        // justifyContent: 'flex-end',
        backgroundColor: colors.chatBalloonLeftBg,
        borderRadius: wp(2),
        borderTopLeftRadius: 0
    },
    wrapperRightParentIsNotSame: {
        // marginRight: wp(-4),
        paddingHorizontal: wp(0.7),
        // marginRight: 60,
        // minHeight: 20,
        // justifyContent: 'flex-end',
        backgroundColor: colors.chatBalloonRightBg,
        borderRadius: wp(2),
        borderTopRightRadius: 0
    },
    username: {
        fontWeight: 'bold',
    },
    time: {
        color: colors.grayTwo,
        textAlign: 'right',
        fontFamily: Fonts.HelveticaNeueMedium,
        fontSize: FontSize('mini'),
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
        height: hp(1.5)
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
    slackImageContainer: {
        marginVertical: wp(0.7),
        width: wp(60),
        height: hp(28)
    },
    slackImage: {
        borderRadius: wp(2),
        width: "100%",
        height: "100%"
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