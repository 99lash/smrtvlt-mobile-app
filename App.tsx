import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/presentation/context/AuthContext';
import { AuthService } from './src/service/AuthService';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { MockDataService } from './src/service/MockDataService';

// Register token refresh handler before any API calls
AuthService.initialize();

const App = () => {
  useEffect(() => {
    MockDataService.seedIfNeeded();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;