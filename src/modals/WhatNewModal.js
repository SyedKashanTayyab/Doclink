import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Keyboard, InputAccessoryView, Button, Image } from 'react-native';
import Modal from 'react-native-translucent-modal';
import { Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Unorderedlist from 'react-native-unordered-list';

import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';

const inputAccessoryViewID = 'inputAccessoryView1';

class WhatNewModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,

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


    reset = () => {
        this.setState({ header: "", header: "" });
    }

    _closeModal(show) {
        this.reset()
        this.props.onClosePress(show);
    }

    render() {
        const settingsJson = require('../res/settings.json');
        const { modalVisible } = this.state;

        const arrayReleaseNotes = global.target == 'doctor' ? settingsJson.doctor : settingsJson.patient
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => this.setState({ modalVisible: false })}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
                            <TouchableOpacity onPress={() => { this._closeModal(false) }} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginVertical: hp(1.5), padding: wp(2) }}>
                            <View style={{ alignItems: 'center', }}>
                                <Image style={{ width: wp(30), height: hp(15) }} resizeMode="contain" source={require('../assets/icons/announcement.png')} />
                                <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xLarge'), fontWeight: 'bold', paddingTop: hp(1) }}>What's New</Text>
                            </View>
                            <View style={{ height: hp(4) }} />
                            <View style={{ paddingTop: (3), }}>
                                {
                                    arrayReleaseNotes.release_notes.map((item, index) => (
                                        <Unorderedlist key={index} bulletUnicode={0x2022}>
                                            <Text style={{ color: '#000', fontFamily: Fonts.HelveticaNeueMedium, fontWeight: 'bold', fontSize: FontSize('small') }}>{item}</Text>
                                        </Unorderedlist>
                                    ))
                                }
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => { this._closeModal(false) }} style={styles.btn}>
                            <Text style={styles.btnText}>Dismiss</Text>
                        </TouchableOpacity>
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
        );
    }
}

export default WhatNewModal;

const styles = StyleSheet.create({
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