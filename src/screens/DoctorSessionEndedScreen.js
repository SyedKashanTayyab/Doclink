import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, Image, Text, TouchableWithoutFeedback, Alert,FlatList, TouchableHighlight } from 'react-native';
import { Container, Icon, Picker ,Content ,List , ListItem , Left, Right, Thumbnail,Body} from 'native-base';
import { ActivityIndicator, Checkbox, TextInput, Button } from 'react-native-paper';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInputMask } from 'react-native-masked-text';
import { Fonts } from '../utils/Fonts';
import { GetSessionDetails } from '../api/Doctor';
import DeviceInfo from 'react-native-device-info';
import appHelper, { CustomSpinner } from '../utils/AppHelper';

class DoctorSessionEndedScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            checked: false,
            session_id: '',
            data:[]
        };
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    makeRemoteRequest = async () => {
        const access_token = await appHelper.getItem("access_token");
        const { navigation } = this.props;
        let data = navigation.getParam('data', 0)
        console.log("MAk=====: ", data)
        let chatroom_session_id = data.id
        await this.setState({ chatroom_session_id: chatroom_session_id });

        var params = { access_token: access_token, chatroom_session_id: chatroom_session_id }

        try {
            const res = await GetSessionDetails(params);
            if (res) {
                const { data } = await res;
                if (data.status == 'Success') {
                    console.log("MAL ===== ", data)
                    this.setState({ data: data.data });
                }
                else if (data.status == 'Error') {
                    appHelper.toastMsg(data.message);
                }
            }
        }
        catch (error) {
            alert(error)
            appHelper.toastMsg(error);
        }
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

    render() {
        const { data } = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.openDrawer()} name='menu' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Closing Note</Text>
                    </View>
                </ImageBackground>

                 
                    {/* Spinner */}
                    <CustomSpinner visible={this.state.spinner} />
                    
                    <KeyboardAwareScrollView>
                    <View style={{ flex: 1 }}>
				        <List style={{ paddingBottom: 10,borderBottomColor:'#e6e6e6',borderBottomWidth: 1,}}>
			              <ListItem avatar noBorder>
			                <Left>
			                	<View style={styles.imageContainer}>
                                    <Image style={styles.profileImage} source={{ uri: data.avatar}} />
                                </View>
			                </Left>
			                <Body>
                              <Text style={{color:'#3f3f3f',fontFamily: Fonts.RobotoLight,fontSize: hp('2.5%')}}>{data.name}</Text>
                              <Text style={{color:'#3f3f3f',fontFamily: Fonts.Roboto,fontSize: hp('2%')}}>MR #{data.mrn}</Text>
                            </Body>
			                {/*<Right style={{paddingTop:wp('8%')}}>
			                  <Text style={{color:'#3f3f3f',fontFamily: Fonts.Roboto,fontSize: hp('2%')}}>31-08-2019 10:32 PM</Text>
			                </Right>*/}
			              </ListItem>
				       </List>
                    
                        <View style={{ backgroundColor: '#ffffff', alignItems: 'center', flex: 1,padding: 15 }}>
                           <View style={styles.container}>
                                <Text style={styles.labelFont}>Chief Complaint</Text>
                                <Text style={styles.descFont}>{data.chief_complaint}</Text>
                            </View>
                            <View style={styles.container}>
                                <Text style={styles.labelFont}>Doctor advice</Text>
                                <Text style={styles.descFont}>{data.diagnosis}</Text>
                            </View>
                            <View style={styles.container}>
                                <Text style={styles.labelFont}>Note</Text>
                                <Text style={styles.descFont}>{data.note}</Text>
                            </View>

                           	{/*<View style={{width:wp('90%'), margin:15,padding: 15,backgroundColor:'#1994fb',borderRadius:4,alignItems: 'center',}} >
                                <Text style={styles.priceFont}>PKR 700</Text>
                                <Text style={styles.priceSmallFont}>Amount Received</Text>
                           	</View>*/}
                            <Button
                                mode="contained"
                                style={{ height: hp('7%'), width: wp('80%'), bottom:0, marginTop:20, marginBottom:20, alignSelf: 'center', justifyContent: 'center', borderRadius: wp('2%') / 2,}}
                                onPress={() => {
                                    this.props.navigation.navigate('Home');
                                }}
                            >
                                <Text uppercase={false} style={{fontFamily: Fonts.HelveticaNeueBold,fontSize: wp('4%'),}}> Back to home</Text>
                            </Button>
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                
            </View>
        );
    }
}

export default DoctorSessionEndedScreen;

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
        marginLeft: hp('2%')
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
        fontFamily: Fonts.HelveticaNeueBold,
        color: '#fff',
        fontSize: hp('3%')
    },
    imageContainer: {
        alignItems: 'center',
        width: wp('16%'),
        height: wp('16'),
        borderRadius: wp('18%') / 2,
        overflow: 'hidden',
        borderWidth:1,
        borderColor:'#000'
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
    labelFont: {
        fontFamily: Fonts.HelveticaNeueBold,
        color: '#ff9600',
        fontSize: hp('2%'),
        paddingBottom:5,
    },
    descFont: {
        fontFamily: Fonts.RobotoLight,
        color: '#000000',
        fontSize: hp('2%')
    },
    priceFont: {
        fontFamily: Fonts.Roboto,
        color: '#fff',
        fontSize: hp('5%')
    },
    priceSmallFont: {
        fontFamily: Fonts.Roboto,
        color: '#fff',
        fontSize: hp('2%')
    },
    container: {
        padding: 15,
        borderBottomColor:'#e6e6e6',
        borderBottomWidth: 1,
        width: wp("100%")
    },
   
});