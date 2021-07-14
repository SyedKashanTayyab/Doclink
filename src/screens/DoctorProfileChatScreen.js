import React, { Component, Fragment } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, FlatList, TouchableWithoutFeedback, ScrollView, Alert, RefreshControl } from 'react-native';
import { Icon, Body, Left, Right, Header } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getDoctorProfile } from '../api/Doctor'
import FiveStarRating from '../components/FiveStarRating';


class DoctorProfileChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            specialization: '',
            doctor_id: '',
            doctor: '',
            loading: true,
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

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }


    makeRemoteRequest = async () => {

        const access_token = await appHelper.getItem("access_token");
        const { navigation } = this.props;
        const doctor = navigation.getParam('doctors', 0);
        this.setState({ doctor: doctor });

        var params = { doctor_id: doctor.doctor_id, access_token: access_token }
        try {
            const res = await getDoctorProfile(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ loading: false, doctor: data.data });
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

    /* Flat List View */
    _keyExtractor = (item, index) => item.id;
    _renderItem = ({ item }) => (
        <View>
            <View style={{
                borderRadius: wp('3%') / 2,
                borderLeftWidth: 4,
                borderBottomColor: '#999999',
                borderRightWidth: 1,
                borderRightColor: '#999999',
                padding: 10,
                borderLeftColor: '#18b9fa',
                borderBottomWidth: 2,
                marginTop: 5,
                flex: 1,
                padding: 10,
                marginBottom: 5,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                    <View>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb', marginBottom: 5 }}>{item.day}</Text>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%') }}>{item.open_time} - {item.close_time}</Text>
                    </View>
                    <View style={{ marginLeft: wp('4%') }}>
                        <Icon name='clock-o' type="FontAwesome" style={{ color: '#f2f2f2', fontSize: wp('10%') }} />
                    </View>
                </View>
            </View>
        </View>
    );



    render() {
        const { doctor } = this.state;
        const package_price = (doctor.packages != undefined) ? doctor.packages[0].price : ""
        return (
            <View style={{ flex: 1 }}>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={{ flex: 1, flexDirection: 'row', height: hp('30%'), }}>
                        <Left style={{ height: hp('30%'), marginLeft: wp('4%') }}>
                            <Icon onPress={() => this.props.navigation.goBack(null)} name='arrow-back' style={styles.headerIcon} />
                        </Left>
                        <Body style={{ flex: 3 }}>
                            <View>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.profileImage} source={{ uri: doctor.avatar }} />
                                </View>
                            </View>
                            <Text style={{ color: '#fff', fontFamily: Fonts.RobotoLight, fontSize: wp('5%'), marginTop: wp('2%'), textAlign: "center", width: "100%" }} ellipsizeMode="tail" numberOfLines={1}>{doctor.name}</Text>
                            <View style={{ flexdirection: "row", width: "100%", justifyContent: "center", alignItems: 'center', marginTop: wp("1%"), }}>
                                <FiveStarRating
                                    starColor={"#ffffff"}
                                    emptyStarColor={"#ffffff"}
                                    starSize={20}
                                    rating={doctor.ratings}
                                    ratingStyle={{
                                        color: "#ffffff",
                                        marginLeft: wp("0.5%"),
                                    }}
                                />
                            </View>
                        </Body>
                        <Right style={{ flex: 1, height: hp('30%'), marginRight: wp('4%') }}></Right>
                    </View>
                </ImageBackground>
                {/* List */}
                <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10, marginTop: 10 }}>
                    <ScrollView refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }>
                        {
                            (this.state.loading == true) ? null :

                                <Fragment>
                                    <View style={{ flexDirection: 'row', marginTop: 10, }}>
                                        <View style={{ marginRight: 25 }}>
                                            <Icon name='user-md' type="FontAwesome" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                                        </View>
                                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Speciality</Text>
                                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{doctor.specialization_name}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginTop: 10, }}>
                                        <View style={{ marginRight: 25 }}>
                                            <Icon name='wallet' type="FontAwesome5" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                                        </View>
                                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Charges</Text>
                                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>PKR {package_price}</Text>
                                        </View>
                                    </View>

                                    <View style={{ padding: 10, paddingBottom: 5 }}>
                                        <Text style={styles.heading}>Schedule</Text>
                                    </View>
                                    <View>
                                        <FlatList
                                            renderItem={this._renderItem}
                                            data={doctor.schedules}
                                            keyExtractor={this._keyExtractor}
                                            extraData={this.state}
                                            style={{ border: 1 }}
                                            refreshing={this.state.refreshing}
                                            ListEmptyComponent={
                                                (this.state.loading == false) ?
                                                    <View>
                                                        <Text style={{ color: '#000000', fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), padding: 10 }}>No Data Found</Text>
                                                    </View>
                                                    : null
                                            }
                                        />
                                    </View>
                                </Fragment>
                        }
                    </ScrollView>


                </View>
            </View>
        );
    }
}

export default DoctorProfileChatScreen;

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
        color: '#fff',
        marginTop: wp('2%')
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
    heading: {
        color: '#cecece',
        fontSize: wp('5%'),
    },
});