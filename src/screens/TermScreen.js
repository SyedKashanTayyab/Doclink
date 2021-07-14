import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Container } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Fonts } from '../utils/Fonts';
import appHelper, { CustomSpinner } from '../utils/AppHelper';
import { getTerms } from '../api/Setting';
import NavigationBar from '../components/NavigationBar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import colors from '../utils/Colors';
import FontSize from '../utils/FontSize';
import { API_URL } from '../utils/Constant'
import API from '../services/API';

class TermScreen extends Component {
    constructor(props) {
        super(props)

        let registerRoute = this.props.navigation.getParam('terms');

        this.state = {
            refreshing: false,
            spinner: false,
            data: [],
            registerScreen: registerRoute,
        }
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* On Refresh */
    _onRefresh = async () => {
        this.setState({ spinner: true });
        await this.makeRemoteRequest();
        this.setState({ spinner: false });
    }

    /* Get About us data */
    makeRemoteRequest = async () => {
        try {
            const res = await API.get(API_URL.SETTING_TERMS_AND_CONDI)
            if (res) {
                const data = res;
                if (data.status == 'Success') {
                    this.setState({ data: data.data[0].data });
                }
                else if (data.status == 'Error') {
                    console.warn('Internal Server Error', data.message);
                }
            }
        }
        catch (error) {
            console.warn('Internal Server Error', error);
        }
    }

    render() {
        const { spinner, data, registerScreen } = this.state;

        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Terms & Conditions"}
                    context={this.props}
                    backButton={true}
                    // removeBackButton={true}
                    right={null}
                    transparent={registerScreen ? true : false}
                    noShadow={true}
                />
                {/* NAVIGATION HEADER END*/}

                {/* Spinner */}
                <CustomSpinner visible={spinner} />

                {/* MAIN CONTENT SECTION */}
                <KeyboardAwareScrollView style={{ flex: 1, width: wp(100) }} extraScrollHeight={75}>
                    <ScrollView
                        style={{
                            backgroundColor: colors.white,
                            width: "100%",
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }
                    >
                        <View style={{
                            flex: 1,
                            marginTop: hp(1.8),
                            marginHorizontal: hp(1.8),
                            backgroundColor: colors.transparent,
                        }}>
                            <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize("large"), textTransform: "capitalize", marginBottom: hp(2), }}>
                                Terms & Condition
                            </Text>
                            <Text style={{ color: colors.black, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize("small"), }}>
                                {data}
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAwareScrollView>
            </Container>
        );
    }
}

export default TermScreen;

const styles = StyleSheet.create({



});