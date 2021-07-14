import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import { Icon, Body, Left, Right, Header  } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import FiveStarRating from '../components/FiveStarRating';

class PatientProfileChatScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data:[],
            spinner:false
        };
    }

    componentDidMount() {
        this.setState({ spinner: true });
        const { navigation } = this.props;
        this.setState({ data:navigation.getParam('patients', 0) });
        this.setState({ spinner: false });
        // patients: navigation.getParam('patients', 0)
    }


    render() {
        const {data} = this.state;
        return (
            <View style={{ flex: 1 }}>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

                {/* Header */}
                <ImageBackground style={styles.headerBackground}  source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={{ flexDirection: 'row', height: hp('30%'),}}>
                        <Left style={{height: hp('30%'),  marginLeft: wp('5%'), }}>
                             <Icon onPress={() => this.props.navigation.goBack(null)} name='arrow-back' style={styles.headerIcon} />
                        </Left>
                        <Body style={{ flex: 3}}>
                             <View>
                                <View style={styles.imageContainer}>
                                    <Image style={styles.profileImage} source={{ uri: data.avatar }} />
                                </View>
                            </View>
                            <Text style={{ color: '#fff', fontFamily: Fonts.RobotoLight, fontSize: wp('5%') }}>{data.name}</Text>
                            <Text style={{ color: '#fff', fontFamily: Fonts.RobotoLight, fontSize: wp('3%') }}>MR #{data.mrn}</Text>
                            <View style={{ flexdirection: "row", width: "100%", justifyContent: "center", alignItems: 'center', marginTop: wp("1%"), }}>
                                <FiveStarRating
                                    starColor={"#ffffff"}
                                    emptyStarColor={"#ffffff"}
                                    starSize={20}
                                    rating={data.ratings}
                                    ratingStyle={{
                                        color: "#ffffff",
                                        marginLeft: wp("0.5%"),
                                    }}
                                />
                            </View>
                        </Body>
                        <Right style={{height: hp('30%'), marginRight: wp('5%'), }}></Right>
                    </View>
                </ImageBackground>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='email' type="MaterialIcons" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Email</Text>
                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.email}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 20, }}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='phone' type="MaterialIcons" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Phone</Text>
                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.phone}</Text>
                        </View>
                    </View>


                    {/* <View style={{ flexDirection: 'row', marginTop: 20, }}>
                        <View style={{ marginRight: 20 }}>
                            <Icon name='venus-mars' type="FontAwesome" style={{ fontSize: wp('8%'), color: '#c8c8c8' }} />
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#eaeaea', flex: 1, paddingBottom: 10 }}>
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: wp('4%'), color: '#aaaaaa' }}>Gender</Text>
                            <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: wp('4%'), color: '#000000' }}>{data.gender}</Text>
                        </View>
                    </View> */}
                </View>
            </View>
        );
    }
}

export default PatientProfileChatScreen;

const styles = StyleSheet.create({
    /* Header Styles */
    headerBackground: {
         
        height: hp('30%'),

    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: hp('3%')
    },
    headerIcon: {
        color: '#fff',
        marginTop: wp('4%')
    },
    headerTitle: {
        fontSize: wp('5%'),
        fontFamily: Fonts.RobotoRegular,
        color: '#fff',
        marginLeft: hp('3%')
    },
    imageContainer: {
        alignItems: 'center',
        width: wp('25%'),
        height: wp('25%'),
        backgroundColor: '#000',
        borderRadius: wp('30%') / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff'
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});