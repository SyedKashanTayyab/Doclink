import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard, InputAccessoryView, Button, Image } from 'react-native';
import Modal from 'react-native-translucent-modal';
import { Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';

const inputAccessoryViewID = 'inputAccessoryView1';

class AnnouncementModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            header: "",
            message: ""
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.modalVisible) {

            return {
                modalVisible: props.visible,
                header: props.header,
                message: props.message
            }
        }
        return null
    }


    reset = () => {
        this.setState({ header: "", header: "" });
    }

    _closeModal(show, refresh = false) {
        this.reset()
        this.props.onClosePress(show, refresh);
    }

    render() {
        const { modalVisible } = this.state;
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => this.setState({ modalVisible: false })}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: FontSize('medium'), fontFamily: Fonts.HelveticaNeue, }}>Preview</Text>
                            <TouchableOpacity onPress={() => { this._closeModal(false) }} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                            </TouchableOpacity>
                        </View>


                        <View style={{ borderRadius: 10, marginVertical: hp(1.5), padding: wp(2), backgroundColor: '#d6edff', alignSelf: 'flex-end', }}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: 14 }}>{'Dear ' + this.state.header}</Text>
                            <TextInput style={{ color: '#000', padding: 0, margin: 0 }} multiline value={this.state.message} editable={false} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: hp(0.5), justifyContent: 'flex-end' }}>
                                <Text style={{ fontSize: 12, color: '#7e7e7e' }}>2:00 PM </Text>
                                <Image style={{ width: wp(5), height: hp(2.5) }} resizeMode="contain" source={require('../assets/icons/double-check.png')} />
                            </View>
                        </View>

                        <TouchableOpacity onPress={this.props.onPress} style={styles.btn}>
                            <Text style={styles.btnText}>Send</Text>
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

export default AnnouncementModal;

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