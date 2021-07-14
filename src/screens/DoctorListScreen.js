import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, ScrollView, TouchableWithoutFeedback, Alert, RefreshControl, Image } from 'react-native';
import { Icon, ListItem } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getDoctorList } from '../api/Manager';
import SingleRatingStar from '../components/SingleRatingStar';

class DoctorListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            data: [],
        };
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* Get Topup History Dashboard */
    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = { user_id: user_id, access_token: access_token }
        try {
            const res = await getDoctorList(params);
            if (res) {
                const { data } = await res;

                if (data.status == 'Success') {
                    this.setState({ data: data.data });
                }
                else if (data.status == 'Error') {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn(error);
        }
    }

    /* Flat List View */
    _keyExtractor = (item, index) => item.id;
    
    // Doctors List View
    _renderItem = ({ item }) => (
        <View>
            <View style={{
                borderBottomColor: '#999999',
                borderBottomWidth: 1,
                marginTop: 10
            }}>
                <View style={{ flexDirection: 'row'}}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('DoctorProfile', {doctor_id: item.id})}>
                        <View style={{ flex:1, flexDirection: 'row', margin:wp('3%'), }}>
                            <View style={{marginRight:wp('4%'),}}>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.profileImage} source={{ uri: item.avatar }} />
                                </View>
                            </View>
                            <View style={{ flex:1, flexDirection:'row', justifyContent: 'space-between', alignItems: 'center',}}>
                                <View style={{ width: "100%", }}>
                                    <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#000000' }}>Dr. {item.name}</Text>
                                    <View style={[  { flexDirection: "row", width:"100%", alignItems: "flex-start",justifyContent: "flex-start", }]}>
                                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), marginBottom: 5, color: '#666666', maxWidth: wp('80%') }}>({item.specializations})</Text>
                                        <SingleRatingStar
                                            // size={}
                                            starColor={"#ff9600"}
                                            starSize={wp('4%')}
                                            rating={item.ratings}
                                            ratingStyle={{
                                                color: "#ff9600",
                                                marginLeft: wp("0.5%")
                                            }}
                                        />
                                        {/* <AppButton
                                            title={"Previous"}
                                            color={colors.black}
                                            width={100}
                                            height={20}
                                           
                                        /> */}
                                    </View>
                                    <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('3%'), color: item.open_time ? '#666666' : '#ff0000' }}>{item.open_time ? 'Availablity (' + item.open_time + ' - ' + item.close_time + ')' : '(Not Available)'} </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </View>
    );

    render() {
        return (
            <View style={{ flex: 1 }}>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.navigate('Home')} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Doctors</Text>
                    </View>
                </ImageBackground>
                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    <View>
                        <FlatList
                            renderItem={this._renderItem}
                            data={this.state.data}
                            keyExtractor={this._keyExtractor}
                            extraData={this.state}
                            style={{ border: 1 }}
                            refreshing={this.state.refreshing}
                            ListEmptyComponent={
                                <View>
                                    <Text style={{ color: '#000000', fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), padding: 10 }}>No Data Found</Text>
                                </View>
                            }
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default DoctorListScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {
         
        height: hp('12%'),
        justifyContent: 'center',
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
        width: wp('15%'),
        height: wp('15%'),
        backgroundColor: '#000',
        borderRadius: wp('15%') / 2,
        overflow: 'hidden',
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});