import React, { Component } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableHighlight, TouchableWithoutFeedback, Alert } from 'react-native';
import { Icon, ListItem } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';


class SubscriptionScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            data: [],
        };
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {/* Header */}
                <ImageBackground style={styles.headerBackground} source={require('../assets/images/header_small_background.png')} resizeMode="cover">
                    <View style={styles.headerView}>
                        <Icon onPress={() => this.props.navigation.openDrawer()} name='menu' style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>Subscription Screen</Text>
                    </View>
                </ImageBackground>
                {/* Spinner */}
                <CustomSpinner visible={this.state.spinner} />

            </View>
        );
    }
}

export default SubscriptionScreen;

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
});