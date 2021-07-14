import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, Image, Text, TouchableWithoutFeedback, Alert } from 'react-native';
import { Container, Icon, Picker } from 'native-base';
import { ActivityIndicator, Checkbox, TextInput, Button } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInputMask } from 'react-native-masked-text';
import { Fonts, BaseUrl } from '../utils/Fonts';
import { Register } from '../api/Authentication';
import { getSpecializationList } from '../api/Doctor';
import DeviceInfo from 'react-native-device-info';
import appHelper, { CustomSpinner } from '../utils/AppHelper'; 
import PhotoUpload from 'react-native-photo-upload';

class CompleteDoctorProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            checked: false,
            name: '',
            email: '',
            phone: '',
            gender: 'Gender',
            specialty:'',
            avatar: '',
            options:[]
        };
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        var params = { access_token: access_token }

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

    onValueChange(value) {
        this.setState({
            gender: value
        });
    }

    onHandleChange(value) {
        this.setState({
            specialty : value
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
    _register = async () => {
        this.setState({ spinner: true });
        let params = {
            "name": this.state.name,
            "email": this.state.email,
            "gender": this.state.gender,
            "specialty": this.state.specialty,
            "avatar": this.state.avatar,
            "device_identifier": await appHelper.getItem('device_identifier'),
            "device_token": DeviceInfo.getUniqueId(),
            "device_type": DeviceInfo.getBrand(),
            "device_name": DeviceInfo.getDeviceName(),
        }
        try {
            const res = await Register(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    // Successfully Registered Message and redirect to login
                    Alert.alert('', 'Thanks! your account has been successfully created.');
                    this.setState({ spinner: false });
                    this.props.navigation.navigate('Login');
                }
                else if (data.status == 'Error') {
                    appHelper.toastMsg(data.message);
                    this.setState({ spinner: false });
                }
            }
        }
        catch (error) {
            appHelper.toastMsg(error);
            this.setState({ spinner: false });
        }
    }

    render() {
        const { checked,options } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <ImageBackground style={styles.imageBackground} source={require('../assets/images/header_background.png')} resizeMode="stretch">
                    <Icon onPress={() => this.props.navigation.goBack(null)} name='arrow-back' style={styles.headerIcon} />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.signupText}>Profile Setup</Text>
                        {/* Profile photo */}
                        <View style={styles.imageContainer}>
                            {/*<Image style={styles.profileImage} source={{ uri: user.image }} />*/}
                            <PhotoUpload
                                onPhotoSelect={avatar => {
                                    if (avatar) {
                                        this.setState({ avatar: avatar })
                                    }
                                }}
                            >
                                <Image
                                    style={{
                                        paddingVertical: 30,
                                        width: 150,
                                        height: 150,
                                        borderRadius: 75
                                    }}
                                    resizeMode='cover'
                                    source={{
                                        uri: (this.state.avatar) ? this.state.avatar : BaseUrl.url + 'images/image-not-found.png'
                                    }}
                                />
                            </PhotoUpload>
                        </View>
                        <Text style={{ color: '#ffffff' }}>Upload Image</Text>
                    </View>

                </ImageBackground>

                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />
                

                <View style={{ flex: 70 }}>
                    <View style={{ marginTop: wp('-10%'), marginRight: wp('5%'), marginLeft: wp('5%'), backgroundColor: '#ffffff', alignItems: 'center', borderRadius: wp('5%') / 2, elevation: 5 }}>
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

                                <View style={{ marginTop:20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
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
                                </View>

                                <View style={{ marginTop:20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777' }}>
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
                                            return (<Picker.Item label={item.name} value={item.id} key={item.id} />)
                                        })} 
                                    </Picker>
                                </View>
                                
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop:10 }}>
                                    <Checkbox
                                        color={'#1994fb'}
                                        status={checked ? 'checked' : 'unchecked'}
                                        onPress={() => { this.setState({ checked: !checked }); }}
                                    />
                                    <Text style={{ fontFamily: Fonts.RobotoLight }}>I agree to the
                                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Term')}>
                                            <Text style={{ fontFamily: Fonts.RobotoBold }}> terms and conditions</Text>
                                        </TouchableWithoutFeedback>
                                    </Text>
                                </View>
                                <Button
                                    mode="contained"
                                    style={{ height: hp('7%'), width: wp('70%'), marginTop:20, marginBottom:20, alignSelf: 'center', justifyContent: 'center', borderRadius: wp('2%') / 2, }}
                                    onPress={() => {
                                        if (this.state.name == '') {
                                            appHelper.toastMsg("Name Required");
                                            return false;
                                        }
                                        if (this.state.email == '') {
                                            appHelper.toastMsg("Email Required");
                                            return false;
                                        }
                                        if (this.state.phone == '') {
                                            appHelper.toastMsg("Phone Required");
                                            return false;
                                        }
                                        if (this.state.checked == false) {
                                            appHelper.toastMsg("Please Accept Terms & Conditions");
                                            return false;
                                        }
                                        if (this.state.phone.length < 10) {
                                            appHelper.toastMsg("Invalid Phone Number");
                                            return false;
                                        }

                                        this._register();
                                    }}
                                >
                                    Next
                                </Button>
                            </View>
                            
                        </KeyboardAwareScrollView>
                    </View>
                </View>
            </View>
        );
    }
}

export default CompleteDoctorProfileScreen;

const styles = StyleSheet.create({
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
        backgroundColor: '#000',
        borderRadius: wp('30%') / 2,
        borderWidth: 0,
        borderColor: 'transparent',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
        marginTop: wp('10%'),
        marginBottom: wp('2%'),
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    headerIcon: {
        color: '#fff',
        position: 'absolute',
        top: wp('5%'),
        left: wp('5%')
    },
});