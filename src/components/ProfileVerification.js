import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PermissionPopup from './PermissionPopup';



function ProfileVerification({ permission, visible, onPressYes, onPressNo }) {
    return (
        <View style={styles.container}>
            {/* PROFILE VERIFICATION POPUP */}
            <PermissionPopup
                popupTitle={permission.title}
                message={permission.message}
                showPopup={visible}
                onPressYes={onPressYes}
                onPressNo={onPressNo}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {

    },
});

export default ProfileVerification;