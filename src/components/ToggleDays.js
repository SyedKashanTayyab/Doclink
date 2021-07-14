import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hp, wp } from '../utils/Utility';
import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';


let weekDaysIndex = [1, 2, 3, 4, 5, 6, 7];
let weekDays = ["M", "T", "W", "T", "F", "S", "S"];

class ToggleDays extends PureComponent {
    render() {

        const { daysIndex,  } = this.props;

        return (
                <View style={{ width: '100%', marginBottom: hp(4), }}>
                    <Text style={{ fontSize: FontSize('xMini'), fontFamily: Fonts.HelveticaNeueBold, color: colors.valentino, marginBottom: hp(1), }}>Days</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', }}>
                        {
                            weekDaysIndex.map((item, i) => (
                                <>
                                    <TouchableOpacity onPress={() => {
                                        let arr = daysIndex
                                        if (daysIndex.includes(item)) {
                                            arr.pop(item)
                                        } else {
                                            arr.push(item)
                                        }
                                        // this.setState({ daysIndex: arr })
                                        this.props.dayPress(arr);
                                        console.log("days clicked");
                                    }}>
                                        <View style={[styles.defaultDayStyle, daysIndex.includes(item) ? styles.activeDayStyle : null]}>
                                            <Text style={[styles.defaultDayText, daysIndex.includes(item) ? styles.activeDayText : null]}>
                                                {weekDays[i]}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </>
                            ))
                        }
                    </View>
                </View>
        );
    }
}

ToggleDays.propTypes = {

};

const styles = StyleSheet.create({
    /* Header Styles */
    defaultDayStyle: {
        width: hp(5),
        height: hp(5),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp(5 / 2),
        marginRight: wp(1.5),
        backgroundColor: "#E6E6E6",
    },
    activeDayStyle: {
        backgroundColor: "#1896FC",
    },
    defaultDayText: {
        color: colors.graySix,
    },
    activeDayText: {
        color: colors.white,
    },
});


export default ToggleDays;