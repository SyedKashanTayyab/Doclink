import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

class NotificationScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View>
                <Text> Notification </Text>
            </View>
        );
    }
}

export default NotificationScreen;