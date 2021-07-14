import React, { Component } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Icon, } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';

export default class ManagerCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render(props) {
        return (
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image style={styles.profileImage} source={{ uri: this.props.item.avatar }} />
                </View>

                <View style={{ flex: 1, marginLeft: 20, justifyContent: 'center' }}>
                        <View style={{marginBottom:10}}>
                        <Text style={{ fontFamily: Fonts.RobotoMedium, color: '#000', fontSize: hp('2.5%') }}>{this.props.item.name}</Text>
                        </View>
                        <View style={{flexDirection: 'column'}}>
                            <View style={{ flexDirection: 'row'}}>
                                <Icon type="MaterialIcons" name='phone' style={{ alignSelf: 'center', marginRight:10, fontSize: hp('2%'), color: '#666666' }} />
                                <Text style={{ alignSelf: 'center', fontFamily: Fonts.RobotoRegular, color: '#666666', fontSize: hp('2%'), }}>{this.props.item.phone}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', }}>
                            <Icon type="MaterialIcons" name='email' style={{ alignSelf: 'center', marginRight: 10, fontSize: hp('2%'), color: '#666666' }} />
                            <Text style={{ alignSelf: 'center', fontFamily: Fonts.RobotoRegular, color: '#666666', fontSize: hp('2%'), }}>{this.props.item.email}</Text>
                            </View>
                        </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding:wp(4),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        marginRight: wp(2), 
        marginLeft: wp(2), 
        borderColor: '#11111111',
        //borderRadius: wp('2%') / 2,
        flexDirection: 'row',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
        resizeMode: 'cover',
    },
    imageContainer: {
        width: wp('16%'),
        height: wp('16%'),
        backgroundColor: '#000',
        borderRadius: wp('16%') / 2,
        borderWidth: 1,
        borderColor: '#fff',
        overflow: 'hidden',
    },
    profileImage: {
        resizeMode: 'cover',
        width: '100%',
        height: '100%',
    },
});