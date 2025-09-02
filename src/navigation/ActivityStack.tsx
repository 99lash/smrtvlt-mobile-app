// src/navigation/HomeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActivityScreen from '../screens/Activity/ActivityScreen';
import ActivityDetailScreen from '../screens/Activity/ActivityDetailScreen';
import { ActivityStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export default function ActivityStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ActivityMain" component={ActivityScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
    </Stack.Navigator>
  );
}
