import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList, Alert, TextInput } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { GetPackage, AddDoctorPackages } from '../api/Doctor';
import colors from '../utils/Colors'
import NavigationBar from '../components/NavigationBar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AppButton from '../components/AppButton';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';

class PackageScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            data: [],
            doctor_id: '',
            checked: false,
            selectedActive: [],
            is_active: [],
            rows: [],
            priceData: [],
            packages: [],
            required: false,
        };
        // this.props.navigation.addListener('willFocus', async () => {
        //     this.setState({ spinner: true });
        //     this.makeRemoteRequest();
        //     this.setState({ spinner: false });
        // })
    }

    onCheckBoxPress = (index) => {

        const selectedActive = [...this.state.selectedActive]; //make a copy of array

        if (selectedActive[index]) {
            selectedActive[index] = false;
        } else {
            selectedActive[index] = true;
        }
        this.setState({ selectedActive: selectedActive });

    }

    onValueChange = (index, value) => {
        const priceData = [...this.state.priceData]; //make a copy of array
        priceData[index] = value;
        this.setState({ priceData: priceData });
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

        var params = {
            user_id: user_id,
            access_token: access_token
        }

        try {
            var res = await GetPackage(params);
            const { data } = await res

            console.log(data.data.fetch_doctor_packages)
            console.log(data.data.fetch_packages)
            if (data.status == "Success") {

                this.setState({ data: data.data.fetch_packages })
                const priceData = [...this.state.priceData];
                const selectedActive = [...this.state.selectedActive];
                let packages = this.state.packages;
                if (this.state.data.length > 0) {
                    var fetch_doctor_packages = data.data.fetch_doctor_packages;

                    this.state.data.map((item, i) => {


                        if (fetch_doctor_packages[i] != undefined) {

                            if (fetch_doctor_packages[i].package_id == item.id) {
                                packages[i] = item.id;
                                priceData[i] = fetch_doctor_packages[i].price;
                                selectedActive[i] = fetch_doctor_packages[i].is_active == 1 ? true : false;
                            }
                            else {
                                packages[i] = item.id;
                                priceData[i] = '';
                                selectedActive[i] = false;
                            }
                        }
                        else {
                            packages[i] = item.id;
                            priceData[i] = '';
                            selectedActive[i] = false;
                        }

                    })


                    this.setState({
                        selectedActive: selectedActive,
                        priceData: priceData,
                        packages: packages,

                    });

                }


            }
            else {
                Alert.alert('', 'No Data Found');
            }
        }
        catch (error) {
            console.warn(error)
        }
    };


    /* Flat List View */
    _keyExtractor = (item, index) => index;

    /* Submit Data */
    _onSubmit = async () => {

        var required = 0;
        this.state.priceData.map((item, i) => {
            if (item == '' && this.state.selectedActive[i]) {

                required = 1;

            } else if (parseInt(item) === 0 && this.state.selectedActive[i]) {

                required = 2;

            } else if (isNaN(item)) {
                required = 3;
            }
        });

        if (required == 1) {
            Alert.alert('', 'Price cannot be empty');
            return;
        } else if (required == 2) {
            Alert.alert('', 'Price cannot be zero');
            return;
        } else if (required == 3) {
            Alert.alert('', 'Only numbers allowed in price');
            return;
        }

        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = {
            access_token: access_token,
            user_id: user_id,
            packages_id: this.state.packages,
            prices: this.state.priceData,
            is_active: 1,
        }

        try {
            const res = await AddDoctorPackages(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ spinner: false });

                    setTimeout(() => {
                        Alert.alert('Success!', 'Package price updated');
                    }, 300);
                    await this.makeRemoteRequest();
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

    render() {
        const { spinner, } = this.state;

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                {/* <NavigationBar
                    title={"Package"}
                    context={this.props}
                    // removeBackButton={false}
                    backButton={true}
                    right={null}
                /> */}
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                {/* MAIN CONTENT SECTION */}
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} enableOnAndroid={true} extraScrollHeight={75}>
                    <View style={{
                        flex: 1,
                        marginTop: hp(1.8),
                        // marginHorizontal: hp(1.8),
                        height: hp(85.2),
                        backgroundColor: colors.white,
                    }}>
                        <Text style={styles.headingTitle}>Change price of the package </Text>
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                {(this.state.data.length > 0) ?
                                    <FlatList
                                        data={this.state.data}
                                        keyExtractor={this._keyExtractor}
                                        extraData={this.state}
                                        renderItem={({ item, index }) =>
                                            <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: hp(1.8), }]}>
                                                <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, flexDirection: 'row', width: "100%", justifyContent: 'space-between', alignItems: 'center', paddingVertical: wp(3), paddingHorizontal: wp(3), borderRadius: wp(1), }]}>
                                                    <View>
                                                        <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), }}>{item.name}</Text>
                                                        {/*<Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), }}>Weekly Package</Text>*/}
                                                    </View>
                                                    <View style={{ alignItems: 'flex-end', flexDirection: "row", alignItems: "center", }}>
                                                        <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), textTransform: "uppercase", marginRight: wp(2), }}>PKR</Text>
                                                        {/* <TextInput
                                                        mode='outlined'
                                                        underlineColorAndroid={'rgba(0,0,0,0)'}
                                                        placeholder='PKR'
                                                        value={this.state.priceData[index] ? this.state.priceData[index] : ''}
                                                        onChangeText={price => this.onValueChange(index, price)}
                                                        style={{ width: wp('25%'), height: 50, alignSelf: 'center', padding: 0, margin: 0, justifyContent: 'center' }}
                                                        keyboardType={'number-pad'}
                                                    /> */}
                                                        {/* Contact Number */}
                                                        <View style={[GlobalStyles.borderGray, { width: wp(20), height: hp(7), borderRadius: wp(1), }]}>
                                                            <TextInput
                                                                style={{
                                                                    fontFamily: Fonts.HelveticaNeue,
                                                                    fontSize: FontSize('small'),
                                                                    color: colors.black,
                                                                    backgroundColor: 'transparent',
                                                                    height: hp(7),
                                                                    // paddingLeft: wp(4),
                                                                    textAlign: "center",
                                                                }}
                                                                placeholder={"PKR"}
                                                                placeholderTextColor={"#888888"}
                                                                maxLength={6}
                                                                onChangeText={price => this.onValueChange(index, price)}
                                                                value={this.state.priceData[index] ? this.state.priceData[index] : ''}
                                                                keyboardType={'number-pad'}
                                                                spellCheck={false}
                                                                autoCorrect={false}
                                                            >
                                                            </TextInput>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        }
                                    />
                                    : <View style={{ padding: 20 }}>
                                        <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold, }}>NO PACKAGES FOUND</Text>
                                    </View>
                                }
                            </View>
                        </ScrollView>

                        <AppButton
                            onPressButton={this._onSubmit}
                            styles={{ marginVertical: hp(4), }}
                            title={"Done"}
                        ></AppButton>

                    </View>
                </KeyboardAwareScrollView>
            </Container>
        );
    }
}

export default PackageScreen;

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
    Button: {
        height: hp('6%'),
        width: wp('25%'),
        alignSelf: 'flex-end',
        justifyContent: 'center',
        borderRadius: wp('2%') / 2,
        fontFamily: Fonts.RobotoRegular,
    },
    headingTitle: {
        fontSize: wp('4.5%'),
        fontFamily: Fonts.RobotoLight,
        color: '#000',
        paddingLeft: 15,
        margin: 5,
    },
});