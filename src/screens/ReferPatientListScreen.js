import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, ScrollView, Alert, RefreshControl, Image, Keyboard, Animated } from 'react-native';
import { Button, Modal, TextInput } from 'react-native-paper';
import { Icon } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import { TextInputMask } from 'react-native-masked-text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getPatientList, ReferPatient } from '../api/Manager';
import SingleRatingStar from '../components/SingleRatingStar';

class ReferPatientListScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            visibleRefer: false,
            data: [],
        };
        this.keyboardHeight = new Animated.Value(0.01);
    }

    componentDidMount() {
        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
    }

    keyboardWillShow = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: event.endCoordinates.height,
            }),
        ]).start();
    };

    keyboardWillHide = (event) => {
        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: 0,
            }),
        ]).start();
    };

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* Get Topup History Dashboard */
    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = { manager_id: user_id, access_token: access_token }
        try {
            const res = await getPatientList(params);
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
            console.warn(error);
        }
    }

    /* Refer Modal Popup */
    _showReferModal = () => this.setState({ visibleRefer: true });
    _hideReferModal = () => this.setState({ visibleRefer: false });

    /* Flat List View */
    _keyExtractor = (item, index) => item.id;
    _renderItem = ({ item }) => (
        <View>
            <View style={{
                borderBottomColor: '#999999',
                borderBottomWidth: 1,
                marginTop: 10
            }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, flexDirection: 'row', margin: wp('3%') }}>
                        <View style={{ marginRight: wp('4%') }}>
                            <View style={styles.imageContainer}>
                                <Image style={styles.profileImage} source={{ uri: item.avatar }} />
                            </View>
                        </View>
                        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('5%'), color: '#3f3f3f', marginBottom: 5, }}>{item.name}</Text>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('3%'), color: '#747474' }}>CONTACT:{item.phone}</Text>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('3%'), color: '#747474' }}>MR #{item.mrn}</Text>
                            <SingleRatingStar
                                // size={}
                                starColor={"#ff9600"}
                                starSize={wp('4%')}
                                rating={item.ratings}
                                ratingStyle={{
                                    color: "#ff9600",
                                    marginLeft: wp("0.5%")
                                }}
                            />
                        </View>
                    </View>

                </View>
            </View>
        </View>
    );

    /* Refer Patient */
    _referPatient = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = {
            access_token: access_token,
            user_id: user_id,
            name: this.state.name,
            phone: this.state.mobile,
        }
        try {
            const res = await ReferPatient(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    Alert.alert('', data.message);
                    this._hideReferModal();
                    this.setState({ name: '', mobile: '' });
                    this.setState({ spinner: false });
                }
                else if (data.status == 'Error') {
                    console.warn('Internal Server Error', data.message);
                    this.setState({ name: '', mobile: '' });
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
            this.setState({ spinner: false });
        }
    }

    render() {
        const { visibleRefer } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.navigate('Home')} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Patients</Text>
                    </View>
                </ImageBackground>

                {/* List */}
                <View style={{ flex: 5, paddingLeft: 10, paddingRight: 10 }}>
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
                                        <Text style={{ color: '#000000', fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), padding: 10 }}>No Data Found</Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>
                </View>
                {/* Footer Buttons */}
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                    <Button mode="contained"
                        style={{ height: hp('6%'), width: wp('40%'), alignSelf: 'center', justifyContent: 'center', borderRadius: wp('2%') / 2, }}
                        onPress={this._showReferModal}
                    >Refer Patient</Button>
                </View>

                {/* Refer Modal */}
                <Modal contentContainerStyle={{ padding: 20 }} visible={visibleRefer} dismissable={false} onDismiss={this._hideReferModal}>
                    <Animated.View style={{ backgroundColor: '#fff', borderRadius: wp('4%') / 2, padding: 20, marginBottom: this.keyboardHeight }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: wp('4%') / 2, padding: 20 }}>
                            <Icon onPress={this._hideReferModal} name='times' type="FontAwesome" style={{ fontSize: wp('5%'), padding: 10, color: '#000', position: 'absolute', right: 0 }} />
                            <Text style={{ fontSize: wp('6%'), fontFamily: Fonts.RobotoRegular, color: '#000' }}>Refer Patient</Text>
                            <View style={{ marginTop: 10, marginBottom: 30 }} >
                                <TextInput
                                    mode='outlined'
                                    underlineColorAndroid={'rgba(0,0,0,0)'}
                                    label='Name'
                                    value={this.state.name}
                                    onChangeText={name => this.setState({ name })}
                                    style={{ marginTop: 20 }}
                                />
                                <TextInput
                                    mode='outlined'
                                    underlineColorAndroid={'rgba(0,0,0,0)'}
                                    label='Phone Number'
                                    value={this.state.mobile}
                                    keyboardType="phone-pad"
                                    onChangeText={mobile => this.setState({ mobile })}
                                    style={{ marginTop: 20 }}
                                    render={props =>
                                        <TextInputMask
                                            {...props}
                                            type={'custom'}
                                            options={{
                                                mask: '99999999999'
                                            }}
                                        />
                                    }
                                />
                            </View>
                            <Button mode="contained"
                                style={{ height: hp('6%'), width: wp('80%'), alignSelf: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    if (this.state.name == 0) {
                                        Alert.alert('', "Name Required");
                                        //alert("Name Required");
                                        return false;
                                    }
                                    if (this.state.mobile == 0) {
                                        Alert.alert('', "Phone Number Required");
                                        //alert("Phone Number Required");
                                        return false;
                                    }

                                    Alert.alert(
                                        '',
                                        'Confirm Refer?',
                                        [
                                            { text: 'Cancel', onPress: () => { return null } },
                                            {
                                                text: 'Confirm',
                                                text: 'Confirm', onPress: () => {
                                                    this._referPatient()
                                                }
                                            },
                                        ],
                                        { cancelable: false }
                                    )

                                }} > Refer </Button>
                        </View>
                    </Animated.View>
                </Modal>
            </View>
        );
    }
}

export default ReferPatientListScreen;

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
    imageContainer: {
        alignItems: 'center',
        width: wp('15%'),
        height: wp('15%'),
        backgroundColor: '#000',
        borderRadius: wp('15%') / 2,
        overflow: 'hidden',
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});