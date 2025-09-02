// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UsersStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<UsersStackParamList, 'UsersMain'>;

export default function UsersScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Users Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('UsersDetail', { userId: '123' })}
      />
    </View>
  );
}
