import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard, InputAccessoryView, Button, Image } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';

class PrivacyModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
        }
    }

    static getDerivedStateFromProps(props, state) {

        if (props.visible !== state.modalVisible) {
            return {
                modalVisible: props.visible,
            }
        }
        return null
    }

    render() {
        const { modalVisible } = this.state;

        if (modalVisible == false) {
            return (
                null
            )
        }
        return (
            <Fragment>
                <Modal animationType="fade" transparent={true} visible={modalVisible}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View>
                                <Text style={styles.heading1}>Stories Privacy</Text>
                            </View>
                            <View style={{ flexDirection: 'row', paddingBottom: wp(2), paddingTop: wp(4) }}>
                                <Image style={styles.IconStyle} source={require('../assets/icons/private_status.png')} />
                                <View style={{ paddingLeft: wp(3), paddingRight: wp(10) }}>
                                    <Text style={styles.heading2}>My Patients</Text>
                                    <Text style={styles.simpleText}>Share your story only with the connected patients</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', paddingBottom: wp(4), paddingTop: wp(2) }}>
                                <Image style={styles.IconStyle} source={require('../assets/icons/public_status.png')} />
                                <View style={{ paddingLeft: wp(3), paddingRight: wp(10) }}>
                                    <Text style={styles.heading2}>Set as Public</Text>
                                    <Text style={styles.simpleText}>Share your story with all the patients registered on DocLink</Text>
                                </View>
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => this.props.onClosePress(false)} style={styles.btn}>
                                    <Text style={styles.btnText}>Dismiss</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Fragment>
        );
    }
}

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
        padding: wp(4),
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
    IconStyle: { resizeMode: 'contain', width: wp(6), height: wp(6) },
    heading1: { fontWeight: 'bold', textAlign: 'center', fontSize: FontSize('medium') },
    heading2: { fontWeight: 'bold', textAlign: 'left', fontSize: FontSize('small') },
    simpleText: { textAlign: 'left', fontSize: FontSize('xMini') }
})


export default PrivacyModal;
