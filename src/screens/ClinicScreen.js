import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, ScrollView, RefreshControl, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import { Icon, Picker } from 'native-base';
import { Button, Modal, Searchbar } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import { getClinic } from '../api/Patient';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getSpecializationList } from '../api/Doctor';

class ClinicScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            spinner: false,
            data: [],
            specialization_data: [],
            speciality: '',
        };
    }

    onHandleChange(value) {
        this.setState({
            speciality: value
        });
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.getSpecializationList();
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        this.getSpecializationList();
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* Get Clinic List */
    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        var params = { specialization_id: this.state.speciality, access_token: access_token }
        try {
            const res = await getClinic(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ data: data.data });
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

    _searchBySpecialization = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* Search Clinic By Specializations */
    getSpecializationList = async () => {
        const access_token = await appHelper.getItem("access_token");
        var params = { 
            access_token: access_token 
        }
        try {
            const res = await getSpecializationList(params);
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

    /* Flat List View */
    _keyExtractor = (item, index) => 'clinic-item-'+index.toString();
    _renderItem = ({ item }) => (
        <View>
            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('ClinicProfile', { clinic_id: item.id })}>
                <View style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#999999',
                    padding: 10,
                    marginTop: 10,
                    flexDirection:'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <View style={{ flex: 1, marginLeft:wp('3%') }}>
                        <Image style={{ width: wp('10%'), height: hp('10%'), resizeMode: 'contain' }} source={require('../assets/images/clinic_icon.png')} />
                    </View>
                    <View style={{ flex: 4 }}>
                        <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#3f3f3f' }}>{item.name}</Text>
                        <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('3%'), marginBottom: 5, color:'#6a6a6a' }}>Contact: {item.phone}</Text>
                    </View>

                    <View style={{ justifyContent: 'flex-end', marginRight:wp('5%') }}>
                        <Icon type='FontAwesome' name='angle-right' style={{ color: '#cbcbcb' }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );

    render() {
        const { specialization_data } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.openDrawer()} name='menu' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Clinics</Text>
                    </View>
                </ImageBackground>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                <View style={{marginRight: 20, marginLeft:20}}>
                    <View style={{ marginTop: 20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            placeholderStyle={{ color: "#bfc6ea" }}
                            placeholderIconColor="#007aff"
                            style={{ color: '#000', width: undefined }}
                            selectedValue={this.state.speciality}
                            onValueChange={this.onHandleChange.bind(this)}

                        >
                            <Picker.Item label='Select Specialization' value='' key='' />
                            {specialization_data.map((item, index) => {
                                return (<Picker.Item label={item.name} value={item.id} key={index} />)
                            })}
                        </Picker>
                    </View>
                    <Button
                        mode="contained"
                        style={{ height: hp('7%'), width: wp('80%'), marginTop: 10, marginBottom: 10, alignSelf: 'center', justifyContent: 'center', borderRadius: wp('2%') / 2, }}
                        onPress={() => {
                            this._searchBySpecialization();
                        }}
                    >
                        Search
                    </Button>
                </View>

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
                                    <Text style={{ textAlign: 'center', color: '#999999' }}>No Data Found</Text>
                                </View>
                            }
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default ClinicScreen;

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