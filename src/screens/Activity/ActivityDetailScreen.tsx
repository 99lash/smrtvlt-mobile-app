// src/screens/Home/HomeDetailScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ActivityStackParamList, 'ActivityDetail'>;

export default function ActivityDetailScreen({ route, navigation }: Props) {
  // Extract params
  const { id } = route.params;

  return (
    <View>
      <Text>Activity Detail Screen</Text>
      <Text>Item ID: {id}</Text>

      <Button title="Go Back" onPress={() => navigation.goBack()} />

      <Button
        title="Go to ActivityMain"
        onPress={() => navigation.navigate('ActivityMain')}
      />
    </View>
  );
}
