import React, { Component } from 'react';
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { FlatList, SafeAreaView } from 'react-navigation'
import { Container, Item } from 'native-base';
var moment = require('moment');

import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import { API_URL } from '../utils/Constant';
import API from '../services/API';
import colors from '../utils/Colors';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { wp } from '../utils/Utility';

class MyPrescriptionScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            MyPrescriptionData: []
        };
    }

    componentDidMount = () => {
        this.requestMyPrescription()
    }

    _onRefresh = () => {
        this.requestMyPrescription()
    }

    requestMyPrescription = async () => {
        try {
            const res = await API.get(API_URL.PATIENT_PRESCRIPTIONS);
            this.setState({ MyPrescriptionData: res.data, spinner: false });
        } catch (error) {
            console.log(error);
        }
    }

    itemSeparator = () => (<View style={styles.mainRowBottomBorder} />)

    render() {
        const { spinner, MyPrescriptionData } = this.state;
        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar title={"My Prescriptions"}
                        context={this.props}
                        backButton={true}
                        right={null} noShadow={true}
                        onBackButtonPress={() => {
                            const { navigation } = this.props;
                            let route = navigation.getParam('route', null)
                            if (route != null) {
                                this.props.navigation.navigate(route)
                            } else {
                                this.props.navigation.goBack()
                            }
                        }}
                        transparent={Platform.OS === 'ios' ? true : false}
                    />

                    {/* Spinner */}
                    <CustomSpinner visible={spinner} />

                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={MyPrescriptionData}
                            keyExtractor={(item, index) => index.toString()}
                            ItemSeparatorComponent={this.itemSeparator}
                            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
                            renderItem={({ item, index }) => (
                                <View style={{ paddingVertical: wp(2), paddingHorizontal: wp(5), flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ width: wp(75) }}>
                                        <Text style={{ fontSize: FontSize('small'), fontWeight: 'bold' }}>{item.doctor_name}</Text>
                                        <Text style={{ fontSize: FontSize('xMini'), fontWeight: 'bold' }}>Chief Complaint:</Text>
                                        <Text style={{ fontSize: FontSize('xMini') }}>{item.chief_complaint == "" ? "Audio" : item.chief_complaint}</Text>
                                        <Text style={{ fontSize: FontSize('xMini') }}>{moment(item.created_at).format('DD MMM YYYY hh:mm A')}</Text>
                                    </View>
                                    <View style={{ justifyContent: 'center', width: wp(18) }}>
                                        <TouchableOpacity onPress={() => {
                                            this.props.navigation.navigate('PrescriptionView', { "chatroom_session_id": item.chatroom_session_id })
                                        }} style={styles.viewButton}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>View</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View>
                                    <Text style={{ textAlign: 'center', color: '#999999' }}>No prescription found</Text>
                                </View>
                            }
                        />
                    </View>
                </SafeAreaView>
            </Container>
        );
    }
}

export default MyPrescriptionScreen;

const styles = StyleSheet.create({
    mainRowBottomBorder: {
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    viewButton: {
        width: wp(15), height: wp(8),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        paddingVertical: wp(2),
        backgroundColor: '#1896fc',
        alignSelf: 'center'
    },
})