import React, { PureComponent } from 'react';
import { View, Text, NetInfo, Dimensions, StyleSheet } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');

function MiniOfflineSign() {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>No Internet Connection</Text>
    </View>
  );
}

class OfflineNotice extends PureComponent {
  state = {
    isConnected: true,
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }
  };

  render() {
    if (!this.state.isConnected) {
      return <MiniOfflineSign />;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#19c2fb',
    height: hp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute',
    bottom: 0
  },
  offlineText: { 
    color: '#fff', 
    fontSize: 12,
  }
});

export default OfflineNotice;