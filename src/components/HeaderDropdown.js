import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';
import { hp, wp } from '../utils/Utility';
import FontSize from '../utils/FontSize';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import { Icon } from 'native-base';

const HeaderDropdown = (props) => {

    return (
        <>
            <TouchableOpacity onPress={() => props.onSettingPress()} style={{ flex: 1, marginLeft: wp(5), marginRight: wp(1), justifyContent: 'center', alignItems: 'flex-end' }}>
                <Icon type="Entypo" style={{ color: 'white' }} name="dots-three-vertical" />
            </TouchableOpacity>
        </>
    )
}
export default HeaderDropdown;
