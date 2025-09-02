// src/screens/Home/HomeDetailScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation';
import ListItem from '../../components/ListItem';
import { Plus } from 'lucide-react-native';

type Props = NativeStackScreenProps<SettingsStackParamList, 'DeviceManagement'>;

export default function DeviceManagementScreen({ route, navigation }: Props) {
  return (
    <View>
      <ListItem
        title="Add New Device"
        subtitle="Add your new vault"
        icon={<Plus className='w-24 h-24 text-neutral' />}
        onPress={() => navigation.navigate('AddNewDevice')}
      />
      <ListItem
        title="List of Device"
        subtitle="Add your new vault"
        icon={<Plus className='w-24 h-24 text-neutral' />}
        onPress={() => navigation.navigate('AddNewDevice')}
      />
    </View>
  );
}
