/**
 * Sample React Native Doctor
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import Routes from './routes/DoctorRoutes';

class Doctor extends Component {
  render() {
    return (
      <Routes />
    );
  }
}

export { Doctor };