import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { Container, Icon } from 'native-base';

import { FlatList, SafeAreaView, ScrollView } from 'react-navigation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Modal from 'react-native-translucent-modal';
import moment from 'moment';

import NavigationBar from '../components/NavigationBar';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import API from '../services/API';
import { API_URL } from '../utils/Constant';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';
import { Fonts } from '../utils/Fonts';
import AppInfo from '../../src/modules/AppInfoNativeModule';

class PatientPrescriptionViewScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PrescriptionData: [],
            modalVisible: false,
            spinner: false,
            medicineName: '',
            medicineComment: '',
            refresh: false,
            chatroomSessionId: 0,
            DiagnosticData: [],
            FollowUpData: []
        };
    }

    async componentDidMount() {
        let chatroom_session_id = await this.props.navigation.getParam('chatroom_session_id', null);
        this.setState({ spinner: true, chatroomSessionId: chatroom_session_id });
        await this.GetPrescription();
        this.setState({ spinner: false });
    }

    MedicineHeader = () => {
        return (
            <View style={{ flexDirection: 'column', paddingHorizontal: wp(3), paddingTop: wp(3) }}>
                <View style={styles.mainRow}>
                    <Text style={[styles.textHeading, { width: wp(35) }]}>Medicine Name (mg)</Text>
                    <Text style={[styles.textHeading, { width: wp(12) }]}>Days</Text>
                    <Text style={[styles.textHeading, { width: wp(30) }]}>Frequency</Text>
                    <Text style={[styles.textHeading, { width: wp(20) }]}>Comments</Text>
                </View>
            </View>
        );
    }

    DiagnosticHeader = () => {
        return (
            <View style={{ flexDirection: 'column', paddingHorizontal: wp(3), paddingTop: wp(2) }}>
                <Text style={[styles.mainHeading, { fontSize: FontSize('medium') }]}>Diagnostic Test</Text>
            </View>
        );
    }

    FollowUpHeader = () => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp(3), paddingTop: wp(2) }}>
            <Text style={[styles.mainHeading, { fontSize: FontSize('medium'), textAlignVertical: 'center' }]}>Follow Up Reminder</Text>
            {
                (AppInfo.TARGET == "doctor")
                    ? null
                    : <TouchableOpacity onPress={() => this.props.navigation.navigate('Reminder')} style={styles.reminderBtn}>
                        <Text style={styles.reminderBtnText}>Reminder</Text>
                    </TouchableOpacity>
            }

        </View>
    );

    FlatListItemSeparator = () => <View style={{ height: 1, width: "100%", backgroundColor: "#e3e3e3" }} />


    commentPress = async (name, comment) => {
        await this.setState({
            modalVisible: !this.state.modalVisible,
            medicineName: name,
            medicineComment: comment
        })
    }

    GetPrescription = async () => {
        try {
            await this.setState({ refresh: true })
            let param = {
                chatroom_session_id: this.state.chatroomSessionId
            };
            const res = await API.get(API_URL.PRESCRIBE_MEDICINE, param);
            if (res) {
                console.log("")
                console.log(res)
                console.log("")
                if (res.status == 'Success') {
                    await this.setState({ PrescriptionData: res.data.prescribe_medicines, DiagnosticData: res.data.diagnosic_tests, FollowUpData: res.data.follow_ups, refresh: false })
                }
                else if (res.status == 'Error') {
                    Alert.alert('Required', res.message)
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            Alert.alert('Error', error)
            this.setState({ spinner: false });
        }
    }

    toggleModal = () => {
        this.setState({
            modalVisible: !this.state.modalVisible,
            medicineName: '',
            medicineComment: ''
        })
    }

    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.GetPrescription();
        this.setState({ spinner: false });
    }

    render() {
        const { spinner, medicineName, medicineComment, DiagnosticData, PrescriptionData, FollowUpData } = this.state;
        return (
            <Container>
                <SafeAreaView style={GlobalStyles.AndroidSafeArea} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Prescription"}
                        context={this.props}
                        backButton={true}
                        right={null}
                        transparent={false}
                        noShadow={true}
                    />

                    {/* Spinner */}
                    <CustomSpinner visible={spinner} />

                    {/* NAVIGATION HEADER END*/}
                    <ScrollView refreshControl={<RefreshControl onRefresh={this._onRefresh} refreshing={this.state.refresh} />}>

                        {/* Prescribe Medication */}
                        {this.MedicineHeader()}
                        {
                            PrescriptionData.map((item, index) => (
                                <>
                                    <View key={index} style={[styles.mainRow, { paddingVertical: wp(3), paddingHorizontal: wp(3) }]}>

                                        <View style={{ width: wp(35) }}>
                                            <Text style={styles.rowText}>{item.medicine_name}</Text>
                                        </View>

                                        <View style={{ width: wp(12), flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: wp(8), height: wp(8), borderRadius: wp(8) / 2, backgroundColor: '#cbf6ff', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={styles.daysStyle}>{item.days >= 10 ? item.days : '0' + item.days}</Text>
                                            </View>
                                        </View>

                                        <View style={{ width: wp(30), flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={[styles.FrequencyStyle, item.morning == 1 ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginRight: wp(1) }]}>
                                                <Text style={[item.morning == 1 ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>M</Text>
                                            </View>
                                            <View style={[styles.FrequencyStyle, item.afternoon == 1 ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginRight: wp(1) }]}>
                                                <Text style={[item.afternoon == 1 ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>A</Text>
                                            </View>
                                            <View style={[styles.FrequencyStyle, item.evening == 1 ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle]}>
                                                <Text style={[item.evening == 1 ? styles.frequencyTextActiveStyle : styles.frequencyTextInactiveStyle]}>E</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity onPress={AppHelper.isNull(item.doctor_comment) == false ? () => this.commentPress(item.medicine_name, item.doctor_comment) : null} style={[styles.commentButton, AppHelper.isNull(item.doctor_comment) == false ? styles.commentButtonActive : styles.commentButtonInactive]}>
                                            <Text style={[styles.commentBtnText, AppHelper.isNull(item.doctor_comment) == false ? styles.commentBtnTextActive : styles.commentBtnTextInactive]}>View</Text>
                                        </TouchableOpacity>

                                    </View>
                                    {PrescriptionData.length == index + 1 ? null : this.FlatListItemSeparator()}
                                </>
                            ))
                        }

                        {/* Diagnostic Test */}
                        {this.DiagnosticHeader()}
                        {
                            DiagnosticData.map((item, index) => (
                                <>
                                    <View key={index} style={{ width: '100%', paddingVertical: wp(3), paddingHorizontal: wp(3) }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <Text style={{ fontSize: FontSize('xLarge') }}>&bull;</Text>
                                            <Text> {item.short_code} - {item.test_name}</Text>
                                        </View>
                                        <Text style={{ paddingLeft: 16 }}>{item.comment}</Text>
                                    </View>
                                    {DiagnosticData.length == index + 1 ? null : this.FlatListItemSeparator()}
                                </>
                            ))
                        }

                        {/* Follow Up Reminder */}
                        {this.FollowUpHeader()}
                        {
                            FollowUpData.map((item, index) => (
                                <>
                                    <View style={{ width: '100%', paddingVertical: wp(3), paddingHorizontal: wp(3) }} key={index}>
                                        <View>
                                            <Text style={{ color: '#1896FC' }}>{moment(item.follow_up_at).utc(true).format('MMM DD, YYYY h:mm A')}</Text>
                                            <Text>{item.comment}</Text>
                                        </View>
                                    </View>
                                    {FollowUpData.length == index + 1 ? null : this.FlatListItemSeparator()}
                                </>
                            ))
                        }

                    </ScrollView>
                </SafeAreaView>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={this.toggleModal}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center', paddingBottom: wp(3), width: '92%', fontSize: FontSize('medium') }}>{medicineName}</Text>
                                <TouchableOpacity onPress={this.toggleModal} style={{ width: wp(7), height: wp(7), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                    <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingVertical: wp(2) }}>
                                <Text>Doctor's Comment</Text>
                            </View>
                            <View style={{ padding: wp(3), backgroundColor: '#eeeff3' }}>
                                <Text style={{ maxHeight: hp(50) }}>{medicineComment}</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Container>
        );
    }
}

export default PatientPrescriptionViewScreen;

const styles = StyleSheet.create({
    textHeading: {
        fontWeight: 'bold',
        paddingVertical: wp(2),
        fontSize: FontSize('xMini'),
        // borderWidth: 1, borderColor: '#000'
    },
    rowText: {
        paddingVertical: wp(2),
        fontSize: FontSize('xMini'),
    },
    daysStyle: {
        // backgroundColor: '#cbf6ff',
        textAlign: 'center',
        //paddingVertical: wp(2),
        fontSize: FontSize('xMini'),
        color: '#18bafa'
    },
    FrequencyStyle: {
        borderRadius: wp(8) / 2,
        width: wp(8), height: wp(8),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2),
        fontSize: FontSize('mini'),
    },
    FrequencyActiveStyle: {
        backgroundColor: '#1896fc',
        color: '#fff'
    },
    FrequencyInactiveStyle: {
        backgroundColor: '#e6e6e6',
        color: '#acabab'
    },
    frequencyTextActiveStyle: {
        color: '#fff'
    },
    frequencyTextInactiveStyle: {
        color: '#acabab'
    },
    mainRow: {
        width: '100%',
        flexDirection: 'row',
    },
    commentButton: {
        width: wp(17),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(8),
        alignSelf: 'center'
    },
    commentButtonActive: {
        backgroundColor: '#1896fc',
    },
    commentButtonInactive: {
        backgroundColor: '#e6e6e6',
    },
    commentBtnText: {
        fontSize: FontSize('xMini'),
        fontWeight: 'bold',
    },
    commentBtnTextActive: {
        color: '#fff'
    },
    commentBtnTextInactive: {
        color: '#acabab'
    },
    centeredView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 25,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    mainHeading: {
        fontWeight: 'bold',
        fontFamily: Fonts.HelveticaNeue,
        textTransform: 'capitalize',
        paddingBottom: wp(1)
        // borderColor: 'black', borderWidth: 1
    },
    reminderBtn: {
        width: wp(20),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(8),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
    },
    reminderBtnText: {
        fontSize: FontSize('xMini'),
        fontWeight: 'bold',
        color: '#fff'
    }
})