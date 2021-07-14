import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import AppButton from './AppButton';



class PermissionPopup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
        }


        // console.log("constructor() ================");
        // console.log("this.props.showPopup", this.props.showPopup);

        // this._setModalVisible()

    }

    // _setModalVisible(visible) {
    //     // console.log("_setModalVisible() ================");
    //     // console.log("this.props.showPopup", this.props.showPopup);
    
    //     this.setState({
    //         modalVisible: this.props.showPopup,
    //     });
    // }

    _closeModal() {
        this.setState({ modalVisible: false, });
    }

    render() {
        const { booking } = this.state;
        const { showPopup, popupTitle } = this.props;


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
                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>
                            {popupTitle &&
                                <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.primaryText, paddingVertical: wp(4), paddingHorizontal: wp(5), }]}>
                                    <Text style={[GlobalStyles.modalHead,]}> {popupTitle} </Text>
                                </View>
                            }
                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, }]}>
                                <View style={[{ width: '100%', backgroundColor: colors.transparent, }]}>
                                    <View style={[ styles.mesgBodyWrap, popupTitle ? styles.reduceVerticleSpace : null, {}]}>
                                        <Text style={[styles.paraTxt, {  }]}>{this.props.message}</Text>
                                    </View>
                                </View>
                                <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, }]}>
                                    <AppButton
                                        onPressButton={() => this.props.onPressYes()}
                                        styles={{ marginTop: hp(0), width: wp(45), borderBottomLeftRadius: wp(1.5), borderRadius: 0, }}
                                        title={"Yes"}
                                    ></AppButton>
                                    <AppButton
                                        onPressButton={() => this.props.onPressNo()}
                                        styles={{ marginTop: hp(0), width: wp(45), borderBottomRightRadius: wp(1.5), borderRadius: 0, backgroundColor:"#d1eafe", }}
                                        title={"No"}
                                        textColor={colors.primaryText}
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
    mesgBodyWrap: {
        flexDirection: "row",
        marginTop: hp(0),
        marginBottom: hp(0),
        paddingHorizontal: wp(5),
        paddingVertical: hp(7),
    },
    reduceVerticleSpace: {
        paddingVertical: hp(5),
    }

})


export default PermissionPopup;
