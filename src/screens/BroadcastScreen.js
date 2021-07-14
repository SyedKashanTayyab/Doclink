import { Button, Container } from 'native-base';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, InputAccessoryView, Button as ButtonRN, Alert, Keyboard } from 'react-native';

import NavigationBar from '../components/NavigationBar';
import API from '../services/API';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';
import { hp, wp } from '../utils/Utility';
import { API_URL } from '../utils/Constant';
import appHelper, { CustomSpinner } from '../utils/AppHelper';


const inputAccessoryViewID = 'inputAccessoryView1';

class BroadcastScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            spinner: false
        };
    }

    addMessage = async (state, value) => {
        this.setState({ [state]: value });
    }

    submitBroadcastMessage = async () => {
        this.setState({ spinner: true });
        const message = this.state.message;

        try {
            let params = { message }
            const res = await API.post(API_URL.DOCTOR_BROADCAST, params);
            if (res) {
                if (res.status == 'Success') {
                    this.setState({ spinner: false, message: '' });
                    setTimeout(() => {
                        Alert.alert('Success', res.message)
                    }, 500);
                }
                else if (res.status == 'Error') {
                    Alert.alert('Required', res.message)
                    this.setState({ spinner: false });
                }
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }

    render() {
        const { message, spinner } = this.state;
        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Broadcast"}
                    context={this.props}
                    backButton={true}
                    right={null}
                    onBackButtonPress={() => {
                        const { navigation } = this.props;
                        let route = navigation.getParam('route', null)
                        if (route != null) {
                            this.props.navigation.navigate(route)
                        } else {
                            this.props.navigation.goBack()
                        }
                    }}
                    transparent={Platform.OS === 'ios' ? true : false}
                    noShadow={true}
                />

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                <View style={{ flex: 1, width: wp(100) }}>
                    <View style={styles.section}>
                        <Text style={styles.mainHeading}>Message</Text>
                        <TextInput
                            style={{
                                fontFamily: Fonts.HelveticaNeue,
                                fontSize: FontSize('small'),
                                color: colors.black,
                                backgroundColor: 'transparent',
                                textAlignVertical: "top",
                                padding: 0,
                                maxHeight: hp(35)
                            }}
                            underlineColorAndroid="transparent"
                            placeholder={"Type here"}
                            numberOfLines={1}
                            multiline={true}
                            onChangeText={(text) => this.addMessage('message', text)}
                            value={message}
                            inputAccessoryViewID={(Platform.OS === 'ios' ? inputAccessoryViewID : "")}
                        />

                    </View>
                </View>
                <View style={{ padding: wp(3), paddingTop: wp(1) }}>
                    <Button onPress={this.submitBroadcastMessage} style={{ height: hp(7), alignSelf: 'center', borderRadius: 5, backgroundColor: colors.btnBgColor }}>
                        <Text style={{ width: '80%', textAlign: 'center', color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "uppercase" }}>Submit</Text>
                    </Button>
                </View>
                {
                    (Platform.OS === 'ios') ?
                        <InputAccessoryView nativeID={inputAccessoryViewID}>
                            <View style={{ backgroundColor: colors.grayFour, alignItems: 'flex-end', width: 100, height: 45, justifyContent: 'center' }}>
                                <ButtonRN
                                    color={colors.black}
                                    onPress={() =>
                                        // Hide that keyboard!
                                        Keyboard.dismiss()
                                    }
                                    title="Done"
                                >
                                    <Text style={{ color: '#fff', fontFamily: Fonts.HelveticaNeueBold, textTransform: "capitalize" }}>Done</Text>
                                </ButtonRN>
                            </View>
                        </InputAccessoryView>
                        :
                        null
                }
            </Container >
        );
    }
}

export default BroadcastScreen;

const styles = StyleSheet.create({
    section: {
        padding: wp(3),
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    mainHeading: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        fontFamily: Fonts.HelveticaNeue,
        textTransform: 'capitalize',
        paddingBottom: wp(1)
        // borderColor: 'black', borderWidth: 1
    },
})