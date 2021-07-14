import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, ScrollView, RefreshControl, FlatList, Alert, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { Icon } from 'native-base';
import { Button, Modal, TextInput, Searchbar } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { GetPackage, CheckWallet, AddSubscription } from '../api/Patient';

class ChatPackageScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            data: [],
            patient_id:'',
            doctor_id:'',
            selected_package_amount: '',
        };
    }

    async componentDidMount() {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        const { navigation } = this.props;
        const doctor_id = navigation.getParam('doctor_id', 0);
        var params = {
            doctor_id: doctor_id,
            access_token: access_token
        }
        try {
            var res = await GetPackage(params);
            const { data } = await res
            if (data.status == "Success") {
                this.setState({ data: data.data, patient_id: user_id, doctor_id: doctor_id })
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    };

    _buyButtonClicked = async (amount, package_id, duration) => {
        Alert.alert(
            '',
            'Are you sure want to buy this package?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => this._checkWallet(amount, package_id, duration) },
            ],
            { cancelable: false },
        );
    }

    _checkWallet = async (package_amount, package_id, duration) => {
        const access_token = await appHelper.getItem("access_token");
        var params = {
            user_id: this.state.patient_id,
            access_token: access_token
        }
        try {
            var res = await CheckWallet(params);
            const { data } = await res
            if (data.status == "Success") {
                console.log(data.data);
                var wallet_amount = await data.data[0].current_wallet_amount;
                if (parseInt(wallet_amount) >= parseInt(package_amount) ){
                    this._addSubscription(package_amount, package_id, duration);
                }
                else{
                    Alert.alert('', 'You have insufficient amount to purchase this package');
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    _addSubscription = async (package_amount, package_id, duration) => {
        const access_token = await appHelper.getItem("access_token");
        var params = {
            patient_id: this.state.patient_id,
            doctor_id: this.state.doctor_id,
            package_id: package_id,
            package_amount: package_amount,
            duration: duration,
            access_token: access_token
        }
        try {
            var res = await AddSubscription(params);
            const { data } = await res
            if (data.status == "Success") {
                Alert.alert('', 'You have purchased the package successfully.');
                this.props.navigation.goBack();
                let { onGoBack } = this.props.navigation.state.params;
                if(onGoBack) {
                    onGoBack();
                }
                return;
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    

    render() {
        if (this.state.data.length > 0) {
            var packagelist = <FlatList
                data={this.state.data}
                renderItem={({ item }) => (
                    <View style={{ margin: wp('5%'), paddingBottom: wp('5%'), borderBottomWidth: 1, borderBottomColor: '#eeeeee' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), }}>{item.name}</Text>
                                <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), }}>Weekly Package</Text>
                            </View>
                            <View>
                                <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb' }}>{item.price}</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: wp('5%') }}>
                            <Text style={{ marginBottom: wp('3%'), fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), }}>{item.description}</Text>
                            <Button mode="contained"
                                style={styles.Button}
                                onPress={() => this._buyButtonClicked(item.package_price, item.id, item.duration)}
                            >Buy</Button>
                        </View>
                    </View>
                )}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={this.renderSeparator}
                //ListHeaderComponent={this.renderHeader}
                refreshing={this.state.refresh}
            />
        }
        else {
            var packagelist = <View style={{ padding: 20 }}>
                <Text style={{ fontSize: wp('3%'), fontFamily: Fonts.RobotoBold, }}>NO PACKAGES FOUND</Text>
            </View>
        }

        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.goBack()} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Packages</Text>
                    </View>
                </ImageBackground>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                <View style={{ flex:1 }}>
                    <ScrollView refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }>
                        
                    {packagelist}
                        
                    </ScrollView>
                </View>
            </View>
        );
    }
}

export default ChatPackageScreen;

const styles = StyleSheet.create({
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
    Button: {
        height: hp('6%'),
        width: wp('25%'),
        alignSelf: 'flex-end',
        justifyContent: 'center',
        borderRadius: wp('2%') / 2,
        fontFamily: Fonts.RobotoRegular,
    }
});