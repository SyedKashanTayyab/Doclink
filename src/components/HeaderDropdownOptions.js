import React, { Component, Fragment } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { hp, wp } from '../utils/Utility';
import colors from '../utils/Colors';
import { Icon } from 'native-base';


class HeaderDropdownOptions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: true,
            toggle: false,
        };
    }

    handleDropdown = () => {
        const { toggle } = this.state;
        // this.setState({ toggle: !toggle, })
        this.props.toggleDropdown();
    }


    render() {
        const { navlistItems, isOpen, toggle } = this.state;

        return (
            <>
                <TouchableOpacity onPress={this.handleDropdown} style={[styles.dropdownStyle, this.props.style,]}>
                    <Icon type="Entypo" style={{ color: 'white', fontSize: hp(2.5), }} name="dots-three-vertical" />
                </TouchableOpacity>
            </>
        )
    }
}
export default HeaderDropdownOptions;

const styles = StyleSheet.create({
    /* Header Styles */
    dropdownStyle: {
        flex: 1, marginLeft: wp(6), marginRight: wp(0.5), justifyContent: 'center', alignItems: 'flex-end', zIndex: 9999999
    }
});


