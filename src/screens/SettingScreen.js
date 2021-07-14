import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Image, Linking, ScrollView } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import { SafeAreaView } from 'react-navigation';

import NavigationBar from '../components/NavigationBar';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import colors from '../utils/Colors';
import Share from 'react-native-share';
import { isAndroid, isIOS, isDoctor, isPatient, API_URL, APP_STORE_URL } from '../utils/Constant';
import API from '../services/API';

const settingPatientLinks = [
    {
        routeLabel: "Home",
        routeLink: "Home",
        routeIcon: require("../assets/icons/home_icon.png"),
    },
    {
        routeLabel: "My Profile",
        routeLink: "ProfileEdit",
        routeIcon: require("../assets/icons/my_profile_icon.png"),
    },
    {
        routeLabel: "Wallet",
        routeLink: "Wallet",
        routeIcon: require("../assets/icons/wallet_icon.png"),
    },
    {
        routeLabel: "Connect With Doctor",
        routeLink: "SearchDoctor",
        routeIcon: require("../assets/icons/connect_with_doctor.png"),
    },
    {
        routeLabel: "Invite Your Doctor",
        routeLink: "InviteYourDoctor",
        routeIcon: require("../assets/icons/invite_doctor_icon.png"),
    },
    {
        routeLabel: "Invite Your Friends",
        routeLink: "InviteYourFriend",
        routeIcon: require("../assets/icons/invitation_icon.png"),
    },
    {
        routeLabel: "Notifications",
        routeLink: "PatientNotification",
        routeIcon: require("../assets/icons/notification.png"),
    },
    {
        routeLabel: "Medical Records",
        routeLink: "MedicalRecords",
        routeIcon: require("../assets/icons/medical_records.png"),
    },
    {
        routeLabel: "Reminders",
        routeLink: "Reminder",
        routeIcon: require("../assets/icons/reminder.png"),
    },
    {
        routeLabel: "For Support",
        routeLink: "ForSupport",
        routeIcon: require("../assets/icons/support_icon.png"),
    },
    {
        routeLabel: "Help",
        routeLink: "Help",
        routeIcon: require("../assets/icons/help_icon.png"),
    }
]

const settingDoctorLinks = [
    {
        routeLabel: "Home",
        routeLink: "Home",
        routeIcon: require("../assets/icons/home_icon.png"),
    },
    {
        routeLabel: "My Profile",
        routeLink: "ProfileEdit",
        routeIcon: require("../assets/icons/my_profile_icon.png"),
    },
    {
        routeLabel: "Payments",
        routeLink: "Payment",
        routeIcon: require("../assets/icons/wallet_icon.png"),
    },
    {
        routeLabel: "Connect With Patient",
        routeLink: "ConnectPatient",
        routeIcon: require("../assets/icons/connect_patient_gray_icon.png"),
    },
    {
        routeLabel: "Reminder",
        routeLink: "Reminder",
        routeIcon: require("../assets/icons/reminder.png"),
    },
    {
        routeLabel: "Announcements",
        routeLink: "Announcements",
        routeIcon: require("../assets/icons/broadcast.png"),
    },
    {
        routeLabel: "Help",
        routeLink: "Help",
        routeIcon: require("../assets/icons/help_icon.png"),
    },
]


class SettingScreen extends Component {
    constructor(props) {
        super(props);

        let settingNavLinks = global.target == "patient" ? settingPatientLinks : settingDoctorLinks;

        this.state = {
            avatar: "",
            name: "",
            status: "",
            settingLinks: settingNavLinks,
            status_text: ""
        };
        this.props.navigation.addListener('willFocus', async () => {
            this.updateProfile();
        })
    }

    componentDidMount = () => {
        this.updateProfile();

    }

    updateProfile = () => {
        const userData = global.user_data;

        if (global.target == "patient") {
            this.setState({
                avatar: userData.avatar,
                name: userData.name,
            })
        } else {
            this.setState({
                avatar: userData.avatar,
                name: `Dr. ${userData.name}`,
                status_text: userData.status_text ? userData.status_text : "Hello, I am now available on DocLink",
            });
        }

    }


    handleInviteYourFriend = () => {
        let inviteLink = "";
        if (isAndroid) {
            if (isPatient)
                inviteLink = APP_STORE_URL.ANDROID_PATIENT
            if (isDoctor)
                inviteLink = APP_STORE_URL.ANDROID_DOCTOR
        }
        if (isIOS) {
            if (isPatient)
                inviteLink = APP_STORE_URL.IOS_PATIENT
            if (isDoctor)
                inviteLink = APP_STORE_URL.IOS_DOCTOR;
        }
        // message: `Hello, I am now using DocLink to connect with my doctor remotely in case I want to ask them something. You should also try it out! ${inviteLink}`,
        const shareOptions = {
            title: 'Invite Your Friends',
            message: `Hello, I am now using DocLink to stay in touch with my Doctor. You should also try it out! ${inviteLink}`,
        };
        Share.open(shareOptions)
    }

    handleSupport = async () => {
        console.log("handle support fired");

        try {
            let res = await API.get(API_URL.SETTING_CSR_NUMBER)
            console.log("handleSupport", res)
            if (res) {
                const data = res
                if (data.status == "Success") {
                    ;
                    Linking.openURL(`tel:${data.data[0].data}`);
                }
            }
        } catch (error) {
            console.warn('ERROR ON HANDLE SUPPORT', error);
            this.setState({ spinner: false });
        }


    }

