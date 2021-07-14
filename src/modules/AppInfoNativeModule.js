//  Created by react-native-create-bridge

import { NativeModules } from 'react-native'

const { AppInfo } = NativeModules

export default {
  exampleMethod () {
    return AppInfo.exampleMethod()
  },

  TARGET: AppInfo.target
}
