//
//  strings.js
//  DocLink
//
//  Created by Kashif Khatri on 17/04/2019.
//  Copyright © 2019 Nexus Corporation LTD. All rights reserved.
//

import { Platform } from 'react-native'

const strings = {
    retry: "Retry",
    noInternetFullMessage: "No Internet connection",
    noInternetMessage: "Internet not reachable",
    noRecordFound: "No record found.",
    credits: "Credits",
    wallet: "Wallet",
    editProfile: "Edit Profile",
    discount: "Discount",
    patient: {
        freeInteractionConfirmation: "Charges for this session are PKR 0, as first interaction is free. Proceed?"
    },
    doctor: {
        freeInteractionConfirmation: "Charges for this session are PKR 0, as first interaction with a patient is free. Proceed?"
    },
    payPerInteraction: "Pay Per Interaction",
    recordTypes: [
        { id: '1', label: 'Prescription', value: 'prescription', image: require('../assets/icons/prescrioption_select_icon.png') },
        { id: '2', label: 'Lab Report', value: 'lab_report', image: require('../assets/icons/lab_report_select_icon.png') },
        { id: '3', label: 'Vaccination', value: 'vaccination_report', image: require('../assets/icons/vaccination_select_icon.png') },
    ],
    statusUpdateError: 'Your status update cannot exceed 700 characters or 12 lines',
    bgColorList: [
        '#66ed66',
        '#20B2AA',
        '#adaba3',
        '#8f8459',
        '#abb1c9',
        '#7b8dd1',
        '#81d4a5',
        '#62d162',
        '#d97cd7',
        '#e8c3e7'
    ],
    fontNameList: [
        {
            name: Platform.OS == 'ios' ? 'Comfortaa-Regular' : 'Comfortaa-Regular',
        },
        {
            name: Platform.OS == 'ios' ? 'ChapazaItalic-Italic' : 'Chapaza-Italic',
        },
        {
            name: 'BebasNeue-Regular',
        },
        {
            name: Platform.OS == 'ios' ? 'CoolveticaCondensedRg-Regular' : 'coolvetica-condensed-rg',
        },
        {
            name: Platform.OS == 'ios' ? 'Ritalia' : 'Ritalia',
        }
    ]
}

export default strings