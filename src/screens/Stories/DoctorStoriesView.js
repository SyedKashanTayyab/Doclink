import { Container } from 'native-base';
import React, { Component, useCallback } from 'react';
import { View, Text, Platform, Image, StyleSheet, TouchableOpacity, RefreshControl, FlatList, ScrollView } from 'react-native';

import GlobalStyles from '../../styles/GlobalStyles';
import colors from '../../utils/Colors';
import { Fonts } from '../../utils/Fonts';
import FontSize from '../../utils/FontSize';
import { hp, wp } from '../../utils/Utility';
import API from '../../services/API';
import { API_URL } from '../../utils/Constant';
import StoryViewerScreen from './StoryViewerScreen';
import AppHelper from '../../utils/AppHelper';
import StorieViewDashCircle from '../../components/StorieViewDashCircle'
import AsyncImageView from '../../services/AsyncImageView';

var moment = require('moment');

class DoctorStoriesView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            statusView: false,
            StoryView: false,
            arrMyDoctorStories: [],
            arrOtherDoctorStories: [],
            refreshing: false,

            showStoryView: false,
            user_data: null
        };

        this.props.navigation.addListener('didFocus', async () => {
            this.getStories()
        })
    }

    componentDidMount = async () => {
        let user_data = await AppHelper.getData('user_data');
        this.setState({
            user_data
        })
        setTimeout(async () => {
            await this.getStories()
        }, 500);
    }

    getStories = async () => {
        try {
            let params = {};
            const res = await API.get(API_URL.DOCTOR_STORIES, params);
            if (res.data.my_stories.length > 0) {
                this.setState({ arrMyDoctorStories: res.data.my_stories });
            }
            if (res.data.stories.length > 0) {
                this.setState({ arrOtherDoctorStories: res.data.stories });
            }
        } catch (error) {
            console.log(error);
        }
    }

    ItemSeparatorComponent = () => (<View style={{ marginLeft: wp(15), borderBottomColor: colors.borderColor, borderBottomWidth: 1 }} />)

    // Stories render Item - Flatlist
    _renderItem = ({ item, index }) => {
        const { StoryView } = this.state;
        return (
            <View style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', marginVertical: hp(1) }} underlayColor='transparent'>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ showStoryView: true, selectedUserObject: item })
                    }}
                    style={{ flexDirection: 'row' }}
                >
                    <StorieViewDashCircle height={wp(15)} width={wp(15)} uri={item.avatar} size={item.stories.length} read={item.viewed_count} />
                    <View style={{ marginLeft: wp(0), width: wp(77), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ alignItems: "flex-start", flexDirection: 'column', justifyContent: 'center' }}>
                            <View style={{ alignItems: "center", flexDirection: 'row' }}>
                                <Text ellipsizeMode="tail" style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: 16, color: '#3f3f3f', textAlignVertical: 'bottom' }}>{item.title == "" ? "" : item.title + " "}{item.name}</Text>
                                {item.verified_badge == 1 ? <Image style={{ resizeMode: 'contain', marginLeft: wp(1), width: wp(3), height: wp(3), }} source={require('../../assets/icons/set_public_icon.png')} /> : null}
                            </View>
                            <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), }}>{moment(item.created_at).utc(true).local().startOf('seconds').fromNow()}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    render() {

        const { statusView, arrMyDoctorStories, arrOtherDoctorStories, showStoryView, selectedUserObject, user_data } = this.state;

        let _story = arrMyDoctorStories.length > 0 ? arrMyDoctorStories[0] : { avatar: '', stories: [{}], viewed_count: 0, created_at: '' }

        return (
            <ScrollView style={{ backgroundColor: colors.white, width: "100%" }} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.getStories} />}>

                <View style={{ width: "100%", height: hp(10), marginHorizontal: hp(0), marginTop: hp(0), marginBottom: hp(0) }}>
                    <View style={{ flex: 1, marginHorizontal: hp(1.4), justifyContent: 'center' }}>
                        <View style={{ justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }} underlayColor='transparent'>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                {
                                    arrMyDoctorStories.length > 0
                                        ? <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ showStoryView: true, selectedUserObject: arrMyDoctorStories[0] })}>
                                            <View style={{ width: wp(16) }}>
                                                <StorieViewDashCircle height={wp(15)} width={wp(15)} uri={_story.avatar} size={_story.stories.length} read={_story.stories.length} />
                                            </View>

                                            <View style={styles.statusInnerContainer}>
                                                <View style={{ alignItems: "flex-start", }}>
                                                    <Text ellipsizeMode="tail" style={styles.statusTitle}>My Status</Text>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={styles.statusSecondTitle}>{moment(_story.created_at).utc(true).local().startOf('seconds').fromNow()}</Text>
                                                </View>
                                                <View style={styles.statusIconContainer}>
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('MediaStory')} style={styles.statusIcon}>
                                                        <Image style={styles.addStatusIcon} source={require('../../assets/icons/status_camera_icon.png')} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('AddTextStory')} style={[styles.statusIcon, { marginLeft: wp(2) }]}>
                                                        <Image style={styles.addStatusIcon} source={require('../../assets/icons/edit_icon.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        : <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.props.navigation.navigate('MediaStory')}>
                                            <View style={{ width: wp(16) }}>
                                                <View style={[GlobalStyles.imageContainer, { width: wp(15), height: wp(15), justifyContent: 'center', alignItems: 'center' }]}>
                                                    <AsyncImageView
                                                        style={{ backgroundColor: 'blue', zIndex: 50, }}
                                                        width={"100%"}
                                                        height={"100%"}
                                                        directory={"images"}
                                                        url={(user_data == null) ? "" : user_data.avatar}
                                                        placeholderImage={require('../../assets/images/dummy.png')}
                                                        onBegin={(res) => {
                                                            // console.log("Begin", res)
                                                        }}
                                                        onProgress={(res) => {
                                                            // console.log("AuthProfile Progress", res)
                                                        }}
                                                        onFinish={(res) => {
                                                            // console.log("Finish", res)
                                                        }}
                                                    />
                                                </View>
                                                <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
                                                    <Image style={{ width: wp(5), height: wp(5), resizeMode: 'contain' }} source={require('../../assets/icons/status_add.png')} />
                                                </View>
                                            </View>

                                            <View style={styles.statusInnerContainer}>
                                                <View style={{ alignItems: "flex-start", }}>
                                                    <Text ellipsizeMode="tail" style={styles.statusTitle}>My Status</Text>
                                                    <Text ellipsizeMode="tail" numberOfLines={1} style={styles.statusSecondTitle}>Add to my Status</Text>
                                                </View>
                                                <View style={styles.statusIconContainer}>
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('MediaStory')} style={styles.statusIcon}>
                                                        <Image style={styles.addStatusIcon} source={require('../../assets/icons/status_camera_icon.png')} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('AddTextStory')} style={[styles.statusIcon, { marginLeft: wp(2) }]}>
                                                        <Image style={styles.addStatusIcon} source={require('../../assets/icons/edit_icon.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>
                </View>

                {/* Other Doctors */}
                <View style={{ flex: 1, marginHorizontal: hp(1.4), marginTop: hp(0) }}>
                    {
                        (arrOtherDoctorStories.length > 0)
                            ? <View style={{ paddingTop: wp(2), paddingBottom: wp(0) }}>
                                <Text style={{ fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold, color: colors.greyEight }}>Recent Updates</Text>
                            </View>
                            : null
                    }
                    <FlatList
                        style={{ backgroundColor: colors.transparent, zIndex: 10, marginTop: 5 }}
                        data={arrOtherDoctorStories}
                        renderItem={this._renderItem}
                        keyExtractor={item => item.id.toString()}
                        ItemSeparatorComponent={this.ItemSeparatorComponent}
                    />
                </View>
                {
                    showStoryView == true
                        ? <StoryViewerScreen visible={showStoryView} data={selectedUserObject} onClosePress={(show) => {
                            this.setState({ showStoryView: show })
                            this.getStories()
                        }} />
                        : null
                }
            </ScrollView>
        );
    }
}

export default DoctorStoriesView;

const styles = StyleSheet.create({
    statusImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    statusIcon: {
        width: wp(9),
        height: wp(9),
        backgroundColor: colors.graySeven,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusImage: {
        resizeMode: 'cover',
        padding: '10%',
        width: wp(13),
        height: wp(13),
        borderRadius: wp(13) / 2,

    },
    statusIcon: {
        width: wp(9),
        height: wp(9),
        backgroundColor: colors.graySeven,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    statusInnerContainer: {
        borderBottomColor: colors.borderColor1,
        borderBottomWidth: 1,
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
        color: colors.black,
        textAlignVertical: 'bottom'
    },
    statusSecondTitle: {
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small')
    },
    addStatusIcon: {
        width: wp(5),
        height: wp(4),
        tintColor: colors.tintColor,
        resizeMode: 'contain'
    },
    statusIconContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    }
})