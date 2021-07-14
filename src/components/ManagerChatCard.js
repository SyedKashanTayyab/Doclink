import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableHighlight, ImageBackground } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Icon } from 'native-base';
import { Fonts } from '../utils/Fonts';
import Modal from "react-native-modal";
import AppInfo from './src/modules/AppInfoNativeModule';

export default class ManagerChatCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        };
    }

    /* Modal */
    _toggleModal = () =>
        this.setState({ isModalVisible: !this.state.isModalVisible });


    _viewProfile = () => {
        this.setState({ isModalVisible: false });
        if (this.props.payment == "true") {
            this.props.navigation.navigate('PatientProfile', { patients: this.props.item });
        }
        else {
            this.props.navigation.navigate('DoctorProfile', { patients: this.props.item });
        }
    }

    _addPayment = () => {
        this.setState({ isModalVisible: false });
        this.props.navigation.navigate('PaymentAdd', { patients: this.props.item });
    }

    render(props, navigation) {
        if(this.props.payment == "true"){
            var icons = <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', }}>
                    <Icon type="MaterialIcons" name='payment' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._addPayment()} />
                    <Icon type="MaterialIcons" name='info' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewProfile()} />
                </View>
        }
        else{
            var icons = <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', }}>
                    <Icon type="MaterialIcons" name='info' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewProfile()} /> 
                </View>
        }

        return (
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <TouchableHighlight onPress={this._toggleModal} underlayColor='transparent' >
                        <Image style={styles.profileImage} source={{ uri: this.props.item.avatar }} />
                    </TouchableHighlight>
                </View>

                <View style={{ width: wp('60%'), marginLeft: 30 }}>
                    <Text style={{ marginBottom: 0, fontFamily: Fonts.RobotoRegular, fontSize: hp('2.5%') }}>{this.props.item.name}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: Fonts.RobotoLight, fosntSize: hp('1.5%') }}>{this.props.item.last_message}</Text>
                </View>

                <View style={{ width: wp('20%') }}>
                    <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: hp('1.8%') }}> {this.props.item.last_message_time} </Text>
                </View>

                {/* Popup Modal Start */}
                <Modal isVisible={this.state.isModalVisible} animationIn="slideInLeft" onBackdropPress={() => this.setState({ isModalVisible: false })}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{ width: wp('60%'), height: hp('40%') }}>
                            <View style={{ flex: 4, backgroundColor: '#000' }}>
                                <ImageBackground source={{ uri: this.props.item.avatar }}
                                    resizeMode="stretch" style={{ flex: 1 }}>
                                    <View style={{ backgroundColor: '#00000060', height: hp('4%'), justifyContent: 'center' }}>
                                        <Text style={{ color: '#fff', marginLeft: 20 }}>{this.props.item.name}</Text>
                                    </View>
                                </ImageBackground>
                            </View>
                            {icons}
                        </View>
                    </View>
                </Modal>
                {/* Popup Modal End */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: wp('25%'),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#33333310',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
        resizeMode: 'cover',
    },
    imageContainer: {
        width: wp('15%'),
        height: wp('15%'),
        backgroundColor: '#000',
        borderRadius: wp('15%') / 2,
        overflow: 'hidden',
        marginLeft: 30,
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});