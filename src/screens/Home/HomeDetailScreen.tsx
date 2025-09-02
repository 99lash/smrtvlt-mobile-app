// src/screens/Home/HomeDetailScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeDetail'>;

export default function HomeDetailScreen({ route, navigation }: Props) {
  // Extract params
  const { id } = route.params;

  return (
    <View>
      <Text>Home Detail Screen</Text>
      <Text>Item ID: {id}</Text>

      <Button title="Go Back" onPress={() => navigation.goBack()} />

      <Button
        title="Go to HomeMain"
        onPress={() => navigation.navigate('HomeMain')}
      />
    </View>
  );
}
