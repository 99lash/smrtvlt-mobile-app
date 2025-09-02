import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import MainTabNavigator from './src/navigation/MainTabNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
        <NavigationContainer>
          <MainTabNavigator />
        </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
