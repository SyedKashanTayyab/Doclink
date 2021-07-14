//
//  ImageViewer.js
//  GhoomCar
//
//  Created by Kashif Khatri on 01/09/2020.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import React, { Component, Fragment } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import PropTypes from 'prop-types';
import Modal from 'react-native-translucent-modal';

import colors from '../utils/Colors'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from "../utils/Fonts";
import { Icon } from "native-base";
import { SafeAreaView } from 'react-navigation'
import GlobalStyles from '../styles/GlobalStyles';

export default class ImageViewer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalVisible: false,
            imageUrl: "",
            title: "",
        }

        this.openModal(this.state.modalVisible);
    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }

    openModal = (param) => {
        // console.log("handleImageViewer => ");
        this.setState({ modalVisible: param });
    }

    handleImageViewer = (params) => {
        // console.log("handleImageViewer => ", params);
        this.setState({
            modalVisible: params.setImageViewerVisibility,
            imageUrl: params.setViewerImage,
            title: params.setViewHeading,
        })
    }

    closeModal(param) {
        this.setState({
            modalVisible: param,
            imageUrl: "",
            title: "",
        });
    }



    render() {
        const { modalVisible, title, imageUrl } = this.state;
        // console.log("ImageViewer render() this.state :)", this.state);
        return (
            <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                <Fragment>

                    {/* Payment Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                    >
                        <View style={[styles.overlay, { width: "auto", }]}>
                            <View style={[styles.ModalWrap, { backgroundColor: colors.black, paddingBottom: wp(0), width: wp(100), height: hp(100), }]}>
                                <View style={[styles.modalBody,]}>
                                    <Icon type="AntDesign" name='closecircle' style={[
                                        styles.modalCloseWrap, styles.alignCenter, styles.shadowElevationSix, {
                                            fontSize: hp('3.5%'), color: colors.white, top: 15, zIndex: 99, backgroundColor: colors.transparent
                                        }]} onPress={() => {
                                            this.closeModal(!modalVisible)
                                        }} />
                                    <View style={[{ width: '100%', }]}>
                                        <Image source={{ uri: imageUrl, }} style={[styles.imgContain,]}></Image>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal >
                </Fragment >
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    // Modal Style
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        alignItems: 'center',
    },
    ModalWrap: {
        alignSelf: 'center',
        backgroundColor: colors.black,
        width: wp(90),
        // marginHorizontal: wp(5),
        // padding: wp(6),
        borderRadius: 0,
    },
    modalCloseWrap: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.gray,
        borderRadius: wp(6 / 2),
        width: wp(8),
        height: wp(8),
    },
    modalClose: {
        color: colors.white,
        fontSize: wp("5%"),
        fontFamily: Fonts.RobotoRegular,
        transform: [{ rotate: '45deg' }]
    },
    modalBody: {
        position: 'relative'
    },
    imgContain: {
        height: "100%",
        width: "100%",
        resizeMode: 'contain',
    },
    // Align Center Class
    alignCenter: {
        justifyContent: 'center', alignItems: 'center',
    },
    // Global Shadow
    shadowElevationThree: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    shadowElevationSix: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    shadowElevationNine: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,

        elevation: 9,
    },

});

ImageViewer.propTypes = {
    title: PropTypes.string,
    onPressButton: PropTypes.func,
};

ImageViewer.defaultProps = {
    title: "",
    onPressButton: () => { },
}
