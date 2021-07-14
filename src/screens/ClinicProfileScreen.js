import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Icon, ListItem } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import { getClinicDetail, getClinicSpecialization, getClinicTiming } from '../api/Patient';
import appHelper, { CustomSpinner } from '../utils/AppHelper';

class ClinicProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            data: [],
            specialization_data: [],
            timing_data: [],
        };
    }

    async componentDidMount() {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    _onRefresh = async () => {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    makeRemoteRequest = async () => {
        await this.getClinicDetails();
        await this.getClinicSpecializations();
        await this.getClinicTimings();
    }
    
    /* Get Clinic Details */
    getClinicDetails = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { navigation } = this.props;
        const clinic_id = navigation.getParam('clinic_id', 0);
        var params = { clinic_id: clinic_id, access_token: access_token }
        try {
            const res = await getClinicDetail(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ data: data.data[0] });
                }
                else if (data.status == 'Error') {
                    console.warn('Internal Server Error', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    /* Get Clinic Specializations */
    getClinicSpecializations = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { navigation } = this.props;
        const clinic_id = navigation.getParam('clinic_id', 0);
        var params = { clinic_id: clinic_id, access_token: access_token }
        try {
            const res = await getClinicSpecialization(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ specialization_data: data.data });
                }
                else if (data.status == 'Error') {
                    console.warn('Internal Server Error', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    /* Get Clinic Timings */
    getClinicTimings = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { navigation } = this.props;
        const clinic_id = navigation.getParam('clinic_id', 0);
        var params = { clinic_id: clinic_id, access_token: access_token }
        try {
            const res = await getClinicTiming(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ timing_data: data.data });
                }
                else if (data.status == 'Error') {
                    console.warn('Internal Server Error', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    render() {
        if (Object.keys(this.state.specialization_data).length != 0) {
            var specialization = this.state.specialization_data.map((data) => {
                return <View key={data.name}>
                    <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}>{data.name}</Text>
                </View>
            });
        }
        else {
            var specialization = <View>
                <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}>N/A</Text>
            </View>
        }
        

        if (Object.keys(this.state.timing_data).length != 0) {
            var timing = this.state.timing_data.map((data) => {
                return <View key={data.id} style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                    <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}>{data.day}</Text>
                    <View style={{ flexDirection: 'row', marginRight: wp('5%'), }}>
                        <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}>{data.open_time}</Text>
                        <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}> - </Text>
                        <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}>{data.close_time}</Text>
                    </View>
                </View>
            });
        }
        else{
            var timing = <View>
                <Text style={{ fontSize: wp('4%'), color: '#000', fontFamily: Fonts.RobotoLight }}>N/A</Text>
            </View>
        }
        
        
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.goBack()} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>{this.state.data.name}</Text>
                    </View>
                </ImageBackground>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />
                

                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                    />
                }>
                    <View style={styles.container}>
                        <View style={{marginLeft:wp('5%')}}>
                            <Icon onPress={() => this.props.navigation.goBack()} name='phone' type='FontAwesome' style={styles.iconColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={{ fontSize: wp('4.5%'), color: '#aaaaaa', }}>Phone</Text>
                            <Text>{this.state.data.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.container}>
                        <View style={{ marginLeft: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.goBack()} name='location-arrow' type='FontAwesome' style={styles.iconColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={{ fontSize: wp('4.5%'), color: '#aaaaaa', }}>Address</Text>
                            <Text>{this.state.data.address}</Text>
                        </View>
                    </View>

                    <View style={styles.container}>
                        <View style={{ marginLeft: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.goBack()} name='user-md' type='FontAwesome' style={styles.iconColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={{ fontSize: wp('4.5%'), color: '#aaaaaa', }}>Specialities</Text>
                            {specialization}
                        </View>
                    </View>

                    <View style={styles.container}>
                        <View style={{ marginLeft: wp('5%') }}>
                            <Icon onPress={() => this.props.navigation.goBack()} name='clock-o' type='FontAwesome' style={styles.iconColor} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={{ fontSize: wp('4.5%'), color: '#aaaaaa', }}>Business Hours</Text>
                            {timing}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default ClinicProfileScreen;

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
    container: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 10 
    },
    iconColor: { 
        color: '#c8c8c8', 
        fontSize: wp('7%') 
    },
    textContainer: { 
        flex: 1, 
        marginLeft: wp('5%'), 
        borderBottomWidth: 1, 
        borderBottomColor: '#eaeaea', 
        paddingBottom: 10 
    }
});