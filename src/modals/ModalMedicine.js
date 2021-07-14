import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard, InputAccessoryView, Button } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import { Icon } from 'native-base';
import DatePicker from 'react-native-date-picker'
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import API from '../services/API';
import { API_URL } from '../utils/Constant';

const maxChars = 250;

var moment = require('moment');

const inputAccessoryViewID = 'inputAccessoryView1';

class ModalMedicine extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
            spinner: false,

            data: {},

            id: null,
            medication_detail_id: null,

            title: "",
            titleError: false,

            days: "0",
            daysError: false,

            frequencyError: false,
            morning: false,
            afternoon: false,
            evening: false,

            _strDate: "",
            _objectDate: null,
        }

    }

    static getDerivedStateFromProps(props, state) {

        if (props.visible !== state.modalVisible) {

            let object_date = null
            if (props.data != null) {
                object_date = moment(props.data.created_at).utc(true)
            }

            // console.log(props.data.follow_up_at, moment(props.data.follow_up_at).utc(false).format('YYYY-MM-DD HH:mm:ss'))
            return {
                modalVisible: props.visible,
                _objectDate: (props.data == null) ? moment().utc(true) : moment(props.data.created_at).utc(true),
                data: props.data,
                title: (props.data == null) ? "" : props.data.medicine_name,
                days: (props.data == null) ? "0" : `${props.data.days}`,
                morning: (props.data == null) ? "" : props.data.morning,
                afternoon: (props.data == null) ? "" : props.data.afternoon,
                evening: (props.data == null) ? "" : props.data.evening,
                id: (props.data == null) ? null : props.data.id,
                medication_detail_id: (props.data == null) ? null : props.data.medication_detail_id,
                _strDate: (props.data == null) ? moment().utc(true).format('YYYY-MM-DD') : object_date.format('YYYY-MM-DD'),
            }
        }
        return null
    }

    componentDidMount = () => {
        // console.log("=====================");
        // console.log("componentDidMount = () => \n this.props.visible", this.props.visible);
        // console.log(moment().utcOffset());
        // console.log("=====================");

        // this.setState({
        //     modalVisible: this.props.visible,
        //     description: this.props.description
        // })
    }

    reset = () => {
        this.setState({ title: "", _strDate: "", _strTime: "", _objectDate: null, _objectTime: null, pickerSelection: 'date' });
    }

    _closeModal(show, refresh = false) {
        this.reset()
        this.props.onClosePress(show, refresh);
    }

    validate = async () => {

        const { title, days, morning, afternoon, evening } = this.state

        if (title == "") {
            this.setState({
                titleError: true
            })
            return false
        } else if (days == "0") {
            this.setState({
                titleError: false,
                daysError: true
            })
            return false
        } else if (morning == false && afternoon == false && evening == false) {
            this.setState({
                titleError: false,
                daysError: false,
                frequencyError: true
            })
            return false
        } else {
            this.setState({
                titleError: false,
                daysError: false,
                frequencyError: false
            })

            return true
        }
    }

    handleSubmit = async () => {

        try {
            const { _objectDate, _strDate, title, id, days, morning, afternoon, evening, medication_detail_id } = this.state

            let isValidated = await this.validate()
            console.log(isValidated)
            if (isValidated == true) {
                let date = _objectDate.format('YYYY-MM-DD HH:mm:ss')

                let params = {
                    created_at: date,
                    medicine_name: title,
                    days: days,
                    morning: morning == true ? "true" : "false",
                    afternoon: afternoon == true ? "true" : "false",
                    evening: evening == true ? "true" : "false",
                    user_id: await appHelper.getItem('user_id')
                }

                if (medication_detail_id != null) {
                    params['medication_detail_id'] = medication_detail_id
                }
                console.log(params)
                this.requestAddUpdateMedicine(params)
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Request API
     */
    requestAddUpdateMedicine = async (params) => {
        this.setState({ spinner: true })
        try {
            const res = await API.post(API_URL.REMINDER_MEDICINE, params);
            console.log(res)
            if (res.status == 'Success') {
                this.setState({ spinner: false }, () => {
                    this._closeModal(false, true)
                })
            } else {
                this.setState({ spinner: false })
            }
        } catch (error) {
            console.log(error);
        }
    }

    requestDeleteMedicine = async () => {
        const { id } = this.state
        this.setState({ spinner: true })
        try {
            let params = {
                id: id
            }
            const res = await API.remove(API_URL.REMINDER_MEDICINE, params);
            console.log(res)
            if (res.status == 'Success') {
                this.setState({ spinner: false }, () => {
                    this._closeModal(false, true)
                })
            } else {
                this.setState({ spinner: false })
            }
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        const { modalVisible, title, _strDate, _objectDate, titleError, days, daysError, frequencyError, morning, afternoon, evening, spinner, id } = this.state;

        if (modalVisible == false) {
            return (
                null
            )
        }
        return (
            <Fragment>
                {/* Example Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        this._closeModal(false);
                    }}>

                    <View style={styles.centeredView}>
                        {/* Spinner */}
                        <CustomSpinner visible={spinner} />

                        <View style={styles.modalView}>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'right', width: '65%', fontSize: FontSize('medium') }}>Medicine</Text>
                                <View style={{ width: '35%', alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => { this._closeModal(false) }} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                        <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <View style={{ paddingVertical: wp(1) }}>
                                    <Text style={{ fontSize: FontSize('mini') }}>Name</Text>
                                </View>
                                <View style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: (titleError == true) ? 'red' : '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                    <TextInput onChangeText={(text) => { this.setState({ title: text }) }} style={{ paddingVertical: wp(1.5), height: hp(4), color: colors.black }} value={title} />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: hp(0.5) }}>
                                <View style={{ width: '40%' }}>
                                    <View style={{ paddingVertical: wp(1) }}>
                                        <Text style={{ fontSize: FontSize('mini') }}>Date</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                        <TextInput style={{ paddingVertical: wp(1.5), color: colors.black, height: hp(4), }} value={_strDate} editable={false} />
                                    </View>
                                </View>
                                <View style={{ width: '15%' }}>
                                    <View style={{ paddingVertical: wp(1) }}>
                                        <Text style={{ fontSize: FontSize('mini') }}>Days</Text>
                                    </View>
                                    <View style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: (daysError == true) ? 'red' : '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                        <TextInput onChangeText={(text) => { this.setState({ days: text }) }} style={{ paddingVertical: wp(1.5), height: hp(4), color: colors.black }} maxLength={2} keyboardType={'numeric'} value={days} />
                                    </View>
                                </View>
                                <View style={{ width: '35%' }}>
                                    <View style={{ paddingVertical: wp(1), }}>
                                        <Text style={{ fontSize: FontSize('mini'), color: (frequencyError == true) ? 'red' : 'black' }}>Frequency</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(0.5) }}>
                                        {/* MedicineFrequency.morning == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle */}
                                        <TouchableOpacity onPress={() => { this.setState({ morning: !morning }) }} style={[styles.FrequencyStyle, morning == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginRight: wp(1) }]}>
                                            <Text style={[morning == true ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>M</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { this.setState({ afternoon: !afternoon }) }} style={[styles.FrequencyStyle, afternoon == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginRight: wp(1) }]}>
                                            <Text style={[afternoon == true ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>A</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { this.setState({ evening: !evening }) }} style={[styles.FrequencyStyle, evening == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle]}>
                                            <Text style={[evening == true ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>E</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <DatePicker
                                    androidVariant="nativeAndroid"
                                    date={(_strDate == "") ? new Date() : new Date(_strDate)}
                                    onDateChange={(date) => {
                                        console.log("this._objectDate", _objectDate)
                                        this.setState({
                                            _objectDate: moment(date.toJSON()).utc(true),
                                            _strDate: appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD'),
                                        })
                                    }}
                                    mode={'date'}
                                    timeZoneOffsetInMinutes={0}
                                />
                            </View>
                            <View>
                                <TouchableOpacity
                                    onPress={
                                        () => {
                                            Keyboard.dismiss()
                                            this.handleSubmit()
                                        }
                                    }
                                    style={styles.btn}
                                >
                                    <Text style={styles.btnText}>{'Done'}</Text>
                                </TouchableOpacity>

                                {
                                    (id != null)
                                        ? <TouchableOpacity onPress={() => {
                                            this.requestDeleteMedicine()
                                        }} style={[styles.btn, { backgroundColor: '#FC5D5D' }]}>
                                            <Text style={styles.btnText}>Delete</Text>
                                        </TouchableOpacity>
                                        : null
                                }
                            </View>
                        </View>
                    </View>

                    {
                        (Platform.OS === 'ios') ?
                            <InputAccessoryView nativeID={inputAccessoryViewID}>
                                <View style={{ backgroundColor: colors.grayFour, alignItems: 'flex-end', width: 100, height: 45, justifyContent: 'center' }}>
                                    <Button
                                        color={colors.black}
                                        onPress={() =>
                                            // Hide that keyboard!
                                            Keyboard.dismiss()
                                        }
                                        title="Done"
                                    />
                                </View>
                            </InputAccessoryView>
                            :
                            null
                    }
                </Modal>
            </Fragment >
        );
    }
}

const styles = StyleSheet.create({
    headingTxt: {
        color: colors.primary,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        flex: 1,
    },
    paraTxt: {
        color: colors.black,
        fontFamily: Fonts.latoLight,
        fontSize: FontSize('mini'),
        flex: 1,
    },
    centeredView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 25,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    btn: {
        width: wp(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(13),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
        marginVertical: wp(2)
    },
    btnText: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase'
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
})


export default ModalMedicine;
