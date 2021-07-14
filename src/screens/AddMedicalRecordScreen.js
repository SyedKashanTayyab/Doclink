import { Container, Icon } from 'native-base';
import React, { Component } from 'react';
import { View, Text, Platform, TouchableOpacity, Image, StyleSheet, Modal, Alert, ActionSheetIOS, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-navigation';
var moment = require('moment');
import ImageViewer from 'react-native-image-zoom-viewer';
import ImagePicker from 'react-native-image-crop-picker';
import DialogAndroid from 'react-native-dialogs';

import GlobalStyles from '../styles/GlobalStyles';
import NavigationBar from '../components/NavigationBar';
import FontSize from '../utils/FontSize';
import { API_URL, URL_IMAGE_UPLOAD } from '../utils/Constant';
import API from '../services/API';
import colors from '../utils/Colors';
import { CustomSpinner } from '../utils/AppHelper';
import { hp, wp } from '../utils/Utility';
import ModalSelectionList from '../modals/ModalSelectionList';
import ModalDatePicker from '../modals/ModalDatePicker';
import strings from '../res/strings'
import AppButton from '../components/AppButton';
import { Fonts } from '../utils/Fonts';

class MedicalRecordScreen extends Component {
    constructor(props) {
        super(props);
        this.openImageViewer = this.openImageViewer.bind(this);
        this.state = {
            spinner: false,
            spinnnerText: "Loading...",

            visibleRecordTypeModal: false,
            visibleRecordDateModal: false,

            recordTypeObject: null,

            selectedDate: null,

            showImageViewer: false,
            imageUrls: [],

            imageList: [{ file_path: 'add', file_url: "", file_type: "" }]
        };
    }

    selectedDate = (date) => {
        this.setState({ selectedDate: date })
    }

    openImageViewer = (item) => {
        let urls = [];
        urls.push({ url: item })
        this.setState({
            showImageViewer: true,
            imageUrls: urls
        })
    }

    _onSubmit = async () => {
        if (this.state.imageList.length == 1) {
            Alert.alert("Select record")
        } else if (this.state.recordTypeObject == null) {
            Alert.alert("Select record type")
        } else if (this.state.selectedDate == null) {
            Alert.alert("Select record date")
        } else {
            this.setState({ spinner: true, spinnnerText: 'Uploading...' })
            this.queueImageUpload(1)
        }
    }

    queueImageUpload = async (index) => {
        try {
            let object = this.state.imageList[index]
            if (object.file_url == "") {
                console.log("file_path", object.file_path)
                const response = await API.postMultipart(URL_IMAGE_UPLOAD, object.file_path, [], null, 'image')
                let cloneImageList = this.state.imageList
                cloneImageList[index]['file_url'] = response.data.base_url + '/' + response.data.image_name;
                this.setState({ imageList: cloneImageList })
            }
            if (index < (this.state.imageList.length - 1)) {
                this.queueImageUpload(index + 1);
                this.setState({ spinnnerText: 'Uploading...' })
            } else {
                this.requestStore()
            }
        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    requestStore = async () => {

        const clone = [...this.state.imageList];
        clone.splice(0, 1)

        try {
            let params = {
                record_type: this.state.recordTypeObject.value,
                record_date: moment(this.state.selectedDate).format('YYYY-MM-DD'),
                record_files: JSON.stringify(clone)
            };

            const res = await API.post(API_URL.MEDICAL_RECORDS, params);
            this.setState({ spinner: false });

            setTimeout(async () => {
                let callbackHandler = await this.props.navigation.getParam('callbackHandler', null);
                callbackHandler()
                this.props.navigation.goBack()
            }, 500);

        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    _onImage = async () => {
        if (Platform.OS === 'ios') {
            const imageCropOptions = {
                cropping: true,
                width: 1080,
                height: 1920,
                freeStyleCropEnabled: true,
                compressImageQuality: 0.8,
                smartAlbums: ['UserLibrary', 'PhotoStream', 'Panoramas']
            }
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    title: 'Choose Option',
                    options: ["Cancel", "Take Photo", "Choose from Library"],
                    cancelButtonIndex: 0
                },
                buttonIndex => {
                    if (buttonIndex === 0) {
                        // cancel action
                    } else if (buttonIndex === 1) {
                        ImagePicker.openCamera(imageCropOptions).then(async (response) => {
                            this.processImage(response)
                        }).catch((e) => console.log(e));
                    } else if (buttonIndex === 2) {
                        ImagePicker.openPicker(imageCropOptions).then(async (response) => {
                            this.processImage(response)
                        }).catch((e) => console.log(e));
                    }
                }
            );
        } else {
            const imageCropOptions = {
                cropping: true,
                freeStyleCropEnabled: true,
                cropperStatusBarColor: colors.primary,
                cropperToolbarColor: colors.primary,
                cropperToolbarWidgetColor: colors.white,
                compressImageQuality: 0.8
            }
            const { selectedItem } = await DialogAndroid.showPicker('Choose Option', null, {
                positiveText: 'Cancel',
                items: [
                    { label: 'Take Photo', id: 'camera' },
                    { label: 'Choose from Library', id: 'gallery' }
                ]
            });
            if (selectedItem.id === 'camera') {
                ImagePicker.openCamera(imageCropOptions).then(async (response) => {
                    this.processImage(response)
                }).catch((e) => console.log(e));

            } else if (selectedItem.id === 'gallery') {
                ImagePicker.openPicker(imageCropOptions).then(async (response) => {
                    this.processImage(response)
                }).catch((e) => console.log(e));
            }
        }
    }

    processImage = (response) => {
        let a = this.state.imageList;
        let uri = response.path;
        let file_type = uri.substring(uri.lastIndexOf(".") + 1);
        a.push({ file_path: uri, file_type: file_type, file_url: "" });
        this.setState({ imageList: a })
    }

    deleteImage = (index) => {
        let a = this.state.imageList;
        a.splice(index, 1);
        this.setState({ imageList: [] })
        this.setState({ imageList: a })
    }

    render() {
        const { spinner, imageList } = this.state;
        const { visibleRecordTypeModal, visibleRecordDateModal, recordTypeObject, selectedDate } = this.state;
        return (
            <Container>
                <SafeAreaView style={[GlobalStyles.AndroidSafeArea]} forceInset={{ top: 'never' }}>
                    {/* NAVIGATION HEADER */}
                    <NavigationBar title={"Medical Records"}
                        context={this.props}
                        backButton={true}
                        noShadow={true}
                        right={null}
                        onBackButtonPress={() => this.props.navigation.goBack()}
                        transparent={Platform.OS === 'ios' ? true : false}
                    />

                    {/* Spinner */}
                    <CustomSpinner visible={spinner} text={this.state.spinnnerText} />
                    <View style={{ flex: 1 }}>
                        <View style={styles.addrecordStyle}>
                            <Text style={{ fontWeight: 'bold' }}>Records</Text>
                            <View style={{ flexDirection: 'row' }}>

                                <FlatList
                                    horizontal
                                    keyExtractor={(item, index) => item + index}
                                    showsHorizontalScrollIndicator={false}
                                    data={imageList}
                                    renderItem={({ item, index }) => {
                                        if (index == 0) {
                                            return (
                                                <View style={styles.recordImageContainer}>
                                                    <TouchableOpacity onPress={this._onImage} style={{ width: wp(18), height: wp(18), marginRight: wp(1.5) }}>
                                                        <Image style={{ resizeMode: 'contain', width: wp(18), height: wp(18) }} source={require('../assets/icons/add_record_icon.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }
                                        return (
                                            <View style={styles.recordImageContainer}>
                                                <TouchableOpacity onPress={() => this.deleteImage(index)} style={styles.closeImage}>
                                                    <Image style={{ resizeMode: 'contain', width: wp(4.5), height: wp(4.5) }} source={require('../assets/icons/close.png')} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => this.openImageViewer(item.file_path)}>
                                                    <Image style={styles.recordImageStyle} source={{ uri: item.file_path }} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }}
                                />
                            </View>
                        </View>
                        <View style={[styles.addrecordStyle, { justifyContent: 'space-between', flexDirection: 'row' }]}>
                            <Text style={{ fontWeight: 'bold' }}>Type of Records</Text>
                            <TouchableOpacity onPress={() => this.setState({ visibleRecordTypeModal: true })}>
                                <Text style={{ fontWeight: 'bold', color: colors.btnBgColor, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small') }}>{recordTypeObject == null ? "Select" : recordTypeObject.label}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.addrecordStyle, { justifyContent: 'space-between', flexDirection: 'row' }]}>
                            <Text style={{ fontWeight: 'bold' }}>Date</Text>
                            <TouchableOpacity
                                onPress={() => this.setState({ visibleRecordDateModal: true })}
                                style={{ width: selectedDate == null ? wp(6) : wp(32), height: wp(6), flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
                            >
                                {
                                    selectedDate == null ? null
                                        : <Text style={{ fontWeight: 'bold', color: colors.btnBgColor, fontFamily: Fonts.HelveticaNeue, fontSize: FontSize('small') }}>{moment(selectedDate).format('DD MMM YYYY')}</Text>
                                }
                                <Image style={{ resizeMode: 'contain', width: wp(6), height: wp(6), marginLeft: wp(2) }} source={require('../assets/icons/schedule-icon-blue.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                <AppButton
                    onPressButton={this._onSubmit}
                    styles={{ marginVertical: hp(4), }}
                    title={"Add"}>
                </AppButton>

                {/* Record Type Modal */}
                <ModalDatePicker visible={visibleRecordDateModal} onClosePress={(show) => this.setState({ visibleRecordDateModal: show })} selected={(date) => this.selectedDate(date)} />

                {/* Record Date Modal */}
                <ModalSelectionList
                    visible={visibleRecordTypeModal}
                    onClosePress={(show) => this.setState({ visibleRecordTypeModal: show })}
                    onItemSelected={(item) => this.setState({ recordTypeObject: item })}
                    data={strings.recordTypes}
                />

                <Modal
                    visible={this.state.showImageViewer}
                    transparent={true}
                >
                    <ImageViewer
                        imageUrls={this.state.imageUrls}
                        onCancel={() => this.setState({ showImageViewer: false })}
                        renderIndicator={() => null}
                        renderImage={(props) => <Image {...props} resizeMode={"contain"} />}
                        enableSwipeDown
                        renderHeader={() => (
                            <TouchableOpacity
                                onPress={() => this.setState({ showImageViewer: false })}
                                style={{ position: "absolute", right: 0, zIndex: 9, }}
                            >
                                <Icon type="AntDesign" name='close' style={styles.closeButton} />
                            </TouchableOpacity>
                        )}
                    />
                </Modal>
            </Container >
        );
    }
}

export default MedicalRecordScreen;

const styles = StyleSheet.create({
    reminderBtn: {
        width: wp(80),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        height: wp(13),
        alignSelf: 'center',
        backgroundColor: '#1896fc',
        marginVertical: wp(2)
    },
    reminderBtnText: {
        fontSize: FontSize('medium'),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'capitalize'
    },
    addrecordStyle: {
        padding: wp(4),
        borderBottomColor: '#C7C7C7',
        borderBottomWidth: 1
    },
    calenderSubTab: {
        paddingHorizontal: wp(5),
        flexDirection: 'row',
        height: wp(10),
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    calenderText: {
        color: '#7FC7FD',
        textAlign: 'center',
        paddingVertical: wp(1),
        fontSize: FontSize('xMini'),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        lineHeight: 20
    },
    mainRowBottomBorder: {
        borderBottomColor: '#c7c7c7',
        borderBottomWidth: 1,
    },
    closeButton: {
        color: colors.white,
        textAlign: "right",
        paddingTop: 20,
        paddingRight: 20,
        fontSize: hp(3),
    },
    closeImage: {
        position: 'absolute',
        zIndex: 9999999,
        bottom: wp(15),
        right: wp(-2)
    },
    recordImageContainer: {
        width: wp(18), height: wp(18),
        marginRight: wp(2),
        marginLeft: wp(1),
        borderRadius: wp(3),
        marginVertical: wp(2),
    },
    recordImageStyle: {
        resizeMode: 'cover',
        width: wp(18), height: wp(18),
        borderRadius: wp(3)
    }
})