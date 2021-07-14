import React, { Component } from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { Icon, Container } from 'native-base';
import { WebView } from 'react-native-webview';
import { Fonts } from '../utils/Fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import appHelper from '../utils/AppHelper';
import { URL_EASYPAISA_HOSTED_CHECKOUT } from '../utils/Constant'
import NavigationBar from '../components/NavigationBar';

class CreditCardEasypaisaScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            start_loading: false,
            url: URL_EASYPAISA_HOSTED_CHECKOUT
        };
    }

    async componentDidMount() {
        let userId = await appHelper.getItem("user_id");
        let data = await appHelper.getData("user_data");

        // console.log(data)

        var params = {
            consumer_id: userId,
        }

        let queryParams = this.querystring(params)

        console.log(queryParams)
        this.setState(previousState => ({
            url: previousState.url + queryParams,
            start_loading: true
        }))
    }

    querystring(query = {}) {
        // get array of key value pairs ([[k1, v1], [k2, v2]])
        const qs = Object.entries(query)
            // filter pairs with undefined value
            .filter(pair => pair[1] !== undefined)
            // encode keys and values, remove the value if it is null, but leave the key
            .map(pair => pair.filter(i => i !== null).map(encodeURIComponent).join('='))
            .join('&');

        return qs && '?' + qs;
    }

    render() {
        console.log(this.state.url)

        return (

            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Easypaisa"}
                    context={this.props}
                    // removeBackButton={false}
                    backButton={true}
                    right={null}
                    noShadow={true}
                />
                <View style={{ flex: 1 }}>
                    {
                        this.state.start_loading == true ?
                            <WebView source={{ uri: this.state.url }} cacheEnabled={false} cacheMode={'LOAD_NO_CACHE'} incognito={true} />
                            : null
                    }
                </View>
            </Container>
        )
    }
}

export default CreditCardEasypaisaScreen;

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