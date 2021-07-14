import { Icon } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, FlatList } from 'react-native';
import Modal from 'react-native-translucent-modal';

import FontSize from '../utils/FontSize';
import { hp, wp } from '../utils/Utility';

class ModalSelectionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,

            data: []
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== state.modalVisible) {
            return {
                modalVisible: props.visible,
                data: props.data
            }
        }
        return null
    }

    _closeModal(show) {
        this.props.onClosePress(show);
    }

    ItemSeparatorComponent = () => (<View style={{ borderBottomColor: '#C7C7C7', borderBottomWidth: 1 }} />)

    render() {
        const { modalVisible, data } = this.state;
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => this._closeModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ flexDirection: 'row', paddingBottom: wp(2), paddingHorizontal: wp(5), justifyContent: 'space-between' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: FontSize('small') }}>Types of Records</Text>
                            <TouchableOpacity onPress={() => this._closeModal(false)} style={{ width: wp(6.5), height: wp(6.5), backgroundColor: '#cbf6ff', alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                <Icon type="AntDesign" name="close" style={{ fontSize: 15, color: '#1896fc' }} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={data}
                            ItemSeparatorComponent={this.ItemSeparatorComponent}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity onPress={() => {
                                    this.props.onItemSelected(item)
                                    this._closeModal(false);
                                }} key={index} style={styles.listStyle}>
                                    <Image style={{ resizeMode: 'contain', width: wp(4), height: wp(4) }} source={item.image} />
                                    <Text style={{ fontSize: FontSize('small'), paddingLeft: wp(2), textAlignVertical: 'center' }}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        );
    }
}

export default ModalSelectionList;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    modalView: {
        margin: wp(5),
        backgroundColor: "white",
        borderRadius: 10,
        paddingVertical: wp(4),
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    listStyle: {
        paddingVertical: wp(3),
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    }
})