import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

class PaymentManagerScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View>
                <Text> PaymentManager </Text>
            </View>
        );
    }
}

export { PaymentManagerScreen };