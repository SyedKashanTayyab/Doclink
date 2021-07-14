import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, Image, Text, TouchableWithoutFeedback, Alert, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Container, Icon, Picker } from 'native-base';
import { ActivityIndicator, Checkbox, TextInput, Button } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Fonts, BaseUrl } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { EditProfile, getDoctorSpecialization, getSpecializationList } from '../api/Doctor';

import ImagePicker from 'react-native-image-picker'
var RNFS = require('react-native-fs');

const defaultOptions = {
    title: 'Choose Option',
    customButtons: [],
    cancelButtonTitle: 'Cancel',
    takePhotoButtonTitle: 'Take Photo',
    chooseFromLibraryButtonTitle: "Choose from Library",
    // storageOptions: {
    //     skipBackup: false,
    //     path: 'media',
    // },
    maxWidth: 800,
    maxHeight: 600,
    quality: 1,
    allowsEditing: true
};


class EditDoctorProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            checked: false,
            name: global.user_data.name,
            email: global.user_data.email,
            phone: global.user_data.phone,
            avatar: global.user_data.avatar,
            // gender: global.user_data.gender,
            speciality: global.user_data.specialization_id,
            options: [],
            speciality_name: "",
            arraySpecialization: [],
            selectedSpecializations: '',
        };
    }

    async componentDidMount() {
        // this.setState({ spinner: true });
        await this.makeRemoteRequest();
        // await this.getDoctorSpeciality();
        // this.setState({ spinner: false });
        // this._getSpecializationsList()
    }

    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        var params = { access_token: access_token }
        const user_id = await appHelper.getItem("user_id");
        try {
            const res = await getSpecializationList(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    this.setState({ options: data.data });
                }
                else if (data.status == 'Error') {
                    appHelper.toastMsg(data.message);
                }
            }
        }
        catch (error) {
            // console.log(error);
            alert(error)
            appHelper.toastMsg(error);
        }
    }

    getDoctorSpeciality = async () => {
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        var params = { access_token: access_token, user_id: user_id }
        try {
            const res = await getDoctorSpecialization(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    if (data.data[0] !== undefined) {
                        this.setState({ speciality: data.data[0].id, speciality_name: data.data[0].name });
                    }
                }
                else if (data.status == 'Error') {
                    Alert.alert('Required', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    updateValue(text, field) {
        if (field == 'name') {
            this.setState({ name: text })
        }
        if (field == 'email') {
            this.setState({ email: text })
        }
        if (field == 'phone') {
            this.setState({ phone: text })
        }
    }

    onHandleChange(value) {
        this.setState({
            speciality: value
        });
    }

    _emptyState() {
        this.setState({
            name: '',
            email: '',
            avatar: '',
        })
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

    //Register API Function
    _onsubmit = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        let params = {
            name: this.state.name,
            email: this.state.email,
            specialty: this.state.speciality,
            user_id: user_id,
            access_token: access_token,
        }

        if (this.state.selectedPhoto != null) {
            const photoData = await RNFS.readFile(this.state.selectedPhoto.uri, 'base64')
            params['avatar'] = photoData
        }

        console.warn(params)
        try {
            const res = await EditProfile(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    console.warn(data.data)
                    // await this.getDoctorSpeciality()
                    const auth_user = {
                        name: data.data.name,
                        email: data.data.email,
                        avatar: data.data.avatar,
                        phone: this.state.phone,
                        specialization_id: this.state.speciality,
                    };

                    await appHelper.setData("user_data", auth_user);
                    global.user_data = auth_user;
                    Alert.alert('', data.message);
                    //redirect to Edit Doctor Profile
                    this._resetStack('EditDoctorProfile');
                    this.props.navigation.navigate('DoctorSectionProfile');
                    this.setState({ spinner: false });
                }
                else if (data.status == 'Error') {
                    Alert.alert('Required', data.message);
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            console.warn('', error);
            this.setState({ spinner: false });
        }
    }

    // Show Image picker control where user can capture photo from camera or select from photo gallery
    async _showImagePicker() {

        ImagePicker.showImagePicker(defaultOptions, (response) => {
            // console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                console.warn('111')
                // const source = { uri: response.uri };
                // this.setState({
                //     avatar: response.uri,
                // });
                // const source = { uri: response.uri };
                // var path = RNFS.DocumentDirectoryPath + '/media/';
                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                // console.warn(response)
                this.setState({ selectedPhoto: response })
            }
        });
    }

    render() {
        const { checked, options } = this.state;

        return (
            <View style={{ flex: 1 }}>
                <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.OS === "ios" ? "padding" : null} enabled>
                    <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                        <View style={styles.headerView}>
                            <Icon onPress={() => this.props.navigation.navigate('DoctorSectionProfile')} name='arrow-back' style={styles.headerIcon} />
                            <Text style={styles.headerTitle}>Edit Profile</Text>
                        </View>
                    </ImageBackground>

                    {/* Spinner */}
                    <CustomSpinner visible={this.state.spinner} />

                    <View style={{ flex: 1, alignItems: 'center', marginTop: wp('5%') }}>
                        {/* Profile photo */}
                        <View style={styles.imageContainer}>
                            {/* <Image style={styles.profileImage} source={{ uri: user.image }} /> */}
                            <TouchableOpacity onPress={() => {
                                this._showImagePicker()
                            }}>
                                <Image
                                    style={{
                                        paddingVertical: 30,
                                        width: wp('30%'),
                                        height: wp('30%'),
                                        borderRadius: wp('14%')
                                    }}
                                    resizeMode='cover'
                                    source={{
                                        uri: (this.state.selectedPhoto != null) ? this.state.selectedPhoto.uri : (this.state.avatar) ? this.state.avatar : BaseUrl.url + 'images/image-not-found.png'
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 20, width: "100%", alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => {
                                this._showImagePicker()
                            }}>
                                <Text style={{ color: '#1994fb' }}>Change Image</Text>
                            </TouchableOpacity>
                        </View>

                        <KeyboardAwareScrollView>
                            <View style={{ marginTop: wp('5%') }}>

                                <TextInput
                                    mode='outlined'
                                    underlineColorAndroid={'rgba(0,0,0,0)'}
                                    label='Full Name*'
                                    value={this.state.name}
                                    onChangeText={name => this.setState({ name })}
                                    style={{ width: wp('80%'), alignSelf: 'center', marginTop: 10 }}
                                />

                                <TextInput
                                    mode='outlined'
                                    underlineColorAndroid={'rgba(0,0,0,0)'}
                                    label='Email Address*'
                                    value={this.state.email}
                                    keyboardType='email-address'
                                    onChangeText={email => this.setState({ email })}
                                    style={{ width: wp('80%'), alignSelf: 'center', marginTop: 10 }}
                                />

                                {/* <View style={{ marginTop:20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                                            <Picker
                                                mode="dropdown"
                                                iosIcon={<Icon name="arrow-down" />}
                                                placeholder="Gender"
                                                placeholderStyle={{ color: "#bfc6ea" }}
                                                placeholderIconColor="#007aff"
                                                style={{ color: '#000', width: undefined }}
                                                selectedValue={this.state.gender}
                                                onValueChange={this.onValueChange.bind(this)}
                                            >
                                                <Picker.Item label='Gender' value='' key='' />
                                                <Picker.Item label='Male' value='Male' key='Male' />
                                                <Picker.Item label='Female' value='Female' key='Female' />
                                            </Picker>
                                        </View> */}

                                {/* <View style={{ marginTop: 20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                                    <Picker
                                        mode="dropdown"
                                        iosIcon={<Icon name="arrow-down" />}
                                        placeholder="Speciality"
                                        placeholderStyle={{ color: "#bfc6ea" }}
                                        placeholderIconColor="#007aff"
                                        style={{ color: '#000', width: undefined }}
                                        selectedValue={this.state.speciality}
                                        onValueChange={this.onHandleChange.bind(this)}

                                    >
                                        <Picker.Item label='Speciality' value='' key='' />
                                        {options.map((item, index) => {
                                            return (<Picker.Item label={item.name} value={item.id} key={index} />)
                                        })}
                                                })}
                                        })}
                                    </Picker>
                                </View> */}


                                <View style={{ marginTop: 20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
                                    <Picker
                                        mode="dropdown"
                                        iosIcon={<Icon name="arrow-down" />}
                                        placeholder="Specializations"
                                        placeholderStyle={{ color: "#bfc6ea" }}
                                        placeholderIconColor="#007aff"
                                        style={{ color: '#000', width: undefined }}
                                        selectedValue={this.state.speciality}
                                        onValueChange={this.onHandleChange.bind(this)}
                                    >
                                        {
                                            options.map(item => {
                                                return (
                                                    <Picker.Item label={item.name} value={item.id} key={item.id} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </View>

                                <Button
                                    mode="contained"
                                    style={{ height: hp('7%'), width: wp('80%'), marginTop: 20, marginBottom: 20, alignSelf: 'center', justifyContent: 'center', borderRadius: wp('2%') / 2, }}
                                    onPress={() => {
                                        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                                        if (this.state.name == '') {
                                            Alert.alert('', 'Name is required');
                                            return false;
                                        }
                                        if (this.state.email == '') {
                                            Alert.alert('', 'Email is required');
                                            return false;
                                        }
                                        // if (this.state.gender == '') {
                                        //     Alert.alert('','Gender is required');
                                        //     return false;
                                        // }
                                        else if (reg.test(this.state.email) === false) {
                                            Alert.alert('', "Invalid Email");
                                            return false;
                                        }


                                        this._onsubmit();
                                    }}
                                >
                                    Submit
                                        </Button>
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }
}

export default EditDoctorProfileScreen;

const styles = StyleSheet.create({

    /* Header Styles */
    headerBackground: {
        backgroundColor: '#456123',
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
    spinnerTextStyle: {
        color: '#fff'
    },
    imageBackground: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flex: 45,
    },
    logoImage: {
        width: wp('100%'),
        height: hp('18%'),
        resizeMode: 'contain',
        marginBottom: 10
    },
    signupText: {
        color: '#ffffff',
        top: wp('5%'),
        fontSize: wp('6%')
    },
    headerFont: {
        fontFamily: Fonts.RobotoMedium,
        color: '#fff',
        fontSize: hp('3%')
    },
    imageContainer: {
        width: wp('30%'),
        height: wp('30%'),
        backgroundColor: 'transparent',
        borderRadius: wp('30%') / 2,
        borderWidth: 0,
        borderColor: 'transparent',
        overflow: 'hidden',
        marginBottom: 0,
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});