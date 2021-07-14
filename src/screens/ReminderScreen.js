import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, SectionList, ScrollView, Animated, FlatList, RefreshControl, Alert } from 'react-native';

import { Container, Icon, Tab, TabHeading, Tabs } from 'native-base';
import Modal from 'react-native-translucent-modal';
import DatePicker from 'react-native-date-picker'
var moment = require('moment');
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import { hp, wp } from '../utils/Utility';
import colors from '../utils/Colors';
import API from '../services/API';
import { API_URL } from '../utils/Constant';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';

import ModalFollowUp from "../modals/ModalFollowUp";
import ModalMedicine from "../modals/ModalMedicine";

class ReminderScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,

            FollowUpData: [],
            MedicineData: [],

            animatedHeight: new Animated.Value(hp(17)),
            sectionIndex: 0,
            index: 0,
            routes: [
                { key: 'first', title: 'Years' },
                { key: 'second', title: 'Months' },
                { key: 'third', title: 'Days' },
                { key: 'fourth', title: 'All' },
            ],
            YearsList: { options: [], follow_ups: [] },
            MonthsList: { options: [], follow_ups: [] },
            DaysList: { options: [], follow_ups: [] },
            AllList: { options: [], follow_ups: [] },
            currentYear: null,
            currentMonth: null,
            currentDate: null,
            refreshing: false,

            visibleFollowUpModal: false,
            objectFollowUp: null,

            visibleMedicineModal: false,
            objectMedicine: null
        };
    }

    componentDidMount = async () => {
        let route = this.props.navigation.getParam('route', null)

        await this.setState({
            currentYear: moment().format('YYYY'),
            currentMonth: ('0' + (moment().month() + 1)).slice(-2),
        })

        await this.getList('YearsList', 'years');
        await this.getMedicine();
        this.setState({ FollowUpData: this.state.YearsList.follow_ups })

        if (route != null) {
            setTimeout(() => {
                console.log("asdfasdfs")
                this.setState({
                    sectionIndex: 1
                })
            }, 500);
        }
    }

    toggleFollowUpModal = () => this.setState({ visibleFollowUpModal: !this.state.visibleFollowUpModal, FollowUpShowDelete: false, FollowUptitle: '', FollowUpDateTime: moment().utc(true) });

    toggleMedicineModal = () => this.setState({ visibleMedicineModal: !this.state.visibleMedicineModal, MedicineShowDelete: false, MedicineTitle: '', MedicineDateTime: moment().utc(true) });

    setDateTime = async (date, state) => {
        const a = moment(date);
        await this.setState({ [state]: a });
    }

    changeTab = async (i) => {
        this.setState({ spinner: true });
        setTimeout(async () => {
            if (i == 0)
                await this.getList('YearsList', 'years');
            else if (i == 1)
                await this.getList('MonthsList', 'months', this.state.currentYear);
            else if (i == 2)
                await this.getList('DaysList', 'dates', this.state.currentYear, this.state.currentMonth, this.state.currentDate);
            else if (i == 3)
                await this.getList('AllList', 'all');
        }, 500);
        i == 3 ? this.closeAnimatedMethod() : this.openAnimatedMethod();
        this.setState({ index: i })
    };

    selectItem = async (item, tabIndex, type) => {
        this.setState({ spinner: true });
        setTimeout(async () => {
            if (type == 1) {
                this.setState({ currentYear: item.value });
                await this.getList('MonthsList', 'months', this.state.currentYear);
            }
            else if (type == 2) {
                this.setState({ currentMonth: item.value });
                await this.getList('DaysList', 'dates', this.state.currentYear, this.state.currentMonth);
            }
            else if (type == 3) {
                this.setState({ currentDate: item.value });
                await this.getList('DaysList', 'dates', this.state.currentYear, this.state.currentMonth, this.state.currentDate);
                // this.scrollToRow(20);
            }
        }, 500);
        this.setState({ index: tabIndex })
    }

    // scrollToRow(itemIndex) {
    //     this._scrollView.scrollTo({ x: itemIndex * wp(16) });
    // }

    getList = async (state, mode, year, month, date) => {
        try {
            let user_id = await AppHelper.getItem("user_id");
            let params = {
                user_id,
                listing_type: 'section',
                mode, year, month, date
            };
            const res = await API.get(API_URL.REMINDER_FOLLOWUP, params);
            this.setState({ [state]: res.data, FollowUpData: res.data.follow_ups, spinner: false });
        } catch (error) {
            console.log(error);
        }
    }

    getMedicine = async () => {
        try {
            let user_id = await AppHelper.getItem("user_id");
            let params = { user_id };
            const res = await API.get(API_URL.REMINDER_MEDICINE, params);
            this.setState({ MedicineData: res.data.medicines, spinner: false });
        } catch (error) {
            console.log(error);
        }
    }

    renderItems = (list, tabIndex, type) => (
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
            {list.options.map((item, index) => (
                <TouchableOpacity key={index} onPress={() => this.selectItem(item, tabIndex, type)} style={[styles.calenderSubTab, item.is_active == 1 ? { backgroundColor: '#1896FC' } : null]}>
                    <Text style={[styles.calenderText, item.is_active == 1 ? { color: '#fff' } : null]}>{item.title}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    )

    renderAll = () => <View />

    renderTabBar = props => (
        <TabBar
            {...props}
            indicatorContainerStyle={{ margin: 4 }}
            // pressColor={'transparent'}
            indicatorStyle={{ backgroundColor: '#1896FC', height: '100%', width: wp(21), borderRadius: 25 }}
            style={{ backgroundColor: '#D6EDFF', borderRadius: 25, elevation: 0, height: wp(8), alignContent: 'center' }}
            tabStyle={{ borderRadius: 25, }}
            labelStyle={{ fontWeight: 'bold', borderRadius: 25, textAlignVertical: 'center', fontSize: FontSize('xMini'), marginTop: -10 }}
            activeColor={'#fff'}
            inactiveColor={'#1896FC'}
        />
    );

    closeAnimatedMethod = () => {
        Animated.timing(this.state.animatedHeight,
            {
                toValue: hp(7),
                duration: 400,
                useNativeDriver: false
            }
        ).start();
    }

    openAnimatedMethod = () => {
        Animated.timing(this.state.animatedHeight,
            {
                toValue: hp(17),
                duration: 400,
                useNativeDriver: false
            }
        ).start();
    }

    itemSeparator = () => (<View style={styles.mainRowBottomBorder} />)

    _onRefresh = async () => {

        if (this.state.sectionIndex == 0) {
            await this.getMedicine();
        } else {
            let i = this.state.index;
            if (i == 0)
                await this.getList('YearsList', 'years');
            else if (i == 1)
                await this.getList('MonthsList', 'months', this.state.currentYear);
            else if (i == 2)
                await this.getList('DaysList', 'dates', this.state.currentYear, this.state.currentMonth, this.state.currentDate);
            else if (i == 3)
                await this.getList('AllList', 'all');
        }


        this.setState({ spinner: false })
    }

    renderEmptyComponent = () => (
        <View style={{ paddingHorizontal: wp(3) }}>
            <Text style={{ color: '#C7C7C7', textAlign: 'center' }}>No follow ups found</Text>
        </View>
    )

    reminderSettings = async (id, value) => {
        this.setState({ spinner: true })

        let params = {
            user_id: await AppHelper.getItem("user_id"),
            reference_key: this.state.sectionIndex == 0 ? 'medicine' : 'follow_up',
            reference_id: id, reference_value: value == 1 ? '0' : '1'
        };

        try {
            const res = await API.post(API_URL.REMINDER_SETTINGS, params);
            if (res.status == 'Success') this._onRefresh();
            else this.setState({ spinner: false });
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        const { sectionIndex, spinner, index, routes, objectFollowUp, objectMedicine, visibleFollowUpModal, visibleMedicineModal } = this.state;
        const { FollowUpData, MedicineData, YearsList, MonthsList, DaysList } = this.state;
        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Reminder"}
                    context={this.props}
                    backButton={true}
                    right={
                        sectionIndex == 0
                            ? (MedicineData.length !== 0) ?
                                <TouchableOpacity onPress={this.toggleMedicineModal}>
                                    <Icon type="Entypo" name="plus" style={{ color: '#fff', marginRight: wp(1) }} />
                                </TouchableOpacity> : null
                            : (YearsList.follow_ups.length == 0 && MonthsList.follow_ups.length == 0 && DaysList.follow_ups.length == 0)
                                ? null : <TouchableOpacity onPress={this.toggleFollowUpModal}>
                                    <Icon type="Entypo" name="plus" style={{ color: '#fff', marginRight: wp(1) }} />
                                </TouchableOpacity>
                    }
                    onBackButtonPress={() => {
                        const { navigation } = this.props;
                        let route = navigation.getParam('route', null)
                        if (route != null) {
                            this.props.navigation.navigate(route)
                        } else {
                            this.props.navigation.goBack()
                        }
                    }}
                    noShadow={true}
                    transparent={Platform.OS === 'ios' ? true : false}
                />
                {/* NAVIGATION HEADER END*/}
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* Spinner */}
                    <CustomSpinner visible={spinner} />

                    <Tabs
                        initialPage={0}
                        page={sectionIndex}
                        tabBarUnderlineStyle={{ backgroundColor: "#ffffff", paddingHorizontal: 30, height: 2 }}
                        tabContainerStyle={{ elevation: 0 }}
                        onChangeTab={({ i }) => this.setState({ sectionIndex: i })}
                        locked>

                        <Tab
                            textStyle={{ color: colors.white, textTransform: "uppercase" }}
                            heading={
                                <TabHeading style={styles.tabHeading}>
                                    <Text style={[(sectionIndex == 0) ? styles.tabSelectText : styles.tabDefaultText]}>Medicine</Text>
                                </TabHeading>
                            }
                        >
                            {
                                MedicineData.length == 0
                                    ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image style={{ resizeMode: 'contain', height: '15%' }} source={require('../assets/images/medicine.png')} />
                                        <Text style={{ fontSize: FontSize('xLarge'), fontFamily: Fonts.HelveticaNeue, fontWeight: 'bold', marginVertical: hp(2.5) }}>Nothing in Medicines</Text>
                                        <TouchableOpacity onPress={this.toggleMedicineModal} style={styles.reminderBtn}>
                                            <Text style={styles.reminderBtnText}>Add Medicine</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <View style={{ flex: 1 }}>
                                        {
                                            <FlatList
                                                data={MedicineData}
                                                keyExtractor={(item, index) => index.toString()}
                                                ItemSeparatorComponent={this.itemSeparator}
                                                refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        activeOpacity={0.5}
                                                        key={index}
                                                        onPress={() => {
                                                            // check is doctor_id exists?
                                                            if (item.doctor_id != null) {
                                                                Alert.alert("Doctor prescripbed medicine is not editable")
                                                            } else {
                                                                this.setState({ objectMedicine: item, visibleMedicineModal: true })
                                                            }
                                                        }}
                                                        style={[styles.mainRow, { paddingVertical: wp(4), paddingHorizontal: wp(4) }]}>

                                                        <View style={{ width: wp(52), flexDirection: 'column' }}>
                                                            <Text style={{ fontSize: FontSize('small') }}>{item.medicine_name}</Text>
                                                            <Text style={{ fontSize: FontSize('xMini'), color: '#1896FC' }}>{item.days + ' days from ' + moment(item.created_at).format('DD-MM-YYYY')}</Text>
                                                        </View>

                                                        <View style={{ width: wp(30), flexDirection: 'row', alignItems: 'center' }}>
                                                            <View style={[styles.FrequencyStyle, item.morning == 1 ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginRight: wp(1) }]}>
                                                                <Text style={[item.morning == 1 ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>M</Text>
                                                            </View>
                                                            <View style={[styles.FrequencyStyle, item.afternoon == 1 ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginRight: wp(1) }]}>
                                                                <Text style={[item.afternoon == 1 ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>A</Text>
                                                            </View>
                                                            <View style={[styles.FrequencyStyle, item.evening == 1 ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle]}>
                                                                <Text style={[item.evening == 1 ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>E</Text>
                                                            </View>
                                                        </View>

                                                        <TouchableOpacity onPress={() => this.reminderSettings(item.medication_detail_id, item.is_on)} style={[styles.commentButton, item.is_on == 1 ? styles.commentButtonActive : styles.commentButtonInactive]}>
                                                            <Icon type="MaterialIcons" style={{ color: '#fff' }} name="notifications" />
                                                        </TouchableOpacity>

                                                    </TouchableOpacity>
                                                )}
                                            />
                                        }
                                    </View>
                            }
                        </Tab>

                        <Tab
                            textStyle={{ color: colors.white, textTransform: "uppercase" }}
                            heading={
                                <TabHeading style={styles.tabHeading}>
                                    <Text style={[(sectionIndex == 1) ? styles.tabSelectText : styles.tabDefaultText]}>Follow Up</Text>
                                </TabHeading>
                            }
                        >
                            {
                                (FollowUpData.length == 0) && (YearsList.follow_ups.length == 0 && MonthsList.follow_ups.length == 0 && DaysList.follow_ups.length == 0)
                                    ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image style={{ resizeMode: 'contain', height: '15%' }} source={require('../assets/images/reminder.png')} />
                                        <Text style={{ fontSize: FontSize('xLarge'), fontFamily: Fonts.HelveticaNeue, fontWeight: 'bold', marginVertical: hp(2.5) }}>Nothing in Follow Ups</Text>
                                        <TouchableOpacity onPress={this.toggleFollowUpModal} style={styles.reminderBtn}>
                                            <Text style={styles.reminderBtnText}>Add Follow Up</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : <View style={{ flex: 1, paddingVertical: wp(4) }}>
                                        <Animated.View style={{ height: this.state.animatedHeight }}>
                                            <TabView
                                                style={{ justifyContent: 'center', paddingHorizontal: wp(3) }}
                                                swipeEnabled={false}
                                                renderTabBar={this.renderTabBar}
                                                sceneContainerStyle={{ flexDirection: 'row', paddingTop: wp(4), paddingHorizontal: wp(3) }}
                                                navigationState={{ index, routes }}
                                                onIndexChange={(i) => this.changeTab(i)}
                                                renderScene={SceneMap({
                                                    first: () => this.renderItems(YearsList, 1, 1),
                                                    second: () => this.renderItems(MonthsList, 2, 2),
                                                    third: () => this.renderItems(DaysList, 2, 3),
                                                    fourth: this.renderAll
                                                })}
                                            />
                                        </Animated.View>
                                        <SectionList
                                            keyExtractor={(item, index) => item + index}
                                            sections={FollowUpData}
                                            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity activeOpacity={0.5}
                                                    onPress={() => {
                                                        let _moFollowUpDate = moment(item.follow_up_at).utc(true)
                                                        let _moCurrentDate = moment().utc(true)

                                                        if (item.chatroom_session_id != null) {
                                                            Alert.alert("Doctor Follow up reminder is not editable")
                                                        } else if (_moCurrentDate.isAfter(_moFollowUpDate) == true) {
                                                            Alert.alert("You cannot modify passed follow up")
                                                        } else {
                                                            console.log(item)
                                                            this.setState({
                                                                objectFollowUp: item,
                                                                visibleFollowUpModal: true
                                                            })
                                                        }
                                                    }}
                                                    style={{ backgroundColor: '#fff', paddingHorizontal: wp(3), paddingVertical: wp(3), flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
                                                    <View>
                                                        {
                                                            index == 0
                                                                ? (
                                                                    <>
                                                                        <Text style={{ fontWeight: 'bold', fontSize: FontSize('medium') }}>{moment(item.follow_up_at).format('DD MMM')}</Text>
                                                                        <Text style={{ fontWeight: 'bold', fontSize: FontSize('small') }}>{moment(item.follow_up_at).utc(true).format('h:mm A')}</Text>
                                                                    </>
                                                                )
                                                                : index == 1
                                                                    ? (
                                                                        <>
                                                                            <Text style={{ fontWeight: 'bold', fontSize: FontSize('medium'), textAlign: 'center' }}>{moment(item.follow_up_at).format('DD')}</Text>
                                                                            <Text style={{ fontWeight: 'bold', fontSize: FontSize('small') }}>{moment(item.follow_up_at).utc(true).format('h:mm A')}</Text>
                                                                        </>
                                                                    )
                                                                    : index == 2
                                                                        ? <Text style={{ fontWeight: 'bold', fontSize: FontSize('small') }}>{moment(item.follow_up_at).utc(true).format('h:mm A')}</Text>
                                                                        : <Text style={{ fontWeight: 'bold', fontSize: FontSize('small') }}>{moment(item.follow_up_at).utc(true).format('h:mm A')}</Text>
                                                        }
                                                    </View>
                                                    <View style={{ width: '65%' }}>
                                                        <Text style={{ fontSize: FontSize('xMini') }}>{item.comment}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => this.reminderSettings(item.id, item.is_on)} style={[styles.commentButton, item.is_on == 1 ? styles.commentButtonActive : styles.commentButtonInactive]}>
                                                        <Icon type="MaterialIcons" style={{ color: '#fff' }} name="notifications" />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            )}
                                            ListEmptyComponent={this.renderEmptyComponent}
                                            renderSectionHeader={({ section: { title } }) => (
                                                title == '' ? null
                                                    : <View style={{ backgroundColor: '#F5F5F5', alignItems: 'flex-start', paddingHorizontal: wp(3), paddingVertical: wp(1) }}>
                                                        <Text style={[styles.calenderText, { color: '#1896FC', fontSize: FontSize('small'), lineHeight: null }]}>{title}</Text>
                                                    </View>
                                            )}
                                        />
                                    </View>
                            }
                        </Tab>
                    </Tabs>
                </SafeAreaView>


                {/* Modal Medicine add, update, delete */}
                <ModalMedicine visible={visibleMedicineModal} data={objectMedicine} onClosePress={(show, refresh = false) => {
                    if (show == false) {
                        this.setState({ visibleMedicineModal: show, objectMedicine: null })
                    }
                    if (refresh == true) {
                        this._onRefresh()
                    }
                }} />

                {/* Modal Follow up add, update, delete */}
                <ModalFollowUp visible={visibleFollowUpModal} data={objectFollowUp} onClosePress={(show, refresh = false) => {
                    if (show == false) {
                        this.setState({ visibleFollowUpModal: show, objectFollowUp: null })
                    }
                    if (refresh == true) {
                        this._onRefresh()
                    }
                }} />
            </Container>
        )
    }
}

export default ReminderScreen;

const styles = StyleSheet.create({
    reminderBtn: {
        width: wp(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(13),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
        marginVertical: wp(2)
    },
    reminderBtnText: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase'
    },

    tabSelectText: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    tabDefaultText: {
        color: colors.white,
        opacity: 0.8,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    tabHeading: {
        backgroundColor: colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    calenderSubTab: {
        borderRadius: 10,
        marginRight: wp(2),
        width: wp(16),
        height: wp(16),
        backgroundColor: '#E6F9FF',
        justifyContent: 'center'
    },
    calenderText: {
        color: '#7FC7FD',
        textAlign: 'center',
        paddingVertical: wp(1),
        fontSize: FontSize('xMini'),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        lineHeight: 20
    },
    mainRow: {
        width: '100%',
        flexDirection: 'row',
    },
    FrequencyStyle: {
        borderRadius: wp(8) / 2,
        width: wp(8), height: wp(8),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2),
        fontSize: FontSize('mini'),
    },
    FrequencyActiveStyle: {
        backgroundColor: '#1896fc',
        color: '#fff'
    },
    FrequencyInactiveStyle: {
        backgroundColor: '#e6e6e6',
        color: '#acabab'
    },
    frequencyTextActiveStyle: {
        color: '#fff'
    },
    frequencyTextInactiveStyle: {
        color: '#acabab'
    },
    commentButton: {
        width: wp(10),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        height: wp(10),
        alignSelf: 'center'
    },
    commentButtonActive: {
        backgroundColor: '#1896fc',
    },
    commentButtonInactive: {
        backgroundColor: '#e6e6e6',
    },
    mainRowBottomBorder: {
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
})
