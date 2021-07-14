import { Icon } from 'native-base';
import React, { Component } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import Modal from 'react-native-translucent-modal';
import DatePicker from 'react-native-date-picker'
var moment = require('moment');

import FontSize from '../utils/FontSize';
import { hp, wp } from '../utils/Utility';

class ModalDatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            selectedDate: moment()
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.modalVisible) {
            return {
                modalVisible: props.visible,
            }
        }
        return null
    }

    _closeModal(show) {
        this.props.onClosePress(show);
    }

    dateDone = () => {
        this.props.selected(this.state.selectedDate);
        this._closeModal(false);
    }



    render() {
        const { modalVisible, selectedDate } = this.state;
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => this._closeModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection: 'row', paddingHorizontal: wp(5) }}>
                            <Text style={{ fontWeight: 'bold', textAlign: 'right', width: '65%', fontSize: FontSize('small') }}>Select Date</Text>
                            <View style={{ width: '35%', alignItems: 'flex-end' }}>
                                <TouchableOpacity onPress={() => { this._closeModal(false) }} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                    <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <DatePicker
                                androidVariant="nativeAndroid"
                                date={new Date(selectedDate)}
                                onDateChange={(date) => this.setState({ selectedDate: date })}
                                mode={'date'}
                            />
                        </View>
                        <View>
                            <TouchableOpacity onPress={this.dateDone} style={styles.btn}>
                                <Text style={styles.btnText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >
        );
    }
}

export default ModalDatePicker;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modalView: {
        margin: wp(5),
        backgroundColor: "white",
        borderRadius: 10,
        paddingVertical: wp(4),
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