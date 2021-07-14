import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import { Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors';

class PatientProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp('4%') }}>
                        <View style={{ marginLeft: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.navigate('Home')} name='arrow-back' style={styles.headerIcon} />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: "80%" }}>
                            <View>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.profileImage} source={{ uri: global.user_data.avatar }} />
                                </View>
                            </View>
                            <Text style={{ width: "100%", textAlign: 'center', marginTop: wp('5%'), color: '#fff', fontFamily: Fonts.RobotoLight, fontSize: wp('5%') }}>{global.user_data.name}</Text>
                            <Text style={{ color: '#fff', fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), marginBottom: wp('5%'), }}>MR #{global.user_data.mrn}</Text>
                        </View>
                        <View style={{ marginRight: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.navigate('EditPatientProfile')} name='edit' type="MaterialIcons" style={styles.headerIcon} />
                        </View>
                    </View>
                </ImageBackground>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='email' type="MaterialIcons" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Email</Text>
                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{global.user_data.email}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20, }}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='phone' type="MaterialIcons" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Phone</Text>
                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{global.user_data.phone}</Text>
                        </View>
                    </View>

                    {/* <View style={{ flexDirection: 'row', marginTop: 20, }}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='venus-mars' type="FontAwesome" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Gender</Text>
                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{global.user_data.gender}</Text>
                        </View>
                    </View> */}
                </View>
            </View>
        );
    }
}

export default PatientProfileScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {

        height: hp('30%'),

    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: hp('3%')
    },
    headerIcon: {
        color: '#fff'
    },
    headerTitle: {
        fontSize: wp('5%'),
        fontFamily: Fonts.RobotoRegular,
        color: '#fff',
        marginLeft: hp('3%')
    },
    imageContainer: {
        alignItems: 'center',
        width: wp('30%'),
        height: wp('30%'),
        borderRadius: wp('30%') / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff'
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});