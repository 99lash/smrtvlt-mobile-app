// src/screens/Home/HomeDetailScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsDetail'>;

export default function SettingsDetailScreen({ route, navigation }: Props) {
  // Extract params
  const { id } = route.params;

  return (
    <View>
      <Text>Settings Detail Screen</Text>
      <Text>Item ID: {id}</Text>

      <Button title="Go Back" onPress={() => navigation.goBack()} />

      <Button
        title="Go to SettingsMain"
        onPress={() => navigation.navigate('SettingsMain')}
      />
    </View>
  );
}
