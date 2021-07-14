import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

class PaymentHistoryScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View>
                <Text> PaymentHistory </Text>
            </View>
        );
    }
}

export { PaymentHistoryScreen };