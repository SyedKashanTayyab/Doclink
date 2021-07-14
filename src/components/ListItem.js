import React from "react";
import { View, StyleSheet, Image, TouchableHighlight, Text } from "react-native";
import GlobalStyles from "../styles/GlobalStyles";
import colors from "../utils/Colors";
import { Fonts } from "../utils/Fonts";
import FontSize from "../utils/FontSize";

function ListItem({ title, subTitle, image, IconComponent, onPress, icon }) {
    return (
        <TouchableHighlight underlayColor={colors.grayFour} onPress={onPress}>
            <View style={styles.container}>
                {IconComponent}
                {image && <Image style={styles.image} source={{uri: image}} />}
                <View style={[styles.detailsContainer,]}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subTitle && <Text style={styles.subTitle} numberOfLines={2}>{subTitle}</Text>}
                </View>
                <Image source={icon} style={[styles.icon]} />
            </View>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 20,
        backgroundColor: colors.white,
        alignItems: "center",
    },
    detailsContainer: {
        marginLeft: 10,
        paddingRight: 10,
        justifyContent: "center",
        flex:1,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    title: {
        fontSize: FontSize("medium"),
        fontFamily: Fonts.RobotoBold,
        color: colors.black,
    },
    subTitle: {
        fontSize: FontSize("small"),
        color: colors.grayFive,
    },
    icon: {
        // backgroundColor:"blue",
        width: 40,
        height: 40,
        // resizeMode: "contain",
    },
});

export default ListItem;
