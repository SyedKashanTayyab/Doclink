import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';
import { hp, wp } from '../utils/Utility';

export default class DefaultSlide extends React.PureComponent {
  render() {
    return (
      <View style={styles.mainContent}>
        {/* <Text style={styles.title}>{this.props.title}</Text> */}
        {/* <Image source={this.props.image} style={this.props.imageStyle} resizeMode={'stretch'} /> */}
        {/* <Text style={styles.text}>{this.props.text}</Text> */}

        {/*  Logo  */}
        <View style={styles.mainRow}>
          <Image style={{ width: wp(100), height: hp(10) }} resizeMode="contain" source={require('../assets/images/tour_logo.png')} />
        </View>

        {/*  Main Image  */}
        <View style={styles.mainRow}>
          <Image style={{ width: wp(100), height: hp(40) }} resizeMode="contain" source={require('../assets/images/tour/tour_slide_1.png')} />
        </View>

        {/*  Main Title  */}
        <View style={[styles.mainRow, { paddingHorizontal: 30 }]}>
          <Text style={styles.title}>{this.props.title}</Text>
        </View>

        {/*  Main Text  */}
        <View style={[styles.mainRow, { paddingHorizontal: 30 }]}>
          <Text style={styles.text}>{this.props.text}</Text>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    width: '100%',
    // borderWidth: 1, borderColor: 'black',
  },
  mainRow: { paddingVertical: 20, width: wp(100) },
  title: {
    textAlign: 'left',
    fontSize: FontSize('xLarge'),
    fontFamily: Fonts.HelveticaNeue,
    color: colors.primary
  },
  text: {
    textAlign: 'left',
    fontSize: FontSize('medium'),
    fontFamily: Fonts.HelveticaNeue,
    lineHeight: 35,
    color: '#686868'
  }
});