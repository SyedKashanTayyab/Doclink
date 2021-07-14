import { Container, Icon } from 'native-base';
import React, { Component } from 'react';
import { View, Text, Platform, TouchableOpacity, Image, StyleSheet, Modal, RefreshControl } from 'react-native';
import { FlatList, SafeAreaView, ScrollView } from 'react-navigation';
var moment = require('moment');
import ImageViewer from 'react-native-image-zoom-viewer';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import { API_URL } from '../utils/Constant';
import API from '../services/API';
import colors from '../utils/Colors';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { hp, wp } from '../utils/Utility';

class MedicalRecordScreen extends Component {
    constructor(props) {
        super(props);
        this.openImageViewer = this.openImageViewer.bind(this);
        this.state = {
            spinner: false,
            refreshing: false,

            all_counts: 0,

            prescriptionData: [],
            labTestData: [],
            vaccinationData: [],

            showImageViewer: false,
            imageUrls: [],

            index: 0,
            routes: [
                { key: 'first', title: 'Prescriptions' },
                { key: 'second', title: 'Lab Reports' },
                { key: 'third', title: 'Vaccinations' }
            ],
        };
    }

    componentDidMount = async () => {
        await this.getList('prescriptionData', 'prescription');
    }

    selectedType = (label) => {
        this.setState({ selectedType: label })
    }

    selectedDate = (date) => {
        this.setState({ selectedDate: date })
    }

    changeTab = async (i) => {
        this.setState({ spinner: true });
        setTimeout(async () => {
            if (i == 0)
                await this.getList('prescriptionData', 'prescription');
            else if (i == 1)
                await this.getList('labTestData', 'lab_report');
            else if (i == 2)
                await this.getList('vaccinationData', 'vaccination_report');
        }, 500);
        this.setState({ index: i })
    };

    renderTabBar = props => (
        <TabBar
            {...props}
            indicatorContainerStyle={{ margin: 4 }}
            // pressColor={'transparent'}
            indicatorStyle={{ backgroundColor: '#1896FC', height: '100%', width: wp(30), borderRadius: 25 }}
            style={{ backgroundColor: '#D6EDFF', borderRadius: 25, elevation: 0, height: wp(8), marginHorizontal: wp(4) }}
            tabStyle={{ borderRadius: 25, }}
            labelStyle={{ fontWeight: 'bold', borderRadius: 25, textAlign: 'center', fontSize: FontSize('xMini'), marginTop: -10, width: wp(30) }}
            activeColor={'#fff'}
            inactiveColor={'#1896FC'}
        />
    );

    itemSeparator = () => (<View style={styles.mainRowBottomBorder} />)

    renderItems = (list) => (
        <FlatList
            keyExtractor={(item, index) => item + index}
            data={list}
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
            ItemSeparatorComponent={this.itemSeparator}
            renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.openImageViewer(item)} style={styles.calenderSubTab}>
                    <Text style={{ fontWeight: 'bold', color: '#1896FC' }}>{moment(item.record_date).format('DD-MM-YYYY')}</Text>
                    <Text style={{ fontWeight: 'bold' }}>{item.files.length} Records</Text>
                </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View>
                    <Text style={{ textAlign: 'center', color: '#999999', fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini') }}>No records found</Text>
                </View>
            }
        />
    )

    /* On Refresh */
    _onRefresh = async () => {
        const { index } = this.state
        this.setState({ spinner: true });
        setTimeout(async () => {
            if (index == 0)
                await this.getList('prescriptionData', 'prescription');
            else if (index == 1)
                await this.getList('labTestData', 'lab_report');
            else if (index == 2)
                await this.getList('vaccinationData', 'vaccination_report');
        }, 500);
    }

    getList = async (state, type) => {
        try {
            let params = { record_type: type };

            const res = await API.get(API_URL.MEDICAL_RECORDS, params);
            this.setState({ [state]: res.data.records, spinner: false, all_counts: res.data.count });
        } catch (error) {
            console.log(error);
        }
    }

