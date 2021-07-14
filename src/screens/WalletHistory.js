import React, { Component } from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, FlatList, ScrollView, Alert, RefreshControl, Keyboard, Animated } from 'react-native';
import { Button, Modal, Searchbar } from 'react-native-paper';
import { Icon, Picker } from 'native-base';
import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { topupHistory, GetWalletAmount, SearchPatient, AddWallet } from '../api/Manager';

class WalletHistoryScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            visibleTopup: false,
            visibleComplete: false,
            topupsearch: false,
            data: [],
            patientData: [],
            walletAmount: [],
            selected: '',
            name: '',
            phone: '',
            mobile: '',
            firstQuery: '',
            amount: '',
        };

        this.props.navigation.addListener('willFocus', async () => {
            this.setState({ spinner: true });
            await this.makeRemoteRequest();
            await this.getWallet();
            this.setState({ spinner: false });
        })

        this.keyboardHeight = new Animated.Value(0.01);
    }

    componentDidMount() {
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.getWallet();
        this.setState({ spinner: false });
    }

    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
    }

    keyboardWillShow = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: event.endCoordinates.height,
            }),
        ]).start();
    };

    keyboardWillHide = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: 0,
            }),
        ]).start();
    };

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        await this.getWallet();
        this.setState({ spinner: false });
    }

    onValueChange(value) {
        this.setState({
            selected: value
        });
    }

    /* Get Topup History Dashboard */
    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = { user_id: user_id, access_token: access_token, limit: "false" }
        try {
            const res = await topupHistory(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ data: data.data });
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error)
        }
    }

    /* Get Wallet Amount From Database */
    getWallet = async () => {
        const access_token = await appHelper.getItem("access_token");
        var params = { access_token: access_token }
        try {
            const res = await GetWalletAmount(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ walletAmount: data.data, selected: data.data[0].name });
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error)
        }
    }

    /* Search Patient */
    _searchPatient = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        var params = { access_token: access_token, phone: this.state.firstQuery }
        try {
            const res = await SearchPatient(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    if (data.data.length > 0) {
                        await this.setState({ patientData: data.data[0] });
                        this.setState({ topupsearch: true, spinner: false });
                    }
                    else {
                        Alert.alert('', 'No Data Found');
                        this.setState({ phone: '', selected: undefined, firstQuery: '', topupsearch: false, spinner: false });
                    }
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            console.warn(error)
            this.setState({ spinner: false });
        }
    }

    /* Topup Patient */
    _topupPatient = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = {
            access_token: access_token,
            credit: this.state.selected,
            reference_id: user_id,
            patient_id: this.state.patientData.id,
        }
        try {
            const res = await AddWallet(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ spinner: false });
                    this.state.patientData.amount = this.state.selected;
                    this.state.patientData.phone = this.state.firstQuery;
                    this.makeRemoteRequest();
                    this._hideTopupModal();
                    this._showCompleteModal();
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            console.warn(error);
            this.setState({ spinner: false });
        }
    }


    /* Topup Modal Popup */
    _showTopupModal = () => this.setState({ visibleTopup: true });
    _hideTopupModal = () => this.setState({ visibleTopup: false, topupsearch: false, selected: undefined, firstQuery: '' });
    /* Complete Modal popup */
    _showCompleteModal = () => this.setState({ visibleComplete: true });
    _hideCompleteModal = () => this.setState({ visibleComplete: false });

    /* Flat List View */
    _keyExtractor = (item, index) => item.id;
    _renderItem = ({ item }) => (
        <View>
            <View style={{
                borderRadius: wp('3%') / 2,
                borderLeftWidth: 4,
                borderBottomColor: '#999999',
                borderRightWidth: 1,
                borderRightColor: '#999999',
                padding: 10,
                borderLeftColor: '#18b9fa',
                borderBottomWidth: 2,
                marginTop: 10
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                    <View>
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb', width: wp("50%") }}>{item.name}</Text>
                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), marginBottom: 5 }}>MR #{item.mrn}</Text>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#000000' }}>{item.credit} PKR</Text>
                    </View>
                    <View>
                        <Text>{item.created_at}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    render() {
        const { visibleTopup, visibleComplete, firstQuery } = this.state;

        /* Topup Wallet */
        const topupwallet = <View>
            <View style={{ marginBottom: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 20, }}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.profileImage} source={{ uri: this.state.patientData.avatar }} />
                    </View>
                </View>
                <View>
                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb', width: wp("50%") }}>{this.state.patientData.name}</Text>
                    <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), marginBottom: 5 }}>MR #{this.state.patientData.mrn}</Text>
                </View>
            </View>
            <View style={{ marginBottom: 20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down" />}
                    placeholder="Select wallet amount"
                    placeholderStyle={{ color: "#bfc6ea" }}
                    placeholderIconColor="#007aff"
                    style={{ color: '#000', width: undefined }}
                    selectedValue={this.state.selected}
                    onValueChange={this.onValueChange.bind(this)}
                >
                    {this.state.walletAmount.map((item, key) => (
                        <Picker.Item label={item.name} value={item.name} key={key} />
                    )
                    )}
                </Picker>
            </View>
            <Button
                mode="contained"
                style={{ height: hp('6%'), width: wp('80%'), alignSelf: 'center', justifyContent: 'center', backgroundColor: '#ff9600' }}
                onPress={() => {
                    Alert.alert(
                        '',
                        'Confirm Transfer?',
                        [
                            { text: 'Cancel', onPress: () => { return null } },
                            {
                                text: 'Confirm', onPress: () => {
                                    if (this.state.firstQuery.length > 0) {
                                        this._topupPatient();
                                    }
                                    else {
                                        this.setState({ topupsearch: false });
                                        Alert.alert('', "Phone Number Required");
                                    }
                                }
                            },
                        ],
                        { cancelable: false }
                    )
                }}
            >
                Submit
            </Button>
        </View>

        return (
            <View style={{ flex: 1 }}>

                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.goBack()} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Wallet</Text>
                    </View>
                </ImageBackground>

                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* List */}
                <View style={{ flex: 5, paddingLeft: 10, paddingRight: 10, backgroundColor: '#fff' }}>
                    <ScrollView refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }>
                        <View style={{ marginTop: 15, marginBottom: 15 }}>
                            <Text style={{ color: '#000', fontSize: wp('4%'), fontFamily: Fonts.RobotoRegular }}>Topup History</Text>
                        </View>
                        <View>
                            <FlatList
                                renderItem={this._renderItem}
                                data={this.state.data}
                                keyExtractor={this._keyExtractor}
                                extraData={this.state}
                                style={{ border: 1 }}
                                refreshing={this.state.refreshing}
                                ListEmptyComponent={
                                    <View>
                                        <Text style={{ textAlign: 'center', color: '#999999' }}>No Data Found</Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>
                </View>

                {/* Footer Buttons */}
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
                    <Button mode="contained"
                        style={{ height: hp('6%'), width: wp('50%'), alignSelf: 'center', justifyContent: 'center', backgroundColor: '#ff9600' }}
                        onPress={this._showTopupModal}
                    >Top Up</Button>
                </View>

                {/* Topup Modal */}
                <Modal contentContainerStyle={{ padding: 20 }} visible={visibleTopup} dismissable={false} onDismiss={this._hideTopupModal}>
                    <Animated.View style={{ backgroundColor: '#fff', borderRadius: wp('4%') / 2, padding: 20, marginBottom: this.keyboardHeight }}>

                        <Icon onPress={this._hideTopupModal} name='times' type="FontAwesome" style={{ fontSize: wp('5%'), padding: 10, color: '#000', position: 'absolute', right: 0 }} />
                        <Text style={{ fontSize: wp('6%'), fontFamily: Fonts.RobotoRegular, color: '#000' }}>Top Up</Text>
                        <Text style={{ fontSize: wp('3%'), fontFamily: Fonts.RobotoRegular, color: '#666' }}>Please fill the fields for top up.</Text>

                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <Searchbar
                                placeholder="Phone Number"
                                onChangeText={query => { this.setState({ firstQuery: query }); }}
                                value={firstQuery}
                                keyboardType="phone-pad"
                                onSubmitEditing={() => {
                                    //Search Patient Profile
                                    if (this.state.firstQuery == 0) {
                                        Alert.alert('', "Phone Number Required");
                                        this.setState({ topupsearch: false })
                                        return false;
                                    }
                                    if (this.state.firstQuery.length < 11) {
                                        Alert.alert('', "Invalid Phone Number");
                                        return false;
                                    }
                                    this._searchPatient();
                                }}
                                style={{ borderWidth: 1 }}
                            />
                        </View>

                        <Button mode="contained"
                            style={{ height: hp('6%'), width: wp('80%'), alignSelf: 'center', justifyContent: 'center', marginBottom: wp('5%') }}
                            onPress={() => {
                                //Search Patient Profile
                                if (this.state.firstQuery == 0) {
                                    Alert.alert('', "Phone Number Required");
                                    this.setState({ topupsearch: false })
                                    return false;
                                }
                                this._searchPatient();
                            }} > Search </Button>

                        {this.state.topupsearch ? topupwallet : null}

                    </Animated.View>
                </Modal>

                {/* Complete Modal */}
                <Modal contentContainerStyle={{ padding: 20 }} visible={visibleComplete} dismissable={false} onDismiss={this._hideCompleteModal}>
                    <View style={{ backgroundColor: '#fff', borderRadius: wp('4%') / 2, padding: 20 }}>
                        <Icon onPress={this._hideCompleteModal} name='times' type="FontAwesome" style={{ fontSize: wp('5%'), padding: 10, color: '#000', position: 'absolute', right: 0 }} />
                        <Text style={{ fontSize: wp('6%'), fontFamily: Fonts.RobotoRegular, color: '#000' }}>Toped Up</Text>

                        <KeyboardAwareScrollView>
                            <View>
                                <View style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 20, }}>
                                        <View style={styles.imageContainer}>
                                            <Image style={styles.profileImage} source={{ uri: this.state.patientData.avatar }} />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb' }}>{this.state.patientData.name}</Text>
                                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), marginBottom: 5 }}>MR #{this.state.patientData.mrn}</Text>
                                    </View>
                                </View>
                                <Text style={{ fontSize: wp('4%'), fontFamily: Fonts.RobotoLight }}>You have just toped up Wallet Amount of <Text style={{ color: '#1994fb', fontWeight: '600' }}>{this.state.patientData.amount} PKR</Text> on <Text style={{ color: '#1994fb', fontWeight: '600' }}>{this.state.patientData.phone}</Text> </Text>

                                <View style={{ marginTop: 30 }}>
                                    <Button mode="contained"
                                        style={{ height: hp('6%'), width: wp('80%'), alignSelf: 'center', justifyContent: 'center' }}
                                        onPress={this._hideCompleteModal} > Close </Button>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                </Modal>
            </View>
        );
    }
}

export default WalletHistoryScreen;

const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#fff'
    },
    /* Header Styles */
    headerBackground: {

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
    buttonIcons: {
        flex: 1,
        resizeMode: 'contain',
        width: wp('3%'),
        height: hp('3%')
    },
    logoImage: {
        width: wp('100%'),
        height: hp('18%'),
        resizeMode: 'contain',
        marginBottom: 10
    },
    headerFont: {
        fontFamily: Fonts.RobotoMedium,
        color: '#fff',
        fontSize: hp('3%')
    },
    imageContainer: {
        alignItems: 'center',
        width: wp('15%'),
        height: wp('15%'),
        backgroundColor: '#000',
        borderRadius: wp('15%') / 2,
        overflow: 'hidden',
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});