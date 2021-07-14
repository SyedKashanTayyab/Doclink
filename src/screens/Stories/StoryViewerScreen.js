import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, FlatList, ActivityIndicator, Platform, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
var moment = require('moment');

import { hp, wp } from '../../utils/Utility';
import { Icon } from 'native-base';
import Video from 'react-native-video';
import colors from '../../utils/Colors';
import API from '../../services/API';
import { API_URL } from '../../utils/Constant';
import FontSize from '../../utils/FontSize';
import { Fonts } from '../../utils/Fonts';
import GlobalStyles from '../../styles/GlobalStyles';
import AsyncImageView from '../../services/AsyncImageView'
import { Easing } from 'react-native-reanimated';

var progress_width = 0
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

class StoryViewerScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {

            visible: false,

            userObject: null,
            storiesList: [],
            storyIndex: 0,
            storyItemIndex: 0,
            startProgress: false,

            play: false,

            storyCurrentItemObject: null,
            rawData: null,

            storyCurrentItemProgress: new Animated.Value(0),
            storyCurrentItemPausedProgress: 0,

            isBuffering: false,
            lastProgress: "",
            currentTime: "",
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.visible) {
            return {
                visible: props.visible,
                userObject: props.data,
                storiesList: props.data.stories
            }
        }
        return null
    }

    componentDidMount() {

        try {
            const { storiesList, storyItemIndex } = this.state

            if (storiesList.length > 0) {
                let _storyObject = storiesList[storyItemIndex]
                this.setState({
                    storyCurrentItemObject: _storyObject,
                    play: (_storyObject.story_type == 'text') ? true : false,
                    rawData: JSON.parse(_storyObject.raw_data)
                }, () => {
                    if (_storyObject.story_type == 'text') {
                        this.playProgress(true)
                    }
                })
            }
        }
        catch (error) {
            console.log("==============================")
            console.log("StoryViewerScreen - componentDidMount() - ", error)
            console.log("==============================")
        }
    }

    playProgress = () => {

        this.requestStoryView()

        const { storyCurrentItemObject, storiesList, storyItemIndex, rawData } = this.state

        let duration = 8 // seconds
        if (storyCurrentItemObject.story_type == 'video') {
            duration = (rawData.duration)
        }

        console.log("// Animation Start", duration, progress_width, (duration * 1000), this.state.storyCurrentItemProgress)

        Animated.timing(this.state.storyCurrentItemProgress, {
            toValue: progress_width,
            duration: ((duration * 1000)),  // * (wp(20) - this.state.pausedProgress)
        }).start(({ finished }) => {
            /* completion callback */
            if (finished == true) {
                this.updateStoryView(true)
            }
        })
    }

    updateStoryView = (next) => {
        const { storiesList, storyItemIndex } = this.state

        let _index = 0
        if (next == true) {
            // 3 > 0, 3 > 1, 3 > 2, 3 > 3
            if ((storiesList.length - 1) > (storyItemIndex)) {
                _index = storyItemIndex + 1
            } else {
                // no other stories found
                console.log("no other stories found")
                this.props.onClosePress(false)
            }
        } else {
            // previous
            // 3 > 0, 2 > 0, 1 > 0, 0 > 0
            if (storyItemIndex > 0) {
                _index = storyItemIndex - 1
            } else {
                // no other stories found
                console.log("no other stories found")
                this.props.onClosePress(false)
            }
        }

        let _storyObject = storiesList[_index]
        // console.log("Next story object", _storyObject)
        this.setState({
            storyCurrentItemObject: _storyObject,
            storyItemIndex: _index,
            play: (_storyObject.story_type == 'text') ? true : false,
            rawData: JSON.parse(_storyObject.raw_data),
            storyCurrentItemProgress: new Animated.Value(0),
        }, () => {
            console.log("state updated")
            if (_storyObject.story_type == 'text') {
                this.playProgress(true)
                this.requestStoryView()
            } else {
                this.render()
            }
        })
    }

    playStory = (play) => {
        if (play == true) {
            this.setState({
                play: true
            }, () => {
                this.playProgress()
            })

        } else {
            this.setState({
                play: false
            })
        }
    }

    requestStoryView = async () => {
        const { storyCurrentItemObject } = this.state
        const story_id = storyCurrentItemObject.id
        try {
            let params = { story_id };
            console.log("requestStoryView - params", params)
            const res = await API.post(API_URL.PATIENT_STORIES, params);
        } catch (error) {
            console.log(error);
        }
    }

    previousSlide = () => {
        this.updateStoryView(false)
    }

    nextSlide = () => {
        this.updateStoryView(true)
    }

    render() {
        const { userObject, storyItemIndex, startProgress, storiesList, storyCurrentItemObject, rawData, isBuffering } = this.state;
        // console.log("render")
        let screen_width = wp(98)
        progress_width = (screen_width) / storiesList.length
        progress_width = progress_width - 4
        // console.log("progress_width", screen_width, progress_width, storyCurrentItemObject)
        // console.log("progress_width", progress_width)

        return (
            <Modal
                isVisible={this.state.visible}
                animationIn={'bounceIn'} animationOut={'slideOutDown'}
                animationInTiming={500} animationOutTiming={300}
                onBackButtonPress={() => { this.props.onClosePress(false); this.setState({ startProgress: false }) }}
                onSwipeComplete={() => { this.props.onClosePress(false); this.setState({ startProgress: false }) }}
                swipeDirection="down" style={{
                    flex: 1, width: wp(100), height: hp(100), margin: 0, padding: 0,
                    backgroundColor: colors.black,
                    backgroundColor: storyCurrentItemObject != null && storyCurrentItemObject.story_type == 'text' ? rawData.bg_color : colors.black,
                }}>
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}>
                    {/* Text Story */}
                    {
                        storyCurrentItemObject != null && storyCurrentItemObject.story_type == 'text'
                            ? <View style={{ width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <TouchableOpacity onPress={this.previousSlide} style={[styles.preNextBtn, { left: 0 }]} />
                                <Text style={{ flex: 1, textAlign: 'center', textAlignVertical: 'center', paddingHorizontal: wp(5), fontFamily: rawData.font_family_name, fontSize: rawData.font_size, color: colors.white }}>
                                    {
                                        rawData.text
                                    }
                                </Text>
                                <TouchableOpacity onPress={this.nextSlide} style={[styles.preNextBtn, { right: 0 }]} />
                            </View>
                            : null
                    }

                    {/* Image Story */}
                    {
                        storyCurrentItemObject != null && storyCurrentItemObject.story_type == 'image'
                            ? <View style={{ width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <TouchableOpacity onPress={this.previousSlide} style={[styles.preNextBtn, { left: 0 }]} />
                                <AsyncImageView
                                    style={{ position: 'absolute', backgroundColor: 'blue', zIndex: 50, }}
                                    width={"100%"}
                                    height={"100%"}
                                    directory={"stories"}
                                    url={rawData.url}
                                    onBegin={(res) => {
                                        console.log("StoryView Begin", res)
                                    }}
                                    onProgress={(res) => {
                                        console.log("StoryView Progress", res)
                                    }}
                                    onFinish={(res) => {
                                        console.log("StoryView Finish", res)
                                        this.playStory(true)
                                    }}
                                />
                                <View style={styles.caption}>
                                    <Text style={{ color: colors.white, textAlign: 'center', fontSize: FontSize('small'), fontWeight: 'bold' }}>
                                        {storyCurrentItemObject.caption}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={this.nextSlide} style={[styles.preNextBtn, { right: 0 }]} />
                            </View>
                            : null
                    }

                    {/* Video Story */}
                    {
                        storyCurrentItemObject != null && storyCurrentItemObject.story_type == 'video'
                            ? <View style={{ width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                                <TouchableOpacity onPress={this.previousSlide} style={[styles.preNextBtn, { left: 0 }]} />
                                <View style={[styles.fullScreen, { backgroundColor: 'transparent', }]}>
                                    <Video
                                        source={{ uri: rawData.url }}
                                        style={[styles.fullScreen]}
                                        rate={1}
                                        paused={false}
                                        resizeMode={'contain'}
                                        onLoadStart={() => {
                                            // console.log("Vidoe is loading...")
                                            this.setState({ isBuffering: true });
                                        }}
                                        onLoad={() => {
                                            this.playProgress()
                                        }}
                                        onEnd={() => {
                                            this.updateStoryView(true)
                                        }}
                                        onError={(error) => {
                                            console.log("Video Player Error", error)
                                            this.props.onClosePress(false)
                                        }}
                                        onProgress={(data) => {
                                            this.setState({ lastProgress: this.state.currentTime });
                                            this.setState({ currentTime: data.currentTime });
                                            if (this.state.lastProgress == data.currentTime) {
                                                this.setState({ isBuffering: true });
                                                this.state.storyCurrentItemProgress.stopAnimation(e => {
                                                    console.log('animation stopped', e)
                                                })

                                            } else {
                                                this.setState({ isBuffering: false });
                                                console.log("rawData.duration", rawData.duration)
                                                Animated.timing(this.state.storyCurrentItemProgress, {
                                                    toValue: (progress_width),
                                                    duration: ((rawData.duration + 1.5) * 1000) - (data.currentTime * 1000),
                                                    easing: Easing.linear
                                                }).start(({ finished }) => {
                                                    /* completion callback */
                                                    // console.log(finished, parseInt(data.currentTime), parseInt(rawData.duration))
                                                    // if (Math.ceil(data.currentTime) >= parseInt(rawData.duration)) {
                                                    //     // this.updateStoryView(true)
                                                    // }
                                                })
                                            }
                                        }}
                                        repeat={false} />
                                    <View style={[styles.fullScreen, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <ActivityIndicator
                                            animating={isBuffering}
                                            color='#fff'
                                            size="small"
                                        />
                                    </View>
                                </View>

                                <View style={styles.caption}>
                                    <Text style={{ color: colors.white, textAlign: 'center', fontSize: FontSize('small'), fontWeight: 'bold' }}>
                                        {storyCurrentItemObject.caption}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={this.nextSlide} style={[styles.preNextBtn, { right: 0 }]} />
                            </View>
                            : null
                    }
                </View>
                {/* Profile Info */}
                <View style={{ width: '100%', height: hp(10), position: 'absolute', top: ((Platform.OS == 'ios') ? STATUSBAR_HEIGHT : 0) + (hp(2)), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(3), }}>
                    <View style={{ flexDirection: 'row', width: wp(30), borderColor: colors.white, borderWidth: 0, alignItems: 'center', }}>
                        <TouchableOpacity style={{ paddingLeft: 0, padding: wp(4), alignItems: 'center', }} onPress={() => { this.props.onClosePress(false); this.setState({ startProgress: false, storyItemIndex: 0 }) }}>
                            <Icon name="arrowleft" type="AntDesign" fontSize={35} style={{ color: colors.white }} />
                        </TouchableOpacity>
                        <View style={[GlobalStyles.imageContainer, { width: wp(12), height: wp(12), }]}>
                            <Image style={styles.statusImage} source={userObject.avatar ? { uri: userObject.avatar } : require('../../assets/images/dummy.png')} />
                        </View>
                        <View style={styles.statusInnerContainer}>
                            <View style={{ alignItems: "flex-start", flexDirection: 'column', justifyContent: 'center' }}>
                                <View style={{ alignItems: "center", flexDirection: 'row' }}>
                                    <Text ellipsizeMode="tail" style={styles.statusTitle}>{userObject.title == "" ? "" : userObject.title + " "}{userObject.name}</Text>
                                    {userObject.verified_badge == 1 ? <Image style={{ resizeMode: 'contain', marginLeft: wp(1), width: wp(3), height: wp(3), }} source={require('../../assets/icons/set_public_icon.png')} /> : null}
                                </View>
                                <Text ellipsizeMode="tail" numberOfLines={1} style={styles.statusSecondTitle}>{(storiesList.length > 0) ? moment(storiesList[storyItemIndex].created_at).utc(true).local().startOf('seconds').fromNow() : ""}</Text>
                            </View>
                        </View>
                    </View>
                    {
                        (global.target == "patient" || userObject.id == 1) ? <View /> : <Text style={{ color: colors.white, fontWeight: 'bold' }}>Views: {storiesList[storyItemIndex].viewers_count}</Text>
                    }
                </View>

                {/* Progress Bar */}
                <View style={{
                    top: (Platform.OS == 'ios') ? (STATUSBAR_HEIGHT + 5) : 0,
                    left: wp(1),
                    right: wp(1),
                    width: wp(98),
                    position: 'absolute',
                    flexDirection: 'row',
                    flex: 1,
                    height: hp(4),
                    backgroundColor: colors.transparent,
                    alignItems: 'center',
                }}>
                    {
                        storiesList.map((item, index) => {
                            // console.log("Flat list index", index, this.state.storyItemIndex)
                            if (index == this.state.storyItemIndex) {
                                return (
                                    <View style={{ width: (progress_width), height: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.transparent, marginHorizontal: 2 }}>
                                        <View style={{ height: 2, width: (progress_width), backgroundColor: "#87888ACC" }}>
                                            <Animated.View style={{ height: 2, width: this.state.storyCurrentItemProgress, backgroundColor: colors.white }}>
                                            </Animated.View>
                                        </View>
                                    </View>
                                )
                            } else if (this.state.storyItemIndex > index) {
                                return (
                                    <View style={{ width: (progress_width), height: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.transparent, marginHorizontal: 2 }}>
                                        <View style={{ height: 2, width: (progress_width), backgroundColor: colors.white }}>
                                        </View>
                                    </View>
                                )
                            } else if (this.state.storyItemIndex < index) {
                                return (
                                    <View style={{ width: (progress_width), height: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.transparent, marginHorizontal: 2 }}>
                                        <View style={{ height: 2, width: (progress_width), backgroundColor: "#87888ACC" }}>
                                        </View>
                                    </View>
                                )
                            }
                        })

                    }
                    {/* <FlatList
                        contentContainerStyle={{
                            backgroundColor: 'green',
                        }}
                        horizontal={true}
                        data={storiesList}
                        ItemSeparatorComponent={() => <View style={{ marginHorizontal: 2 }} />}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => {

                        }}
                    /> */}
                </View>
            </Modal >
        );
    }
}

export default StoryViewerScreen;

const styles = StyleSheet.create({
    preNextBtn: {
        width: wp(20), height: hp(80), position: 'absolute', zIndex: 10,
    },
    fullScreen: {
        position: 'absolute',
        top: 0, bottom: 0,
        left: 0, right: 0,
    },
    caption: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        paddingHorizontal: wp(5),
        minHeight: hp(15),
        paddingTop: wp(5)
    },
    statusInnerContainer: {
        marginLeft: wp(2.5),
        width: wp(75),
        height: wp(14),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statusTitle: {
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: 16,
        color: colors.white,
        textAlignVertical: 'bottom'
    },
    statusSecondTitle: {
        fontFamily: Fonts.HelveticaNeue,
        color: colors.white,
        fontSize: FontSize('small')
    },
    statusImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    activityIndicator: {
        position: 'absolute',
        top: 70,
        left: 70,
        right: 70,
        height: 50,
    }

})