    openImageViewer(item) {
        let urls = [];
        for (let index = 0; index < item.files.length; index++) {
            let file_object = item.files[index]
            urls.push({ url: file_object.file_url })
        }

        if (urls.length > 0) {
            this.setState({
                showImageViewer: true,
                imageUrls: urls
            })
        }
    }

    render() {

        const { spinner, index, routes } = this.state;
        const { prescriptionData, labTestData, vaccinationData, all_counts } = this.state;

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar title={"Medical Records"}
                        context={this.props}
                        backButton={true}
                        noShadow={true}
                        right={
                            (prescriptionData.length == 0 && labTestData.length == 0 && vaccinationData.length == 0)
                                ? null
                                : <TouchableOpacity onPress={() => this.props.navigation.navigate('AddMedicalRecord', { 'callbackHandler': this._onRefresh })}>
                                    <Icon type="Entypo" name="plus" style={{ color: '#fff', marginRight: wp(1) }} />
                                </TouchableOpacity>
                        }
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
                        {
                            (all_counts == 0)
                                ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Image style={{ resizeMode: 'contain', height: '15%', tintColor: '#1994fa' }} source={require('../assets/icons/medical_records2.png')} />
                                    <Text style={{ fontSize: FontSize('xLarge'), fontFamily: Fonts.HelveticaNeue, fontWeight: 'bold', marginVertical: hp(2.5) }}>No Medical Records</Text>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('AddMedicalRecord', { 'callbackHandler': this._onRefresh })} style={styles.reminderBtn}>
                                        <Text style={styles.reminderBtnText}>Add Medical Record</Text>
                                    </TouchableOpacity>
                                </View>
                                : <View style={{ flex: 1, paddingVertical: wp(4) }}>
                                    <TabView
                                        style={{ justifyContent: 'center', }}
                                        swipeEnabled={false}
                                        renderTabBar={this.renderTabBar}
                                        sceneContainerStyle={{ paddingTop: wp(4) }}
                                        navigationState={{ index, routes }}
                                        onIndexChange={(i) => this.changeTab(i)}
                                        renderScene={SceneMap({
                                            first: () => this.renderItems(prescriptionData),
                                            second: () => this.renderItems(labTestData),
                                            third: () => this.renderItems(vaccinationData)
                                        })}
                                    />
                                </View>
                        }
                    </View>
                </SafeAreaView>

                <Modal
                    visible={this.state.showImageViewer}
                    transparent={true}
                >
                    <ImageViewer
                        imageUrls={this.state.imageUrls}
                        onCancel={() => this.setState({ showImageViewer: false })}
                        renderIndicator={() => null}
                        renderImage={(props) => <Image {...props} resizeMode={"cover"} />}
                        enableSwipeDown
                        renderHeader={() => (
                            <TouchableOpacity
                                onPress={() => this.setState({ showImageViewer: false })}
                                style={{ position: "absolute", right: 0, zIndex: 9 }}
                            >
                                <Icon type="AntDesign" name='close' style={styles.closeButton} />
                            </TouchableOpacity>
                        )}
                    />
                </Modal>
            </Container>
        );
    }
}

export default MedicalRecordScreen;

const styles = StyleSheet.create({
    reminderBtn: {
        width: wp(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(13),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
        marginVertical: wp(2)
    },
    reminderBtnText: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'capitalize'
    },
    addrecordStyle: {
        padding: wp(4),
        borderBottomColor: '#C7C7C7',
        borderBottomWidth: 1
    },
    calenderSubTab: {
        paddingHorizontal: wp(5),
        flexDirection: 'row',
        height: wp(10),
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    calenderText: {
        color: '#7FC7FD',
        textAlign: 'center',
        paddingVertical: wp(1),
        fontSize: FontSize('xMini'),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        lineHeight: 20
    },
    mainRowBottomBorder: {
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    closeButton: {
        color: colors.white,
        textAlign: "right",
        paddingTop: 20,
        paddingRight: 20,
        fontSize: hp(3),
    },
})