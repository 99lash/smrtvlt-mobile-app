// src/screens/Home/HomeDetailScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation';
import PrimaryButton from '../../components/PrimaryButton';
import { Search } from 'lucide-react-native';

type Props = NativeStackScreenProps<SettingsStackParamList, 'AddNewDevice'>;

export default function SettingsDetailScreen({ route, navigation }: Props) {
  return (
    <View className='flex-1 items-center bg-slate-600 justify-start gap-8 pt-10'>
      <PrimaryButton
        title="Scan for Devices" 
        icon={<Search className="text-neutral-text" size={20} />} 
        onPress={() => navigation.navigate('Provisioning')}
      />
      <PrimaryButton
        title="Go to Details" 
        onPress={() => navigation.navigate('DeviceManagement')}
      />
    </View>
  );
}
