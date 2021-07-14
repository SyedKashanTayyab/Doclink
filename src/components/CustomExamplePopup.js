import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableHighlight, } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';



class CustomExamplePopup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
        }

    }

    _setModalVisible(visible) {
        this.setState({
            modalVisible: visible,
        });
    }

    _closeModal() {
        this.setState({ modalVisible: false, });
    }

    render() {
        const { booking } = this.state;

        return (
            <Fragment>
                {/* Example Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this._closeModal();
                        // this.props.onClosePopup(false)
                    }}>

                    <View style={GlobalStyles.overlay} >
                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), }]}>
                            <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.black, paddingVertical: wp(4), paddingHorizontal: wp(5), }]}>
                                <Text style={[GlobalStyles.modalHead,]}> Enter Head Text</Text>
                                {/* <TouchableOpacity
                                    style={[GlobalStyles.modalCloseWrap, GlobalStyles.alignCenter, GlobalStyles.shadowElevationSix, { backgroundColor: colors.white, position: "relative", top: -5, right: -10, zIndex: 99, }]}
                                    onPress={() => {
                                        this._closeModal();
                                    }}
                                >
                                    <Text style={[GlobalStyles.modalClose, GlobalStyles.alignCenter, { fontFamily: Fonts.HelveticaNeueBold, right: -1, color: colors.black }]}>+</Text>
                                </TouchableOpacity> */}
                            </View>
                            <View style={[GlobalStyles.modalBody, { backgroundColor:"blue", }]}>
                                <View style={[{ width: '100%', marginTop: hp(2), paddingBottom: hp(3), }]}>

                                    {/* Find The Car - Section */}
                                    <View style={[{ flexDirection: "row", marginTop: hp(0), marginBottom: hp(0), paddingHorizontal: wp(5), }]}>
                                        <Text style={[styles.headingTxt, {}]}>Find the car</Text>
                                    </View>
                                    <View style={[{ flexDirection: "row", marginTop: hp(0), marginBottom: hp(1), paddingHorizontal: wp(5), }]}>
                                        <Text style={[styles.paraTxt, {}]}>Use this information to locate your car.</Text>
                                    </View>

                                   
                                </View>
                            </View>
                        </View>
                    </View>

                </Modal>
                <TouchableHighlight
                    onPress={() => {
                        this._setModalVisible(true);
                    }}>
                    <Text>Show Modal</Text>
                </TouchableHighlight>
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

})


export default CustomExamplePopup;