// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ActivityStackParamList, 'ActivityMain'>;

export default function ActivityScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Activity Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('ActivityDetail', { id: '123' })}
      />
    </View>
  );
}
