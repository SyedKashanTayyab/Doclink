import React from 'react';
import { Modal, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import colors from '../utils/Colors';
import { Icon } from 'native-base';
import { hp } from '../utils/Utility';

export default class MessageImageView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            viewerModalOpen: false,
        };
    }

    render() {
        const { containerStyle, imageStyle, currentMessage } = this.props;
        console.log("this.props ==> ", this.props);

        return (
            <React.Fragment>
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ viewerModalOpen: true });
                    }}
                    onLongPress={() => {
                        this.props.onLongPress();
                    }}
                    alignment={this.props.alignment}
                    style={[styles.container, containerStyle]}
                >
                    <Image source={{ uri: currentMessage.image }} style={[styles.image, imageStyle]} />
                </TouchableOpacity>
                <Modal visible={this.state.viewerModalOpen} transparent={true} onRequestClose={() => { }}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <ImageViewer
                            imageUrls={[{ url: currentMessage.image }]}
                            onCancel={() => {
                                this.setState({ viewerModalOpen: false });
                            }}
                            renderIndicator={() => null}
                            enableSwipeDown
                            renderHeader={() => (
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ viewerModalOpen: false });
                                    }}
                                >
                                    {/* <Text style={styles.closeButton}>Close</Text> */}
                                    <Icon type="AntDesign" name='close' style={[styles.closeButton]} />
                                </TouchableOpacity>
                            )}
                        />
                    </SafeAreaView>
                </Modal>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {

    },
    image: {
        width: 300,
        height: 300,
    },
    closeButton: {
        color: colors.white,
        textAlign: "right",
        paddingTop: 20,
        paddingRight: 20,
        fontSize: hp(3),
    },
});