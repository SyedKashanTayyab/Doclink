import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableHighlight, ImageBackground } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Icon } from 'native-base';
import { Fonts } from '../utils/Fonts';
import Modal from "react-native-modal";

export default class HelpDeskCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        };
    }

    /* Modal */
    _toggleModal = () =>
        this.setState({ isModalVisible: !this.state.isModalVisible });

    _viewProfile = () => {
        this.setState({ isModalVisible: false });
        this.props.navigation.navigate('PatientProfile', { doctors: this.props.item });
    }

    render(props, navigation) {
        return (
            <View style={styles.container}>
                <View style={{marginBottom:10}}>
                    <Text style={{ fontFamily: Fonts.RobotoRegular, color:'#043884', fontSize:hp('2.5%')}}>{this.props.item.subject}</Text>
                </View>
                <View style={{ paddingTop: 3, borderTopWidth: 1, borderColor: '#dfddeb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',}}>
                    <View>
                        <Text style={{ fontSize: hp('1.5%') }}> {this.props.item.name} </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                        <Icon type="FontAwesome" name='clock-o' style={{ marginRight:10, fontSize: hp('1.5%'), color: '#043884' }} />
                        <Text style={{ fontSize: hp('1.5%') }}>{this.props.item.date}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        margin:wp('2%'),
        backgroundColor:'#c1c1c140',
        padding:hp('3%'),
        borderWidth: 1,
        borderColor:'#dfddeb',
        borderRadius:wp('2%') / 2,
    },
});