import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, Alert, RefreshControl } from 'react-native';
import { Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getDoctorProfile } from '../api/Manager';


class DoctorSectionProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            data: [],
            specialization: '',
            doctor_id: '',
        };

        this.props.navigation.addListener('willFocus', async () => {
            this.setState({ spinner: true });
            await this.makeRemoteRequest();
            this.setState({ spinner: false });
        })
    }

    async componentDidMount() {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }


    makeRemoteRequest = async () => {

        const access_token = await appHelper.getItem("access_token");
        const doctor_id = await appHelper.getItem("user_id");
        this.setState({ doctor_id: doctor_id });

        var params = { doctor_id: doctor_id, access_token: access_token }

        try {
            const res = await getDoctorProfile(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    console.warn(data.data)
                    this.setState({ data: data.data });

                    global.user_data.specialization_id = data.data.specialization_id
                    global.user_data.specialization_name = data.data.specialization_name
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error)
        }
    }


    render() {
        const { data } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: wp('4%') }}>
                        <View style={{ marginLeft: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.goBack(null)} name='arrow-back' style={styles.headerIcon} />
                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <View>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.profileImage} source={{ uri: data.avatar }} />
                                </View>
                            </View>
                            <Text style={{ marginTop: wp('5%'), color: '#fff', fontFamily: Fonts.RobotoLight, fontSize: wp('5%') }}>{data.name}</Text>
                        </View>
                        <View style={{ marginRight: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.navigate('EditDoctorProfile')} name='edit' type="MaterialIcons" style={styles.headerIcon} />
                        </View>

                    </View>
                </ImageBackground>
                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    <View style={{ padding: 20 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ marginRight: 20 }}>
                                <Icon name='email' type="MaterialIcons" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                            </View>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                                <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Email</Text>
                                <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.email}</Text>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 10, }}>
                            <View style={{ marginRight: 20 }}>
                                <Icon name='phone' type="MaterialIcons" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                            </View>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                                <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Phone</Text>
                                <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.phone}</Text>
                            </View>
                        </View>

                        {/* <View style={{ flexDirection: 'row', marginTop: 10, }}>
                            <View style={{ marginRight: 20 }}>
                                <Icon name='venus-mars' type="FontAwesome" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                            </View>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                                <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Gender</Text>
                                <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.gender}</Text>
                            </View>
                        </View> */}

                        <View style={{ flexDirection: 'row', marginTop: 10, }}>
                            <View style={{ marginRight: 25 }}>
                                <Icon name='user-md' type="FontAwesome" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                            </View>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                                <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Speciality</Text>
                                <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.specialization_name}</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1, alignItems: 'center', marginTop: 30, }}>
                            <Text onPress={() => this.props.navigation.navigate('Schedule', { doctor_id: this.state.doctor_id })} style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#ff9600' }}>View Schedule</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default DoctorSectionProfileScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {
        backgroundColor: '#456123',
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
        width: wp('25%'),
        height: wp('25%'),
        backgroundColor: '#000',
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