'use strict';

import React from 'react';
import {View, Text, ImageBackground, StyleSheet} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
const Splash = (props) => {
    return (
	      <ImageBackground style={styles.backgroundImage} resizeMode="cover" source={require('../assets/images/splash.png')} />
    );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex:1,
  }
});

export default Splash;