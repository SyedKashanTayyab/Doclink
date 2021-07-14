import React, { Component } from 'react';
import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity, Image, ScrollView, BackHandler, FlatList, InputAccessoryView, Platform, Keyboard, Button as ButtonRN } from 'react-native';

import { Button, Container, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Modal from 'react-native-translucent-modal';
import moment from 'moment'
import DatePicker from 'react-native-date-picker';

import { Fonts } from '../utils/Fonts';
import { GetChiefComplaint } from '../api/Doctor';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import API from '../services/API';
import CheckBox from '../components/CheckBox'
import { API_URL } from '../utils/Constant';
import Sounds from "../components/Sound";
import { connect } from 'socket.io-client';
import { stat } from 'react-native-fs';
import VoicePlayerChatRequestPopup from '../components/VoicePlayerChatRequestPopup';

var _isSubmitting = false

let navlist = [
    { label: "View Profile", routeLink: "ProfileView" },
    { label: "View Media", routeLink: "Media" },
]

const inputAccessoryViewID = 'inputAccessoryView1';

class DoctorClosingNoteScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false, checked: false,
            name: '', note: '', data: [],
            chatroom_session_id: '', chatroom_id: '',
            patient_id: '', chief_complaint: '',
            sesssion_id: '', fcmToken: '', insertId: '',
            medicineCommentModal: false,
            errors: { note: false }, navlistItems: navlist,
            popupText: "Are you sure you want to submit this note?",
            returnMoneyText: "Are you sure you want to return the session charges to the patient? \n This action can not be reversed",
            PrescriptionData: [],
            DiagnosticData: [],
            FollowUpData: { follow_up_at: '', comment: '' },
            FollowUpVisible: false,
            NotesVisible: false,
            dateTimeModal: false,
            showDate: true,
            counter: 0,
            deletePrescription: false,
            deleteDiagnostic: false,
            commentID: null,
            commentName: 'Comments',
            commentText: '',
            search_keyword: '',
            search_type: true,
            diagnosticTestModal: false,
            diagnostic_list: [],
            diagnostic_list_filtered: [],
            diagnosticIndex: null,
            chief_complaint_request_data: null
        };

        this.props.navigation.addListener('didFocus', async () => {
            console.log("DC - Did focus ConstrUCTOR")
            BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        })
    }

    async componentDidMount() {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        await this.getDoagnosticNames();
        this.setState({ spinner: false });

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    getDoagnosticNames = async () => {
        try {
            let params = {}
            const res = await API.get(API_URL.LAB_NAMES, params);
            if (res) {
                if (res.status == 'Success') {
                    this.setState({ diagnostic_list: res.data, diagnostic_list_filtered: res.data })
                }
            }
        } catch (error) {
            Alert.alert('Error', error)
            this.setState({ spinner: false });
        }
    }

    makeRemoteRequest = async () => {
        const access_token = await AppHelper.getItem("access_token");
        const { navigation } = this.props;
        let data = navigation.getParam('data', 0)

        await this.setState({ chatroom_session_id: data.chatroom_session_id });

        var params = { chatroom_session_id: data.chatroom_session_id }
        try {
            const res = await API.get(API_URL.DOCTOR_CHIEF_COMPLAINT, params);

            if (res) {
                const { data } = await res;
                if (res.status == 'Success') {

                    let isJSONString = AppHelper.isJSONString(data.request_data)
                    let description = ""
                    let reques_data = null
                    if (isJSONString == true) {
                        let json_request_data = JSON.parse(data.request_data)
                        reques_data = json_request_data
                        description = (json_request_data.description == null) ? data.chief_complaint : json_request_data.description
                    } else {
                        description = data.chief_complaint
                    }
                    this.setState({ chief_complaint_request_data: reques_data, chief_complaint: description, session_id: data.chatroom_session_id, chatroom_id: data.chatroom_id });
                }
                else if (res.status == 'Error') {
                    Alert.alert('Required', data.message)
                }
            }
        }
        catch (error) {
            // console.warn(' ', error)
        }
    }

    /**
     * Hardware Back Button pressed handler
     */
    handleBackButton = async () => {
        if (this.refNCR != undefined) {
            this.refNCR.onPause()
        }
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        console.log("Back button is pressed - DC")
        let _chatroom = ChatRoomModel.find_by_id(this.state.chatroom_id);
        if (_chatroom != null)
            this.props.navigation.navigate({
                routeName: 'Chat',
                params: { chatroom: _chatroom, closing_notes_chatroom_session_id: this.state.chatroom_session_id },
                key: 'ChatScreenReview'
            });
    }

    _resetStack = async (stackName) => {
        this._emptyState();
        this.props
            .navigation
            .dispatch(StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({
                        routeName: stackName,
                    }),
                ],
            }))
    }

    //Add Session Details API Function
    _sessionDetials = async () => {

        if (this.refNCR != undefined) {
            this.refNCR.onPause()
        }

        this.setState({ spinner: true })
        const { checked } = this.state;

        this.setState({ medicineCommentModal: false, });
        const user_id = await AppHelper.getItem("user_id");

        let data = this.state.PrescriptionData;
        for (var i = 0; i < data.length; i++) {
            if (data[i].edit == true) {
                if (data[i].medicine_name == '') {
                    Alert.alert('Alert', 'Please fill out Medicine name');
                    this.setState({ spinner: false });
                    return;
                } else if (data[i].days == 0) {
                    Alert.alert('Alert', 'Please fill out Days');
                    this.setState({ spinner: false });
                    return;
                }
                else if ((data[i].m || data[i].a || data[i].e) === false) {
                    Alert.alert('Alert', 'Please select Frequency');
                    this.setState({ spinner: false });
                    return;
                }
            }
        }

        let diagnosticData = this.state.DiagnosticData;
        for (var j = 0; j < diagnosticData.length; j++) {
            if (diagnosticData[j].edit == true) {
                if (diagnosticData[j].short_code == '') {
                    Alert.alert('Alert', 'Please select Diagnostic test');
                    this.setState({ spinner: false });
                    return;
                }
            }
        }

        if (_isSubmitting == false) {
            _isSubmitting = true
            console.log("clicked submit true")
        } else {
            return;
        }

        try {
            const finalPrescription = this.state.PrescriptionData.filter(item => item.edit);
            const finalDiagnostic = this.state.DiagnosticData.filter(item => item.edit)
            const follow_ups = this.state.FollowUpData;

            const finalFollowUps = (follow_ups.follow_up_at == '') ? [] : [{ "follow_up_at": moment(follow_ups.follow_up_at).format('YYYY-MM-DD HH:mm:ss'), "comment": follow_ups.comment }]

            let params = {
                notes: AppHelper.encodeStringAscii(this.state.note),
                doctor_id: user_id,
                chatroom_session_id: this.state.chatroom_session_id,
                return_session_charges: checked ? "1" : "0",
                prescribe_medicine: JSON.stringify(finalPrescription),
                lab_tests: JSON.stringify(finalDiagnostic),
                follow_ups: JSON.stringify(finalFollowUps)
            }

            this.setState({ deletePrescription: false, deleteDiagnostic: false })
            const res = await API.post(API_URL.CHAT_ADD_CLOSING_NOTES, params);
            if (res) {
                if (res.status == 'Success') {
                    // Session Details Added Successfully
                    setTimeout(() => {
                        _isSubmitting = false
                        this.setState({ spinner: false, checked: false, deletePrescription: false, deleteDiagnostic: false });
                        if (checked == false) {
                            Sounds.earnSound();
                        }
                        setTimeout(() => {
                            this.props.navigation.navigate('Home');
                        }, 1000);
                    }, 700);
                }
                else if (res.status == 'Error') {
                    _isSubmitting = false
                    Alert.alert('Required', res.message)
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            _isSubmitting = false
            Alert.alert('Error', error)
            this.setState({ spinner: false });
        }
    }

    handleReturnAmount = () => {
        this.setState({ checked: !this.state.checked, });
    }

    changeFrequency = async (id, type) => {
        let a = this.state.PrescriptionData;
        a[id][type] = !a[id][type];
        a[id]['edit'] = true;
        await this.setState({ PrescriptionData: a });
    }

    showPrescriptionView = () => {
        this.setState({ deletePrescription: false });
        this.addMorePrescription();
    }

    deleteButton = async (stateName, stateValue) => {
        await this.setState({ [stateName]: !stateValue })
    }

    deleteFromItem = async (index, stateName, state) => {
        var array = state
        array.splice(index, 1);
        await this.setState({ [stateName]: [] });
        await this.setState({ [stateName]: array });
    }

    addMorePrescription = async () => {
        const data = [...this.state.PrescriptionData];

        data.push({
            medicine_name: '', days: 0, comment: '',
            m: false, a: false, e: false, edit: false
        });
        await this.setState({ PrescriptionData: data });
    }

    commentPress = async (id, name, comment) => {
        await this.setState({
            medicineCommentModal: !this.state.medicineCommentModal,
            commentID: id, commentName: name, commentText: comment
        })
    }

    changeComment = async (id, value) => {
        let a = this.state.PrescriptionData;
        a[id]['comment'] = value;
        await this.setState({ PrescriptionData: a, commentText: value });
    }

    toggleModal = (stateName, state) => { this.setState({ [stateName]: !state, diagnostic_list_filtered: this.state.diagnostic_list }) }

    showDiagnostic = () => {
        this.setState({ deleteDiagnostic: false });
        this.addDiagnostic();
    }

    addDiagnostic = async () => {
        const data = [...this.state.DiagnosticData];

        data.push({ short_code: '', test_name: '', comment: '', lab_test_id: null, edit: false })
        await this.setState({ DiagnosticData: data });
    }

    changeItemData = async (index, stateName, state, value, itemName) => {
        let a = state;
        a[index][itemName] = value;
        a[index]['edit'] = true;
        await this.setState({ [stateName]: a });
    }

    setDateTime = async (date) => {
        let a = this.state.FollowUpData;
        a.follow_up_at = moment(date);
        await this.setState({ FollowUpData: a });
    }

    itemSeparator = () => (<View style={styles.mainRowBottomBorder} />)

    searchText = (e) => {
        let text = e.toLowerCase();
        let tests = this.state.diagnostic_list;
        let filteredName = tests.filter(item => (item.short_code.toLowerCase() + ' ' + item.test_name.toLowerCase()).indexOf(text) > -1);

        if (Array.isArray(filteredName))
            this.setState({ diagnostic_list_filtered: filteredName });
    }

    selectDiagnosticText = async (item) => {
        let a = this.state.DiagnosticData;
        let i = this.state.diagnosticIndex;
        a[i]['short_code'] = item.short_code;
        a[i]['test_name'] = item.test_name;
        a[i]['edit'] = true;
        await this.setState({ DiagnosticData: a, diagnosticTestModal: false });
    }

    diagnosticTestToggle = (index, stateName, state) => {
        this.setState({ diagnosticIndex: index })
        this.toggleModal(stateName, state);
    }

    cancelClosingNotes = async () => {
        if (this.refNCR != undefined) {
            this.refNCR.onPause()
        }
        this.setState({ spinner: true })
        const user_id = await AppHelper.getItem("user_id");
        const { checked } = this.state;
        try {
            let params = {
                notes: '',
                doctor_id: user_id,
                chatroom_session_id: this.state.chatroom_session_id,
                return_session_charges: checked ? "1" : "0",
                prescribe_medicine: JSON.stringify([]),
                lab_tests: JSON.stringify([]),
                follow_ups: JSON.stringify([]),
                dismiss: 1
            }
            console.log(params)
            this.setState({ deletePrescription: false, deleteDiagnostic: false })
            const res = await API.post(API_URL.CHAT_ADD_CLOSING_NOTES, params);
            if (res) {
                if (res.status == 'Success') {
                    if (checked == false) {
                        Sounds.earnSound();
                    }
                    setTimeout(() => {
                        this.setState({ spinner: false, checked: false, deletePrescription: false, deleteDiagnostic: false });
                        this.props.navigation.navigate('Home');
                    }, 700);
                }
            }
        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    render() {
        const { chief_complaint, chief_complaint_request_data, spinner, note, checked, commentID, commentName, commentText, PrescriptionData, deletePrescription, medicineCommentModal, NotesVisible } = this.state;
        const { DiagnosticData, deleteDiagnostic, diagnosticTestModal, diagnostic_list_filtered } = this.state;
        const { FollowUpData, FollowUpVisible, dateTimeModal, showDate } = this.state;


        // console.log(chief_complaint, chief_complaint_request_data)
        // console.log("FollowUpData.follow_up_at", FollowUpData.follow_up_at == '' ? "Empty" : FollowUpData.follow_up_at)
        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar title={"Closing Note"}
                    context={this.props}
                    backButton={true}
                    right={
                        <TouchableOpacity
                            onPress={() => this.cancelClosingNotes()}
                            style={{ justifyContent: 'center', alignContent: 'center', paddingRight: wp(2) }}
                        >
                            <Icon type="AntDesign" name="close" style={{ fontSize: 26, color: colors.white }} />
                        </TouchableOpacity>
                    }
                    noShadow={true}
                    onBackButtonPress={() => {
                        this.handleBackButton()
                    }}
                />

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                <KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={250}>
                    {/* MAIN CONTENT SECTION */}
                    <View style={{ flex: 1, width: wp(100) }}>

                        {/* Chief Complaint */}
                        <View style={styles.section}>
                            <Text style={styles.mainHeading}>Chief Complaint</Text>
                            {
                                (chief_complaint != "")
                                    ? <Text style={styles.textLabel}>{chief_complaint}</Text>
                                    : null
                            }
                            {
                                (chief_complaint_request_data != null && AppHelper.isEmpty(chief_complaint_request_data.audioData) == false)
                                    ? <VoicePlayerChatRequestPopup
                                        ref={refNCR => this.refNCR = refNCR}
                                        data={chief_complaint_request_data.audioData}
                                        containerStyle={{
                                            width: "100%",
                                            height: hp(7),
                                        }}
                                        childElements={<></>}>
                                    </VoicePlayerChatRequestPopup>
                                    : null

                            }
                        </View>

                        {/* Prescribe Medication */}
                        <View style={[styles.section, { flexDirection: 'row', paddingBottom: 2, borderBottomWidth: 0, alignItems: 'center', justifyContent: 'space-between' }]}>
                            <Text style={[styles.mainHeading, { fontSize: FontSize('medium'), }]}>Prescribe Medication</Text>
                            <View style={{ flexDirection: 'row', borderWidth: 0, borderColor: '#000' }}>
                                {
                                    PrescriptionData.length !== 0
                                        ?
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.deleteButton('deletePrescription', deletePrescription)
                                            }}
                                            style={[styles.PrescriptionBtn, { backgroundColor: deletePrescription == true ? colors.btnBgColor : '#e6e6e6', marginRight: wp(2) }]}
                                            disabled={PrescriptionData.length == 0 ? true : false}
                                        >
                                            <Icon type="FontAwesome5" name="trash-alt" style={{ color: deletePrescription == true ? '#ffffff' : '#acabab', fontSize: 18 }} />
                                        </TouchableOpacity>
                                        : null
                                }
                                <TouchableOpacity onPress={this.showPrescriptionView} style={[styles.PrescriptionBtn, styles.addPrescriptionBtn]}>
                                    <Icon type="Entypo" name="plus" style={{ color: '#ffffff' }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Medication List */}
                        {
                            PrescriptionData.length == 0
                                ? <View style={[styles.mainRowBottomBorder, { height: hp(1.5) }]} />
                                : <View style={PrescriptionData.length == 0 ? styles.mainRowBottomBorder : null}>
                                    <View style={[styles.mainRow, { height: hp(3), alignItems: 'center' }]}>
                                        {
                                            deletePrescription == true
                                                ? <Text style={[styles.textHeading, { width: wp(9) }]}></Text>
                                                : null
                                        }
                                        <Text style={[styles.textHeading, { width: wp(35) }]}>Medicine Name (mg)</Text>
                                        <Text style={[styles.textHeading, { width: wp(12) }]}>Days</Text>
                                        <Text style={[styles.textHeading, { width: wp(30) }]}>Frequency</Text>
                                        <Text style={[styles.textHeading, { width: wp(17) }]}>
                                            {deletePrescription == false ? "Comments" : ""}
                                        </Text>
                                    </View>
                                    {
                                        PrescriptionData.map((v, i) => (
                                            <View key={i} style={[styles.mainRow, { paddingVertical: wp(3) }, styles.mainRowBottomBorder]}>
                                                {
                                                    deletePrescription == true
                                                        ? <View style={{ width: wp(9), justifyContent: 'center', }}>
                                                            <TouchableOpacity onPress={() => {
                                                                this.deleteFromItem(i, 'PrescriptionData', PrescriptionData)
                                                            }} style={{ width: wp(7), height: wp(7), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                                                <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                                            </TouchableOpacity>
                                                        </View>
                                                        : null
                                                }
                                                <View style={{ width: wp(35) }}>
                                                    <TextInput onChangeText={(text) => this.changeItemData(i, 'PrescriptionData', PrescriptionData, text, 'medicine_name')} placeholder="Enter Medicine" value={v.medicine_name} style={[styles.rowText, { width: wp(30), paddingLeft: wp(2), color: colors.black }]} />
                                                </View>

                                                <View style={{ width: wp(12), flexDirection: 'row', alignItems: 'center' }}>
                                                    <TextInput onChangeText={(text) => this.changeItemData(i, 'PrescriptionData', PrescriptionData, text, 'days')} placeholder="00" maxLength={2} keyboardType="number-pad" value={v.days.toString()} style={[styles.rowText, { width: wp(8), textAlign: 'center', color: colors.black }]} inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")} />
                                                </View>

                                                <View style={{ width: wp(30), flexDirection: 'row', alignItems: 'center' }}>
                                                    <TouchableOpacity onPress={() => this.changeFrequency(i, 'm')} style={[styles.FrequencyStyle, v.m == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle]}>
                                                        <Text style={v.m == true ? styles.FrequencyTextActiveStyle : styles.FrequencyTextInactiveStyle}>M</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.changeFrequency(i, 'a')} style={[styles.FrequencyStyle, v.a == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle, { marginHorizontal: wp(1) }]}>
                                                        <Text style={v.a == true ? styles.FrequencyTextActiveStyle : styles.FrequencyTextInactiveStyle}>A</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => this.changeFrequency(i, 'e')} style={[styles.FrequencyStyle, v.e == true ? styles.FrequencyActiveStyle : styles.FrequencyInactiveStyle]}>
                                                        <Text style={v.e == true ? styles.FrequencyTextActiveStyle : styles.FrequencyTextInactiveStyle}>E</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {
                                                    (deletePrescription == false)
                                                        ? <TouchableOpacity onPress={() => this.commentPress(i, v.medicine_name, v.comment)} style={[styles.commentButton, styles.commentButtonActive]}>
                                                            <Text style={[styles.commentBtnText, styles.commentBtnTextActive]}>{v.comment == '' ? 'Add' : 'View'}</Text>
                                                        </TouchableOpacity>
                                                        : null
                                                }
                                            </View>
                                        ))
                                    }
                                </View>
                        }

                        {/* Diagnostic Test */}
                        <View style={[styles.section, { flexDirection: 'row', paddingBottom: 2, borderBottomWidth: 0, alignItems: 'center', justifyContent: 'space-between' }]}>
                            <Text style={[styles.mainHeading, { fontSize: FontSize('medium'), }]}>Diagnostic Test</Text>
                            <View style={{ flexDirection: 'row', borderWidth: 0, borderColor: '#000' }}>
                                {
                                    DiagnosticData.length !== 0
                                        ?
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.deleteButton('deleteDiagnostic', deleteDiagnostic)
                                            }}
                                            style={[styles.PrescriptionBtn, { backgroundColor: deleteDiagnostic == true ? colors.btnBgColor : '#e6e6e6', marginRight: wp(2) }]}
                                            disabled={DiagnosticData.length == 0 ? true : false}
                                        >
                                            <Icon type="FontAwesome5" name="trash-alt" style={{ color: deleteDiagnostic == true ? '#ffffff' : '#acabab', fontSize: 18 }} />
                                        </TouchableOpacity>
                                        : null
                                }
                                <TouchableOpacity onPress={this.showDiagnostic} style={[styles.PrescriptionBtn, styles.addPrescriptionBtn]}>
                                    <Icon type="Entypo" name="plus" style={{ color: '#ffffff' }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Diagnostic List */}
                        {
                            DiagnosticData.length == 0
                                ? <View style={[styles.mainRowBottomBorder, { height: hp(1.5) }]} />
                                : <View style={DiagnosticData.length == 0 ? styles.mainRowBottomBorder : null}>
                                    {
                                        DiagnosticData.map((v, i) => (
                                            <View key={i} style={[styles.mainRow, styles.mainRowBottomBorder, { paddingBottom: wp(3), flexDirection: 'column' }]}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderColor: 'black', borderWidth: 0 }}>
                                                    {
                                                        deleteDiagnostic == true
                                                            ? <View style={{ width: wp(9), justifyContent: 'center', }}>
                                                                <TouchableOpacity onPress={() => {
                                                                    this.deleteFromItem(i, 'DiagnosticData', DiagnosticData)
                                                                }} style={{ width: wp(7), height: wp(7), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                                                    <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                                                </TouchableOpacity>
                                                            </View>
                                                            : null
                                                    }
                                                    <View style={{ flexDirection: 'column' }}>
                                                        <Text style={styles.textHeading}>Short Code</Text>
                                                        <TouchableOpacity onPress={() => this.diagnosticTestToggle(i, 'diagnosticTestModal', diagnosticTestModal)} style={{ justifyContent: 'center' }}>
                                                            <TextInput placeholder="Short Code" value={v.short_code} style={[styles.rowText, { width: wp(30), paddingLeft: wp(2), color: colors.black }]} editable={false} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{ flexDirection: 'column' }}>
                                                        <Text style={styles.textHeading}>Name</Text>
                                                        <TouchableOpacity onPress={() => {
                                                            this.diagnosticTestToggle(i, 'diagnosticTestModal', diagnosticTestModal)
                                                        }} style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.white }}>
                                                            <TextInput onFocus={() => {
                                                                this.diagnosticTestToggle(i, 'diagnosticTestModal', diagnosticTestModal)
                                                            }} placeholder="Name" value={v.test_name} style={[styles.rowText, { width: wp(60), paddingLeft: wp(2), color: colors.black, marginLeft: deleteDiagnostic == true ? wp(3) : wp(0) }]} pointerEvents="none" editable={false} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {
                                                        deleteDiagnostic == true
                                                            ? <View style={{ width: wp(9), justifyContent: 'center', }} /> : null
                                                    }
                                                    <View style={{ flexDirection: 'column', width: '100%' }}>
                                                        <Text style={styles.textHeading}>Comment</Text>
                                                        <TextInput multiline={true} onChangeText={(text) => this.changeItemData(i, 'DiagnosticData', DiagnosticData, text, 'comment')} value={v.comment} placeholder="Comment" style={[styles.rowText, { width: '100%', paddingLeft: wp(2), minHeight: hp(6), color: colors.black, }]} inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")} />
                                                    </View>
                                                </View>
                                            </View>
                                        ))
                                    }
                                </View>
                        }

                        {/* Follow Up */}
                        <View style={[styles.section, { flexDirection: 'row', paddingBottom: 2, borderBottomWidth: 0, alignItems: 'center', justifyContent: 'space-between' }]}>
                            <Text style={[styles.mainHeading, { fontSize: FontSize('medium'), }]}>Follow Up Reminder</Text>
                            <View style={{ flexDirection: 'row', borderWidth: 0, borderColor: '#000' }}>
                                {
                                    FollowUpVisible
                                        ? <TouchableOpacity
                                            onPress={() => {
                                                this.setState({ FollowUpVisible: false, FollowUpData: { follow_up_at: '', comment: '' } })
                                            }}
                                            style={[styles.PrescriptionBtn, { backgroundColor: colors.btnBgColor }]}
                                        >
                                            <Icon type="FontAwesome5" name="trash-alt" style={{ color: '#ffffff', fontSize: 18 }} />
                                        </TouchableOpacity>
                                        : <TouchableOpacity onPress={() => {
                                            let _timeObject = moment()
                                            const roundedDown = Math.floor(_timeObject.minute() / 15) * 15;
                                            _timeObject.set('minutes', roundedDown)
                                            _timeObject.set('seconds', 0)

                                            let array = this.state.FollowUpData
                                            array['follow_up_at'] = _timeObject.toDate()

                                            this.setState({ FollowUpVisible: true, FollowUpData: array })
                                        }} style={[styles.PrescriptionBtn, styles.addPrescriptionBtn]}>
                                            <Icon type="Entypo" name="plus" style={{ color: '#ffffff' }} />
                                        </TouchableOpacity>
                                }
                            </View>
                        </View>

                        {/* Follow Up List */}
                        {
                            FollowUpVisible
                                ? <View style={[styles.mainRow, styles.mainRowBottomBorder, { paddingBottom: wp(3), flexDirection: 'column' }]}>
                                    <View>
                                        <Text style={styles.textHeading}>Date/Time</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={{ color: '#1896FC' }}>{FollowUpData.follow_up_at != '' ? moment(FollowUpData.follow_up_at).format('MMM DD, YYYY h:mm A') : ""}</Text>
                                            <TouchableOpacity onPress={() => this.setState({ dateTimeModal: true })} style={[styles.PrescriptionBtn, styles.addPrescriptionBtn]}>
                                                <Image style={{ resizeMode: 'contain', tintColor: '#fff', width: wp(5), height: wp(5) }} source={require('../assets/icons/follow_up_icon.png')} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View>
                                        <Text style={styles.textHeading}>Comment</Text>
                                        <TextInput
                                            multiline={true}
                                            onChangeText={async (text) => { let a = this.state.FollowUpData; a.comment = text; await this.setState({ FollowUpData: a }); }}
                                            placeholder="Comment" style={[styles.rowText, { width: '100%', paddingLeft: wp(2), minHeight: hp(6), color: colors.black }]}
                                            inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                        />
                                    </View>
                                </View>
                                : <View style={[styles.mainRowBottomBorder, { height: hp(1.5) }]} />
                        }

                        {/* Doctor's Note */}
                        <View style={[styles.section, { flexDirection: 'row', paddingBottom: 2, borderBottomWidth: 0, alignItems: 'center', justifyContent: 'space-between' }]}>
                            <Text style={[styles.mainHeading, { fontSize: FontSize('medium'), }]}>Additional Comments</Text>
                            <View style={{ flexDirection: 'row', borderWidth: 0, borderColor: '#000' }}>
                                {
                                    NotesVisible ?
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.setState({ NotesVisible: false, note: '' })
                                            }}
                                            style={[styles.PrescriptionBtn, { backgroundColor: colors.btnBgColor }]}
                                        >
                                            <Icon type="FontAwesome5" name="trash-alt" style={{ color: '#ffffff', fontSize: 18 }} />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => {
                                            this.setState({ NotesVisible: true, note: '' })
                                        }} style={[styles.PrescriptionBtn, styles.addPrescriptionBtn]}>
                                            <Icon type="Entypo" name="plus" style={{ color: '#ffffff' }} />
                                        </TouchableOpacity>
                                }
                            </View>
                        </View>

                        {
                            NotesVisible
                                ? <View style={[styles.section, { borderBottomWidth: 0 }]}>
                                    <TextInput
                                        style={{
                                            fontFamily: Fonts.HelveticaNeue,
                                            fontSize: FontSize('small'),
                                            color: colors.black,
                                            backgroundColor: 'transparent',
                                            textAlignVertical: "top",
                                            padding: 0,
                                        }}
                                        value={note}
                                        onChangeText={note => { this.setState({ note }) }}
                                        underlineColorAndroid="transparent"
                                        placeholder={"Write any additional comments for the patient here"}
                                        numberOfLines={1}
                                        multiline={true}
                                        maxLength={300}
                                        inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                    />
                                </View>
                                : <View style={[styles.mainRowBottomBorder, { height: hp(1.5) }]} />
                        }


                    </View>
                </KeyboardAwareScrollView>

                {/* Return Ammount and Submit Button  */}
                <View style={[styles.section, { borderBottomWidth: 0, paddingTop: wp(1) }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CheckBox
                            checkedIcon={<Image source={require('../assets/icons/Icon_checked.png')} />}
                            uncheckedIcon={<Image source={require('../assets/icons/Icon_unchecked.png')} />}
                            checked={checked}
                            onPress={this.handleReturnAmount}
                            customStyles={{ width: 20, height: 40 }}
                        />
                        <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black }}>Return amount to Patient </Text>
                    </View>
                    <Button onPress={() => this._sessionDetials()} style={{ width: '100%', height: hp(7), justifyContent: 'center', borderRadius: 5, backgroundColor: colors.btnBgColor }}>
                        <Text style={{ color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase" }}>Submit</Text>
                    </Button>
                </View>

                {
                    (Platform.OS === 'ios') ?
                        <InputAccessoryView nativeID={inputAccessoryViewID}>
                            <View style={{ backgroundColor: colors.grayFour, alignItems: 'flex-end', width: 100, height: 45, justifyContent: 'center' }}>
                                <ButtonRN
                                    color={colors.black}
                                    onPress={() =>
                                        // Hide that keyboard!
                                        Keyboard.dismiss()
                                    }
                                    title="Done"
                                >
                                    <Text style={{ color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "capitalize" }}>Done</Text>
                                </ButtonRN>
                            </View>
                        </InputAccessoryView>
                        :
                        null
                }

                {/* Comment Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={medicineCommentModal}
                    onRequestClose={() => this.toggleModal('medicineCommentModal', medicineCommentModal)}>
                    <View style={[styles.centeredView, { marginTop: Platform.OS == 'ios' ? hp(-20) : 0 }]}>
                        <View style={styles.modalView}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'center', paddingBottom: wp(3), width: '92%', fontSize: FontSize('medium') }}>{commentName === '' ? 'Comments' : commentName}</Text>
                                <TouchableOpacity onPress={() => this.toggleModal('medicineCommentModal', medicineCommentModal)} style={{ width: wp(7), height: wp(7), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                    <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingVertical: wp(2) }}>
                                <Text>Comments (Optional)</Text>
                            </View>
                            <View>
                                <TextInput
                                    style={[styles.rowText, { paddingLeft: wp(2), textAlignVertical: "top", minHeight: hp(20), color: colors.black, }]}
                                    placeholder="Add your comments"
                                    value={commentText}
                                    numberOfLines={4}
                                    multiline={true}
                                    onChangeText={(text) => this.changeComment(commentID, text)}
                                    inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                />
                            </View>
                            <View style={{ paddingVertical: wp(2) }}>
                                <Button onPress={() => this.toggleModal('medicineCommentModal', medicineCommentModal)} style={{ width: '100%', height: hp(7), justifyContent: 'center', borderRadius: 5, backgroundColor: colors.btnBgColor }}>
                                    <Text style={{ color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase" }}>Add Comments</Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Date/Time Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={dateTimeModal}
                    onRequestClose={() => this.toggleModal('dateTimeModal', dateTimeModal)}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={{ fontWeight: 'bold', textAlign: 'right', width: '65%', fontSize: FontSize('medium') }}>Follow Up</Text>
                                <View style={{ width: '35%', alignItems: 'flex-end' }}>
                                    <TouchableOpacity onPress={() => this.toggleModal('dateTimeModal', dateTimeModal)} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                        <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                                <View style={{ width: '49%' }}>
                                    <View style={{ paddingVertical: wp(1) }}>
                                        <Text style={{ fontSize: FontSize('mini') }}>Date</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.setState({ showDate: true })} style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                        <TextInput style={{ paddingVertical: wp(1.5), color: colors.black, }} value={moment(FollowUpData.follow_up_at).format('DD-MM-YYYY')} editable={false} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '49%' }}>
                                    <View style={{ paddingVertical: wp(1) }}>
                                        <Text style={{ fontSize: FontSize('mini') }}>Time</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => this.setState({ showDate: false })} style={{ paddingHorizontal: wp(1), borderWidth: 1, borderColor: '#C7C7C7', borderRadius: 5, justifyContent: 'center' }}>
                                        <TextInput style={{ paddingVertical: wp(1.5), color: colors.black, }} value={moment(FollowUpData.follow_up_at).format('h:mm a')} editable={false} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ paddingVertical: wp(2), alignItems: 'center' }}>
                                <DatePicker
                                    androidVariant="nativeAndroid"
                                    date={FollowUpData.follow_up_at == '' ? new Date() : FollowUpData.follow_up_at}
                                    onDateChange={(date) => {
                                        let a = this.state.FollowUpData;
                                        // _objectDate: moment(date.toJSON()).utc(true),
                                        a.follow_up_at = date//moment(date.toJSON()).utc(true);
                                        this.setState({ FollowUpData: a });
                                    }}
                                    mode={showDate ? 'date' : 'time'}
                                    minuteInterval={15}
                                />
                            </View>
                            <View>
                                <TouchableOpacity
                                    onPress={
                                        () => showDate
                                            ? this.setState({ showDate: false })
                                            : (this.toggleModal('dateTimeModal', dateTimeModal), this.setState({ showDate: true }))
                                    }
                                    style={styles.reminderBtn}
                                >
                                    <Text style={styles.reminderBtnText}>{showDate ? 'Select' : 'Done'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Search Short Code Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={diagnosticTestModal}
                    onRequestClose={() => this.toggleModal('diagnosticTestModal', diagnosticTestModal)}>
                    <View style={[styles.centeredView, { backgroundColor: '#fff', justifyContent: 'flex-start', paddingTop: wp(10), paddingHorizontal: wp(5) }]}>
                        <TextInput autoFocus={true} onChangeText={this.searchText} placeholder="Search" style={[styles.rowText, { paddingLeft: wp(2), borderWidth: 2, color: colors.black, }]} />
                        {
                            <FlatList
                                data={diagnostic_list_filtered}
                                keyExtractor={(item, index) => index.toString()}
                                ItemSeparatorComponent={this.itemSeparator}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => this.selectDiagnosticText(item)}>
                                        <Text style={{ padding: wp(2), fontSize: FontSize('xMini') }}>{item.short_code + ' - ' + item.test_name}</Text>
                                    </TouchableOpacity>
                                )}
                                style={{ marginTop: 10 }}
                            />
                        }
                    </View>
                </Modal>
            </Container >
        );
    }
}

export default DoctorClosingNoteScreen;

const styles = StyleSheet.create({
    mainHeading: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        fontFamily: Fonts.HelveticaNeue,
        textTransform: 'capitalize',
        paddingBottom: wp(1)
        // borderColor: 'black', borderWidth: 1
    },
    textHeading: {
        fontWeight: 'bold',
        paddingVertical: wp(1),
        fontSize: FontSize('xMini'),
    },
    textLabel: {
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: 'capitalize',
        paddingBottom: wp(1)
    },
    section: {
        padding: wp(3),
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    addMoreBtn: {
        backgroundColor: '#18bafa',
        width: wp(7), height: wp(7),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    PrescriptionBtn: {
        width: wp(8),
        height: wp(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    },
    addPrescriptionBtn: {
        backgroundColor: '#18bafa',
    },
    deletePrescriptionBtn: {
        backgroundColor: '#e6e6e6',
    },
    rowText: {
        paddingVertical: wp(2),
        fontSize: FontSize('xMini'),
        borderColor: '#c7c7c7', borderWidth: 1, borderRadius: 5
    },
    daysStyle: {
        backgroundColor: '#cbf6ff',
        borderRadius: 30,
        width: wp(8), height: wp(8),
        textAlign: 'center',
        paddingVertical: wp(2),
        fontSize: FontSize('mini'),
        color: '#18bafa'
    },
    FrequencyStyle: {
        borderRadius: 30,
        width: wp(8), height: wp(8),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: wp(2),
    },
    FrequencyActiveStyle: {
        backgroundColor: '#1896fc',
    },
    FrequencyInactiveStyle: {
        backgroundColor: '#e6e6e6',
    },
    FrequencyTextActiveStyle: {
        fontSize: FontSize('mini'),
        color: '#fff'
    },
    FrequencyTextInactiveStyle: {
        fontSize: FontSize('mini'),
        color: '#acabab'
    },
    mainRow: {
        width: '100%',
        flexDirection: 'row', paddingHorizontal: wp(3),
        // borderColor: 'black', borderWidth: 1
    },
    mainRowBottomBorder: {
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
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
        textTransform: 'uppercase'
    },
});