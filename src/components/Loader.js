//
//  Loader.js
//  GhoomCar
//
//  Created by Kashif Khatri on 10/03/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import React from "react"
import { StyleSheet } from "react-native"
import PropTypes from "prop-types"
import { Fonts } from '../utils/Fonts';
import Spinner from 'react-native-loading-spinner-overlay';

const Loading = (props) =>
    props.animating
        ? <Spinner
            {...props}
            visible={true}
            color={'#1994fb'}
            textContent={'Loading...'}
            overlayColor={'rgba(0,0,0,0)'}
            textStyle={props.textStyle ? props.textStyle : styles.spinnerStyles}
        /> : null

Loading.propTypes = {
    animating: PropTypes.bool.isRequired,
    style: PropTypes.oneOfType([PropTypes.style, PropTypes.object]),
}

export default Loading

const styles = StyleSheet.create({
    spinnerStyles: {
        color: '#000',
        fontWeight: 'normal',
        fontFamily: Fonts.HelveticaNeueBold
    },
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    }
})