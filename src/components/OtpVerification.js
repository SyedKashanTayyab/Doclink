import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert, StyleSheet, View, DeviceEventEmitter } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import RNOtpReader from 'react-native-otp-reader'

import { isAndroid } from '../utils/Constant';
import CustomOTPInput from './CustomOTPInput';
import ErrorBoundary from './ErrorBoundary';
import colors from '../utils/Colors';


const OtpVerification = function (props) {
    const [otpArray, setOtpArray] = useState([]);

    // TextInput refs to focus programmatically while entering OTP
    const firstTextInputRef = useRef(null);
    const secondTextInputRef = useRef(null);
    const thirdTextInputRef = useRef(null);
    const fourthTextInputRef = useRef(null);

    useEffect(() => {
        // Generate the Hash String
        RNOtpReader.GenerateHashString((hash) => {
            console.log('Hash for your application', hash);
        });

        // Start Observing the SMS
        RNOtpReader.StartObservingIncomingSMS((message) => {
            console.log('Started the SMS observer successfully', message);
        }, (error) => {
            console.log('Starting the SMS observer failed', error)
        });

        // Add the listener for the SMS
        DeviceEventEmitter.addListener('otpReceived', (message) => {
            // Retrived Message
            // console.log('message', message);
            try {
                // console.log("try() message ==>", message.message);
                const msg = message.message;
                if (msg) {
                    const messageArray = msg.split("\n");
                    // console.log("messageArray =>", messageArray);
                    if (messageArray[1]) {
                        const otp = messageArray[1].replace(/\s+/g, '');
                        // console.log(otp);
                        if (otp.length === 4) {
                            setOtpArray(otp.split(''));
                            // console.log("useEffect otpArray", otpArray, otp);
                            // fourthTextInputRef.current.focus();
                            props.onOTPFilled(otp);
                            // to auto submit otp in 4 secs
                            // setAutoSubmitOtpTime(AUTO_SUBMIT_OTP_TIME_LIMIT);
                            // startAutoSubmitOtpTimer();

                            // DeviceEventEmitter.removeListener('otpReceived', (message) => {
                            //     console.log("DeviceEventEmitter.removeListener('otpReceived'")
                            //     console.log(message)
                            // })
                        }
                    }
                }
            } catch (error) {
                Alert.alert('auto event error', error.message);
            }

        });

    }, []);


    useEffect(() => {
        // For Manually Entered Code - verify otp
        // console.log("otpArray.length", otpArray.length);
        if (otpArray.length === 4) {
            setTimeout(() => {
                let str = otpArray.join('')
                props.onOTPFilled(str);
            }, 1000);
        }
    }, [otpArray]);


    const refCallback = textInputRef => node => {
        textInputRef.current = node;
    };


    // this event won't be fired when text changes from '' to '' i.e. backspace is pressed
    // using onOtpKeyPress for this purpose
    const onOtpChange = index => {
        return value => {
            if (isNaN(Number(value))) {
                // do nothing when a non digit is pressed
                return;
            }
            const otpArrayCopy = otpArray.concat();
            otpArrayCopy[index] = value;
            setOtpArray(otpArrayCopy);

            // auto focus to next InputText if value is not blank
            if (value !== '') {
                if (index === 0) {
                    secondTextInputRef.current.focus();
                } else if (index === 1) {
                    thirdTextInputRef.current.focus();
                } else if (index === 2) {
                    fourthTextInputRef.current.focus();
                }
            }
        };
    };

    // only backspace key press event is fired on Android
    // to have consistency, using this event just to detect backspace key press and
    // onOtpChange for other digits press
    const onOtpKeyPress = index => {
        return ({ nativeEvent: { key: value } }) => {
            // auto focus to previous InputText if value is blank and existing value is also blank
            if (value === 'Backspace' && otpArray[index] === '') {
                if (index === 1) {
                    firstTextInputRef.current.focus();
                } else if (index === 2) {
                    secondTextInputRef.current.focus();
                } else if (index === 3) {
                    thirdTextInputRef.current.focus();
                }

                /**
                 * clear the focused text box as well only on Android because on mweb onOtpChange will be also called
                 * doing this thing for us
                 * todo check this behaviour on ios
                 */
                if (isAndroid && index > 0) {
                    const otpArrayCopy = otpArray.concat();
                    otpArrayCopy[index - 1] = ''; // clear the previous box which will be in focus
                    setOtpArray(otpArrayCopy);
                }
            }
        };
    };

    // console.log("otpArray", otpArray);
    return (
        <ErrorBoundary screenName={'OtpVerification'}>
            <View style={styles.container}>
                <View style={[{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingBottom: hp(5), backgroundColor: colors.transparent, width: "80%", }]}>
                    {[
                        firstTextInputRef,
                        secondTextInputRef,
                        thirdTextInputRef,
                        fourthTextInputRef,
                    ].map((textInputRef, index) => (
                        <CustomOTPInput
                            autoFocus={index === 0 ? true : undefined}
                            containerStyle={[{ flex: 1, marginRight: 15, height: hp(7), }, index !== 3 ? styles.mr15 : styles.mr0]}
                            value={otpArray[index]}
                            onKeyPress={onOtpKeyPress(index)}
                            onChangeText={onOtpChange(index)}
                            keyboardType={'number-pad'}
                            maxLength={1}
                            style={[styles.otpText, styles.centerAlignedText,]}
                            secureTextEntry={true}
                            refCallback={refCallback(textInputRef)}
                            key={index}
                        />
                    ))}
                </View>
            </View>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        // padding: 16,
        flex: 1,
        // backgroundColor:"red",
        alignItems: "center",
    },
    submitButtonText: {
        color: colors.white,
    },
    otpResendButton: {
        alignItems: 'center',
        width: '100%',
        marginTop: 16,
    },
    otpResendButtonText: {
        color: colors.black,
        textTransform: 'none',
        textDecorationLine: 'underline',
    },
    otpText: {
        fontWeight: 'bold',
        color: colors.gray,
        fontSize: 18,
        width: '100%',
    },
    centerAlignedText: {
        textAlign: 'center',
    },
    mr15: {
        marginRight: 15,
    },
    mr0: {
        marginRight: 0,
    }
});

OtpVerification.defaultProps = {
    attempts: 5,
    otpRequestData: {
        username: 'varunon9',
        email_id: false,
        phone_no: true,
    },
    otpCode: "",
};

OtpVerification.propTypes = {
    otpRequestData: PropTypes.object.isRequired,
    attempts: PropTypes.number.isRequired,
    otpCode: PropTypes.number.isRequired,
};

export default OtpVerification;
