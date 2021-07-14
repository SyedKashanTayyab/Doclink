import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, Image, Animated, Platform } from 'react-native';
import { Icon, Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FloatingLabel from '../components/CustomFloatingTextInput';
import CouponCodeAddedPopup from '../components/CouponCodeAddedPopup';
import API from '../services/API';
import { API_URL } from '../utils/Constant';
import strings from '../res/strings';

var moment = require('moment');

class WalletScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            walletamount: '',
            data: [],
            currentWallet: {
                currency: 'PKR',
                amount: 0
            },
            heightReferralView: new Animated.Value(hp(7)),
            showReferralCodeView: false,
            viewReferralOpacity: new Animated.Value(0),
            errors: { refCode: "", },
            visible: false,
            validCoupon: true,
            couponCode: ''
        };

        this.props.navigation.addListener('willFocus', async () => {
            this.wallet()
        })
    }

    componentDidMount() {
        // this.wallet()
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.wallet();
    }

    /* Get Topup History Dashboard */
    wallet = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = {
            user_id: user_id,
        }
        try {
            const res = await API.get(API_URL.PATIENT_WALLET, params)
            if (res) {
                const data = res;
                if (data.status == 'Success') {
                    this.setState({
                        data: data.data.history,
                        currentWallet: {
                            currency: data.data.currency,
                            amount: data.data.credit_available
                        }
                    });

                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    /* Flat List View */
    _keyExtractor = (item, index) => index.toString();
    _renderItem = ({ item }) => {

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.transparent, paddingHorizontal: hp(1.8), }}>
                <View style={[GlobalStyles.shadowElevationThree, {
                    borderLeftWidth: 6,
                    borderLeftColor: colors.btnBgColor,
                    borderRadius: wp(1.5),
                    padding: 10,
                    marginBottom: hp(2),
                    marginTop: hp(0.1),
                    flex: 1,
                    backgroundColor: colors.white,
                }]}>
                    {
                        (item.packagename.toLowerCase() == strings.payPerInteraction.toLowerCase()) ?
                            <Fragment>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingVertical: hp(1), }}>
                                    <View>
                                        <Text style={{ color: '#1994fb', fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('large'), }}>{item.title} {item.doctorname}</Text>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{item.packagename}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', }}>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), textAlign: 'right' }} numberOfLines={2}>
                                            {
                                                moment(item.start_time).utc(true).format('hh:mm A[\n]DD-MM-YYYY')
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingVertical: hp(1), }}>
                                    <View>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('large'), }}>
                                            {appHelper.currency_formatter(item.currency, item.amount)}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', }}>
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
                            </Fragment>
                            :
                            <Fragment>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingVertical: hp(1), }}>
                                    <View>
                                        <Text style={{ color: '#1994fb', fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('large'), }}>{item.doctorname}</Text>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{item.packagename}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', }}>
                                        <Text style={{ color: '#ff9600', fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>From</Text>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>
                                            {/* {item.start_time} */}
                                            {moment(item.start_time).utc(true).format('hh:mm A[\n]DD-MM-YYYY')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingVertical: hp(1), }}>
                                    <View>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('large'), }}>{item.amount}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', }}>
                                        <Text style={{ color: '#ff9600', fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>To</Text>
                                        <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), }}>{item.end_time}</Text>
                                    </View>
                                </View>
                            </Fragment>
                    }
                </View>
            </View >
        )
    };

    handleTopupMethod = () => {
        this.props.navigation.navigate('CreditCard')
    }

    handleEasypaisaMethod = () => {
        this.props.navigation.navigate('CreditCardEasypaisa')
    }

    // Button Handler Connect with doctor 
    couponCodeHandler = () => {
        const { couponCode, errors } = this.state

        if (couponCode == '') {
            errors.refCode = "Code is Required";
            this.setState({ errors, })
            return false;
        } else {
            errors.refCode = "";
            this.setState({ errors, })
            this.requestCouponCode();
        }
    }

    requestCouponCode = async () => {
        const { couponCode } = this.state

        this.setState({ spinner: true, });
        try {
            let res = await API.post(API_URL.PATIENT_COUPON, {
                user_id: await appHelper.getItem('user_id'),
                code: couponCode

            })
            console.log(res)
            if (res) {
                const data = await res
                if (data.status == "Success") {
                    this.setState({ visible: true, validCoupon: true, couponCode: '', spinner: false });
                } else {
                    this.setState({ visible: true, validCoupon: false, spinner: false });
                }
            }
        } catch (error) {
            console.warn('Internal Server Error TWO', error);
            this.setState({ visible: true, validCoupon: false, spinner: false });
        }
    }

    closeModal = () => {
        this.setState({ visible: false, });
        this.fetchWalletAmount()
    }

    render() {
        const { spinner, data, errors, visible, validCoupon, currentWallet } = this.state;
        // console.log("redner() this.state.heightReferralView", this.state.heightReferralView);
        let couponMsg = validCoupon ? "Your Code is Added Successfully!" : "Your Code is Invalid!";

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Wallet"}
                    context={this.props}
                    onBackButtonPress={() => {
                        const { navigation } = this.props;
                        let route = navigation.getParam('route', null)
                        if (route != null) {
                            this.props.navigation.navigate(route)
                        } else {
                            this.props.navigation.goBack()
                        }
                    }}
                    backButton={true}
                    right={null}
                    noShadow={true}
                />
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                <View style={{ marginTop: hp(1.8), backgroundColor: colors.white }}>
                    <View style={{ marginHorizontal: hp(1.8), }}>
                        <View style={{ height: hp(17), borderRadius: wp(1), backgroundColor: '#18d5fa', justifyContent: 'center', alignItems: 'center', marginVertical: hp(2), }}>
                            <Text style={{ fontSize: FontSize('xxLarge'), color: colors.white, fontFamily: Fonts.HelveticaNeue, }}>{(currentWallet == null) ? 0 : appHelper.currency_formatter(currentWallet.currency, currentWallet.amount)} </Text>
                            <Text style={{ fontSize: FontSize('medium'), color: colors.white, fontFamily: Fonts.HelveticaNeue, marginTop: hp(1), }}>Available Credit</Text>
                        </View>

                    </View>
                </View>
                {/* AVAILABLE CREDIT SECTION */}
                <ScrollView
                    style={{ backgroundColor: colors.white, width: "100%", }}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
                >
                    <View style={{ marginTop: hp(0), backgroundColor: colors.white }}>
                        <View style={{ marginHorizontal: hp(1.8), }}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize("medium"), color: colors.black, marginBottom: hp(1), marginTop: hp(1) }}>Select Top Up Method</Text>

                            {/* Credit Card option */}
                            <View style={[GlobalStyles.shadowElevationThree, { flexDirection: "row", borderRadius: wp(1), backgroundColor: colors.white, alignItems: 'center', marginVertical: hp(1), height: hp(7), paddingLeft: wp(3) }]}>
                                <TouchableOpacity onPress={this.handleTopupMethod} style={{ flexDirection: 'row', alignItems: 'center', height: "100%" }} >
                                    <View style={[{ width: wp(5.5), height: wp(5.5), marginRight: wp(3), }]}>
                                        <Image source={require('../assets/icons/credit-card-blue-icon.png')} style={[GlobalStyles.imgContain, {}]} />
                                    </View>
                                    <Text style={{ width: (wp(100) - hp(3.6) - wp(12.5)), fontSize: FontSize('small'), color: colors.primaryText, fontFamily: Fonts.HelveticaNeue, textTransform: "capitalize", }}>Credit / Debit Card</Text>
                                </TouchableOpacity>
                            </View>

                            {/* ADD COUPON */}
                            <Animated.View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, borderRadius: wp(1), width: "100%", height: this.state.heightReferralView, flexDirection: 'column', marginTop: hp(0.5) }]}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (this.state.showReferralCodeView == true) {

                                            Animated.parallel([
                                                Animated.timing(this.state.viewReferralOpacity, {
                                                    toValue: 0,
                                                    duration: 200,
                                                }).start(() => {

                                                }),
                                                Animated.timing(this.state.heightReferralView, {
                                                    toValue: hp('7%'),
                                                    duration: 200,
                                                }).start(() => {
                                                    this.setState({ showReferralCodeView: false, couponCode: '' })
                                                })
                                            ])
                                        } else {
                                            Animated.parallel([
                                                Animated.timing(this.state.heightReferralView, {
                                                    toValue: (Platform.OS === 'android') ? hp(20) : hp(19),
                                                    duration: 200,
                                                }).start(() => {
                                                    this.setState({ showReferralCodeView: true })
                                                }),
                                                Animated.timing(this.state.viewReferralOpacity, {
                                                    toValue: 1,
                                                    duration: 200,
                                                }).start(() => {

                                                })
                                            ])
                                        }
                                    }}
                                    style={{ flexDirection: 'row', paddingHorizontal: wp(3.5), paddingVertical: hp(7 / 2 / 2), justifyContent: 'center', alignItems: 'center', marginLeft: wp(0), }}
                                >
                                    <Fragment>
                                        <View style={{ width: wp(5.5), height: hp(7 / 2), marginRight: wp(3) }}>
                                            <Image source={require('../assets/icons/add_coupon_icon.png')} style={[GlobalStyles.imgContain, {}]} />
                                        </View>

                                        <View style={{ flexDirection: 'column', marginLeft: wp(0), flex: 1, justifyContent: 'center', }}>
                                            <Text style={{
                                                width: (wp(100) - hp(3.6) - wp(12.5)),
                                                fontSize: FontSize('small'),
                                                lineHeight: FontSize('small'),
                                                color: colors.primaryText,
                                                fontFamily: Fonts.HelveticaNeue,
                                                textTransform: "capitalize",
                                            }}>Prepaid Card</Text>
                                        </View>

                                    </Fragment>
                                </TouchableOpacity>
                                {
                                    this.state.showReferralCodeView == true ?
                                        <Animated.View style={{ flexDirection: 'column', paddingHorizontal: wp(3.5), marginLeft: wp(0), justifyContent: 'center', alignItems: 'flex-start', marginTop: hp(0), opacity: this.state.viewReferralOpacity }}>
                                            <Text style={{ fontFamily: Fonts.HelveticaNeueLight, fontSize: FontSize('small'), color: colors.black, }}>Enter your code here </Text>
                                            <View style={{ flexDirection: 'row', padding: wp(0), justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: hp(0.5), marginBottom: hp(0), height: (Platform.OS === 'android') ? hp(6.8) : hp(6.3) }}>
                                                <FloatingLabel
                                                    labelStyle={[GlobalStyles.labelStyle, {}]}
                                                    inputStyle={[GlobalStyles.inputStyle, (errors && errors.refCode != "") ? GlobalStyles.inputErrorStyle : {}]}
                                                    style={[GlobalStyles.inputWrapper, { width: wp(68), marginTop: hp(1) }]}
                                                    value={this.state.couponCode}
                                                    onChangeText={couponCode => this.setState({ couponCode })}
                                                    // onBlur={this.validatePhone}
                                                    error={(errors && errors.refCode != "") ? true : false}
                                                    keyboardType="number-pad"
                                                    maxLength={30}
                                                    masking={true}
                                                    maskType={'custom'}
                                                    autoFocus={false}
                                                    maskOptions={{
                                                        mask: '999999999999',
                                                        validator: function (value) {
                                                            var re = /^\(?([0-9]{12})\)$/;
                                                            return re.test(value);
                                                        }
                                                    }}
                                                >
                                                    {/* PLACEHOLDER */}
                                                    {(errors && errors.refCode != "") ? errors.refCode : "Enter Code"}
                                                </FloatingLabel>
                                                <View style={{
                                                    marginTop: 0,
                                                    marginLeft: wp('3%'),
                                                    width: wp(14),
                                                    height: '100%',
                                                    marginTop: hp(1),
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: colors.btnBgColor,
                                                    borderRadius: wp(0.5),
                                                }}>
                                                    <TouchableOpacity onPress={() => {
                                                        this.couponCodeHandler()
                                                    }}
                                                        style={{
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        {/* <Image source={require('../assets/icons/icon_connect.png')} resizeMode="center" style={{ width: "90%", height: "90%" }} /> */}
                                                        <Icon name={"arrowright"} type="AntDesign" style={{ fontSize: wp(7), color: colors.white, }} />
                                                    </TouchableOpacity >
                                                </View>
                                            </View>
                                        </Animated.View>
                                        : null
                                }
                            </Animated.View>

                            {/* Easypaisa */}
                            <View style={[GlobalStyles.shadowElevationThree, { flexDirection: "row", borderRadius: wp(1), backgroundColor: colors.white, alignItems: 'center', marginVertical: hp(1), height: hp(7), paddingLeft: wp(3) }]}>
                                <TouchableOpacity onPress={this.handleEasypaisaMethod} style={{ flexDirection: 'row', alignItems: 'center', height: "100%" }} >
                                    <View style={[{ width: wp(5.5), height: wp(5.5), marginRight: wp(3), }]}>
                                        <Image source={require('../assets/icons/easypaisa_icon.png')} style={[GlobalStyles.imgContain, {}]} />
                                    </View>
                                    <Text style={{ width: (wp(100) - hp(3.6) - wp(12.5)), fontSize: FontSize('small'), color: colors.primaryText, fontFamily: Fonts.HelveticaNeue, textTransform: "capitalize", }}>Easypaisa</Text>
                                </TouchableOpacity>
                            </View>

                            {/* PAYMENT HISTORY BLOCK */}
                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize("medium"), color: colors.black, marginHorizontal: hp(0), marginBottom: hp(0), marginTop: hp(2) }}>Payment History</Text>
                        </View>
                    </View>

                    <View style={{ flex: 15, marginTop: hp(1), backgroundColor: colors.white }}>
                        <FlatList
                            renderItem={this._renderItem}
                            data={data}
                            keyExtractor={this._keyExtractor}
                            style={{ backgroundColor: colors.transparent, }}
                            refreshing={this.state.refreshing}
                            ListEmptyComponent={
                                <View style={{ marginTop: wp('5%') }}>
                                    <Text style={{ textAlign: 'center', color: '#999999' }}>No Data Available</Text>
                                </View>
                            }
                        />
                    </View>
                </ScrollView>

                <CouponCodeAddedPopup
                    showPopup={visible}
                    message={couponMsg}
                    onPressYes={this.closeModal}
                    valid={validCoupon}
                />
            </Container>
        );
    }
}

export default WalletScreen;


