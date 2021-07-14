import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableWithoutFeedback, Alert, RefreshControl, SectionList } from 'react-native';
import { Container, Tabs, Tab, TabHeading, Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { GetPayments } from '../api/Doctor';
import { SafeAreaView } from 'react-navigation';
import NavigationBar from '../components/NavigationBar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Image } from 'react-native';
import NavDropdownOptions from '../components/NavDropdownOptions';
import API from '../services/API';
import { API_URL } from '../utils/Constant'
import { TouchableOpacity } from 'react-native';
import Modal from 'react-native-translucent-modal';
import AppButton from '../components/AppButton';
import DatePicker from 'react-native-date-picker'

var moment = require('moment');

var _customStartDateObject = null
var _customEndDateObject = null

class PaymentScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,

            // earningFilterTitle: "Today",
            // earningFilterKey: "today",
            // earningStartDate: moment().utc(true).format('YYYY-MM-DD 00:00:00'),
            // earningEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
            earningFilterTitle: "Lifetime",
            earningFilterKey: "all",
            earningStartDate: moment().startOf('month').utc(true).format('1970-01-01 00:00:00'),
            earningEndDate: moment().utc(true).format('YYYY-MM-DD HH:mm:ss'),

            // payoutFilterTitle: "Today",
            // payoutFilterKey: "today",
            // payoutStartDate: moment().utc(true).format('YYYY-MM-DD 00:00:00'),
            // payoutEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
            payoutFilterTitle: "Lifetime",
            payoutFilterKey: "all",
            payoutStartDate: moment().startOf('month').utc(true).format('1970-01-01 00:00:00'),
            payoutEndDate: moment().utc(true).format('YYYY-MM-DD HH:mm:ss'),

            earningCustomStartDate: "Select",
            earningCustomEndDate: "Select",
            earningSelectedCustomDateKey: "start", //Start, End
            earningMinimumDate: null,
            earningCustomPopupButtonTitle: "Select",

            payoutCustomStartDate: "Select",
            payoutCustomEndDate: "Select",
            payoutSelectedCustomDateKey: "start", //Start, End
            payoutMinimumDate: null,
            payoutCustomPopupButtonTitle: "Select",

            currency: "PKR",
            sectionIndex: 0,
            initialPage: 0,

            arrEarnings: [],
            totalEarnings: "0",

            arrPayouts: [],
            totalPayouts: 0,

            showEarningCustomCalendar: false,
            showTransactionDetailPopup: false,

            showPayoutCustomCalendar: false,

            transactionDetailObject: null,

        };

        this.props.navigation.addListener('willFocus', async () => {
            await this.requestEarnings();
        })
    }

    async componentDidMount() {
        await this.requestEarnings();
        await this.requestPayouts();
    }

    /* On Refresh */
    _onRefresh = async () => {
        if (this.state.sectionIndex == 0) {
            this.setState({ refreshing: true }, () => { this.requestEarnings() });
        } else {
            this.setState({ refreshing: true }, () => { this.requestPayouts() });
        }
    }

    resetEarningFilter = async () => {
        this.setState({
            earningFilterTitle: "Today",
            earningFilterKey: "today",
            earningStartDate: moment().utc(true).format('YYYY-MM-DD 00:00:00'),
            earningEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
        })
    }

    resetPayoutFilter = async () => {
        this.setState({
            payoutFilterTitle: "Today",
            payoutFilterKey: "today",
            payoutStartDate: moment().utc(true).format('YYYY-MM-DD 00:00:00'),
            payoutEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
        })
    }

    showEarningCustomCalendar = async (show) => {

        this._customStartDateObject = null
        this._customEndDateObject = null

        this.setState({
            showEarningCustomCalendar: show,
            earningStartDate: moment().utc(true).format('YYYY-MM-DD 00:00:00'),
            earningEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
            earningCustomStartDate: "Select",
            earningCustomEndDate: "Select",
            earningSelectedCustomDateKey: "start",
            earningCustomPopupButtonTitle: 'Select',
        })
    }

    showPayoutCustomCalendar = async (show) => {
        this._customStartDateObject = null
        this._customEndDateObject = null

        this.setState({
            showPayoutCustomCalendar: show,
            payoutStartDate: moment().utc(true).format('YYYY-MM-DD 00:00:00'),
            payoutEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
            payoutCustomStartDate: "Select",
            payoutCustomEndDate: "Select",
            payoutSelectedCustomDateKey: "start",
            payoutCustomPopupButtonTitle: 'Select',
        })
    }

    showTransactionDetailPopup = async (show, object) => {
        this.setState({
            showTransactionDetailPopup: show,
            transactionDetailObject: object
        })
    }

    /* Get Topup History Dashboard */
    requestEarnings = async () => {

        let userId = await appHelper.getItem("user_id");
        const params = {
            user_id: userId,
            start_date: this.state.earningStartDate,
            end_date: this.state.earningEndDate,
            listing_type: 'section',
            timezone_offset: moment().utcOffset()
        }
        try {
            const res = await API.get(API_URL.DOCTOR_EARNINGS, params);
            if (res.status == 'Success') {
                const { data } = await res;
                console.log(data)
                this.setState({
                    arrEarnings: data.earnings,
                    currency: data.currency,
                    totalEarnings: parseFloat(data.total_doctor_earning).toFixed(2),
                    refreshing: false
                })
            }
            else if (data.status == 'Error') {
                this.setState({ refreshing: false })
                Alert.alert('', data.message);
            }
        } catch (error) {
            this.setState({ refreshing: false })
            console.warn('', error);
        }
    }

    requestPayouts = async () => {

        let userId = await appHelper.getItem("user_id");
        const params = {
            user_id: userId,
            start_date: this.state.payoutStartDate,
            end_date: this.state.payoutEndDate,
            listing_type: 'section',
            timezone_offset: moment().utcOffset()
        }
        try {
            const res = await API.get(API_URL.DOCTOR_PAYOUTS, params);
            if (res.status == 'Success') {
                const { data } = await res;
                console.log(data)
                this.setState({
                    arrPayouts: data.payouts,
                    currency: data.currency,
                    totalPayouts: parseInt(data.total_doctor_payouts),
                    refreshing: false
                })
            }
            else if (data.status == 'Error') {
                this.setState({ refreshing: false })
                Alert.alert('', data.message);
            }
        } catch (error) {
            this.setState({ refreshing: false })
            console.warn('', error);
        }
    }

    /* Flat List View */
    _keyExtractor = (item, index) => index;
    _renderItem = ({ item }) => (

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: "#f1f1f1", paddingHorizontal: hp(1.8), }}>
            <View style={[GlobalStyles.shadowElevationThree, {
                borderLeftWidth: 6,
                borderLeftColor: colors.btnBgColor,
                borderRadius: wp(1.5),
                padding: 10,
                marginVertical: hp(1),
                flex: 1,
                backgroundColor: colors.white,
            }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                    <View>
                        <Text style={{ color: '#1994fb', fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('large'), }}>{item.patient_name}</Text>
                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{item.package_name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', width: wp(30), }}>
                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), textAlign: "right" }} numberOfLines={2}>
                            {
                                moment(item.date).utc(true).format('hh:mm A[\n]DD-MM-YYYY')
                            }
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingTop: 5, paddingBottom: 5, paddingRight: 10 }}>
                    <View>
                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('large'), }}>{appHelper.currency_formatter(this.state.currency, item.amount)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', width: wp(30), }}>
                        {
                            (item.payment_status == 'CashReturn')
                                ?
                                <View style={{ backgroundColor: "#D1EAFE", padding: 5, borderRadius: 5 }}>
                                    <Text style={{ color: colors.primaryText, fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('xMini'), textAlign: 'right', textTransform: 'uppercase' }} numberOfLines={2}>Refunded</Text>
                                </View>
                                : null
                        }
                    </View>
                </View>
            </View>
        </View>
    );

    render() {
        const { spinner, totalEarnings, totalPayouts, currency, sectionIndex, initialPage } = this.state;

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Payments"}
                        context={this.props}
                        // removeBackButton={false}
                        onBackButtonPress={() => this.props.navigation.navigate('Setting')}
                        backButton={true}
                        right={null}
                        noShadow={true}
                        transparent={Platform.OS === 'ios' ? true : false}
                    />
                    {/* NAVIGATION HEADER END*/}

                    <Tabs
                        initialPage={initialPage}
                        onChangeTab={({ i }) => this.setState({ sectionIndex: i })}
                        tabBarUnderlineStyle={{ backgroundColor: colors.white, }}
                        tabContainerStyle={{
                            elevation: 0,
                        }}
                    >
                        <Tab
                            textStyle={[{ color: colors.white, textTransform: "uppercase", }]}
                            heading={
                                <TabHeading style={{ backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                    <Text style={[(sectionIndex == 0) ? styles.tabSelectText : styles.tabDefaultText]} >Earnings</Text>
                                </TabHeading>
                            }
                        >
                            {/* MAIN CONTENT SECTION */}
                            <View style={{ flex: 1, width: wp(100) }}>

                                <View style={{
                                    flex: 1,
                                    marginTop: hp(0),
                                    backgroundColor: colors.transparent,
                                    height: hp(87),
                                }}>

                                    {/* AMOUNT BLOCK */}
                                    <View style={[{ backgroundColor: colors.primary, padding: 20, paddingBottom: 0, zIndex: 1, }]}>
                                        <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, paddingVertical: 15, paddingLeft: 15, paddingRight: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", top: 20, zIndex: 0 }]}>
                                            <View style={[{ flexDirection: "row", alignItems: "center", width: "100%" }]}>
                                                <View style={{ height: hp(12), width: hp(12), borderRadius: hp(12 / 2), backgroundColor: "#CBF6FF", justifyContent: 'center', alignItems: 'center', }}>
                                                    <Image style={[GlobalStyles.imgContain, { width: hp(6), height: hp(6), }]} source={require('../assets/icons/money.png')} />
                                                </View>
                                                <View style={{ paddingLeft: wp(3), }}>
                                                    <Text style={{ fontSize: FontSize('medium'), color: colors.black, fontFamily: Fonts.HelveticaNeue, marginTop: hp(1), }}>Total Earnings</Text>
                                                    <Text style={{ fontSize: FontSize('xxxLarge'), color: colors.primaryText, fontFamily: Fonts.HelveticaNeueBold, maxWidth: wp(55), }} numberOfLines={1}>{totalEarnings} {currency}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, backgroundColor: 'white', position: 'absolute', top: 40, right: 20, width: 150, zIndex: 2, borderRadius: 10, }}>
                                        <NavDropdownOptions onItemSelected={(item) => {
                                            console.log("Item selected")
                                            console.log(item)
                                            if (item.key == "custom") {
                                                this.showEarningCustomCalendar(true)
                                            } else {
                                                this.setState({
                                                    earningFilterKey: item.key,
                                                    earningFilterTitle: item.title,
                                                    earningStartDate: item.start_date,
                                                    earningEndDate: item.end_date
                                                })
                                                this.requestEarnings()
                                            }
                                        }} />
                                    </View>

                                    {/* FILTER HEADER */}

                                    <View style={[{ backgroundColor: colors.white, padding: 20, borderBottomColor: colors.borderColor, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(3), }]}>
                                        <View style={{}}>
                                            <Text style={{ fontSize: FontSize('small'), color: "#383338", fontFamily: Fonts.HelveticaNeue, marginTop: hp(1), }}>{(this.state.earningFilterKey == "today") ? "Recent Earnings" : "Earnings"}</Text>
                                        </View>
                                        {
                                            (this.state.earningFilterKey == "today")
                                                ? null
                                                : <TouchableOpacity onPress={() => {
                                                    this.resetEarningFilter()
                                                    this.requestEarnings()
                                                }}>
                                                    <View style={{ backgroundColor: "#CBF6FF", justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, }}>
                                                        <Text style={{ fontSize: FontSize('small'), lineHeight: FontSize('small'), color: '#1896FC', fontFamily: Fonts.HelveticaNeue }}>
                                                            <Icon type="FontAwesome" name='close' style={{ fontSize: FontSize('small'), color: '#1896FC' }} /> {this.state.earningFilterTitle}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                        }
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <SectionList
                                            refreshing={this.state.refreshing}
                                            onRefresh={() => this._onRefresh()}
                                            sections={this.state.arrEarnings}
                                            keyExtractor={(item, index) => item + index}
                                            renderItem={({ item }) => {
                                                return (
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: "#f1f1f1", }}>
                                                        <View style={[styles.listStyle, {}]}>
                                                            <TouchableOpacity onPress={() => {
                                                                this.showTransactionDetailPopup(true, item)
                                                            }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5 }}>
                                                                    <View style={{ width: wp(65), }}>
                                                                        <Text style={{ color: '#383338', fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), }}>{item.patient_name}</Text>
                                                                        <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{item.package_name}</Text>
                                                                    </View>
                                                                    <View style={{ alignItems: 'flex-end', width: wp(25), }}>
                                                                        <Text style={{ color: "#1896FC", fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), }}>{item.doctor_amount} {this.state.currency}</Text>
                                                                        <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{appHelper.timestampFormat(appHelper.convertToGMT(item.created_at), true, 'hh:mm a')}</Text>
                                                                    </View>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )
                                            }}
                                            ListEmptyComponent={
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={{ textAlign: 'center', color: '#999999' }}>No earnings found</Text>
                                                </View>
                                            }
                                            renderSectionHeader={({ section: { title } }) => {
                                                return (
                                                    <View style={{ paddingVertical: hp(1), paddingHorizontal: hp(2), backgroundColor: "#f1f1f1", }}>
                                                        <Text style={{ color: "#1896FC", fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), }}>{title}</Text>
                                                    </View>
                                                )
                                            }}
                                        />
                                        {/* EARNINGS LISTING */}
                                    </View>
                                </View>
                            </View>

                            {/* Custom Calendar Popup */}
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={this.state.showEarningCustomCalendar}
                                onRequestClose={() => {
                                    // this._closeModal();
                                    // this.props.onClosePopup(false)
                                }}>

                                <View style={GlobalStyles.overlay}>
                                    <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>
                                        <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: wp(4), paddingHorizontal: wp(3) }]}>
                                            <View style={{ width: 25 }}>

                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={[{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }]}>Select Custom Date Range</Text>
                                            </View>

                                            <View style={{ width: 25 }}>

                                                <TouchableOpacity
                                                    style={[{ backgroundColor: colors.transparent, }]}
                                                    onPress={() => {
                                                        this.showEarningCustomCalendar(false)
                                                    }}
                                                >
                                                    <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#CBF6FF", width: hp(3), height: hp(3), borderRadius: hp(3) / 2 }]}>
                                                        <Icon type="AntDesign" name='close' style={{ fontSize: hp(2), color: '#1896FC' }} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>

                                        </View>
                                        <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }]}>
                                            <View style={[{ width: '100%', backgroundColor: colors.transparent, alignItems: 'center' }]}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'flex-start'
                                                }}>
                                                    <View style={{ width: '49%', marginRight: '2%' }}>
                                                        <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino }}>Start Date</Text>
                                                        <TouchableOpacity onPress={() => {
                                                            this.setState({
                                                                earningCustomPopupButtonTitle: 'Select',
                                                                earningSelectedCustomDateKey: 'start',
                                                                minimumDate: null
                                                            })
                                                        }}>
                                                            <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{(this.state.earningCustomStartDate == "Select") ? "Select" : this.state.earningCustomStartDate}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{ width: '49%', }}>
                                                        <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino }}>End Date</Text>
                                                        <TouchableOpacity onPress={() => {
                                                            this.setState({
                                                                earningCustomPopupButtonTitle: 'Done',
                                                                earningSelectedCustomDateKey: 'end',
                                                                minimumDate: this.state.earningCustomStartDate
                                                            })
                                                        }}>
                                                            <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{(this.state.earningCustomEndDate == "Select") ? "Select" : this.state.earningCustomEndDate}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={[{ height: 180, marginTop: 10, marginBottom: 10 }]}>
                                                    <DatePicker
                                                        date={(this.state.earningSelectedCustomDateKey == "start")
                                                            ? (this.state.earningCustomStartDate == "Select")
                                                                ? new Date()
                                                                : new Date(this.state.earningCustomStartDate)
                                                            : (this.state.earningCustomEndDate == "Select")
                                                                ? new Date()
                                                                : new Date(this.state.earningCustomEndDate)
                                                        }
                                                        // minimumDate={(this.state.minimumDate == null) ? null : new Date(this.state.minimumDate)}
                                                        androidVariant={'nativeAndroid'}
                                                        mode={'date'}
                                                        onDateChange={(date) => {
                                                            if (this.state.earningSelectedCustomDateKey == "start") {

                                                                this._customStartDateObject = moment(date.toJSON()).utc(true)
                                                                this.setState({
                                                                    earningCustomStartDate: appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD'),
                                                                })
                                                            }
                                                            if (this.state.earningSelectedCustomDateKey == "end") {

                                                                this._customEndDateObject = moment(date.toJSON()).utc(true)
                                                                this.setState({
                                                                    earningCustomEndDate: appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD')
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                            <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, }]}>
                                                {
                                                    <AppButton
                                                        onPressButton={() => {
                                                            if (this._customStartDateObject == null) {
                                                                Alert.alert('Select Start Date')
                                                            } else if (this._customEndDateObject == null) {
                                                                this.setState({
                                                                    earningCustomPopupButtonTitle: 'Done',
                                                                    earningSelectedCustomDateKey: 'end',
                                                                    minimumDate: this.state.earningCustomStartDate,
                                                                    earningEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
                                                                    earningCustomEndDate: moment().utc(true).format('YYYY-MM-DD'),
                                                                })
                                                                this._customEndDateObject = moment().utc(true)
                                                            } else if (this._customStartDateObject > this._customEndDateObject) {
                                                                Alert.alert('Start date should be smaller than the End date')
                                                            } else {
                                                                this.setState({
                                                                    showEarningCustomCalendar: false,
                                                                    earningStartDate: this._customStartDateObject.format('YYYY-MM-DD 00:00:00'),
                                                                    earningEndDate: this._customEndDateObject.format('YYYY-MM-DD 23:59:59'),
                                                                    earningCustomStartDate: "Select",
                                                                    earningCustomEndDate: "Select",
                                                                    earningSelectedCustomDateKey: "start",
                                                                    earningFilterTitle: this._customStartDateObject.format('YYYY-MM-DD') + " to " + this._customEndDateObject.format('YYYY-MM-DD'),
                                                                    earningFilterKey: "custom",
                                                                    earningCustomPopupButtonTitle: 'Select',
                                                                })
                                                                this._customStartDateObject = null
                                                                this._customEndDateObject = null
                                                                this.requestEarnings()
                                                            }
                                                        }}
                                                        styles={[{ marginTop: hp(0), borderRadius: wp(1.5) }]}
                                                        title={this.state.earningCustomPopupButtonTitle}
                                                        textColor={colors.white}>
                                                    </AppButton>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Modal>

                            {/* Transaction Details for earning */}
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={this.state.showTransactionDetailPopup}
                                onRequestClose={() => {
                                    this.showTransactionDetailPopup(false, null)
                                }}>
                                {
                                    this.state.transactionDetailObject == null
                                        ? null
                                        : <View style={GlobalStyles.overlay}>
                                            <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>
                                                <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: wp(4), paddingHorizontal: wp(3) }]}>
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 5 }}>
                                                        <Text style={[{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }]}>Payment Details</Text>
                                                    </View>

                                                    <View style={{ width: 25 }}>

                                                        <TouchableOpacity
                                                            style={[{ backgroundColor: colors.transparent, }]}
                                                            onPress={() => {
                                                                this.showTransactionDetailPopup(false, null)
                                                            }}
                                                        >
                                                            <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#CBF6FF", width: hp(3), height: hp(3), borderRadius: hp(3) / 2 }]}>
                                                                <Icon type="AntDesign" name='close' style={{ fontSize: hp(2), color: '#1896FC' }} />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>

                                                </View>
                                                <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, paddingTop: 10, paddingHorizontal: 10, paddingBottom: 7 }]}>
                                                    <View style={[{ width: '100%', backgroundColor: colors.transparent }]}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, borderBottomWidth: 0.5, borderBottomColor: colors.borderColor, paddingBottom: 10, marginBottom: 5 }}>
                                                            <View>
                                                                <Text style={{ color: '#383338', fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), }}>{this.state.transactionDetailObject.patient_name}</Text>
                                                                <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{this.state.transactionDetailObject.package_name}</Text>
                                                                <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{appHelper.timestampFormat(appHelper.convertToGMT(this.state.transactionDetailObject.created_at), true, 'DD-MM-YYYY hh:mm a')}</Text>
                                                            </View>
                                                            <View style={{ alignItems: 'flex-end', }}>
                                                                <Text style={{ color: "#1896FC", fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), }}>{appHelper.currency_formatter(this.state.currency, parseInt(this.state.transactionDetailObject.doctor_amount))}</Text>
                                                                <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>Transaction ID: {this.state.transactionDetailObject.transaction_id}</Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                    <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#CBF6FF", width: hp(1.6), height: hp(1.6), borderRadius: hp(1.6) / 2, marginRight: 3 }]}>
                                                                        <Icon type="AntDesign" name='minus' style={{ fontSize: hp(1.6), color: '#1896FC' }} />
                                                                    </View>
                                                                    <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>Charges: -{this.state.transactionDetailObject.doclink_percentage}%</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <View>
                                                                {
                                                                    (this.state.transactionDetailObject.payment_status == 'CashReturn')
                                                                        ? <View style={{ backgroundColor: "#D1EAFE", padding: 5, borderRadius: 5 }}>
                                                                            <Text style={{ color: colors.primaryText, fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('xMini'), textAlign: 'right', textTransform: 'uppercase' }} numberOfLines={2}>Refunded</Text>
                                                                        </View>
                                                                        : null
                                                                }
                                                            </View>
                                                            <Text style={{ color: "#1896FC", fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), textAlign: 'right' }}>Session Charges: {appHelper.currency_formatter(this.state.currency, parseInt(this.state.transactionDetailObject.transaction_amount))}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                }

                            </Modal>
                        </Tab>

                        {/* 
                        -----------
                        PAYOUT TABS
                        ----------- 
                        */}
                        <Tab
                            textStyle={[{ color: colors.white, textTransform: "uppercase", }]}
                            heading={
                                <TabHeading style={{ backgroundColor: colors.primary, shadowColor: colors.transparent, shadowOpacity: 0 }}>
                                    <Text style={[(sectionIndex == 1) ? styles.tabSelectText : styles.tabDefaultText]}>Payouts</Text>
                                </TabHeading>
                            }
                        >
                            {/* MAIN CONTENT SECTION */}
                            <View style={{ flex: 1, width: wp(100) }}>

                                <View style={{
                                    flex: 1,
                                    marginTop: hp(0),
                                    backgroundColor: colors.transparent,
                                    height: hp(87),
                                }}>

                                    {/* AMOUNT BLOCK */}
                                    <View style={[{ backgroundColor: colors.primary, padding: 20, paddingBottom: 0, zIndex: 1, }]}>
                                        <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, paddingVertical: 15, paddingLeft: 15, paddingRight: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", top: 20, zIndex: 0 }]}>
                                            <View style={[{ flexDirection: "row", alignItems: "center", width: "100%" }]}>
                                                <View style={{ height: hp(12), width: hp(12), borderRadius: hp(12 / 2), backgroundColor: "#CBF6FF", justifyContent: 'center', alignItems: 'center', }}>
                                                    <Image style={[GlobalStyles.imgContain, { width: hp(6), height: hp(6), }]} source={require('../assets/icons/money.png')} />
                                                </View>
                                                <View style={{ paddingLeft: wp(3), }}>
                                                    <Text style={{ fontSize: FontSize('medium'), color: colors.black, fontFamily: Fonts.HelveticaNeue, marginTop: hp(1), }}>Total Payouts</Text>
                                                    <Text style={{ fontSize: FontSize('xxxLarge'), color: colors.primaryText, fontFamily: Fonts.HelveticaNeueBold, maxWidth: wp(55), }} numberOfLines={1}>{appHelper.currency_formatter(currency, totalPayouts)}</Text>
                                                </View>

                                            </View>
                                        </View>
                                    </View>

                                    <View style={{ flex: 1, backgroundColor: 'white', position: 'absolute', top: 40, right: 20, width: 150, zIndex: 2, borderRadius: 10, }}>
                                        <NavDropdownOptions onItemSelected={(item) => {
                                            console.log("Item selected")
                                            console.log(item)
                                            if (item.key == "custom") {
                                                this.showPayoutCustomCalendar(true)
                                            } else {
                                                this.setState({
                                                    payoutFilterKey: item.key,
                                                    payoutFilterTitle: item.title,
                                                    payoutStartDate: item.start_date,
                                                    payoutEndDate: item.end_date
                                                })
                                                this.requestPayouts()
                                            }
                                        }} />
                                    </View>

                                    {/* FILTER HEADER */}

                                    <View style={[{ backgroundColor: colors.white, padding: 20, borderBottomColor: colors.borderColor, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(3), }]}>
                                        <View style={{}}>
                                            <Text style={{ fontSize: FontSize('small'), color: "#383338", fontFamily: Fonts.HelveticaNeue, marginTop: hp(1), }}>{(this.state.filterKey == "today") ? "Recent Payouts" : "Payouts"}</Text>
                                        </View>
                                        {
                                            (this.state.payoutFilterKey == "today")
                                                ? null
                                                : <TouchableOpacity onPress={() => {
                                                    this.resetPayoutFilter()
                                                    this.requestPayouts()
                                                }}>
                                                    <View style={{ backgroundColor: "#CBF6FF", justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, }}>
                                                        <Text style={{ fontSize: FontSize('small'), lineHeight: FontSize('small'), color: '#1896FC', fontFamily: Fonts.HelveticaNeue }}>
                                                            <Icon type="FontAwesome" name='close' style={{ fontSize: FontSize('small'), color: '#1896FC' }} /> {this.state.payoutFilterTitle}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                        }
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <SectionList
                                            refreshing={this.state.refreshing}
                                            onRefresh={() => this._onRefresh()}
                                            sections={this.state.arrPayouts}
                                            keyExtractor={(item, index) => item + index}
                                            renderItem={({ item }) => {
                                                return (
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: "#f1f1f1", }}>
                                                        <View style={[styles.listStyle, {}]}>
                                                            {/* <TouchableOpacity onPress={() => {
                                                                
                                                            }}> */}
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5 }}>
                                                                <View>
                                                                    <Text style={{ color: '#383338', fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), }}>Cash Credit</Text>
                                                                    <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small') }}>Transaction ID: {item.transaction_id}</Text>
                                                                </View>
                                                                <View style={{ alignItems: 'flex-end', width: wp(30), }}>
                                                                    <Text style={{ color: "#1896FC", fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), }}>{appHelper.currency_formatter(this.state.currency, parseInt(item.payout_amount))}</Text>
                                                                    <Text style={{ color: "#383338", fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{appHelper.timestampFormat(appHelper.convertToGMT(item.created_at), true, 'hh:mm a')}</Text>
                                                                </View>
                                                            </View>
                                                            {/* </TouchableOpacity> */}
                                                        </View>
                                                    </View>
                                                )
                                            }}
                                            ListEmptyComponent={
                                                <View style={{ marginTop: 10 }}>
                                                    <Text style={{ textAlign: 'center', color: '#999999' }}>No payouts found</Text>
                                                </View>
                                            }
                                            renderSectionHeader={({ section: { title } }) => {
                                                return (
                                                    <View style={{ paddingVertical: hp(1), paddingHorizontal: hp(2), backgroundColor: "#f1f1f1", }}>
                                                        <Text style={{ color: "#1896FC", fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), }}>{title}</Text>
                                                    </View>
                                                )
                                            }}
                                        />
                                        {/* PAYOUT LISTING */}
                                    </View>
                                </View>
                            </View>

                            {/* Custom Calendar Popup */}
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={this.state.showPayoutCustomCalendar}
                                onRequestClose={() => {
                                    // this._closeModal();
                                    // this.props.onClosePopup(false)
                                }}>

                                <View style={GlobalStyles.overlay}>
                                    <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>
                                        <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: wp(4), paddingHorizontal: wp(3) }]}>
                                            <View style={{ width: 25 }}>

                                            </View>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={[{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }]}>Select Custom Date Range</Text>
                                            </View>

                                            <View style={{ width: 25 }}>

                                                <TouchableOpacity
                                                    style={[{ backgroundColor: colors.transparent, }]}
                                                    onPress={() => {
                                                        this.showPayoutCustomCalendar(false)
                                                    }}
                                                >
                                                    <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#CBF6FF", width: hp(3), height: hp(3), borderRadius: hp(3) / 2 }]}>
                                                        <Icon type="AntDesign" name='close' style={{ fontSize: hp(2), color: '#1896FC' }} />
                                                    </View>
                                                </TouchableOpacity>
                                            </View>

                                        </View>
                                        <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 20 }]}>
                                            <View style={[{ width: '100%', backgroundColor: colors.transparent, alignItems: 'center' }]}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'flex-start'
                                                }}>
                                                    <View style={{ width: '49%', marginRight: '2%' }}>
                                                        <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino }}>Start Date</Text>
                                                        <TouchableOpacity onPress={() => {
                                                            this.setState({
                                                                payoutCustomPopupButtonTitle: 'Select',
                                                                payoutSelectedCustomDateKey: 'start',
                                                                minimumDate: null
                                                            })
                                                        }}>
                                                            <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{(this.state.payoutCustomStartDate == "Select") ? "Select" : this.state.payoutCustomStartDate}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{ width: '49%', }}>
                                                        <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino }}>End Date</Text>
                                                        <TouchableOpacity onPress={() => {
                                                            this.setState({
                                                                payoutCustomPopupButtonTitle: 'Done',
                                                                payoutSelectedCustomDateKey: 'end',
                                                                minimumDate: this.state.payoutCustomStartDate
                                                            })
                                                        }}>
                                                            <View style={{ height: 40, width: "100%", borderRadius: 5, borderColor: colors.borderColor1, borderWidth: 0.5, marginTop: 5, justifyContent: 'center', paddingLeft: wp(4) }}>
                                                                <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.borderColor1 }}>{(this.state.payoutCustomEndDate == "Select") ? "Select" : this.state.payoutCustomEndDate}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={[{ height: 180, marginTop: 10, marginBottom: 10 }]}>
                                                    <DatePicker
                                                        date={(this.state.payoutSelectedCustomDateKey == "start")
                                                            ? (this.state.payoutCustomStartDate == "Select")
                                                                ? new Date()
                                                                : new Date(this.state.payoutCustomStartDate)
                                                            : (this.state.payoutCustomEndDate == "Select")
                                                                ? new Date()
                                                                : new Date(this.state.payoutCustomEndDate)
                                                        }
                                                        // minimumDate={(this.state.minimumDate == null) ? null : new Date(this.state.minimumDate)}
                                                        androidVariant={'nativeAndroid'}
                                                        mode={'date'}
                                                        onDateChange={(date) => {
                                                            if (this.state.payoutSelectedCustomDateKey == "start") {
                                                                this._customStartDateObject = moment(date.toJSON()).utc(true)
                                                                this.setState({
                                                                    payoutCustomStartDate: appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD'),
                                                                })
                                                            }
                                                            if (this.state.payoutSelectedCustomDateKey == "end") {

                                                                this._customEndDateObject = moment(date.toJSON()).utc(true)
                                                                this.setState({
                                                                    payoutCustomEndDate: appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD')
                                                                })
                                                            }
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                            <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, }]}>
                                                {
                                                    <AppButton
                                                        onPressButton={() => {
                                                            if (this._customStartDateObject == null) {
                                                                Alert.alert('Select Start Date')
                                                            } else if (this._customEndDateObject == null) {
                                                                this.setState({
                                                                    payoutCustomPopupButtonTitle: 'Done',
                                                                    payoutSelectedCustomDateKey: 'end',
                                                                    minimumDate: this.state.payoutCustomStartDate,
                                                                    payoutEndDate: moment().utc(true).format('YYYY-MM-DD 23:59:59'),
                                                                    payoutCustomEndDate: moment().utc(true).format('YYYY-MM-DD'),
                                                                })
                                                                this._customEndDateObject = moment().utc(true)
                                                            } else if (this._customStartDateObject > this._customEndDateObject) {
                                                                Alert.alert('Start date should be smaller than the End date')
                                                            } else {
                                                                this.setState({
                                                                    showPayoutCustomCalendar: false,
                                                                    payoutStartDate: this._customStartDateObject.format('YYYY-MM-DD 00:00:00'),
                                                                    payoutEndDate: this._customEndDateObject.format('YYYY-MM-DD 23:59:59'),
                                                                    payoutCustomStartDate: "Select",
                                                                    payoutCustomEndDate: "Select",
                                                                    payoutSelectedCustomDateKey: "start",
                                                                    payoutFilterTitle: this._customStartDateObject.format('YYYY-MM-DD') + " to " + this._customEndDateObject.format('YYYY-MM-DD'),
                                                                    payoutFilterKey: "custom",
                                                                    payoutCustomPopupButtonTitle: 'Select',
                                                                })
                                                                this._customStartDateObject = null
                                                                this._customEndDateObject = null
                                                                this.requestPayouts()
                                                            }
                                                        }}
                                                        styles={[{ marginTop: hp(0), borderRadius: wp(1.5) }]}
                                                        title={this.state.payoutCustomPopupButtonTitle}
                                                        textColor={colors.white}>
                                                    </AppButton>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Modal>
                        </Tab>
                    </Tabs>


                    {/* Spinner */}
                    <CustomSpinner visible={spinner} />

                </SafeAreaView>
            </Container>
        );
    }
}

export default PaymentScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {
        backgroundColor: '#456123',
        height: hp('12%'),
        justifyContent: 'center',
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: hp('3%')
    },
    headerIcon: {
        color: '#fff'
    },
    headerTitle: {
        fontSize: wp('5%'),
        fontFamily: Fonts.RobotoRegular,
        color: '#fff',
        marginLeft: hp('3%')
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
    listStyle: {
        // paddingHorizontal: hp(1.8),
        padding: 10,
        flex: 1,
        backgroundColor: colors.white,
        borderBottomColor: colors.borderColor,
        borderBottomWidth: 1,
    }
});