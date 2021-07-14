import React, { Component } from 'react';
import { View, Text, ImageBackground, Image, StyleSheet, FlatList, ScrollView, TouchableWithoutFeedback, Alert, RefreshControl } from 'react-native';
import { Icon , Picker} from 'native-base';
import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, Checkbox, TextInput,  Button, Modal } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DatePicker from 'react-native-datepicker'
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getDoctorSchedule } from '../api/Manager';


class DoctorScheduleScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            spinner: false,
            refreshing: false,
            data: [],

        }
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
        const { navigation } = this.props;
        const doctor_id = navigation.getParam('doctor_id', 0);
        var params = { doctor_id: doctor_id, access_token: access_token }
        try {
            const res = await getDoctorSchedule(params);
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
                padding:10,
                marginBottom: 5, 
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding:10}}>
                    <View>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#1994fb', marginBottom: 5 }}>{item.day}</Text>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%') }}>{item.open_time} - {item.close_time}</Text>
                    </View>
                    <View style={{marginLeft:wp('4%')}}>
                        <Icon name='clock-o' type="FontAwesome" style={{ color: '#f2f2f2', fontSize: wp('10%') }} />
                    </View>
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
                        <Icon onPress={() => this.props.navigation.goBack()} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Schedule</Text>
                    </View>
                </ImageBackground>


                {/* List */}
                <View style={{ flex: 1, paddingLeft: 10, paddingRight: 10,marginTop:10 }}>
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
                                        <Text style={{ color: '#000000', fontFamily: Fonts.RobotoRegular, fontSize:wp('4%'), padding:10 }}>No Data Found</Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>

                   
                </View>
                
            </View>
        );
    }
}

export default DoctorScheduleScreen;

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
});