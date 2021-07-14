import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableHighlight, ImageBackground } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Icon } from 'native-base';
import { Fonts } from '../utils/Fonts';
import Modal from "react-native-modal";
import AppInfo from './src/modules/AppInfoNativeModule';
import moment from "moment";
export default class ChatCard extends Component {
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
    if (AppInfo.TARGET == "doctor") {
      this.props.navigation.navigate('PatientProfile', { patients: this.props.item });
    }
    else{
      this.props.navigation.navigate('DoctorProfile', { patients: this.props.item });
    }
  }

  _viewChat = () => {
    this.setState({ isModalVisible: false });
    this.props.navigation.navigate('Chat', {patients: this.props.item});
  }

  render(props, navigation) {

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.imageContainer}>
            <TouchableHighlight onPress={this._toggleModal} underlayColor='transparent' >
              <Image style={styles.profileImage} source={{ uri: this.props.item.avatar }} />
            </TouchableHighlight>
          </View>
        
          <View style={{ flex:1, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#11111111', marginRight:wp(3), marginLeft:wp(3), paddingBottom:20 }}>

            <View style={{ flex: 1, justifyContent: 'center'}}>
              <Text style={{ color: '#000', fontFamily: Fonts.RobotoRegular, fontSize: hp('2.5%') }}>{this.props.item.name}</Text>
              <Text numberOfLines={1} style={{ fontFamily: Fonts.RobotoLight, fontSize: hp('1.7%') }}>{this.props.item.last_msg.text}</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: Fonts.RobotoLight, fontSize: hp('1.5%') }}> {
                (this.props.item.last_msg.created_at ? moment(this.props.item.last_msg.created_at).fromNow() : '')
              } </Text>
            </View>
          </View>
        </View>

        {/* Popup Modal Start */}
        <Modal isVisible={this.state.isModalVisible} animationIn="slideInLeft" onBackdropPress={() => this.setState({ isModalVisible: false })}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ width: wp('60%'), height: hp('40%') }}>
              <View style={{ flex: 4, backgroundColor: '#000' }}>
                <ImageBackground source={{ uri: this.props.item.avatar }}
                  resizeMode="stretch" style={{ flex: 1 }}>
                  <View style={{ backgroundColor: '#00000060', height: hp('4%'), justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', marginLeft: 20 }}>{this.props.item.name}</Text>
                  </View>
                </ImageBackground>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', }}>
                <Icon type="MaterialIcons" name='message' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewChat()} />
                <Icon type="MaterialIcons" name='info' style={{ fontSize: hp('3%'), color: '#000', padding: 10 }} onPress={() => this._viewProfile()} />
              </View>
            </View>
          </View>
        </Modal>
        {/* Popup Modal End */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: wp('22%'),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    resizeMode: 'cover',
  },
  imageContainer: {
    width: wp('13%'),
    height: wp('13%'),
    backgroundColor: '#000',
    borderRadius: wp('13%') / 2,
    overflow: 'hidden',
    marginLeft: 30,
  },
  profileImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
});