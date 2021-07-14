import React from 'react';
import { View, StyleSheet, TextInput, Image } from 'react-native';
import colors from '../utils/Colors';
import GlobalStyles from '../styles/GlobalStyles';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

function AppSearch({ icon, width = "100%", ...otherProps }) {
    return (
        <View style={[styles.container, { width }]}>
            <TextInput placeholderTextColor={colors.graySix} style={[styles.searchStyle,]} {...otherProps} />
            { icon && <Image source={require('../assets/icons/search-icon.png')} style={[GlobalStyles.imgContain, styles.icon]} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#e6f2f7",
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        height: hp(6)
    },
    icon: {
        marginRight: 5,
        width: 20, height: 20,
    },
    searchStyle: {
        width: "100%",
        color: "black",
        flex: 1,
    },
});

export default AppSearch;
