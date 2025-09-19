import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import React from 'react';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

const App = () => {
  const rnScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  React.useEffect(() => {
    if (rnScheme === 'dark' || rnScheme === 'light') {
      setColorScheme(rnScheme);
    }
  }, [rnScheme, setColorScheme]);

  return (
    <SafeAreaProvider>
        <NavigationContainer theme={rnScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <MainTabNavigator />
        </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