    render() {
        const { avatar, name, settingLinks, status_text } = this.state;

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Settings"}
                    context={this.props}
                    // removeBackButton={false}
                    onBackButtonPress={() => this.props.navigation.navigate('Home')}
                    backButton={true}
                    right={null}
                    noShadow={true}
                    transparent={Platform.OS === 'ios' ? true : false}
                />
                {/* NAVIGATION HEADER END*/}
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>

                    {/* MAIN CONTENT SECTION */}
                    <ScrollView style={{
                        flex: 1,
                        marginTop: hp(0),
                        paddingHorizontal: hp(1.8),
                        backgroundColor: colors.transparent,
                    }}>

                        {/* PERSON INFO CARD */}
                        <View style={{ marginBottom: hp(0), height: hp(12), marginTop: hp(0), }}>
                            {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('ProfileView')} style={{ flexDirection: 'row', width:"100%", }}> */}
                            <View style={[{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.strokeColor4, paddingBottom: hp(0), }]}>
                                <View style={[GlobalStyles.imageContainer, { marginRight: 10, }]}>
                                    <Image style={[GlobalStyles.imgCover,]} source={{ uri: avatar, }} />
                                </View>
                                <View style={{ alignItems: 'flex-start', flexDirection: 'column', justifyContent: 'center', paddingVertical: hp(2), height: "100%", flex: 1, }}>
                                    <Text ellipsizeMode="tail" numberOfLines={1} style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('large'), color: '#3f3f3f', }}>
                                        {name}
                                    </Text>
                                    {
                                        global.target != "patient"
                                            ? (status_text != "")
                                                ? <Text ellipsizeMode="tail" numberOfLines={0} style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: '#000000' }}>
                                                    {status_text}
                                                </Text>
                                                : null
                                            : null
                                    }
                                </View>
                            </View>
                            {/* </TouchableOpacity> */}
                        </View>

                        {/* Links LISTING HERE */}
                        {
                            settingLinks.map((route, i) => {
                                return (
                                    <TouchableWithoutFeedback onPress={
                                        () => {
                                            if (route.routeLink == "ForSupport") {
                                                this.handleSupport()
                                            } else if (route.routeLink == "InviteYourFriend") {
                                                this.handleInviteYourFriend()
                                            } else {
                                                this.props.navigation.navigate(route.routeLink)
                                            }
                                        }
                                    }
                                        key={i}
                                    >
                                        <View style={[GlobalStyles.alignCenter, { flexDirection: "row", width: "100%", }]}>
                                            <View style={[{ height: hp(6), width: hp(6), paddingHorizontal: wp(3), }]}>
                                                <Image source={route.routeIcon} style={[GlobalStyles.imgContain, {}]} />
                                            </View>
                                            {/* <View style={[{ flexDirection: "row", justifyContent: "space-between", backgroundColor: colors.transparent, paddingVertical: hp(3), paddingLeft: wp(2), borderBottomColor: colors.strokeColor4, borderBottomWidth: 1, }]}> */}
                                            <View style={[{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                backgroundColor: colors.transparent,
                                                height: hp(8),
                                                paddingLeft: wp(2),
                                                borderBottomColor: colors.strokeColor4,
                                                borderBottomWidth: 1,
                                                flex: 1,
                                            }]}>
                                                <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayThree, }]}>{route.routeLabel}</Text>
                                                {
                                                    (route.routeLink == "ForSupport") ?
                                                        <TouchableWithoutFeedback onPress={() => this.handleSupport()}>
                                                            <Image source={require("../assets/icons/call-icon.png")} style={[{ height: hp(6), width: hp(6), paddingHorizontal: wp(3), }]} />
                                                        </TouchableWithoutFeedback>
                                                        : null
                                                }
                                            </View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                )
                            })
                        }

                        {/* SUPPORT BUTTON */}
                        {
                            // isPatient &&
                            // <>
                            //     <View style={[{ flexDirection: "row", width: "100%", alignItems: "center", }]}>
                            //         <View style={[{ height: hp(6), width: hp(6), paddingHorizontal: wp(3), }]}>
                            //             <Image source={require('../assets/icons/support_icon.png')} style={[GlobalStyles.imgContain, {}]} />
                            //         </View>
                            //         <View style={[{
                            //             flexDirection: "row",
                            //             justifyContent: "space-between",
                            //             alignItems: "center",
                            //             backgroundColor: colors.transparent,
                            //             paddingVertical: hp(1),
                            //             paddingLeft: wp(2),
                            //             borderBottomColor: colors.strokeColor4,
                            //             borderBottomWidth: 1,
                            //             flex: 1,
                            //         }]}>
                            //             <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.grayThree, }]}>For Support</Text>
                            //             <TouchableWithoutFeedback onPress={() => this.handleSupport()}>
                            //                 <Image source={require("../assets/icons/call-icon.png")} style={[{ height: hp(6), width: hp(6), paddingHorizontal: wp(3), }]} />
                            //             </TouchableWithoutFeedback>
                            //         </View>
                            //     </View>
                            // </>
                        }
                    </ScrollView>
                </SafeAreaView>
            </Container >
        );
    }
}

export default SettingScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    settingView: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#bababa40'
    },
    settingInnerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
});
