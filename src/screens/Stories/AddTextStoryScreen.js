import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Container, Icon } from 'native-base';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native-gesture-handler';

import { API_URL } from '../../utils/Constant';
import { CustomSpinner } from '../../utils/AppHelper';
import API from '../../services/API';
import { wp, hp } from '../../utils/Utility';
import strings from '../../res/strings';
import colors from '../../utils/Colors';
import { Fonts } from '../../utils/Fonts';
import FontSize from '../../utils/FontSize';
import PrivacyModal from '../../modals/PrivacyModal';
import Toast from 'react-native-simple-toast';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

class AddTextStoryScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {

            spinner: false,
            spinnnerText: "Loading...",
            numberOfLines: 0,
            numberOfLinesCarriageReturns: 0,
            txtHeight: 0,

            // backgrounds States
            bgColor: colors.primary,
            bgColorList: strings.bgColorList,
            bgColorIndex: 0,

            // Text States
            textStory: "",
            textFontFamily: strings.fontNameList[0].name,
            textFontSize: FontSize('xxxLarge'),
            textFontColor: colors.white,

            // All available font families
            fontFamilyList: strings.fontNameList,

            myPatient: true,

            viewPrivacy: false,

            keybaordHeight: 336 / 2,
            paddingTop: 336 / 2,
        }

        this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    }

    componentDidMount = () => {

        let temp = "kashif is good, \n"
        var count = (temp.match(/\n/g) || []).length;
        console.log(count);

        this.setState({
            textFontSize: FontSize('xxxLarge'),
            textFontFamily: strings.fontNameList[0].name
        })

        console.log("FontSize('xxxLarge')", FontSize('xxxLarge'))
    }

    /**
     * Keyboard listners
     */
    keyboardWillShow = (event) => {
        if (event.endCoordinates.height > 0) {
            this.setState({
                paddingTop: event.endCoordinates.height / 2,
                keybaordHeight: event.endCoordinates.height / 2
            })
        }
        // Animated.parallel([
        //     Animated.timing(this.keyboardHeight, {
        //         duration: event.duration,
        //         toValue: event.endCoordinates.height,
        //     }),
        // ]).start();
    };

    // keyboardWillHide = (event) => {
    //     Animated.parallel([
    //         Animated.timing(this.keyboardHeight, {
    //             duration: event.duration,
    //             toValue: 0,
    //         }),
    //     ]).start();
    // };

    handlerBgColor = async () => {
        try {
            let index = Math.floor(Math.random() * (this.state.bgColorList.length - 0))
            this.setState({
                bgColor: this.state.bgColorList[index]
            })
        } catch (error) {
            console.log(error)
        }
    }

    handlerFontFamily = async () => {
        try {
            let index = Math.floor(Math.random() * (this.state.fontFamilyList.length - 0))
            if (this.state.fontFamilyList[index].name == this.state.textFontFamily) {
                this.handlerFontFamily()
                return;
            }
            this.setState({
                textFontFamily: this.state.fontFamilyList[index].name
            })
        } catch (error) {
            console.log(error)
        }
    }

    onChangeText = (text) => {

        console.log(text.length, this.state.textStory.length, this.state.numberOfLines + this.state.numberOfLinesCarriageReturns)

        if (text.length > this.state.textStory) {
            if ((this.state.numberofLines + this.state.numberOfLinesCarriageReturns) > 12) {
                return false;
            }
        }

        let font_size = FontSize('xxLarge')
        if (text.length > 80 && text.length < 200) {
            font_size = FontSize('xxLarge')
        } else if (text.length > 200 && text.length < 300) {
            font_size = FontSize('large')
        } else if (text.length > 300 && text.length < 600) {
            font_size = FontSize('medium')
        } else if (text.length > 600) {
            font_size = FontSize('small')
        }

        let numberofLines = this.getNumberOfLines(text, font_size, 1.91, wp(95))
        var carriageReturnsCount = (text.match(/\n/g) || []).length;
        if ((numberofLines + carriageReturnsCount) > 12) {
            Toast.show(strings.statusUpdateError, Toast.SHORT);
            return false
        }

        this.setState({ textStory: text })

        // let numberofLines = this.getNumberOfLines(text, font_size, 1.91, wp(95))
        // var carriageReturnsCount = (text.match(/\n/g) || []).length;
        console.log("numberofLines", numberofLines, carriageReturnsCount)


        // console.log("text.length", text.length, numberofLines)
        this.setState({ textFontSize: font_size, numberofLines: numberofLines })
        this.setState({
            paddingTop: this.state.keybaordHeight - 12 - numberofLines
        })
        // this.setState({ textFontSize: font_size, numberOfLinesCarriageReturns: carriageReturnsCount })


    }

    /**
     * Function get text number of lines 
     */
    getNumberOfLines(text, fontSize, fontConstant, containerWidth) {

        let cpl = Math.floor(containerWidth / (fontSize / fontConstant));
        const words = text.split(' ');
        const elements = [];
        let line = '';

        while (words.length > 0) {
            if (line.length + words[0].length + 1 <= cpl || line.length === 0 && words[0].length + 1 >= cpl) {
                let word = words.splice(0, 1);
                if (line.length === 0) {
                    line = word;
                } else {
                    line = line + " " + word;
                }
                if (words.length === 0) {
                    elements.push(line);
                }
            }
            else {
                elements.push(line);
                line = "";
            }
        }
        return elements.length;
    }



    /**
     * Submit Request to server
     */
    onSubmit = async () => {
        this.setState({ spinner: true });
        const privacy = this.state.myPatient == true ? 'patient' : 'public';
        const data = {
            bg_color: this.state.bgColor,
            font_family_name: this.state.textFontFamily,
            text: this.state.textStory,
            font_size: this.state.textFontSize
        }

        try {
            let params = { type: 'text', data: JSON.stringify(data), privacy };
            const res = await API.post(API_URL.DOCTOR_STORIES, params);
            this.setState({ spinner: false, visible: false, myPatient: true, textStory: '' })

            this.props.navigation.goBack()

        } catch (error) {
            this.setState({ spinner: false })
            console.log(error);
        }
    }

    render() {

        const { textStory, textFontColor, textFontSize, textFontFamily, myPatient, spinner, viewPrivacy } = this.state

        return (
            <Container style={{ backgroundColor: this.state.bgColor }}>

                {/* Spinner */}
                <CustomSpinner visible={spinner} text={this.state.spinnnerText} activityColor={colors.white} textStyle={{ color: colors.white }} />

                <View style={{ height: APPBAR_HEIGHT, flexDirection: 'column', marginTop: Platform.OS === 'ios' ? APPBAR_HEIGHT : 0 }}>
                    <View style={{ flexDirection: 'row', height: hp(5) }}>
                        <View style={{ width: "50%", flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ marginLeft: wp(4) }}>
                                <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/doctor_status_close.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: "50%", flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TouchableOpacity style={{ marginRight: wp(4), justifyContent: 'center', alignItems: 'center', width: wp(5), height: wp(5) }} onPress={() => this.handlerFontFamily()}>
                                <Text style={{ color: '#fff', fontFamily: textFontFamily, fontSize: FontSize('large') }}>T</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: wp(4) }} onPress={() => this.handlerBgColor()}>
                                <Icon type="MaterialIcons" name="palette" style={{ color: '#fff', fontSize: FontSize('xxLarge') }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : ""}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1 }}>
                        <TextInput
                            style={{
                                flex: 1,
                                color: textFontColor,
                                fontSize: textFontSize,
                                fontFamily: textFontFamily,
                                paddingTop: Platform.OS == 'ios' ? this.state.paddingTop : 0
                            }}
                            onFocus={(e) => {

                            }}
                            textAlign={'center'}
                            // keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}

                            // onKeyPress={({ nativeEvent }) => {
                            //     console.log(nativeEvent.key)
                            //     if (nativeEvent.key === 'Enter') {
                            //         if (this.state.numberOfLinesCarriageReturns < 12) {
                            //             this.setState({ numberOfLinesCarriageReturns: this.state.numberOfLinesCarriageReturns + 1 })
                            //         }
                            //     }
                            //     if (nativeEvent.key === 'Backspace') {
                            //         this.setState({ numberOfLines: 0 })
                            //     }
                            // }}
                            value={textStory}
                            onChangeText={this.onChangeText}
                            // onChange={(e) => {
                            //     // console.log("event.nativeEvent.contentSize.height", e.nativeEvent)
                            // }}
                            onContentSizeChange={(e) => {
                                // if (this.state.textStory.length > 40) {
                                //     console.log("NOL", e.nativeEvent.contentSize.height, this.state.textFontSize, e.nativeEvent.contentSize.height / this.state.textFontSize)
                                // }
                            }}

                            //     const { nativeEvent } = e
                            //     const { contentSize: { width: txtWidth, height: txtHeight } } = nativeEvent

                            //     console.log("txtWidth", txtWidth, txtHeight)

                            //     let numberOfLines = (txtHeight > this.state.txtHeight) ? this.state.numberOfLines + 1 : this.state.numberOfLines - 1

                            //     if (txtHeight > 40) {
                            //         this.setState({
                            //             txtHeight: txtHeight,
                            //             numberOfLines: numberOfLines
                            //         })
                            //     }
                            //     // console.log("txtHeight", txtHeight)
                            //     // if (txtHeight > 40) {
                            //     //     this.setState({
                            //     //         height: txtHeight,
                            //     //     });
                            //     // }
                            // }}
                            // onChange={(e) => {
                            //     const { contentSize } = e.nativeEvent
                            //     console.log("e", contentSize)
                            //     if (txtHeight > 40) {

                            //         this.setState({
                            //             height: txtHeight,
                            //         });
                            //     }
                            // }}
                            placeholder="Type a status"
                            placeholderTextColor={colors.white}
                            autoFocus={true}
                            maxLength={700}
                            numberOfLines={12}
                            multiline={true}
                        // maxFontSizeMultiplier={0}
                        >
                        </TextInput>
                        <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: wp(2), height: wp(15) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.setState({ myPatient: true })} style={[myPatient ? null : styles.publicstyles, { width: wp(5), height: wp(5) }]}>
                                    {
                                        myPatient
                                            ? <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5), }} source={require('../../assets/icons/set_public_icon.png')} />
                                            : null
                                    }
                                </TouchableOpacity>
                                <Text style={{ color: colors.white, fontFamily: Fonts.HelveticaNeueBold, paddingLeft: wp(2), textAlignVertical: 'center', marginRight: wp(2) }}>My Patients</Text>
                                <TouchableOpacity onPress={() => this.setState({ myPatient: false })} style={[myPatient ? styles.publicstyles : null, { width: wp(5), height: wp(5) }]}>
                                    {
                                        myPatient
                                            ? null
                                            : <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5) }} source={require('../../assets/icons/set_public_icon.png')} />
                                    }
                                </TouchableOpacity>
                                <Text style={{ color: colors.white, fontFamily: Fonts.HelveticaNeueBold, paddingHorizontal: wp(2), textAlignVertical: 'center' }}>Set As Public</Text>
                                <TouchableOpacity onPress={() => this.setState({ viewPrivacy: true })} style={{ alignItems: 'center' }}>
                                    <Image style={{ resizeMode: 'contain', width: wp(5), height: wp(5), }} source={require('../../assets/icons/exclamationcircle.png')} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={this.onSubmit}>
                                <Image style={{ resizeMode: 'contain', width: wp(10), height: wp(10), }} source={require('../../assets/icons/submit_status.png')} />
                            </TouchableOpacity>

                        </View>
                    </View>
                </KeyboardAvoidingView>
                <PrivacyModal visible={viewPrivacy} onClosePress={(show) => this.setState({ viewPrivacy: show })} />
            </Container >
        );
    }
}

// Your status update cannot exceed 700 characters or 12 lines.
export default AddTextStoryScreen;

const styles = StyleSheet.create({
    publicstyles: {
        borderWidth: 2, borderColor: '#fff', borderRadius: wp(5)
    }
})
