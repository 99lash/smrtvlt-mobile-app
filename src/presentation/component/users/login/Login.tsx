import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, Dimensions, Image } from 'react-native';
import { Eye, EyeOff, User, Lock, LogIn, Mail, AlertCircle, Shield } from 'lucide-react-native';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import { useAuthContext } from '../../../context/AuthContext';
import { useLogin } from '../../../hooks/useLogin';
import { validateLoginForm, resetLoginForm, createLoginFormData } from '../../../../utils/loginUtils';
import { LoginProps } from '../../../../types/LoginTypes';
import RegisterModal from '../register';
import { ErrorMessage } from '../../common/ErrorMessage';
import PasswordResetRequestModal from '../../modals/PasswordResetRequestModal';
import PasswordResetFormModal from '../../modals/PasswordResetFormModal';

// Conditional import for logo image - falls back to Shield icon if image doesn't exist
let logoImage: any = null;
try {
  logoImage = require('../../../../assets/images/Logo.png');
} catch (error) {
  // Logo image not found, will use Shield icon instead
  console.warn('Logo image not found. Please add logo.png to src/assets/images/');
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onLoginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [passwordResetModalVisible, setPasswordResetModalVisible] = useState(false);
  const [passwordResetFormVisible, setPasswordResetFormVisible] = useState(false);

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
              <Image
                    source={logoImage}
                    style={{ width: 100, height: 100, resizeMode: 'contain' }}
                    onError={() => {
                      console.warn('Logo image failed to load. Using Shield icon instead.');
                    }}
                  />
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
                    className="flex-1 ml-3 text-text-dark text-base"
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
                    className="flex-1 ml-3 text-text-dark text-base"
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
              <TouchableOpacity
                className="mb-8 self-end"
                onPress={() => setPasswordResetModalVisible(true)}
              >
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
                <Text className="text-muted-default text-sm">
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

      {/* Password Reset Request Modal */}
      <PasswordResetRequestModal
        visible={passwordResetModalVisible}
        onClose={() => setPasswordResetModalVisible(false)}
        onSuccess={() => {
          // Password reset request was successful
          setPasswordResetModalVisible(false);
        }}
      />

      {/* Password Reset Form Modal */}
      <PasswordResetFormModal
        visible={passwordResetFormVisible}
        onClose={() => setPasswordResetFormVisible(false)}
        onSuccess={() => {
          // Password reset was successful
          setPasswordResetFormVisible(false);
          setErrorMessage('Password reset successful! Please log in with your new password.');
          setShowError(false);
        }}
      />
    </>
  );
};

export default Login;