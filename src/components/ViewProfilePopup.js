import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import AppButton from './AppButton';
import AppTextInput from './AppTextInput';


class ViewProfilePopup extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
        }


    }


    _closeModal() {
        this.setState({ modalVisible: false, });
    }

    render() {
        const { booking } = this.state;
        const { showPopup, profileData, } = this.props;

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
                            <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: colors.white, paddingVertical: wp(7), paddingHorizontal: wp(5), }]}>
                                <View style={[GlobalStyles.imageContainer, { position: "absolute", width: hp(16), height: hp(16), borderRadius: hp(16) / 2, borderColor: colors.white, top: -hp(9),} ]}>
                                    {<Image source={{uri: profileData ? profileData.avatar : global.BASE_URL_IMAGE + "dummy.png"}} style={[GlobalStyles.imgContain, styles.icon]} />}
                                </View>
                                <TouchableOpacity
                                    style={[GlobalStyles.modalCloseWrap, GlobalStyles.alignCenter, GlobalStyles.shadowElevationSix, { backgroundColor: colors.white, top: 15, zIndex: 99, }]}
                                    onPress={() => this.props.onPressNo()}
                                >
                                    <Text style={[GlobalStyles.modalClose, GlobalStyles.alignCenter, { fontFamily: Fonts.HelveticaNeueBold, right: -2.5, top: -1.5, color: colors.primary }]}>+</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={[GlobalStyles.modalBody, { backgroundColor: colors.white, }]}>
                                <View style={[{ width: '100%', backgroundColor: colors.white,}]}>
                                    <View style={[styles.mesgBodyWrap, { backgroundColor: "transparent", marginHorizontal: wp(5), marginBottom: hp(3), marginTop: hp(2.5), }]}>
                                        <AppTextInput
                                            mode={"icon-label-view"}
                                            label={"Name"}
                                            value={profileData.name}
                                            icon={require('../assets/icons/name_gray_icon.png')}
                                        />
                                        <AppTextInput
                                            mode={"icon-label-view"}
                                            label={"Specialization"}
                                            value={profileData.specialization_name}
                                            icon={require('../assets/icons/specialization_gray_icon.png')}
                                        />
                                        <AppTextInput
                                            mode={"icon-label-view"}
                                            label={"Referral"}
                                            value={profileData.referral_code}
                                            icon={require('../assets/icons/ref_icon.png')}
                                        />
                                    </View>
                                </View>
                                <View style={[{ flexDirection: "row", backgroundColor: colors.transparent, marginHorizontal: wp(5), marginBottom:hp(2.5), }]}>
                                    <AppButton
                                        onPressButton={() => this.props.onPressYes()}
                                        styles={{ marginTop: hp(0), width: "100%", }}
                                        title={"Connect With Doctor"}
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
        marginTop: hp(0),
        marginBottom: hp(0),
        paddingHorizontal: wp(1.8),
        paddingVertical: hp(0),
    },

})


export default ViewProfilePopup;
