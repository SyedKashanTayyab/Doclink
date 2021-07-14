import React, { Component, Fragment } from 'react';
import { View, StyleSheet, Image, BackHandler, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import { SafeAreaView } from 'react-navigation';
import NavigationBar from '../components/NavigationBar';
import AppTextInput from '../components/AppTextInput';
import { API_URL, KEYS } from '../utils/Constant';
import API from '../services/API';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import appHelper from '../utils/AppHelper';

class ProfileViewScreen extends Component {
    constructor(props) {
        super(props);
        // GET DATA VIA PROPS
        const { navigation } = this.props;
        const profileData = navigation.getParam('profile', "");
        const skipLastScreen = navigation.getParam('skipLastScreen', false);

        this.state = {
            refreshing: false,
            userId: profileData.user_id,
            userData: "",
            skipLastScreen: skipLastScreen,
        };

        // GET USER PROFILE DATA
        this.getUserProfileData();

    }

    componentDidMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    }

    componentWillUnmount = () => {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    }

    handleBackButton = () => {
        // console.log("Back button is pressed")
        const { skipLastScreen } = this.state;
        // console.log("handleBackButton skipLastScreen", skipLastScreen);

        if (skipLastScreen == true)
            this.props.navigation.navigate('Setting')
        else
            this.props.navigation.goBack();
        return true;
    }

    getUserProfileData = async () => {

        const { userId, userData } = this.state;

        const params = {
            user_id: userId,
            role: 'doctor',
        }

        try {
            const data = await API.get(API_URL.PROFILE_USER, params);
            // console.log("===================");
            // console.log("getUserProfileData _getProfile data.data =", data.data);
            // console.log("===================");

            this.setState({ userData: data.data, });

            // // this.setState({ loading: false });

        } catch (error) {
            alert(error)
            // this.setState({ loading: false });
        }

    }

    goToChatScreen = async (doctor_id) => {
        console.log(doctor_id)
        let current_user_data = await appHelper.getData("user_data");
        console.log(current_user_data.id)
        let chatroom = ChatRoomModel.find_chatroom(doctor_id, parseInt(current_user_data.id))
        console.log(chatroom)

        if (chatroom.length > 0) {
            this.props.navigation.navigate('Chat', { chatroom: chatroom[0] })
        }
    }

    render() {

        const { userData, skipLastScreen } = this.state;

        // console.log("render() skipLastScreen", skipLastScreen);
        // console.log("render() this.state.userData", userData);

        let package_price = "";
        let specialization = "";
        let user_avatar = userData.avatar != undefined ? userData.avatar : global.BASE_URL_IMAGE + "dummy.png";
        // userData.packages != undefined && userData.packages.length > 0 ? userData.packages.map((item) => (package_price = item.price)) : (package_price = 200);
        userData.specializations != undefined && userData.specializations.length > 0 ? userData.specializations.map((item) => (specialization = item.specialization_name)) : specialization = "Family Physician"

        let name = (parseInt(userData.role) == 0)
            ? (userData.name == undefined) ? "" : userData.name
            : (userData.name == undefined) ? "" : `${userData.title} ${userData.name}`

        // console.log("===============================");
        // console.log("package_price", package_price);
        // console.log("specialization", specialization);
        // console.log("render() userData.avatar", user_avatar);

        const { navigation } = this.props;
        const route = navigation.getParam('route', "");

        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar
                        title={"Profile"}
                        context={this.props}
                        backButton={true}
                        onBackButtonPress={() => {
                            if (skipLastScreen == true)
                                this.props.navigation.navigate('Setting')
                            else
                                this.props.navigation.goBack();
                        }}
                        // removeBackButton={false}
                        right={null}
                        transparent={Platform.OS === 'ios' ? true : false}
                        noShadow={true}
                    />
                    {/* NAVIGATION HEADER END*/}

                    {/* PERSON AVATAR BLOCK */}
                    <View style={[{ backgroundColor: colors.primary, width: wp(100), height: hp(39 / 2 / 2), alignItems: "center", }]}>
                        <View style={[GlobalStyles.imageContainer, { width: wp(35), height: wp(35), borderRadius: wp(35) / 2, borderColor: colors.white, marginTop: hp(1), }]}>
                            <Image style={[GlobalStyles.imgCover,]} source={{ uri: user_avatar, }} />
                        </View>
                    </View>
                    {/* PERSON AVATAR BLOCK END */}

                    {/* EMPTY SPACE */}
                    <View style={{ paddingVertical: hp(6), }}></View>

                    {/* <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }}> */}
                    <ScrollView style={{
                        backgroundColor: colors.white,
                        width: "100%",
                    }}
                        enabled={false}
                    >

                        {/* MAIN CONTENT SECTION */}
                        <View style={{
                            flex: 1,
                            // marginTop: hp(1.8),
                            marginHorizontal: hp(1.8),
                            backgroundColor: colors.transparent,
                        }}>
                            {
                                (parseInt(userData.role) == 2 && route == 'home_patient')
                                    ? <View style={{ height: hp(5.2), backgroundColor: colors.transparent, flexDirection: 'row', flex: 1, justifyContent: 'center', paddingRight: wp(0), borderTopWidth: 0, borderColor: colors.white }} >
                                        <View style={{ width: 'auto', backgroundColor: colors.btnBgColor, borderRadius: wp(1.5), paddingHorizontal: wp(3), marginVertical: wp(1.5) }}>
                                            <TouchableOpacity
                                                style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
                                                onPress={() => {
                                                    this.goToChatScreen(parseInt(userData.id))
                                                }}>
                                                <Text style={{ fontFamily: Fonts.HelveticaNeueBold, fontSize: FontSize('small'), color: colors.white, textAlign: 'center', textTransform: 'uppercase' }}>START chat</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    : null
                            }
                            <AppTextInput
                                mode={"icon-label-view"}
                                label={"Name"}
                                value={name}
                                icon={require('../assets/icons/name_gray_icon.png')}
                            />

                            {(parseInt(userData.role) == 0) ?
                                <AppTextInput
                                    mode={"icon-label-view"}
                                    label={"MR. No"}
                                    value={userData.mrn}
                                    icon={require('../assets/icons/status_gray_icon.png')}
                                />
                                :
                                null
                            }

                            {(parseInt(userData.role) == 2) ?
                                <AppTextInput
                                    mode={"icon-label-view"}
                                    label={"Status"}
                                    value={(userData.status_text == null) ? "Hello, I am now available on DocLink" : userData.status_text}
                                    icon={require('../assets/icons/status_gray_icon.png')}
                                />
                                :
                                null
                            }

                            {(parseInt(userData.role) == 2) ?
                                <AppTextInput
                                    mode={"icon-label-view"}
                                    label={"Specialization"}
                                    value={specialization}
                                    icon={require('../assets/icons/specialization_gray_icon.png')}
                                />
                                :
                                null
                            }

                            {/* LIST OF CHARGES HEADING */}
                            {
                                userData.packages != undefined && userData.packages.length > 0 ?
                                    <View style={{ paddingLeft: wp(0), paddingTop: wp(5) }}>
                                        <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: colors.heading, textTransform: 'uppercase' }]}>charges</Text>
                                    </View>
                                    :
                                    null
                            }


                            {/* LIST OF CHARGES */}
                            <View style={styles.listContainer}>
                                <FlatList
                                    style={{ flex: 1, }}
                                    data={userData.packages}
                                    keyExtractor={(item) => item.id + item.package_id}
                                    renderItem={({ item }) =>
                                        (parseInt(userData.role) == 2) ?
                                            (item.price != "") ?
                                                <AppTextInput
                                                    mode={"icon-label-row-view"}
                                                    label={item.name}
                                                    value={"PKR " + item.price}
                                                    icon={
                                                        item.package_key == KEYS.CHARGES ?
                                                            require('../assets/icons/phone_new_icon.png')
                                                            :
                                                            item.package_key == KEYS.PAY_PER_INTERACTION ?
                                                                require('../assets/icons/conversation.png')
                                                                :
                                                                null
                                                    }
                                                />
                                                :
                                                null
                                            :
                                            null
                                    }
                                    ItemSeparatorComponent={() => <View style={[styles.seperator,]}></View>}
                                    refreshing={this.state.refreshing}
                                />
                            </View>

                            {
                                (parseInt(userData.role) == 2)
                                    ?
                                    <>
                                        <View style={{ paddingLeft: wp(0), paddingTop: wp(5) }}>
                                            <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('xMini'), color: colors.heading, textTransform: 'uppercase' }]}>schedule</Text>
                                        </View>


                                        <View style={styles.listContainer}>
                                            <FlatList
                                                data={userData.schedules}
                                                keyExtractor={(item) => item.id + item.package_id}
                                                renderItem={({ item }) => {
                                                    return (
                                                        // TEXT INPUT LABEL ROW VIEW
                                                        <View style={{ flexDirection: "row", justifyContent: 'center', }}>
                                                            <View style={[{ justifyContent: "center", width: wp(13), paddingLeft: wp(0), }]}>
                                                                <Image source={require('../assets/icons/schedule-icon.png')} resizeMode='contain' style={{ width: wp(6), height: wp(6), }} />
                                                            </View>
                                                            <View style={[{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: 'center', paddingVertical: hp(1.5), borderBottomColor: colors.strokeColor4, borderBottomWidth: 1, }]}>
                                                                <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, maxWidth: wp(35), paddingRight: wp(2), }]} numberOfLines={2} >{item.place_name}</Text>
                                                                <View style={[{ flexDirection: "column", justifyContent: "flex-end", maxWidth: wp(45), }]}>
                                                                    <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, textAlign: 'right' }]}>{item.days_text.join(", ")}</Text>
                                                                    <Text style={[{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small'), color: colors.black, textAlign: 'right' }]}>{item.start_time_text} to {item.end_time_text}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    )
                                                }}
                                                ItemSeparatorComponent={() => <View style={[styles.seperator,]}></View>}
                                                refreshing={this.state.refreshing}
                                                ListEmptyComponent={
                                                    <View style={{ marginTop: 10 }}>
                                                        <Text style={{ textAlign: 'center', color: '#999999' }}>No schedule found</Text>
                                                    </View>
                                                }
                                            />
                                        </View>
                                    </>
                                    : null
                            }
                        </View>
                    </ScrollView>
                    {/* </KeyboardAwareScrollView> */}
                </SafeAreaView>
            </Container >
        );
    }
}

export default ProfileViewScreen;

const styles = StyleSheet.create({
    listContainer: {
        padding: 0,
    },


});