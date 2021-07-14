import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, Alert } from 'react-native';
import { Container, Icon, Picker } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts, BaseUrl } from '../utils/Fonts';
import { NavigationActions, StackActions } from 'react-navigation';
import { TextInput, Button } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { EditProfile } from '../api/Manager';
import PhotoUpload from 'react-native-photo-upload';
import Loading from '../components/Loader'

class EditManagerProfileScreen extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            spinner: false,
            name: global.user_data.name,
            email: global.user_data.email,
            phone: global.user_data.phone,
            avatar: global.user_data.avatar,
            gender: global.user_data.gender,
        }
    }

    updateValue(text, field) {
        if (field == 'name') {
            this.setState({ name: text })
        }
        if (field == 'email') {
            this.setState({ email: text })
        }
    }

    onValueChange(value) {
        this.setState({
            gender: value
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

    /* On Submit */
    _onsubmit = async () => {
        this.setState({ spinner: true });
        const access_token = await appHelper.getItem("access_token");
        const user_id = await appHelper.getItem("user_id");
        params = {
            avatar: this.state.avatar,
            name: this.state.name,
            email: this.state.email,
            gender: this.state.gender,
            user_id: user_id,
            access_token: access_token,
        }
        
        //post form api here
        try {
            const res = await EditProfile(params);
            if (res) {
                const { data } = await res
                this.setState({ spinner: false });

                if (data.status == "Success") {
                    const auth_user = {
                        name: data.data.name,
                        email: data.data.email,
                        avatar: data.data.avatar,
                        gender: data.data.gender,
                        phone: this.state.phone,
                    };
                    await appHelper.setData("user_data", auth_user);
                    global.user_data = auth_user;
                    Alert.alert('', data.message);
                    //redirect to homescreen
                    this._resetStack('EditManagerProfile');
                    this.props.navigation.navigate('ManagerProfile');
                }
                else {
                    Alert.alert('', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
            this.setState({ spinner: false });
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.navigate('ManagerProfile')} name='arrow-back' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                    </View>
                </ImageBackground>

                <View style={{flex:1, alignItems: 'center', marginTop:wp('5%')}}>
                    {/* Profile photo */}
                    <View style={styles.imageContainer}>
                        {/* <Image style={styles.profileImage} source={{ uri: user.image }} /> */}
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
                                    uri: (this.state.avatar) ? this.state.avatar : BaseUrl.url+'images/image-not-found.png'
                                }}
                            />
                        </PhotoUpload>
                    </View>
                    <Text style={{ color:'#1994fb'}}>Change Image</Text>
                    {/* Inputs */}
                    
                    <KeyboardAwareScrollView>
                        <View style={{marginTop:wp('5%')}}>
                            <TextInput
                                mode='outlined'
                                underlineColorAndroid={'rgba(0,0,0,0)'}
                                label='Name'
                                value={this.state.name}
                                onChangeText={name => this.setState({ name })}
                                style={{ width: wp('80%'), alignSelf: 'center', marginTop: 20 }}
                            />

                            <TextInput
                                mode='outlined'
                                underlineColorAndroid={'rgba(0,0,0,0)'}
                                label='Email'
                                value={this.state.email}
                                onChangeText={email => this.setState({ email })}
                                style={{ width: wp('80%'), alignSelf: 'center', marginTop: 20 }}
                            />

                            <View style={{ width: wp('80%'), marginTop:20, borderWidth: 1, borderRadius: wp('1%') / 2, borderColor: '#777',alignSelf: 'center', }}>
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

                            <Button
                                onPress={() => {
                                    Alert.alert(
                                        '',
                                        'Confirm Submit?',
                                        [
                                            { text: 'Cancel', onPress: () => { return null } },
                                            {
                                                text: 'Confirm', onPress: () => {
                                                    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                                                    if (this.state.name.length == 0) {
                                                        Alert.alert('', "Name Required");
                                                        return false;
                                                    }
                                                    else if (this.state.email.length == 0) {
                                                        Alert.alert('', "Email Required");
                                                        return false;
                                                    }
                                                    else if (reg.test(this.state.email) === false) {
                                                        Alert.alert('', "Invalid Email");
                                                        return false;
                                                    }
                                                    else {
                                                        this._onsubmit();
                                                    }
                                                }
                                            },
                                        ],
                                        { cancelable: false }
                                    )
                                }}
                                mode="contained"
                                style={{ height: hp('7%'), width: wp('80%'), alignSelf: 'center', margin: 40, justifyContent: 'center', borderRadius: wp('2%') / 2, }}
                            >
                                Submit
                            </Button>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
                <Loading animating={this.state.spinner} />
            </View>
        );
    }
}

export default EditManagerProfileScreen;

const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#fff'
    },
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
        width: wp('30%'),
        height: wp('30%'),
        backgroundColor: '#000',
        borderRadius: wp('30%') / 2,
        borderWidth: 0,
        borderColor: 'transparent',
        overflow: 'hidden',
        marginBottom: 20,
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});