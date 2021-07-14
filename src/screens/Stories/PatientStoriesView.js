import { Container } from 'native-base';
import React, { Component } from 'react';
import { View, Text, Platform, Image, StyleSheet, TouchableOpacity, FlatList, ScrollView, RefreshControl } from 'react-native';

import GlobalStyles from '../../styles/GlobalStyles';
import colors from '../../utils/Colors';
import { Fonts } from '../../utils/Fonts';
import FontSize from '../../utils/FontSize';
import { hp, wp } from '../../utils/Utility';
import API from '../../services/API';
import { API_URL } from '../../utils/Constant';
import StoryViewerScreen from './StoryViewerScreen';
import AppHelper from '../../utils/AppHelper';
var moment = require('moment');
import StorieViewDashCircle from '../../components/StorieViewDashCircle'

class PatientStoriesView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showStoryView: false,

            selectedUserObject: null,

            StoryView: false,
            arrMyDoctorStories: [],
            arrOtherDoctorStories: [],
            refreshing: false,
            myDoctorStoryIndex: 0,
            otherDoctorStoryIndex: 0
        };
    }

    componentDidMount = async () => {
        setTimeout(async () => {
            await this.getStories()
        }, 500);
    }

    getStories = async () => {
        try {
            let params = {};
            const res = await API.get(API_URL.PATIENT_STORIES, params);
            if (res.data.my_doctors.length > 0) {
                this.setState({ arrMyDoctorStories: res.data.my_doctors });
            }
            if (res.data.public.length > 0) {
                this.setState({ arrOtherDoctorStories: res.data.public });
            }
        } catch (error) {
            console.log(error);
        }
    }

    ItemSeparatorComponent = () => (<View style={{ marginLeft: wp(15), borderBottomColor: colors.borderColor, borderBottomWidth: 1 }} />)

    // Stories render Item - Flatlist
    _renderItem = ({ item, index }) => {
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
        const { arrMyDoctorStories, arrOtherDoctorStories } = this.state;
        const { myDoctorStoryIndex, otherDoctorStoryIndex, showStoryView, selectedUserObject, otherDoctorStatusView } = this.state;
        let myDoctors = arrMyDoctorStories.length > 0 ? arrMyDoctorStories[myDoctorStoryIndex] : null
        let otherDoctors = arrOtherDoctorStories.length > 0 ? arrOtherDoctorStories[otherDoctorStoryIndex] : null
        return (
            <ScrollView style={{ backgroundColor: colors.transparent, width: "100%" }} refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                this.getStories()
            }} />}>
                {/* My Doctors */}
                <View style={{ flex: 1, marginHorizontal: hp(1.4), marginTop: hp(0), marginBottom: hp(1) }}>
                    {
                        (arrMyDoctorStories.length > 0)
                            ? <View style={{ paddingTop: wp(2), paddingBottom: wp(0) }}>
                                <Text style={{ fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold, color: colors.greyEight }}>My Doctors</Text>
                            </View>
                            : null
                    }
                    <FlatList
                        style={{ backgroundColor: colors.transparent, zIndex: 10, marginTop: 5 }}
                        data={arrMyDoctorStories}
                        renderItem={this._renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={this.ItemSeparatorComponent}
                    />
                </View>

                {/* Other Doctors */}
                <View style={{ flex: 1, marginHorizontal: hp(1.4), marginTop: hp(0) }}>
                    {
                        (arrOtherDoctorStories.length > 0)
                            ? <View style={{ paddingTop: wp(2), paddingBottom: wp(0) }}>
                                <Text style={{ fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeueBold, color: colors.greyEight }}>Other Doctors</Text>
                            </View>
                            : null
                    }
                    <FlatList
                        style={{ backgroundColor: colors.transparent, zIndex: 10, marginTop: 5 }}
                        data={arrOtherDoctorStories}
                        renderItem={this._renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={this.ItemSeparatorComponent}
                    />
                </View>

                {/* No Stories */}
                {
                    (arrMyDoctorStories.length > 0 || arrOtherDoctorStories.length > 0)
                        ? null
                        : <View style={{ paddingLeft: wp(2) }}>
                            <Text style={{ color: colors.grayTwo }}>No stories found</Text>
                        </View>
                }
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

export default PatientStoriesView;

const styles = StyleSheet.create({
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
    }
})