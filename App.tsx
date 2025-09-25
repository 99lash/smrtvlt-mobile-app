
import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { ProvisioningProvider } from './src/presentation/hooks/provisioning/useProvisioning';
import { AuthProvider } from './src/presentation/context/AuthContext';
import AppNavigator from './src/presentation/navigation/AppNavigator';
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
      <AuthProvider>
        <ProvisioningProvider>
          <NavigationContainer theme={rnScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppNavigator />
          </NavigationContainer>
        </ProvisioningProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
