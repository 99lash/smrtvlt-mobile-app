import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import SettingsDetailScreen from '../screens/Settings/SettingsDetailScreen';
import AddNewDeviceScreen from '../screens/Settings/AddNewDeviceScreen';
import DeviceManagementScreen from '../screens/Settings/DeviceManagementScreen';
import ProvisioningScreen from '../screens/Settings/ProvisioningScreen';
import AddUserScreen from '../screens/Settings/AddUserScreen';
import ManagePermissionsScreen from '../screens/Settings/ManagePermissionsScreen';

import { SettingsStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />

      <Stack.Screen
        name="DeviceManagement"
        component={DeviceManagementScreen}
        options={{ title: 'Device Management' }}
      />

      <Stack.Screen
        name="AddNewDevice"
        component={AddNewDeviceScreen}
        options={{ title: 'Add New Device' }}
      />

      <Stack.Screen
        name="Provisioning"
        component={ProvisioningScreen}
        options={{ title: 'Add New Device' }}
      />

      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
        options={{ title: 'Add User' }}
      />

      <Stack.Screen
        name="ManagePermissions"
        component={ManagePermissionsScreen}
        options={{ title: 'Manage Permissions' }}
      />

      <Stack.Screen name="SettingsDetail" component={SettingsDetailScreen} />
    </Stack.Navigator>
  );
}
