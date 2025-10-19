import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { ProvisioningProvider } from './src/presentation/hooks/provisioning/useProvisioning';
import { AuthProvider } from './src/presentation/context/AuthContext';
import { VaultProvider } from './src/presentation/hooks/VaultContext';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import './global.css';

const App = () => {

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VaultProvider>
          <ProvisioningProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ProvisioningProvider>
        </VaultProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;