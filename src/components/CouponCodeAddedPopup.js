import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image, } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import AppButton from './AppButton';



class CouponCodeAddedPopup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
        }


        // console.log("constructor() ================");
        // console.log("this.props.showPopup", this.props.showPopup);

        // this._setModalVisible()

    }

    _setModalVisible(visible) {
        // console.log("_setModalVisible() ================");
        // console.log("this.props.showPopup", this.props.showPopup);

        this.setState({
            modalVisible: this.props.showPopup,
        });
    }

    _closeModal() {
        this.setState({ modalVisible: false, });
    }

    render() {
        const { booking } = this.state;
        const { showPopup, valid } = this.props;


        return (
            <Fragment>
                {/* Example Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showPopup}
                    onRequestClose={() => {
                        this._closeModal();
                        // this.props.onClosePopup(false)
                    }}>

                    <View style={GlobalStyles.overlay}>
                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), }]}>
                            <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.btnBgColor, paddingVertical: wp(4), paddingHorizontal: wp(5), }]}>
                                <Text style={[GlobalStyles.modalHead,]}>
                                    {
                                        (valid == true)
                                            ? "Prepaid Card Added"
                                            : "Prepaid Card Error"
                                    }

                                </Text>
                            </View>
                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, paddingHorizontal: wp(5), paddingVertical: hp(2), }]}>
                                <View style={[{ alignItems: "center" }]}>
                                    <View style={[{ width: wp(18), height: wp(18), marginTop: hp(1), }]}>
                                        {valid ?
                                            <Image source={require('../assets/icons/thumbs-up-icon.png')} style={[GlobalStyles.imgContain, {}]} />
                                            :
                                            <Image source={require('../assets/icons/invalid_icon.png')} style={[GlobalStyles.imgContain, {}]} />
                                        }
                                    </View>
                                    <View style={[{ flexDirection: "row", width: '70%', marginTop: hp(0), marginBottom: hp(4), marginTop: hp(2), }]}>
                                        <Text style={[styles.paraTxt, { fontSize: FontSize("medium"), lineHeight: FontSize("xLarge"), }]}>{this.props.message}</Text>
                                    </View>
                                </View>
                                <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, }]}>
                                    <AppButton
                                        onPressButton={() => this.props.onPressYes()}
                                        styles={{ marginTop: hp(0), width: "100%", borderBottomLeftRadius: wp(1.5), borderBottomRightRadius: wp(1.5), borderRadius: 0, }}
                                        title={valid ? "Done" : "Try Again"}
                                    ></AppButton>
                                </View>
                            </View>
                        </View>
                    </View>

                </Modal>
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    headingTxt: {
        color: colors.primary,
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: FontSize('large'),
        flex: 1,
    },
    paraTxt: {
        fontFamily: Fonts.HelveticaNeue,
        color: colors.black,
        fontSize: FontSize('small'),
        flex: 1,
        textAlign: "center",
        // backgroundColor:"#f1f1f1",
    },

})


export default CouponCodeAddedPopup;
