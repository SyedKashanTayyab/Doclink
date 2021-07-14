//
//  GlobalStyles.js
//  DocLink
//
//  Created by Kashif Khatri on 22/03/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import { StyleSheet, Platform, StatusBar } from 'react-native';
import colors from '../utils/Colors'
import { Fonts } from '../utils/Fonts';
//import FontStyles from '../config/FontStyles';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import FontSize from '../utils/FontSize';

const GlobalStyles = StyleSheet.create({

    AndroidSafeArea: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? 0 : 0
    },

    noConnectivityTitle: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: FontSize('medium'),
        marginLeft: wp(2)
    },
    headerTitle: {
        color: colors.white,
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: FontSize('large'),
        marginLeft: Platform.os === 'ios' ? wp(0) : wp(2),
    },

    // Align Center Class
    alignCenter: {
        justifyContent: 'center', alignItems: 'center',
    },


    // Global Shadow
    shadowElevationThree: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    shadowElevationSix: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    shadowElevationNine: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,

        elevation: 9,
    },

    // Global Border
    borderRightGray: {
        borderRightColor: colors.strokeColor1,
        borderRightWidth: 1,
    },
    borderBottomGray: {
        borderBottomColor: colors.strokeColor1,
        borderBottomWidth: 1,
    },
    borderTopGray: {
        borderTopColor: colors.strokeColor1,
        borderTopWidth: 1,
    },
    borderGray: {
        borderColor: colors.borderColor,
        borderWidth: 1,
    },
    borderPrimary: {
        borderColor: colors.primary,
        borderWidth: 1,
    },
    borderError: {
        borderColor: colors.errorColor,
        borderWidth: 1,
    },

    imgContain: {
        height: "100%",
        width: "100%",
        resizeMode: 'contain',
    },

    imgCover: {
        height: "100%",
        width: "100%",
        resizeMode: 'cover',
    },

    // FLOATING LABEL STYLES
    labelStyle: {
        textAlignVertical: "center",
        // left: 20,
        paddingHorizontal: 9,
    },

    inputStyle: {
        fontSize: FontSize('small'),
        borderWidth: 1,
        borderRadius: wp(1),
        // height: 0,
        alignItems: "center",
        justifyContent: "center",
        textAlignVertical: "center",
    },
    inputStylePaddingLeft: {
        paddingLeft: 15,
    },
    inputErrorStyle: {
        borderColor: colors.errorColor,
        borderWidth: 1,
    },
    inputLabelErrorStyle: {
        color: colors.errorColor,
    },
    inputWrapper: {
        justifyContent: "center",
        textAlignVertical: "center",
    },
    imageContainer: {
        alignItems: 'center',
        width: wp(18),
        height: wp(18),
        backgroundColor: colors.white,
        borderRadius: wp('18%') / 2,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.strokeColor3,
    },
    pickerDefaultStyle: {
        backgroundColor: colors.white,
        paddingLeft: wp(6.5),
        borderTopLeftRadius: wp(1),
        borderTopRightRadius: wp(1),
        borderBottomLeftRadius: wp(1),
        borderBottomRightRadius: wp(1),
        borderColor: colors.borderColor,
    },
    defaultDropdownStyle: {
        borderBottomLeftRadius: wp(1),
        borderBottomRightRadius: wp(1),
        borderColor: colors.borderColor,
    },
    defaultLabelStyle: {
        fontFamily: Fonts.HelveticaNeue,
    },

    // Modal Style
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        flex: 1,
        width: wp(100),
        height: hp(100),
        justifyContent: 'center',
        alignItems: 'center',
    },
    ModalWrap: {
        alignSelf: 'center',
        justifyContent: "center",
        backgroundColor: colors.white,
        width: wp(90),
        // marginHorizontal: wp(5),
        // padding: wp(6),
        borderRadius: wp(1.5),
    },
    modalCloseWrap: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.gray,
        borderRadius: wp(6 / 2),
        width: wp(6),
        height: wp(6),
    },
    modalClose: {
        color: colors.white,
        fontSize: FontSize('large'),
        // lineHeight: FontSize('large'),
        fontFamily: Fonts.HelveticaNeue,
        transform: [{ rotate: '45deg' }]
    },
    modalBody: {
        position: 'relative',
        backgroundColor: colors.white,
        borderRadius: wp(1.5),
    },
    modalHead: {
        fontFamily: Fonts.HelveticaNeueBold,
        color: colors.white,
        fontSize: FontSize('medium'),
        // marginBottom: hp(1),
    },
    modalText: {
        fontFamily: Fonts.HelveticaNeue,
        color: colors.black,
        fontSize: FontSize('medium'),
    },
    modalTextBold: {
        fontFamily: Fonts.HelveticaNeueBold,
        marginTop: hp(2),
    },
    modalBtn: {
        width: '100%'
    },
    confirmWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    confirmText: {
        fontFamily: Fonts.HelveticaNeue,
        flex: 1,
    },
    confirmBtn: {
        marginLeft: wp(0),
    },
    confirmBtnText: {
        fontFamily: Fonts.HelveticaNeueBold,
        fontSize: FontSize('small'),
        color: colors.white,
        textTransform: "uppercase",
    },

    showMenu: {
        position: "absolute",
        opacity: 1,
    },

    hideMenu: {
        opacity: 0,
    },

    // TABS HEADING STYLE
    tabsHeadingStyle: {
        fontFamily: Fonts.HelveticaNeue,
        fontSize: FontSize('small'),
        color: colors.white,
        textTransform: "uppercase",
    },


})

export default GlobalStyles;