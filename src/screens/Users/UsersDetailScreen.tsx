// src/screens/Home/HomeDetailScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UsersStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UsersStackParamList, 'UsersDetail'>;

export default function UsersDetailScreen({ route, navigation }: Props) {
  // Extract params
  const { userId } = route.params;

  return (
    <View>
      <Text>Users Detail Screen</Text>
      <Text>Item ID: {userId}</Text>

      <Button title="Go Back" onPress={() => navigation.goBack()} />

      <Button
        title="Go to UsersMain"
        onPress={() => navigation.navigate('UsersMain')}
      />
    </View>
  );
}
