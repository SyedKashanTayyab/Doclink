import React, { Component } from 'react'
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { Icon } from 'native-base';
 
export default class Header extends Component {
    constructor(props) {
      super(props)
    }
    
    render() {
        return (
            <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                <View style={styles.headerView}>
                    <Icon name='menu' style={styles.headerIcon} />
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
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
    }
});