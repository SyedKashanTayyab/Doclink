import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

class PatientListScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <View>
                <Text> PatientList </Text>
            </View>
        );
    }
}

export default PatientListScreen;