import React from 'react';
import { Image, View, Text, StyleSheet, Clipboard, Alert } from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';
import { hp, wp } from '../utils/Utility';
import FontSize from '../utils/FontSize';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import AppButton from './AppButton';

const HomeDoctorPlaceholder = ({ onConnectWithPatientPress, isVerified, status }) => {

    // CHECK IS DOCTOR PROFILE VERIFIED
    let buttonStyle = isVerified ? styles.active : styles.disabled;
    return (
        <>
            <View style={{ flex: 1, height: "100%", justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: wp(2), marginBottom: hp(1.8) }}>
                <View style={{ height: wp(35), width: wp(35), borderRadius: 100, padding: 36, backgroundColor: colors.btnBgColor }}>
                    <Image source={require('../assets/icons/connect-patient-icon.png')} style={[GlobalStyles.imgContain, { tintColor: '#ffffff' }]} />
                </View>
                <View style={[GlobalStyles.alignCenter, { backgroundColor: colors.transparent, marginTop: hp(3), }]}>
                    {/* <Text style={{ fontSize: FontSize('xLarge'), color: colors.black, fontFamily: Fonts.HelveticaNeueBold, }}>Congratulations</Text> */}
                    {
                        isVerified == true
                            ? <>
                                <Text style={{ fontSize: FontSize('large'), fontFamily: Fonts.HelveticaNeue, color: colors.black, textAlign: 'center', fontWeight: 'bold' }}>Congratulations!</Text>
                                <Text style={{ fontSize: FontSize('small'), fontFamily: Fonts.HelveticaNeue, color: colors.black, textAlign: "center", marginTop: hp(1.5), }}>
                                    Your profile is now verified
                                </Text>
                            </>
                            : status == "rejected"
                                ? <>
                                    <Text style={{ fontSize: FontSize('medium'), color: colors.black, fontFamily: Fonts.HelveticaNeueLight, textAlign: "center", marginTop: hp(1.5) }}>
                                        Sorry, your profile could not be verified.
                                        </Text>
                                    <Text style={{ fontSize: FontSize('small'), color: colors.black, fontFamily: Fonts.HelveticaNeueLight, textAlign: "center" }}>
                                        For clarification write to us at <Text onPress={() => {
                                            Clipboard.setString("hello@doclink.health");
                                            Alert.alert('Copied')
                                        }} style={{ fontSize: FontSize('small'), color: colors.black, fontFamily: Fonts.HelveticaNeueLight, textDecorationLine: 'underline' }}>hello@doclink.health</Text>
                                    </Text>
                                </>
                                : <Text style={{ fontSize: FontSize('large'), color: colors.black, fontFamily: Fonts.HelveticaNeueLight, textAlign: "center", marginTop: hp(1.5), }}>
                                    Your profile is being reviewed.
                                    Please wait to connect with your
                                    patients.
                                    </Text>
                    }
                </View>
                <AppButton
                    onPressButton={onConnectWithPatientPress}
                    styles={[{ marginTop: hp(3), }, buttonStyle,]}
                    title={"Connect With Patient"}
                ></AppButton>
            </View>
        </>
    )
}
export default HomeDoctorPlaceholder;

const styles = StyleSheet.create({
    disabled: {
        backgroundColor: "#bababa",
    },
    active: {
        backgroundColor: colors.btnBgColor,
    },
})
