import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Fragment, StatusBar } from 'react-native';
import { NavigationActions, SafeAreaView } from 'react-navigation';
import DrawerHeader from '../components/DrawerHeader';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { DrawerItems } from 'react-navigation';

import { Fonts } from '../utils/Fonts';
import colors from '../utils/Colors'

export default class DrawerContent extends Component {

    navigateToScreen = (route) => {

        console.warn(route)
        setTimeout(() => {
            const navigateAction = NavigationActions.navigate({
                routeName: route
            });
            this.props.navigation.dispatch(navigateAction);
            this.props.navigation.closeDrawer();
        }, 1);

    }

    async componentDidMount() {
    }

    render() {
        return (
            <SafeAreaView style={[styles.AndroidSafeArea, { backgroundColor: colors.white }]} forceInset={{ bottom: 'never' }}>
                <View style={{ height: "100%", backgroundColor: colors.white }}>

                    <DrawerHeader />
                    <DrawerItems {...this.props} />

                    <View style={styles.footerContainer}>
                        <TouchableOpacity onPress={() => {
                            this.navigateToScreen('Report')
                        }} >
                            <Text style={{ fontFamily: Fonts.RobotoRegular, fontSize: hp('1.7%'), color: colors.btnBgColor1, }}>Report a Problem</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    footerContainer: {
        position: "absolute",
        bottom: 15,
        left: 10,
        right: 0,
        alignItems: 'center',
    },
    AndroidSafeArea: {
        flex: 1,
        backgroundColor: "white",
        //paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
});