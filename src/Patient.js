/**
 * Sample React Native Patient
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import Routes from './routes/PatientRoutes';

class Patient extends Component {
  render() {
    return (
      <Routes />
    );
  }
}

export { Patient };