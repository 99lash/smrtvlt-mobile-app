import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react-native';
import ButtonPrimary from '../../buttons/ButtonPrimary';
import SuccessBanner from '../../banner/SuccessBanner';
import FailureBanner from '../../banner/FailureBanner';
import { useAuthContext } from '../../../context/AuthContext';
import RegisterModal from '../register';

type LoginProps = {
  onLoginSuccess?: () => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const { login: authLogin } = useAuthContext();

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setIsLoading(false);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please fill in all fields');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setShowError(false);

    try {
      const loginData = {
        username: username.trim(),
        password: password,
      };

      console.log('Login - Attempting login for:', loginData.username);

      await authLogin(loginData.username, loginData.password);

      if (__DEV__) {
        console.log('Login - Login successful');
      }

      setIsLoading(false);
      setShowSuccess(true);

      // Auto-hide success banner after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onLoginSuccess?.();
      }, 2000);

    } catch (error) {
      setIsLoading(false);

      let errorMsg = 'Login failed. Please try again.';

      if (error instanceof Error) {
        switch (error.message) {
          case 'Invalid username or password':
            errorMsg = 'Invalid username or password. Please check your credentials.';
            break;
          case 'Invalid login credentials provided':
            errorMsg = 'Please check your username and password.';
            break;
          case 'Server error occurred during login':
            errorMsg = 'Server error. Please try again later.';
            break;
          case 'Network error occurred during login':
            errorMsg = 'Network error. Please check your connection and try again.';
            break;
          default:
            errorMsg = error.message || 'Login failed. Please try again.';
        }
      }

      setErrorMessage(errorMsg);
      setShowError(true);

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
    // Modal will automatically close after success
    // Optionally show a message prompting user to login
    setErrorMessage('Account created! Please login with your credentials.');
    setShowError(false);
    // Show as info message instead of error
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  return (
    <>
      <ScrollView 
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-blue-100 p-4 rounded-full mb-4">
              <LogIn size={40} color="#3B82F6" />
            </View>
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-600 text-center px-4">
              Sign in to access your SmartVault account and manage your devices
            </Text>
          </View>

          {/* Login Form */}
          <View className="w-full max-w-md mx-auto">
            {/* Username/Email Field */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <User size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Enter your username or email"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50">
                <Lock size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Enter your password"
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
                  className="ml-2"
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
            <TouchableOpacity className="mb-6">
              <Text className="text-sm text-blue-600 text-right">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <ButtonPrimary
              title="Login to SmartVault"
              onPress={handleLogin}
              disabled={isLoading || !username.trim() || !password.trim()}
              loading={isLoading}
              icon={<LogIn size={20} color="white" />}
              className="w-full"
            />

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600 text-sm">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => setRegisterModalVisible(true)}>
                <Text className="text-blue-600 text-sm font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
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

      {/* Success Banner */}
      {showSuccess && (
        <SuccessBanner
          message="Login successful! Welcome back."
          duration={2000}
          onHide={() => setShowSuccess(false)}
        />
      )}

      {/* Error Banner */}
      {showError && (
        <FailureBanner
          message={errorMessage}
          duration={3000}
          onHide={() => setShowError(false)}
        />
      )}
    </>
  );
};

export default Login;