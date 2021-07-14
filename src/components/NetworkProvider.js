//
//  NerworkProvider.js
//  GhoomCar
//
//  Created by Kashif Khatri on 17/04/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import React from 'react';
import NetInfo from '@react-native-community/netinfo';

export const NetworkContext = React.createContext({ isConnected: true });

export class NetworkProvider extends React.PureComponent {
    state = {
        isConnected: true,
        connectionState: ''
    };

    componentDidMount() {
        const unsubscribe = NetInfo.addEventListener(state => {
            this.setState({
                isConnected: state.isConnected,
                connectionState: state
            })
            // console.log("\n      ===== ");
            // console.log("NetworkProvider - Connection type :", state.type);
            // console.log("NetworkProvider - Is connected? :", state.isConnected);
            // console.log("===== \n");
        });
        
        // Unsubscribe
        // unsubscribe();
    }

    componentWillUnmount() {
        // NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

    render() {
        return (
            <NetworkContext.Provider value={this.state}>
                {this.props.children}
            </NetworkContext.Provider>
        );
    }
}