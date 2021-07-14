import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard, InputAccessoryView, Button } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import { Icon } from 'native-base';
import DatePicker from 'react-native-date-picker'
import TimePicker from 'react-native-date-picker'
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import API from '../services/API';
import { API_URL } from '../utils/Constant';

const maxChars = 250;

var moment = require('moment');

const inputAccessoryViewID = 'inputAccessoryView1';

class ModalFollowUp extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
            spinner: false,

            data: {},

            id: null,
            title: "",
            titleError: false,

            _strDate: "",
            _objectDate: null,

            _strTime: "",
            _objectTime: null,

            pickerSelection: "date"
        }

    }

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.modalVisible) {

            let _timeObject = moment().utc(true)
            const roundedDown = Math.floor(_timeObject.minute() / 15) * 15;
            _timeObject.set('minutes', roundedDown)

            let object_follow_up_date = null
            if (props.data != null) {
                object_follow_up_date = moment(props.data.follow_up_at).utc(true)
            }

            // console.log(props.data.follow_up_at, moment(props.data.follow_up_at).utc(false).format('YYYY-MM-DD HH:mm:ss'))
            return {
                modalVisible: props.visible,
                data: props.data,
                title: (props.data == null) ? "" : props.data.comment,
                id: (props.data == null) ? null : props.data.id,
                _strDate: (props.data == null) ? moment().utc(true).format('YYYY-MM-DD') : object_follow_up_date.format('YYYY-MM-DD'),
                _strTime: (props.data == null) ? _timeObject.format('hh:mm a') : object_follow_up_date.format('hh:mm a'),
                _objectTime: (props.data == null) ? _timeObject.toDate() : object_follow_up_date.toDate()
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

        const { title } = this.state

        if (title == "") {
            this.setState({
                titleError: true
            })
            return true
        }

        this.setState({
            titleError: false
        })

        return false
    }

    handleSubmit = async () => {

        const { _strDate, _objectTime, title, id } = this.state

        let isError = await this.validate()

        if (isError == false) {
            let time = moment(_objectTime.toJSON()).utc(false).format('HH:mm:ss')
            let date = moment(_strDate + ' ' + time).format('YYYY-MM-DD HH:mm:ss')

            let params = {
                follow_up_at: date,
                comment: title,
                user_id: await appHelper.getItem('user_id')
            }

            if (id != null) {
                params['id'] = id
            }
            console.log(params)
            this.requestAddUpdateFollowUp(params)
        }
    }

    /**
     * Request API
     */
    requestAddUpdateFollowUp = async (params) => {
        this.setState({ spinner: true })
        try {
            const res = await API.post(API_URL.REMINDER_FOLLOWUP, params);
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

    requestDeleteFollowUp = async () => {
        const { id } = this.state
        this.setState({ spinner: true })
        try {
            let params = {
                id: id
            }
            const res = await API.remove(API_URL.REMINDER_FOLLOWUP, params);
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
        const { modalVisible, title, _strDate, _strTime, pickerSelection, _objectTime, _objectDate, titleError, spinner, id, data } = this.state;

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
                                <Text style={{ fontWeight: 'bold', textAlign: 'right', width: '65%', fontSize: FontSize('medium') }}>Follow up</Text>
                                <View style={{ width: '35%', alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => { this._closeModal(false) }} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                        <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View>
                                <View style={{ paddingVertical: wp(1) }}>
                                    <Text style={{ fontSize: FontSize('mini') }}>Title</Text>
                                </View>
                                <View style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: (titleError == true) ? 'red' : '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                    <TextInput onChangeText={(text) => { this.setState({ title: text }) }} style={{ paddingVertical: wp(1.5), height: hp(4), color: colors.black }} value={title} />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                                <View style={{ width: '49%' }}>
                                    <View style={{ paddingVertical: wp(1) }}>
                                        <Text style={{ fontSize: FontSize('mini') }}>Date</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.setState({ pickerSelection: 'date' })} style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                        <TextInput style={{ paddingVertical: wp(1.5), color: colors.black, height: hp(4), }} value={_strDate} editable={false} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '49%' }}>
                                    <View style={{ paddingVertical: wp(1) }}>
                                        <Text style={{ fontSize: FontSize('mini') }}>Time</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.setState({ pickerSelection: 'time' })} style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                        <TextInput style={{ paddingVertical: wp(1.5), color: colors.black, height: hp(4), }} value={_strTime} editable={false} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ paddingVertical: wp(2), alignItems: 'center' }}>
                                {
                                    (pickerSelection == 'date')
                                        ? <DatePicker
                                            androidVariant="nativeAndroid"
                                            date={(_strDate == "") ? new Date() : new Date(_strDate)}
                                            onDateChange={(date) => {
                                                console.log("this._objectDate", _objectDate, _objectTime)

                                                let strTime = appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD') + "T" + moment(_objectTime).utc(true).format('HH:mm:ss')
                                                let _moTime = moment(strTime)

                                                this.setState({
                                                    _objectDate: moment(date.toJSON()).utc(true),
                                                    _strDate: appHelper.timestampFormat(date.toJSON(), true, 'YYYY-MM-DD'),
                                                    _objectTime: _moTime.toDate(),
                                                    strTime: _moTime.format('hh:mm a')
                                                })
                                            }}
                                            mode={'date'}
                                            timeZoneOffsetInMinutes={0}
                                        />
                                        :
                                        // null
                                        <TimePicker
                                            androidVariant="nativeAndroid"
                                            date={(_strTime == "") ? new Date() : _objectTime}
                                            onDateChange={(date) => {
                                                console.log("=== onDateChange ===", date)
                                                let _time = moment(date.toJSON())
                                                this.setState({
                                                    _objectTime: date,
                                                    _strTime: _time.utc(false).format('hh:mm a'),
                                                })
                                            }}
                                            mode={'time'}
                                            timeZoneOffsetInMinutes={0}
                                            minuteInterval={15}
                                        />
                                }

                            </View>
                            <View>
                                <TouchableOpacity
                                    onPress={
                                        () => {
                                            Keyboard.dismiss()
                                            if (pickerSelection == "date") {
                                                setTimeout(() => {
                                                    this.setState({ pickerSelection: "time" })
                                                }, 500);
                                            } else {
                                                this.handleSubmit()
                                            }
                                        }
                                    }
                                    style={styles.btn}
                                >
                                    <Text style={styles.btnText}>{pickerSelection == 'date' ? 'Select' : 'Done'}</Text>
                                </TouchableOpacity>

                                {
                                    (id != null)
                                        ? <TouchableOpacity onPress={() => {
                                            this.requestDeleteFollowUp()
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
            </Fragment>
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
})


export default ModalFollowUp;
