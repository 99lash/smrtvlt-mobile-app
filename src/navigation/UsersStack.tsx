// src/navigation/HomeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UsersScreen from '../screens/Users/UsersScreen';
import UsersDetailScreen from '../screens/Users/UsersDetailScreen';
import { UsersStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<UsersStackParamList>();

export default function UsersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="UsersMain" component={UsersScreen} />
      <Stack.Screen name="UsersDetail" component={UsersDetailScreen} />
    </Stack.Navigator>
  );
}
