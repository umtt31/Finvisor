import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelopes, faLock, faEye, faEyeSlash } from '@fortawesome/pro-regular-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../../redux/login-register/LoginRegisterActions';
import Shadows from '../../styles/shadows';
import { clearErrors } from '../../redux/login-register/LoginRegisterReducers';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux state
  const {
    loginLoading,
    loginError,
    isAuthenticated,
    token,
    error
  } = useSelector(state => state.auth);

  // Local state
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // Auth kontrol - token ve isAuthenticated'i kontrol et
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      if (isAuthenticated && token) {
        try {
          // AsyncStorage'dan token'ı kontrol et
          const storedToken = await AsyncStorage.getItem('auth_token');

          if (storedToken && storedToken.trim() !== '') {
            console.log('✅ User authenticated, navigating to HomeScreen');
            navigation.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }],
            });
          } else {
            console.log('❌ No stored token found');
            dispatch(clearErrors()); // Auth state'ini temizle
          }
        } catch (error) {
          console.error('AsyncStorage error:', error);
        }
      }
    };

    checkAuthAndNavigate();
  }, [isAuthenticated, token, navigation, dispatch]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Geçerli bir email adresi giriniz';
    }

    if (!credentials.password.trim()) {
      errors.password = 'Şifre gereklidir';
    } else if (credentials.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🚀 Starting login process...');

      const result = await dispatch(loginUser(credentials));

      console.log('🔍 Login result type:', result.type);
      console.log('🔍 Login result payload:', result.payload);

      if (result.type === 'auth/loginUser/fulfilled') {
        // Redux state'i güncellendi, useEffect otomatik olarak navigation'ı handle edecek
        console.log('✅ Login successful');
      } else if (result.type === 'auth/loginUser/rejected') {
        // Hata Redux state'inde zaten var, UI'da gösterilecek
        console.log('❌ Login failed:', result.payload);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
    }
  };

  // Handle navigation to signup
  const handleSignupNavigation = () => {
    navigation.navigate('SignupScreen');
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    Alert.alert('Bilgi', 'Şifre sıfırlama özelliği yakında eklenecek');
    // navigation.navigate('ForgotPasswordScreen');
  };



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        className="flex-1 bg-[#171717]"
      >
        <View className="flex-1">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              justifyContent: 'center',
              minHeight: height * 0.9
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="items-center mb-10">
              <Image source={require('../../assets/finvisor-logo.png')} className="w-48 h-48 mb-2" />
              <Text className="text-[#1B77CD] font-bold text-base mb-5">Stock Platform</Text>
              <Text className="text-[#888888] text-base text-center leading-5">
                Log in to your account and explore the world of investment
              </Text>
            </View>

            {/* Form */}
            <View className="pt-5">

              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-white text-base font-medium mb-2">Email</Text>
                <Pressable
                  className={`flex-row items-center bg-[#252525] rounded-xl px-4 border gap-3 ${fieldErrors.email ? 'border-[#FF4444]' : 'border-[#444444]'
                    }`}
                >

                  <FontAwesomeIcon icon={faEnvelopes} size={20} color="#888" />
                  <TextInput
                    className="flex-1 py-4 text-white"
                    style={{
                      textAlignVertical: 'center',
                      paddingVertical: 0,
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#888"
                    value={credentials.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loginLoading}
                  />
                </Pressable>
                {fieldErrors.email && (
                  <Text className="text-[#FF4444] text-sm mt-1.5 ml-1">{fieldErrors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-5">
                <Text className="text-white text-base font-medium mb-2">Password</Text>
                <Pressable
                  className={`flex-row items-center bg-[#252525] rounded-xl px-4 border gap-3 ${fieldErrors.email ? 'border-[#FF4444]' : 'border-[#444444]'
                    }`}
                >
                  <FontAwesomeIcon icon={faLock} size={20} color="#888" />
                  <TextInput
                    className="flex-1 py-4 text-white"
                    style={{
                      textAlignVertical: 'center',
                      paddingVertical: 0,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#888"
                    value={credentials.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loginLoading}
                  />
                  <TouchableOpacity
                    className="p-1"
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loginLoading}
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEye : faEyeSlash}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </Pressable>
                {fieldErrors.password && (
                  <Text className="text-[#FF4444] text-sm mt-1.5 ml-1">{fieldErrors.password}</Text>
                )}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                className="items-end mb-6"
                onPress={handleForgotPassword}
                disabled={loginLoading}
              >
                <Text className="text-[#1B77CD] text-sm font-medium">Forgot Password?</Text>
              </TouchableOpacity>

              {/* Error Display */}
              {(loginError || error) && (
                <View className="bg-[#FF444420] p-3 rounded-lg mb-5 border border-[#FF4444]">
                  <Text className="text-[#FF4444] text-sm text-center">
                    {loginError || error}
                  </Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                className={`bg-[#1B77CD] rounded-[14px] py-4 items-center mb-6 ${(loginLoading || !credentials.email || !credentials.password) ? 'bg-[#1B77CD80]' : ''
                  }`}
                style={Shadows.shadow2}
                onPress={handleLogin}
                disabled={loginLoading || !credentials.email || !credentials.password}
              >
                {loginLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white text-lg font-semibold">Login</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-[#444444]" />
                <Text className="text-[#888888] text-sm mx-4">or</Text>
                <View className="flex-1 h-[1px] bg-[#444444]" />
              </View>

              {/* Signup Link */}
              <TouchableOpacity
                className="items-center mb-5"
                onPress={handleSignupNavigation}
                disabled={loginLoading}
              >
                <Text className="text-[#888888] text-base">
                  Don't have an account?{' '}
                  <Text className="text-[#1B77CD] font-semibold">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;