import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Icon } from 'native-base';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import FontSize from '../utils/FontSize';
import { Fonts } from '../utils/Fonts';
import Modal from 'react-native-translucent-modal';
import { TouchableHighlight } from 'react-native';


// let arrItemsList = [
//     {
//         "label": "Cardiologist",
//         "value": 1
//     },
//     {
//         "label": "Eye Specialist",
//         "value": 2
//     },
//     {
//         "label": "Opthalmologist",
//         "value": 3
//     },
//     {
//         "label": "Orthopedic Surgeon",
//         "value": 4
//     },
//     {
//         "label": "General Surgeon",
//         "value": 5
//     },
//     {
//         "label": "Pediatrician",
//         "value": 6
//     },
//     {
//         "label": "Diabetologist",
//         "value": 7
//     },
//     {
//         "label": "Gynecologist",
//         "value": 8
//     },
//     {
//         "label": "ENT Specialist",
//         "value": 9
//     },
//     {
//         "label": "Urologist",
//         "value": 10
//     },
//     {
//         "label": "Dentist",
//         "value": 11
//     },
//     {
//         "label": "Plastic Surgeon",
//         "value": 12
//     },
//     {
//         "label": "Dermatologist",
//         "value": 13
//     },
//     {
//         "label": "General Physician",
//         "value": 16
//     },
//     {
//         "label": "Gastroenterologist",
//         "value": 18
//     }
// ]


class DropdownPickerModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
            dropdownItems: [],
        }

    }

    showModal() {
        this.setState({ modalVisible: true, });
    }

    _closeModal() {
        this.setState({ modalVisible: false, });
    }

    handleSelectedItem = (item) => {
        // console.log("handleSelectedItem =>>", item);
        this.setState({ modalVisible: false, })
        this.props.selectedItem(item)

    }

    // componentDidUpdate(prevProps) {
        // console.log("prevProps", prevProps);

    //     if (this.props.visible != prevProps.visible) {
    //         this.setState({
    //             modalVisible: (this.props.visible) ? true : false,
    //         })
    //     }
    // }


    static getDerivedStateFromProps(props, state) {
        // console.log("=========================");
        // console.log("getDerivedStateFromProps onChangeText", props, "state=>", state);
        // console.log("=========================");

        if (props.visible && props.visible !== state.modalVisible) {
            return {
                modalVisible: props.visible,
            };
        }

        if (props.dropdownData && props.dropdownData !== state.dropdownItems) {
            return {
                dropdownItems: props.dropdownData,
            };
        }



        // Return null to indicate no change to state.
        return null;
    }




    render() {
        const { dropdownItems, modalVisible } = this.state;
        // console.log("modalVisible", modalVisible);

        return (
            <Fragment>
                {/* Example Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        // this._closeModal();
                        // this.props.onClosePopup(false)
                    }}>


                    <View style={GlobalStyles.overlay}>
                        <View style={[GlobalStyles.ModalWrap, { paddingBottom: wp(0), backgroundColor: colors.white, }]}>

                            <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: wp(4), paddingHorizontal: wp(3) }]}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 5 }}>
                                    <Text style={[{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeueBold }]}>Select Speciality</Text>
                                </View>

                                <View style={{ width: 25 }}>

                                    <TouchableOpacity
                                        style={[{ backgroundColor: colors.transparent, }]}
                                        onPress={() => {
                                            this.handleSelectedItem(null)
                                        }}
                                    >
                                        <View style={[{ justifyContent: 'center', alignItems: 'center', backgroundColor: "#CBF6FF", width: hp(3), height: hp(3), borderRadius: hp(3) / 2 }]}>
                                            <Icon type="AntDesign" name='close' style={{ fontSize: hp(2.2), color: '#1896FC' }} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* <TouchableOpacity
                                activeOpacity={0}
                                style={{
                                    flex: 1,
                                    width: wp(100),
                                    height: hp(100),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }} onPress={() => {
                                    this.props.selectedItem(null)
                                    this.setState({ modalVisible: false, })
                                }}
                            > */}

                            {/* <View style={[GlobalStyles.ModalWrap, GlobalStyles.borderGray, { paddingBottom: wp(0), width: wp(80), borderRadius: wp(1) }]}>
                                    <View style={[GlobalStyles.modalBody, { backgroundColor: colors.transparent, }]}>
                                        <View style={[{ width: '100%', paddingVertical: hp(2), paddingHorizontal: wp(5), }]}> */}
                            <View style={[{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: wp(2), paddingHorizontal: wp(3), paddingVertical: wp(3) }]}>
                                <ScrollView style={{ maxHeight: 300, paddingLeft: 5, }}>
                                    {
                                        dropdownItems.map((item) => (
                                            <TouchableOpacity onPress={() => this.handleSelectedItem(item)} style={{}} key={item.value}>
                                                <Text style={{ paddingVertical: hp(1), }}>{item.label}</Text>
                                            </TouchableOpacity>
                                        ))
                                    }
                                </ScrollView>
                            </View>
                            {/* </View>
                                    </View>
                                </View> */}
                            {/* </TouchableOpacity> */}
                        </View>
                    </View>


                </Modal>
            </Fragment >
        );
    }
}

const styles = StyleSheet.create({
    headingTxt: {
        color: colors.primary,
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        flex: 1,
    },
    paraTxt: {
        color: colors.black,
        fontFamily: Fonts.latoLight,
        fontSize: FontSize('mini'),
        flex: 1,
    },

})


export default DropdownPickerModal;