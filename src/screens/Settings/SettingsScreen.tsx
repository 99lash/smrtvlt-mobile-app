// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation';
import ListItem from '../../components/ListItem';
import { Settings, Vault } from 'lucide-react-native';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsMain'>;

export default function SettingsScreen({ navigation }: Props) {
  const iconSize: number = 35; // I use this instead of Assigning the icon size value inside ListItem 
  return (
    <View  className="flex-1">
      <ListItem
        title="Device Management"
        subtitle="Manage preferences"
        icon={<Vault size={iconSize}/>}
        onPress={() => navigation.navigate('DeviceManagement')}
      />
      <ListItem
        title="Settings"
        subtitle="Manage preferences"
        icon={<Settings size={iconSize} />}
        onPress={() => navigation.navigate('SettingsDetail', { id: '123' })}
      />
      
    </View>
  );
}
