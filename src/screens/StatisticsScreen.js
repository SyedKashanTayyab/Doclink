import React, { Component } from 'react';
import { View, Text, SafeAreaView, FlatList, RefreshControl, StyleSheet, Alert } from 'react-native';
import { Container, Icon } from 'native-base'

import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import { hp, wp } from '../utils/Utility';
import colors from '../utils/Colors';
import API from '../services/API';
import { API_URL } from '../utils/Constant';
import AppHelper, { CustomSpinner } from '../utils/AppHelper';

class StatisticsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: false,
            refreshing: false,
            statsData: [],
            statsHeads: []
        };
    }

    componentDidMount = () => {
        this.getStats();
    }

    getStats = async () => {
        this.setState({ spinner: true })
        try {
            let params = {};
            const res = await API.get(API_URL.DOCTOR_STATISTICS, params);
            if (res.status == 'Success') {
                this.setState({ statsData: res.data.statistics, statsHeads: res.data.heads, spinner: false });
            } else {
                alert(res.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    ListHeaderComponent = () =>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f5f5f5' }}>
            <Text style={[styles.listHeader, styles.textStyle, { width: wp(31), textAlign: 'left' }]}>Date</Text>
            <Text style={[styles.listHeader, styles.textStyle]}>Patients</Text>
            <Text style={[styles.listHeader, styles.textStyle]}>Sessions</Text>
            <Text style={[styles.listHeader, styles.textStyle]}>Requests</Text>
        </View>


    ItemSeparatorComponent = () => (<View style={{ height: 1, width: "100%", backgroundColor: "#e3e3e3" }} />)

    _onRefresh = () => {
        this.getStats();
    }

    render() {
        const { spinner, statsData, statsHeads } = this.state;
        return (
            <Container>
                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Stats"}
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
                    noShadow={true}
                    transparent={Platform.OS === 'ios' ? true : false}
                />

                {/* NAVIGATION HEADER END*/}
                <SafeAreaView style={GlobalStyles.AndroidSafeArea} forceInset={{ top: 'never' }}>

                    {/* Spinner */}
                    <CustomSpinner visible={spinner} />

                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={statsData}
                            keyExtractor={(item, index) => index.toString()}
                            ListHeaderComponent={this.ListHeaderComponent}
                            ItemSeparatorComponent={this.ItemSeparatorComponent}
                            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh} />}
                            renderItem={({ item, index }) => (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={[styles.listItems, styles.textStyle, { width: wp(31), textAlign: 'left', backgroundColor: item.is_read == 0 ? '#dcefff' : null }]}>{item.stats_date}</Text>
                                    <Text style={[styles.listItems, styles.textStyle, { backgroundColor: item.is_read == 0 ? '#dcefff' : null }]}>{JSON.parse(item.raw_json_data).patients}</Text>
                                    <Text style={[styles.listItems, styles.textStyle, { backgroundColor: item.is_read == 0 ? '#dcefff' : null }]}>{JSON.parse(item.raw_json_data).sessions}</Text>
                                    <Text style={[styles.listItems, styles.textStyle, { backgroundColor: item.is_read == 0 ? '#dcefff' : null }]}>{JSON.parse(item.raw_json_data).requests}</Text>
                                </View>
                            )}
                        />
                    </View>

                </SafeAreaView>

            </Container>
        );
    }
}

export default StatisticsScreen;

const styles = StyleSheet.create({
    listHeader: {
        color: '#1896fc',
        fontSize: FontSize('small'),
    },
    listItems: {
        color: '#000',
        fontSize: FontSize('medium'),
    },
    textStyle: {
        fontFamily: Fonts.HelveticaNeueBold,
        textAlign: 'center',
        width: wp(23), paddingHorizontal: wp(2),
        paddingVertical: wp(4)
        // borderWidth: 1, borderColor: '#000'
    }
})