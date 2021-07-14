import React, { Component } from 'react';
import { Text, StyleSheet, View, Switch, FlatList, Platform } from 'react-native';
import { Container } from 'native-base'
import NavigationBar from '../components/NavigationBar';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';
import { hp, wp } from '../utils/Utility';
import API from '../services/API';
import { API_URL } from '../utils/Constant';
import AppHelper from '../utils/AppHelper';

class PatientNotificationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hide: true,
            notification_Settings: [
                { notification_key: 'prescription', is_on: true },
                // { notification_key: 'general', is_on: false },
            ]
        };
    }

    componentDidMount = async () => {

        // Get NOtification Settings
        this.getNotificationSettings();
    }

    getNotificationSettings = async () => {
        try {
            const user_id = await AppHelper.getItem("user_id")
            let params = { user_id };
            const res = await API.get(API_URL.PROFILE_NOTIFICATION, params);

            if (res.status == "Success") {
                let a = this.state.notification_Settings;

                a.map((item, index) => {
                    let _res_noti_data = res.data
                    _res_noti_data.map((item_child, index_child) => {
                        if (item.notification_key == item_child.notification_key) {
                            a[index]['is_on'] = item_child.is_on == 1 ? true : false;
                        }
                    })
                })

                await this.setState({ notification_Settings: a, hide: false });
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
        }
    }

    renderSeparator = () => (<View style={styles.separator} />);

    toggleSwitch = async (id) => {
        let a = this.state.notification_Settings;
        a[id]['is_on'] = !a[id]['is_on'];
        await this.setState({ notification_Settings: a })

        const user_id = await AppHelper.getItem("user_id")
        let params = {
            user_id,
            notificaiton_data: JSON.stringify(a),
            response: true
        };
        const res = await API.post(API_URL.PROFILE_NOTIFICATION, params);
        console.log(res.status);
    }

    render() {
        return (
            <Container>

                {/* NAVIGATION HEADER */}
                <NavigationBar
                    title={"Notifications"}
                    context={this.props}
                    backButton={true}
                    right={null}
                    transparent={false}
                    noShadow={true}
                />
                <View style={styles.container}>

                    {(this.state.hide == true)
                        ? null
                        : <><View style={{ paddingTop: wp(5), paddingHorizontal: wp(5) }}>
                            <Text style={{ fontFamily: Fonts.HelveticaNeue }}>Notify me About</Text>
                        </View>

                            <FlatList
                                // onRefresh={this._onRefresh}
                                // refreshing={this.state.refresh}
                                data={this.state.notification_Settings}
                                ItemSeparatorComponent={this.renderSeparator}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <View style={styles.section}>
                                        <Text style={{ fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('medium'), fontWeight: 'bold', paddingLeft: wp(5), textTransform: 'capitalize' }}>{item.notification_key}</Text>
                                        <View style={{ alignItems: 'center', width: wp(20), paddingVertical: wp(5), marginRight: wp(-1) }}>
                                            <Switch
                                                style={{ transform: Platform.OS === 'ios' ? [{ scaleX: 1 }, { scaleY: 1 }] : [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                                                trackColor={{ false: "#767577", true: colors.primary }}
                                                thumbColor={item.is_on ? "#ffffff" : "#f4f3f4"}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={() => this.toggleSwitch(index)}
                                                value={item.is_on}
                                            />
                                        </View>
                                    </View>
                                )}
                            />
                        </>
                    }
                </View>
            </Container>
        );
    }
}

export default PatientNotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // borderWidth: 1, borderColor: 'black'
    },
    separator: {
        borderBottomColor: '#eaeaea',
        borderBottomWidth: 1,
        marginHorizontal: wp(5)
    }
})
