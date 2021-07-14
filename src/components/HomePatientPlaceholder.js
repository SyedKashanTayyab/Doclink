import React from 'react';
import { Image, View, Text } from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';
import { hp, wp } from '../utils/Utility';
import FontSize from '../utils/FontSize';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import AppButton from './AppButton';

const HomePatientPlaceholder = ({ onConnectWithDoctorPress }) => {
    return (
        <>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.transparent, paddingHorizontal: wp(5), }}>
                <View style={{ height: hp(10), width: "100%", }}>
                    <Image source={require('../assets/icons/connect-patient-icon.png')} style={GlobalStyles.imgContain} />
                </View>
                <View style={[GlobalStyles.alignCenter, { backgroundColor: colors.transparent, marginTop: hp(4), }]}>
                    <Text style={{ fontSize: FontSize('xLarge'), color: colors.black, fontFamily: Fonts.HelveticaNeueBold, }}>Welcome</Text>
                    <Text style={{ fontSize: FontSize('small'), color: colors.black, fontFamily: Fonts.HelveticaNeue, textAlign: "center", marginTop: hp(1.5), }}>
                        You can now use DocLink to stay connected with your doctor.
                    </Text>
                </View>
                <AppButton
                    onPressButton={onConnectWithDoctorPress}
                    styles={{ marginTop: hp(3), }}
                    title={"Connect With Doctor"}
                ></AppButton>
            </View>
        </>
    )
}
export default HomePatientPlaceholder;
