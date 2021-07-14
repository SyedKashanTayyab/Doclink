import React, { Component } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FiveStarRating from './FiveStarRating';
import AppInfo from '../modules/AppInfoNativeModule';

export default class DrawerHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: ''
        };
    }

    render() {
        return (
            <View>
                <ImageBackground
                    source={require('../assets/images/drawer_header.png')}
                    resizeMode="stretch"
                    style={{
                        height: hp('35%'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#1994fb',
                    }}
                >
                    <View style={{ flex: 1, justifyContent: 'space-between', width: wp('50%') }}>
                        <View style={{ marginTop: 20, alignItems: 'flex-end', }}>

                        </View>

                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <View style={styles.imageContainer}>
                                <Image style={styles.profileImage} source={{ uri: global.user_data.avatar }} />
                            </View>
                        </View>

                        <View style={{ marginBottom: hp("0"), justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: hp('2.5%'), color: '#fff' }}>{global.user_data.name}</Text>
                            {
                                AppInfo.TARGET == "doctor" ?
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: hp('2%'), color: '#fff' }}>PMDC #{global.user_data.pmdc_number}</Text>
                                    :
                                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: hp('2%'), color: '#fff' }}>MR #{global.user_data.mrn}</Text>
                            }

                        </View>

                        <View style={{ marginBottom: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: "transparent", }}>
                            {
                                AppInfo.TARGET != "manager" ?
                                    <FiveStarRating
                                        starColor={"#ffffff"}
                                        emptyStarColor={"#ffffff"}
                                        starSize={20}
                                        rating={(global.user_data.ratings == 0) ? "5.0" : global.user_data.ratings}
                                        ratingStyle={{
                                            color: "#ffffff",
                                            marginLeft: wp("0.5%")
                                        }}
                                    />
                                    :
                                    null
                            }
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        width: wp('30%'),
        height: wp('30%'),
        backgroundColor: '#000',
        borderRadius: wp('30%') / 2,
        overflow: 'hidden',
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});