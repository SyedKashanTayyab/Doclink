import React, { Component } from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, FlatList, ScrollView, TouchableWithoutFeedback, Alert, RefreshControl } from 'react-native';
import { Icon, Picker } from 'native-base';
import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, Checkbox, TextInput, Button, Modal } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DatePicker from 'react-native-datepicker'
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getDoctorSchedule } from '../api/Manager';
import { AddDoctorSchedule, DeleteDoctorSchedule } from '../api/Doctor';


const days = {
    'Sunday': 'Sunday',
    'Monday': 'Monday',
    'Tuesday': 'Tuesday',
    'Wednesday': 'Wednesday',
    'Thursday': 'Thursday',
    'Friday': 'Friday',
    'Saturday': 'Saturday',
};

class ScheduleScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            spinner: false,
            refreshing: false,
            data: [],
            days: days,
            visibleScheduleModal: false,
            day: '',
            start_time: '',
            end_time: '',
            isEdit: false,
            schedule_id: '',

        }
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* Get Topup History Dashboard */
    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { navigation } = this.props;
        const user_id = await appHelper.getItem("user_id");
        var params = { doctor_id: user_id, access_token: access_token }
        try {
            const res = await getDoctorSchedule(params);
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

    /* Flat List View */
    _keyExtractor = (item, index) => item.id;
    _renderItem = ({ item }) => (
        <View>
            <View style={{
                borderRadius: wp('3%') / 2,
                borderLeftWidth: 1,
                borderColor: '#999999',
                borderRightWidth: 1,
                padding: 20,
                borderBottomWidth: 2,
                marginTop: 10,
                marginBottom: 5
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                    <View>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb', marginBottom: 5 }}>{item.day}</Text>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%') }}>{item.open_time} - {item.close_time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                        <TouchableWithoutFeedback onPress={() => this.editModal(item)}>
                            <Icon name='pencil' onPress={() => this.editModal(item)} type="FontAwesome" style={{ color: '#1994fb', fontSize: wp('5%'), marginRight: 20, padding: 10 }} />
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={() => this.onConfirmDelete(item.id)}>
                            <Icon name='trash' onPress={() => this.onConfirmDelete(item.id)} type="FontAwesome" style={{ color: 'red', fontSize: wp('5%'), padding: 10 }} />
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>
        </View>
    );

    /* Complete Modal popup */
    _showScheduleModal = () => this.setState({ visibleScheduleModal: true });
    _hideScheduleModal = () => {
        this.setState({ visibleScheduleModal: false });
        this.setState({
            day: '',
            start_time: '',
            end_time: '',
            isEdit: false,
            schedule_id: ''

        });
    };

    onValueChange(value) {
        this.setState({
            day: value
        });
    }

    editModal = async (item) => {

        await this.setState({
            visibleScheduleModal: true,
            isEdit: true,
            day: item.day,
            start_time: item.open_time,
            end_time: item.close_time,
            schedule_id: item.id

        });


    }

    _onsubmit = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        const params = {
            day: this.state.day,
            start_time: this.state.start_time,
            end_time: this.state.end_time,
            doctor_id: user_id,
            schedule_id: this.state.schedule_id,
            access_token: access_token,
        }


        //post form api here
        try {
            const res = await AddDoctorSchedule(params);
            if (res) {
                const { data } = await res
                if (data.status == "Success") {
                    Alert.alert('', data.message);
                    this._hideScheduleModal();
                    await this.makeRemoteRequest();
                }
                else {
                    console.warn('', data.message);
                }
            }
        }
        catch (error) {
            console.warn('', data.error);
        }
    }


    onConfirmDelete = async (id) => {

        Alert.alert(
            'Are you want to delete this schedule?',
            '',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Yes', onPress: () => this.handleDelete(id) },
            ],
            { cancelable: false },
        );
    }


    handleDelete = async (id) => {
        const access_token = await appHelper.getItem("access_token");
        const params = {
            id: id,
            access_token: access_token,
        }

        try {
            const res = await DeleteDoctorSchedule(params);
            if (res) {
                const { data } = await res
                if (data.status == "Success") {
                    Alert.alert('', data.message);
                    await this.makeRemoteRequest();
                }
                else {
                    console.warn('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error);
        }
    }

    render() {
        const { visibleScheduleModal, days, isEdit } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.goBack()} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Schedule</Text>
                    </View>
                </ImageBackground>


                {/* List */}
                <View style={{ flex: 5, paddingLeft: 10, paddingRight: 10 }}>
                    <ScrollView refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }>
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
                                        <Text style={{ color: '#000000', fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), padding: 10 }}>No Data Found</Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>


                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#fff' }}>
                    <Button
                        mode="contained"
                        style={{ height: hp('7%'), width: wp('90%'), marginTop: 20, marginBottom: 20, alignSelf: 'center', justifyContent: 'center', zIndex: 0, borderRadius: wp('2%') / 2, }}
                        onPress={this._showScheduleModal} >
                        <Text>Add Schedule</Text>
                    </Button>
                </View>
                {/* Topup Modal */}
                <Modal contentContainerStyle={{ padding: 20 }} visible={visibleScheduleModal} dismissable={true} onDismiss={this._hideScheduleModal}>
                    <View style={{ backgroundColor: '#fff', borderRadius: wp('4%') / 2, padding: 20 }}>
                        <Icon onPress={this._hideScheduleModal} name='times' type="FontAwesome" style={{ fontSize: wp('5%'), padding: 10, color: '#000', position: 'absolute', right: 0 }} />
                        <Text style={{ fontSize: wp('6%'), fontFamily: Fonts.RobotoRegular, color: '#000', paddingBottom: 10, marginBottom: 10, borderBottomColor: '#777', borderBottomWidth: 1, }}>{isEdit ? 'Edit' : 'Add'} Schedule</Text>

                        <KeyboardAwareScrollView>
                            <View style={{ marginTop: 10, marginBottom: 10, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                                <Picker
                                    mode="dropdown"
                                    iosIcon={<Icon name="arrow-down" />}
                                    placeholder="Select Day"
                                    placeholderStyle={{ color: "#bfc6ea" }}
                                    placeholderIconColor="#007aff"
                                    style={{ color: '#000', borderColor: '#000', height: 30 }}
                                    selectedValue={this.state.day}
                                    onValueChange={this.onValueChange.bind(this)}
                                >
                                    <Picker.Item label="Select Day" value="" key="{item}" />
                                    {Object.keys(days).map((item, index) => {
                                        return (<Picker.Item label={item} value={item} key={item} />)
                                    })}

                                </Picker>

                            </View>

                            <View style={{ marginTop: 10, marginBottom: 10, textAlign: 'left' }}>
                                <DatePicker
                                    style={{
                                        borderWidth: 1,
                                        borderRadius: wp('1%') / 2,
                                        borderColor: '#777',
                                        width: "100%",
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        paddingleft: wp('10%'),
                                    }}
                                    date={this.state.start_time}
                                    mode="time"
                                    placeholder="Select Start Time"
                                    format="hh:mm A"
                                    is24Hour={false}
                                    showIcon={false}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {
                                            fontSize: wp('4%'),
                                            color: '#000',
                                            textAlign: 'left',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            paddingleft: wp('5%'),
                                        },
                                        placeholderText: {
                                            fontSize: wp('4%'),
                                            color: '#000',
                                            textAlign: 'left',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            paddingleft: wp('5%'),
                                        }
                                        // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={(start_time) => {
                                        this.setState({ start_time: start_time }
                                        )
                                    }}
                                />
                            </View>


                            <View style={{ marginTop: 10, marginBottom: 10 }}>
                                <DatePicker
                                    style={{
                                        color: '#000',
                                        fontSize: wp('4%'),
                                        borderWidth: 1,
                                        borderRadius: wp('1%') / 2,
                                        borderColor: '#777',
                                        width: "100%",
                                        textAlign: 'left',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        paddingleft: wp('10%'),
                                    }}
                                    date={this.state.end_time}
                                    mode="time"
                                    placeholder="Select End Time"
                                    format="hh:mm A"
                                    is24Hour={false}
                                    showIcon={false}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {
                                            fontSize: wp('4%'),
                                            color: '#000',
                                            textAlign: 'left',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                        },
                                        placeholderText: {
                                            fontSize: wp('4%'),
                                            color: '#000',
                                            textAlign: 'left',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                        }
                                        // ... You can check the source to find the other keys.
                                    }}
                                    onDateChange={(end_time) => { this.setState({ end_time: end_time }) }}
                                />
                            </View>

                            <Button
                                mode="contained"
                                style={{ height: hp('7%'), width: wp('80%'), marginTop: 20, marginBottom: 20, alignSelf: 'center', justifyContent: 'center', zIndex: 0, borderRadius: wp('2%') / 2, }}
                                onPress={() => {
                                    if (this.state.day == '') {
                                        Alert.alert('', "Day Required");
                                        return false;
                                    }
                                    if (this.state.start_time == '') {
                                        Alert.alert('', "Start Time Required");
                                        return false;
                                    }
                                    if (this.state.end_time == '') {
                                        Alert.alert('', "End Time Required");
                                        return false;
                                    }

                                    this._onsubmit();
                                }} >
                                <Text>{isEdit ? 'Update' : 'Add'} Schedule</Text>
                            </Button>



                        </KeyboardAwareScrollView>
                    </View>
                </Modal>

            </View>
        );
    }
}

export default ScheduleScreen;

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
});