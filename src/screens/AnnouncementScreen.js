import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, InputAccessoryView, Button as ButtonRN, Alert, Keyboard, TouchableOpacity, Image } from 'react-native';
import { Button, Container, Tab, Tabs, TabHeading, Icon } from 'native-base';
import Modal from 'react-native-translucent-modal';

import NavigationBar from '../components/NavigationBar';
import API from '../services/API';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';
import { hp, wp } from '../utils/Utility';
import { API_URL } from '../utils/Constant';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import AnnouncementModal from '../modals/AnnouncementModal';

const inputAccessoryViewID = 'inputAccessoryView1';

class AnnouncementScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            followUp: '',
            followUpHeader: '@Patient_name',
            modalVisible: false,
            spinner: false,
            sectionIndex: 0,
            initialPage: 0,
        };
    }

    addMessage = async (state, value) => {
        this.setState({ [state]: value });
    }

    submitBroadcastMessage = async () => {
        this.setState({ spinner: true });
        const message = this.state.message;

        try {
            let params = { message }
            const res = await API.post(API_URL.DOCTOR_BROADCAST, params);
            if (res) {
                if (res.status == 'Success') {
                    this.setState({ spinner: false, message: '' });
                    setTimeout(() => {
                        Alert.alert('Success', res.message)
                    }, 500);
                }
                else if (res.status == 'Error') {
                    Alert.alert('Required', res.message)
                    this.setState({ spinner: false });
                }
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }

    getFollowUpMessage = async () => {
        try {
            const res = await API.get(API_URL.FOLLOW_UP_MESSAGE)
            const { data } = res;
            if (data.length > 0) {
                if (res.status == 'Success') {
                    this.setState({ followUp: data[0].message_text, /* followUpHeader: data[0].header_text */ })
                }
                else if (res.status == 'Error') {
                    Alert.alert('Error', data.message);
                }
            }

        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }

    setFollowUpMessage = async () => {
        try {
            this.setState({ spinner: true });
            let params = {
                "message": this.state.followUp,
                "header": this.state.followUpHeader
            }
            const res = await API.post(API_URL.FOLLOW_UP_MESSAGE, params)
            this.getFollowUpMessage();
            this.setState({ spinner: false });

        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }

    componentDidMount = () => {
        this.setState({ spinner: true });
        this.getFollowUpMessage();
        this.setState({ spinner: false });
    }

    render() {
        const { message, followUp, modalVisible, spinner, sectionIndex } = this.state;
        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Announcements"}
                    context={this.props}
                    backButton={true}
                    right={null}
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
                    noShadow={true}
                />

                {/* Spinner */}
                <CustomSpinner visible={spinner} />
                <Tabs
                    initialPage={this.state.initialPage}
                    tabBarUnderlineStyle={{ backgroundColor: "#ffffff", paddingHorizontal: 30, height: 2 }}
                    tabContainerStyle={{ elevation: 0 }}
                    page={this.state.sectionIndex}
                    onChangeTab={({ i }) => {
                        this.setState({ sectionIndex: i })
                    }}
                >
                    <Tab
                        textStyle={{ color: colors.white, textTransform: "uppercase", }}
                        heading={
                            <TabHeading style={{ backgroundColor: colors.primary, shadowColor: colors.transparent, shadowOpacity: 0 }}>
                                <Text style={(sectionIndex == 0) ? styles.tabSelectText : styles.tabDefaultText}>Broadcast</Text>
                            </TabHeading>
                        }>
                        <View style={{ flex: 1, width: wp(100) }}>
                            <View style={styles.section}>
                                <Text style={styles.mainHeading}>Message</Text>
                                <TextInput
                                    style={{
                                        fontFamily: Fonts.HelveticaNeue,
                                        fontSize: FontSize('small'),
                                        color: colors.black,
                                        backgroundColor: 'transparent',
                                        textAlignVertical: "top",
                                        padding: 0,
                                        maxHeight: hp(35)
                                    }}
                                    underlineColorAndroid="transparent"
                                    placeholder={"Type here"}
                                    numberOfLines={1}
                                    multiline={true}
                                    onChangeText={(text) => this.addMessage('message', text)}
                                    value={message}
                                    inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                />

                            </View>
                        </View>
                        <View style={{ padding: wp(3), paddingTop: wp(1) }}>
                            <Button onPress={this.submitBroadcastMessage} style={{ height: hp(7), alignSelf: 'center', borderRadius: 5, backgroundColor: colors.btnBgColor }}>
                                <Text style={{ width: '80%', textAlign: 'center', color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase" }}>Submit</Text>
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
                    </Tab>
                    <Tab
                        textStyle={{ color: colors.white, textTransform: "uppercase", }}
                        heading={
                            <TabHeading style={{ backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", }}>
                                <Text style={(sectionIndex == 1) ? styles.tabSelectText : styles.tabDefaultText} >Follow Up</Text>
                            </TabHeading>
                        }
                    >
                        <View style={{ flex: 1, width: wp(100) }}>
                            <View style={styles.section}>
                                <Text style={styles.mainHeading}>Header</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.mainHeading, { fontSize: FontSize('medium') }]}>Dear </Text>
                                    <Text style={{ fontWeight: 'bold', fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), color: colors.primary, paddingBottom: wp(1) }}>{this.state.followUpHeader}</Text>
                                </View>
                            </View>
                            <View style={styles.section}>
                                <Text style={styles.mainHeading}>Message</Text>
                                <TextInput
                                    style={{
                                        fontFamily: Fonts.HelveticaNeue,
                                        fontSize: FontSize('small'),
                                        color: colors.black,
                                        backgroundColor: 'transparent',
                                        textAlignVertical: "top",
                                        padding: 0,
                                        maxHeight: hp(35)
                                    }}
                                    underlineColorAndroid="transparent"
                                    placeholder={"Type here"}
                                    numberOfLines={1}
                                    multiline={true}
                                    onChangeText={(text) => this.addMessage('followUp', text)}
                                    value={followUp}
                                    inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                                />

                            </View>
                            {/* <View style={[styles.section, { borderBottomWidth: 0 }]}>
                                <Text style={{ color: '#ababab', fontFamily: Fonts.HelveticaNeueBold, fontWeight: 'bold' }}>Instructions</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: (3) }}>
                                    <View style={{ width: wp(3), height: wp(3), backgroundColor: '#ababab', borderRadius: 10 }} />
                                    <Text style={{ color: '#ababab', fontFamily: Fonts.HelveticaNeueMedium, paddingLeft: wp(2) }}>Lorem impum or as is it sometimes known, is</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: (3) }}>
                                    <View style={{ width: wp(3), height: wp(3), backgroundColor: '#ababab', borderRadius: 10 }} />
                                    <Text style={{ color: '#ababab', fontFamily: Fonts.HelveticaNeueMedium, paddingLeft: wp(2) }}>Lorem impum or as is it sometimes known, is</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: (3) }}>
                                    <View style={{ width: wp(3), height: wp(3), backgroundColor: '#ababab', borderRadius: 10 }} />
                                    <Text style={{ color: '#ababab', fontFamily: Fonts.HelveticaNeueMedium, paddingLeft: wp(2) }}>Lorem impum or as is it sometimes known, is</Text>
                                </View>
                            </View> */}
                        </View>
                        <View style={{ padding: wp(3), paddingTop: wp(1) }}>
                            <Button onPress={() => this.setState({ modalVisible: true })} style={{ height: hp(7), alignSelf: 'center', borderRadius: 5, backgroundColor: colors.btnBgColor }}>
                                <Text style={{ width: '80%', textAlign: 'center', color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase" }}>Preview</Text>
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
                    </Tab>
                </Tabs>
                <AnnouncementModal visible={modalVisible} header={this.state.followUpHeader} message={this.state.followUp} onPress={this.setFollowUpMessage}
                    onClosePress={(show, refresh = false) => {
                        if (show == false) {
                            this.setState({ modalVisible: show, })
                        }
                    }}
                />
            </Container>
        );
    }
}

export default AnnouncementScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    section: {
        padding: wp(3),
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    mainHeading: {
        fontSize: FontSize('small'),
        fontWeight: 'bold',
        fontFamily: Fonts.HelveticaNeue,
        textTransform: 'capitalize',
        paddingBottom: wp(1)
    },
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
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    heading: {
        color: '#cecece',
        fontSize: wp('5%'),
    },
    tabSelectText: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    tabDefaultText: {
        color: colors.white,
        opacity: 0.8,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        textTransform: "uppercase",
        fontWeight: 'bold'
    },
    chatBackground: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
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
    btn: {
        width: wp(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(13),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
        marginVertical: wp(2)
    },
    btnText: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase'
    },
});
