import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Image, StyleSheet, ActivityIndicator } from 'react-native';

// Placeholder for ButtonPrimary to keep it self-contained or import if refactored.
// For now I'll implement a simple button here to ensure "no logic/libs" dependency for this file.
const SimpleButton = ({ title, onPress, disabled, loading }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    style={[styles.button, disabled && styles.buttonDisabled]}
  >
    {loading ? (
      <ActivityIndicator color="white" />
    ) : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

const Login = ({ onLoginSuccess }: { onLoginSuccess?: () => void, onLoginError?: (err: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    console.log('Login pressed');
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess?.();
    }, 1000);
  };

  const { height } = Dimensions.get('window');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.background, { minHeight: height }]}>
        <View style={styles.contentContainer}>
          
          {/* Header Section */}
          <View style={styles.logoContainer}>
             {/* Placeholder for Logo */}
             <View style={styles.logoPlaceholder}>
                <Text style={styles.logoText}>Logo</Text>
             </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            
            {/* Username/Email Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.iconPlaceholder}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username or email"
                  placeholderTextColor="#6B7280"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.iconPlaceholder}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text>{showPassword ? '👁️‍🗨️' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => console.log('Forgot Password pressed')}
            >
              <Text style={styles.linkText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <SimpleButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !username || !password}
            />

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.mutedText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => console.log('Create Account pressed')}>
                <Text style={[styles.linkText, styles.underline]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#f3f4f6', // bg-default
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff', // bg-surface-default ??? usually surface is white
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb', // light gray
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  iconPlaceholder: {
    fontSize: 20,
    color: '#6B7280',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937', // text-dark
  },
  eyeIcon: {
    marginLeft: 12,
    padding: 4,
  },
  forgotPassword: {
    marginBottom: 32,
    alignSelf: 'flex-end',
  },
  linkText: {
    color: '#3b82f6', // primary-default
    fontSize: 14,
    fontWeight: '600',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedText: {
    color: '#6b7280',
    fontSize: 14,
  },
});

export default Login;