import React, { useEffect, useState, } from 'react'
import { Modal } from 'react-native';
import { TouchableOpacity, StyleSheet, View, Text, FlatList } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import GlobalStyles from '../styles/GlobalStyles';

import colors from '../utils/Colors';
import { Fonts } from '../utils/Fonts';
import FontSize from '../utils/FontSize';
var moment = require('moment');

const filterOptions = [
	{ name: "Today", key: "today" },
	{ name: "Yesterday", key: "yesterday" },
	{ name: "Last 7 days", key: "last_7_days" },
	{ name: "This Month", key: "this_month" },
	{ name: "Lifetime", key: "all" },
	{ name: "Custom Date", key: "custom" },
]

const NavDropdownOptions = (props) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [options, setOptions] = useState(filterOptions);

	// useEffect(() => {

	// }, [])


	const renderItem = ({ item }) => (
		<TouchableOpacity onPress={() => {
			let start_date = ""
			let end_date = ""
			if (item.key == "today") {
				start_date = moment().utc(true).format('YYYY-MM-DD 00:00:00')
				end_date = moment().utc(true).format('YYYY-MM-DD 23:59:59')
			} else if (item.key == "yesterday") {
				start_date = moment().add(-1, 'days').utc(true).format('YYYY-MM-DD 00:00:00')
				end_date = moment().add(-1, 'days').utc(true).format('YYYY-MM-DD 23:59:59')
			} else if (item.key == "last_7_days") {
				start_date = moment().add(-6, 'days').utc(true).format('YYYY-MM-DD 00:00:00')
				end_date = moment().utc(true).format('YYYY-MM-DD 23:59:59')
			} else if (item.key == "this_month") {
				start_date = moment().startOf('month').utc(true).format('YYYY-MM-DD 00:00:00')
				end_date = moment().endOf('month').utc(true).format('YYYY-MM-DD 23:59:59')
			} else if (item.key == "all") {
				start_date = moment().startOf('month').utc(true).format('1970-01-01 00:00:00')
				end_date = moment().utc(true).format('YYYY-MM-DD HH:mm:ss')
			} else {

			}
			let params = {
				key: item.key,
				title: item.name,
				start_date: start_date,
				end_date: end_date
			}
			props.onItemSelected(params)
			setModalVisible(!modalVisible)
		}}>
			<View style={{ marginVertical: hp(1) }}>
				<Text styles={styles.item}>{item.name}</Text>
			</View>
		</TouchableOpacity>
	);

	const renderSeparator = () => {
		return (
			<View
				style={{
					height: 1,
					width: "100%",
					backgroundColor: "#CED0CE",
					marginLeft: "0%"
				}}
			/>
		);
	};

	return (
		<>
			{
				modalVisible
					? <View style={[GlobalStyles.shadowElevationThree, { backgroundColor: colors.white, paddingRight: 10, paddingTop: 15, paddingBottom: 5, paddingLeft: 10, borderRadius: 10 }]}>
						<TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={[styles.dotswrapper, { zIndex: 1, marginTop: 0 }]}>
							<View style={[!modalVisible ? styles.dotsDefault : styles.dotsActive]}></View>
							<View style={[!modalVisible ? styles.dotsDefault : styles.dotsActive]}></View>
							<View style={[!modalVisible ? styles.dotsDefault : styles.dotsActive]}></View>
						</TouchableOpacity>
						<FlatList
							style={{ backgroundColor: colors.white, zIndex: 10, marginTop: 5 }}
							data={filterOptions}
							renderItem={renderItem}
							keyExtractor={item => item.id}
							ItemSeparatorComponent={renderSeparator}
						/>
					</View>

					: <View style={[{ backgroundColor: colors.white, paddingRight: 10, paddingVertical: 15, borderRadius: 10 }]}>
						<TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={[styles.dotswrapper, { zIndex: 1, marginTop: 0 }]}>
							<View style={[!modalVisible ? styles.dotsDefault : styles.dotsActive]}></View>
							<View style={[!modalVisible ? styles.dotsDefault : styles.dotsActive]}></View>
							<View style={[!modalVisible ? styles.dotsDefault : styles.dotsActive]}></View>
						</TouchableOpacity>
					</View>
			}
		</>
	);
}

export default NavDropdownOptions

const styles = StyleSheet.create({
	/* Header Styles */
	dotswrapper: {
		flex: 1,
		height: "100%",
		flexDirection: "row",
		// marginRight: wp(1),
		justifyContent: "flex-end",
		position: "relative",
		zIndex: 1,
	},
	dotsDefault: {
		width: hp(1), height: hp(1), backgroundColor: "#D6D6D6", margin: 1, borderRadius: (5 / 2),
	},
	dotsActive: {
		width: hp(1), height: hp(1), backgroundColor: "#1896FC", margin: 1, borderRadius: (5 / 2),
	},
	dropdownStyle: {
		backgroundColor: colors.white,
		borderRadius: 10,
		padding: 10,
		// paddingHorizontal: 20,
		// position: "absolute",
		// right: 0,
		// top: 0,
		// zIndex: 1,
		width: 150
	},
	item: {
		color: colors.grayFive,
		fontFamily: Fonts.HelveticaNeue,
		fontSize: FontSize('xMini'),
		textTransform: "capitalize",
		paddingVertical: hp(2),
		paddingRight: 30,
	},
});


