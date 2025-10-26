import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, Dimensions } from 'react-native';
import { Eye, EyeOff, User, Lock, LogIn, Shield, Mail, AlertCircle } from 'lucide-react-native';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import { useAuthContext } from '../../../context/AuthContext';
import { useLogin } from '../../../hooks/useLogin';
import { validateLoginForm, resetLoginForm, createLoginFormData } from '../../../../utils/loginUtils';
import { LoginProps } from '../../../../types/LoginTypes';
import RegisterModal from '../register';
import { ErrorMessage } from '../../common/ErrorMessage';

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  // Use the new login hook instead of auth context
  const { login, isLoading, error: hookError, clearError } = useLogin();

  const handleLogin = async () => {
    // Clear any previous errors
    clearError();
    setShowError(false);

    // Validate form using utility function
    const validation = validateLoginForm(username, password);
    if (!validation.isValid) {
      setErrorMessage(validation.error!);
      setShowError(true);
      onLoginError?.(validation.error!);
      return;
    }

    try {
      const loginData = createLoginFormData(username, password);

      console.log('Login - Attempting login for:', loginData.username);

      // Use the new login hook
      await login(loginData.username, loginData.password);

      if (__DEV__) {
        console.log('Login - Login successful');
      }

      // Reset form and call success callback immediately
      resetLoginForm({ setUsername, setPassword, setShowPassword, setShowError, setErrorMessage });
      onLoginSuccess?.();

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrorMessage(errorMsg);
      setShowError(true);
      onLoginError?.(errorMsg);

      if (__DEV__) {
        console.error('Login - Login error:', error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful - user can now login');
    setErrorMessage('Account created! Please login with your credentials.');
    setShowError(false);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const { width, height } = Dimensions.get('window');

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background */}
        <View className="flex-1 bg-bg-default" style={{ minHeight: height }}>

          <View className="flex-1 justify-center px-6 py-8 bg-surface-default">

            {/* Header Section */}
            <View className="items-center mb-6">
              {/* Logo */}
              <View className="w-24 h-24 rounded-full bg-cards-default items-center justify-center mb-3 border-4 border-primary-default">
                <Shield size={30} color="#ffb800" />
              </View>
            </View>

            {/* Login Card */}
            <View className="bg-surface-default rounded-3xl p-8 pt-8  border border-border-default shadow-lg" 
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
              borderRadius: 24,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
            >
              {/* Error Messages */}
              {showError && (
                <ErrorMessage message={errorMessage} />
              )}

              {/* Username/Email Field */}
              <View className="mb-6">
                <View className="flex-row items-center rounded-2xl px-4 py-2 bg-bg-default border border-border-default">
                  <Mail size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-3 text-text-default text-base"
                    placeholder="Enter your username or email"
                    placeholderTextColor="#6B7280"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-8">
                <View className="flex-row items-center rounded-2xl px-4 py-2 bg-bg-default border border-border-default">
                  <Lock size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-3 text-text-default text-base"
                    placeholder="Enter your password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    disabled={isLoading}
                    className="ml-3 p-1"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity className="mb-8 self-end">
                <Text className="text-primary-default text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <ButtonPrimary
                title={isLoading ? "Signing In..." : "Sign In"}
                onPress={handleLogin}
                disabled={isLoading || !username.trim() || !password.trim()}
                loading={isLoading}
                icon={<LogIn size={20} color="white" />}
                iconPosition="left"
                className="mb-6"
              />

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-text-default/70 text-sm">
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => setRegisterModalVisible(true)}>
                  <Text className="text-primary-default font-semibold text-sm underline">
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Registration Modal */}
      <RegisterModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default Login;