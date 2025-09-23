
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { ProvisioningProvider } from './src/presentation/hooks/provisioning/useProvisioning';
import BottomTabNavigator from './src/presentation/navigation/BottomTabNavigator';
import './global.css';

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
      <ProvisioningProvider>
        <NavigationContainer theme={rnScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <BottomTabNavigator />
        </NavigationContainer>
      </ProvisioningProvider>
    </SafeAreaProvider>
  );
};

export default App;
