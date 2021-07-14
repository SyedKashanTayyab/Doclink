import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image, Alert } from 'react-native';
import { Container, Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Fonts } from '../utils/Fonts';
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import GlobalStyles from '../styles/GlobalStyles';
import { SafeAreaView } from 'react-navigation';
import appHelper, { CustomSpinner } from '../utils/AppHelper';

import API from '../services/API';
import { API_URL } from '../utils/Constant';
import AppSearch from '../components/AppSearch';
import ListItem from '../components/ListItem';
import ViewProfilePopup from '../components/ViewProfilePopup';
import { ConnectDoctor } from '../api/Profile';
import ChatRoomModel from '../schemas/models/ChatRoomModel';
import AppButton from '../components/AppButton';

function SearchScreen(props) {
    const [refreshing, setRefreshing] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchFailed, setSearchFailed] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchedDoctorList, setSearchedDoctorList] = useState([]);
    const [searchCount, setSearchCount] = useState(0);
    const [profileData, setProfileData] = useState({});

    const handleDoctorSearch = async (value) => {
        try {
            setSearchValue(value);
            if (!value) {
                setSearchedDoctorList([]);
                setSearchCount(0);
                setRefreshing(!refreshing);
            }
            else {
                // FIND DOCTOR
                const params = {
                    keyword: value,
                    type: "name",
                }
                let res = await API.get(API_URL.DOCTOR_SEARCH, params);
                if (res) {
                    const data = await res
                    if (res.status == "Success") {
                        setSearchedDoctorList(data.data);
                        setSearchCount(data.count);
                        setRefreshing(!refreshing);

                        setTimeout(() => {
                            // CHECK OF SEARCH COUNT IS ZERO
                            if (data.count === 0) setSearchFailed(true);
                        }, 600);
                    }
                }
            }
        } catch (error) {
            Alert.alert('Error', error);
        }

    }

    const showDoctorProfile = async (item) => {
        // SHOW POPUP
        setModalVisible(true);
        setProfileData(item);
    }

    const handleConnectWithDoctor = async () => {

        // CLOSE POPUP
        closePopup();

        setSpinner(true);
        const user_id = await appHelper.getItem("user_id");

        let params = {
            "doctor_id": profileData.id,
            user_id: user_id,
        }
        try {
            const res = await API.post(API_URL.DOCTOR_CONNECT, params);
            if (res) {

                setSpinner(false);

                const { data, status, message } = res;
                console.log(status, data, res)
                if (status == 'Success') {
                    var object = data
                    // Create new object
                    let newObject = ChatRoomModel.createOrUpdate(object)

                    setTimeout(() => {
                        // Navigate
                        navigation.navigate('Chat', { chatroom: newObject })
                    }, 500);
                }
                else if (status == 'Error') {
                    setTimeout(() => {
                        Alert.alert('', message);
                    }, 150);
                }
            }
        }
        catch (error) {
            console.log("Search SCreen 113", error)
            setSpinner(false);
            setTimeout(() => {
                Alert.alert('Alert', error);
            }, 150);
        }
    }

    const closePopup = () => {
        setModalVisible(false);
    }


    return (
        <Container>
            <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    context={props}
                    title={"Connect with Doctor"}
                    // onBackButtonPress={() => props.navigation.navigate('Setting')}
                    backButton={true}
                    onBackButtonPress={() => {
                        const { navigation } = props;
                        let route = navigation.getParam('route', null)
                        if (route != null) {
                            props.navigation.navigate(route)
                        } else {
                            props.navigation.goBack()
                        }
                    }}
                    right={null}
                    transparent={false}
                    noShadow={true}
                />
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />


                {/* MAIN CONTENT SECTION */}
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} extraScrollHeight={75}>
                    <ScrollView
                        style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}
                    >
                        <View style={{
                            flex: 1,
                            marginTop: hp(0.5),
                            marginHorizontal: hp(1.8),
                            backgroundColor: colors.transparent,
                        }}>
                            <View style={{ marginTop: hp(1), }}>
                                <AppSearch
                                    onChangeText={handleDoctorSearch}
                                    value={searchValue}
                                    placeholder="Search"
                                    icon={true}
                                    maxLength={50}
                                />
                            </View>

                            {!searchedDoctorList.length ?
                                null
                                :
                                <View style={[GlobalStyles.borderBottomGray,]}>
                                    <Text style={[styles.searchText,]}>{searchCount} Search result for <Text style={{ color: colors.primaryText }}>{searchValue}</Text></Text>
                                </View>
                            }

                            {/* LIST OF SEARCHED DOCTORS */}
                            <View style={styles.listContainer}>
                                <FlatList
                                    data={searchedDoctorList}
                                    keyExtractor={(item) => item.id + appHelper.getRandomString(5)}
                                    renderItem={({ item }) =>
                                        <>
                                            <ListItem
                                                image={item.avatar}
                                                icon={require("../assets/icons/add_doctor_icon.png")}
                                                title={item.title + " " + item.name}
                                                subTitle={item.specialization_name}
                                                onPress={() => showDoctorProfile(item)}
                                            />
                                        </>
                                    }
                                    ItemSeparatorComponent={() => <View style={[styles.seperator,]}></View>}
                                    refreshing={refreshing}
                                />
                            </View>
                            {searchedDoctorList.length ?
                                null
                                :
                                !searchFailed ?
                                    <View style={[{ height: hp(84), alignItems: "center", justifyContent: "center", paddingVertical: hp(2), }]}>
                                        <Image style={styles.searchIcon} source={require("../assets/icons/loupe-icon.png")} />
                                        <Text style={[styles.noFoundText]}>Search your doctor</Text>
                                    </View>
                                    :
                                    <View style={{ height: hp(84), alignItems: "center", justifyContent: "center", paddingVertical: hp(2), }}>
                                        <Image style={styles.searchIcon} source={require("../assets/icons/loupe-icon.png")} />
                                        <Text style={[styles.noFoundText, { fontSize: FontSize("small"), }]}>Sorry, we could not find your doctor {'\n'} in our records. Please try another method.</Text>
                                        <AppButton
                                            onPressButton={() => props.navigation.navigate("ConnectDoctor")}
                                            styles={{ marginTop: hp(0.5), }}
                                            title={"Try referral code"}
                                        ></AppButton>
                                    </View>
                            }

                            {/* VIEW PROFILE POPUP */}
                            {modalVisible &&
                                <ViewProfilePopup
                                    profileData={profileData}
                                    showPopup={modalVisible}
                                    onPressYes={handleConnectWithDoctor}
                                    onPressNo={closePopup}
                                />
                            }

                        </View>
                    </ScrollView>
                </KeyboardAwareScrollView>

            </SafeAreaView>
        </Container>
    );
}

const styles = StyleSheet.create({
    /* Header Styles */
    searchText: {
        fontSize: FontSize("medium"),
        fontFamily: Fonts.HelveticaNeueLight,
        color: colors.grayFive,
        paddingVertical: hp(1.5),
    },
    noFoundText: {
        fontSize: FontSize("medium"),
        fontFamily: Fonts.HelveticaNeueLight,
        color: colors.grayFive,
        paddingVertical: hp(1.5),
        textAlign: "center",
    },
    icon: {
        width: 50, height: 50,
    },
    seperator: {
        width: "100%",
        height: 1,
        backgroundColor: colors.borderColor,
    },
    listContainer: {
        padding: 0,
    },
    searchIcon: {
        width: 100,
        height: 100,
    }
});
export default SearchScreen;