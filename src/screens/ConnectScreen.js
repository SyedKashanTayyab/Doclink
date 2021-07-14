import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, RefreshControl, Alert, Keyboard } from 'react-native';
import { Icon, CheckBox } from 'native-base';
import { Button, Searchbar } from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { SearchPatient, getDoctorConnected, ConnectPatient } from '../api/Manager';
import Loader from '../components/Loader'

class ConnectScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            data: [],
            patientData: [],
            doctorData: [],
            search: false,
            checked: false,
            firstQuery: '',
            selectedDoctorId: [],
            doctors: [],
        };
    }

    onDoctorCheckBoxPress(id) {
        let tmp = this.state.selectedDoctorId;

        if (tmp.includes(id)) {
            tmp.splice(tmp.indexOf(id), 1);
        } else {
            tmp.push(id);
        }

        this.setState({
            selectedDoctorId: tmp,
            data: {
                patient_id: this.state.patientData.id,
                doctors: this.state.selectedDoctorId,
            }
        });
    }

    componentDidMount() {
        // this.setState({ spinner: true });
        // this.makeRemoteRequest();
        // this.setState({ spinner: false });
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        if (this.state.patientData.length > 0) {
            await this.makeRemoteRequest();
        }
        this.setState({ spinner: false });
    }

    /* Get Topup History Dashboard */
    makeRemoteRequest = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = { access_token: access_token, user_id: user_id, patient_id: this.state.patientData.id }
        try {
            const res = await getDoctorConnected(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ doctorData: data.data });
                    this.setState({ spinner: false });
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

    /* Search Patient */
    _searchPatient = async () => {
        
        // Dismiss keyboard
        Keyboard.dismiss()

        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        var params = { access_token: access_token, phone: this.state.firstQuery }
        try {
            const res = await SearchPatient(params);
            if (res) {

                const { data } = await res;
                this.setState({ spinner: false });
                if (data.status == 'Success') {
                    if (data.data.length > 0) {
                        await this.setState({ patientData: data.data[0] });
                        await this.makeRemoteRequest();
                        this.setState({ search: true });
                    }
                    else {
                        this.setState({ phone: '', selected: undefined, firstQuery: '', search: false, spinner: false })
                        setTimeout(() => {
                            Alert.alert('', 'There is no patient associated with this phone number');
                        }, 150);
                    }
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error);
            this.setState({ spinner: false });
        }
    }

    /* Submit Data */
    _onSubmit = async () => {

        // Dismiss keyboard
        Keyboard.dismiss()

        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        var params = { access_token: access_token, patient_id: this.state.data.patient_id, doctors: this.state.data.doctors }
        try {
            const res = await ConnectPatient(params);
            if (res) {
                const { data } = await res;
                this.setState({ spinner: false });
                if (data.status == 'Success') {

                    //Open Popup
                    Alert.alert('Connected Successfully', 'Patient Successfully Connected');
                    this.setState({ search: false, data: [], selectedDoctorId: [], firstQuery: '' })
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);

                }
            }
        }
        catch (error) {
            console.warn(error);
            this.setState({ spinner: false });
        }
    }

    /* Flat List View */
    _keyExtractor = (item, index) => index;

    render() {
        const { firstQuery, doctorData, checked } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => [Keyboard.dismiss(), this.props.navigation.openDrawer()]} name='menu' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Connect Patient With Doctors</Text>
                    </View>
                </ImageBackground>

                <View style={{ flex: 1, marginTop: hp('2%') }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Searchbar
                            placeholder="Enter Phone Number"
                            onChangeText={query => { this.setState({ firstQuery: query }); }}
                            value={firstQuery}
                            keyboardType="phone-pad"
                            clear={() => {
                                this.setState({ search: false, data: [], selectedDoctorId: [] })
                            }}
                            onSubmitEditing={() => {
                                //Search Patient Profile
                                if (this.state.firstQuery == 0) {
                                    Alert.alert('', "Phone Number Required");
                                    this.setState({ search: false, data: [], selectedDoctorId: [] })
                                    return false;
                                }
                                if (this.state.firstQuery.length > 11) {
                                    Alert.alert('', "Invalid Phone Number");
                                    return false;
                                }
                                this._searchPatient();
                            }}
                            style={{ borderWidth: 1, borderColor: '#aaaaaa', width: wp('90%'), marginBottom: 10 }}
                            render={props =>
                                <TextInputMask
                                    {...props}
                                    type={'custom'}
                                    options={{
                                        mask: '99999999999'
                                    }}
                                />
                            }
                        />

                        <Button mode="contained"
                            style={{ height: hp('6%'), width: wp('80%'), alignSelf: 'center', justifyContent: 'center', marginBottom: wp('5%') }}
                            onPress={() => {
                                //Search Patient Profile
                                if (this.state.firstQuery == 0) {
                                    Alert.alert('', "Phone Number Required");
                                    this.setState({ search: false, data: [], selectedDoctorId: [] })
                                    return false;
                                }
                                if (this.state.firstQuery.length < 11) {
                                    Alert.alert('', "Invalid Phone Number");
                                    return false;
                                }

                                this._searchPatient();
                            }} > Search Patient </Button>
                    </View>

                    {
                        this.state.search ?
                            <View style={{ backgroundColor: '#1994fb', padding: wp('5%') }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 20, }}>
                                        <View style={styles.imageContainer}>
                                            <Image style={styles.profileImage} source={{ uri: this.state.patientData.avatar }} />
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('5%'), color: '#fff' }}>{this.state.patientData.name}</Text>
                                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#fff' }}>MR #{this.state.patientData.mrn}</Text>
                                    </View>
                                </View>
                            </View>
                            : <View></View>
                    }

                    {
                        this.state.search ?
                            <View style={{ flex: 1 }}>

                                <ScrollView refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this._onRefresh}
                                    />
                                }>
                                    <FlatList
                                        data={this.state.doctorData}
                                        keyExtractor={this._keyExtractor}
                                        extraData={this.state}
                                        style={{ border: 1 }}
                                        refreshing={this.state.refreshing}
                                        ListEmptyComponent={
                                            <View>
                                                <Text style={{ textAlign: 'center', color: '#999999' }}>No Data Found</Text>
                                            </View>
                                        }
                                        renderItem={({ item, index }) =>
                                            <View style={{ padding: 10 }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    padding: wp('3%'),
                                                    borderWidth: 1,
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                    borderRadius: wp('4%') / 2,
                                                    borderColor: '#aaaaaa40'
                                                }}>
                                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 20, }}>
                                                        <View style={styles.imageContainer}>
                                                            <Image style={styles.profileImage} source={{ uri: item.avatar }} />
                                                        </View>
                                                    </View>
                                                    <View>
                                                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>Dr. {item.name}</Text>
                                                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('3.5%'), color: '#000000', width: wp('40%') }}>({item.specializations})</Text>
                                                    </View>
                                                    {
                                                        (item.is_active == 1) ? <View style={{ flex: 1, alignItems: 'flex-end', padding: 20 }}>
                                                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), color: '#1994fb' }}>Connected</Text>
                                                        </View> : <TouchableWithoutFeedback onPress={() => this.onDoctorCheckBoxPress(item.id)}>
                                                                <View style={{ flex: 1, alignItems: 'flex-end', padding: 20 }}>
                                                                    <CheckBox
                                                                        center
                                                                        onPress={() => this.onDoctorCheckBoxPress(item.id)}
                                                                        color='#1994fb'
                                                                        checked={this.state.selectedDoctorId.includes(item.id) ? true : false} />
                                                                </View>
                                                            </TouchableWithoutFeedback>
                                                    }

                                                </View>
                                            </View>
                                        }
                                    />
                                </ScrollView>
                                <Button mode="contained"
                                    style={{ height: hp('6%'), width: wp('80%'), alignSelf: 'center', justifyContent: 'center', marginBottom: wp('5%') }}
                                    onPress={() => {
                                        //Search Patient Profile
                                        if (this.state.firstQuery == 0) {
                                            Alert.alert('', "Phone Number Required");
                                            this.setState({ search: false, data: [], selectedDoctorId: [] })
                                            return false;
                                        }
                                        if (this.state.firstQuery.length > 11) {
                                            Alert.alert('', "Invalid Phone Number");
                                            return false;
                                        }
                                        if (this.state.selectedDoctorId.length == 0) {
                                            Alert.alert('', "Select Any Doctor");
                                            return false;
                                        }
                                        this._onSubmit();
                                    }} > Submit </Button>
                            </View>

                            : <View></View>
                    }
                </View>
                {/* Spinner */}
                <Loader animating={this.state.spinner} />
            </View>
        );
    }
}

export default ConnectScreen;

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