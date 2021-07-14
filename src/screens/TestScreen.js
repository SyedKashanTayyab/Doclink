import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MovableView from '../components/MovableView';
// import Pdf from 'react-native-pdf';
import { hp } from '../utils/Utility';

class TestScreen extends Component {

    render() {
        const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };
        return (
            <View style={styles.container}>
                {/* <MovableView /> */}
                {/* <Pdf
                    fitWidth
                    source={source}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                        console.log(`current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log(error);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link presse: ${uri}`)
                    }}
                    style={styles.pdf} /> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: hp(100),
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});

export default TestScreen;