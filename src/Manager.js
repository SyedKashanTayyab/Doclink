/**
 * Sample React Native Manager
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import Routes from './routes/ManagerRoutes';

class Manager extends Component {
  render() {
    return (
      <Routes />
    );
  }
}

export { Manager };