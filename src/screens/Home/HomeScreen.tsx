// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types/navigation';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text className="text-primary text-2xl">Home Screen</Text>
      {/* <Button
        title="Go to Details"
        onPress={() => navigation.navigate('HomeDetail', { id: '123' })}
      /> */}
      <PrimaryButton title='Go to Details' onPress={() => navigation.navigate('HomeDetail', { id: '123' })}/>
      <SecondaryButton title='Go to Details' onPress={() => navigation.navigate('HomeDetail', { id: '123' })}/>

    </View>
  );
}
