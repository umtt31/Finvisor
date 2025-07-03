import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faSignature,
  faEnvelopes,
  faPhone,
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faCalendar,
  faArrowLeft,
  faPersonRunningFast,
  faPhoneIntercom,
  faCalendarDays,
  faCakeCandles,
  faTimes
} from "@fortawesome/pro-regular-svg-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import Shadows from "../../styles/shadows";
import { registerUser } from "../../redux/login-register/LoginRegisterActions";

const { width } = Dimensions.get("window");

const SignupScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { registerLoading, registerError, isAuthenticated } = useSelector((state) => state.auth);

  // Form States
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date(2000, 0, 1));

  // Step handling
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3; // Account Info, Personal Info, Password

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Input refs for keyboard navigation
  const emailInputRef = useRef(null);
  const usernameInputRef = useRef(null);
  const firstNameInputRef = useRef(null);
  const lastNameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  // Navigate to home if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate("Main");
    }
  }, [isAuthenticated, navigation]);

  // Date picker handlers
  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateValue;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setDateValue(currentDate);

    // Format date for API (YYYY-MM-DD)
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    setBirthDate(`${year}-${month}-${day}`);
  };

  // Basic validation functions
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPhoneValid = (phone) => {
    if (!phone) return true; // Optional field
    return /^\d{10,11}$/.test(phone.replace(/[\s()-]/g, ""));
  };

  // Validate current step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Account Info
        if (!email.trim()) {
          Alert.alert("Hata", "Lütfen e-posta adresinizi giriniz.");
          return false;
        }
        if (!isEmailValid(email.trim())) {
          Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi giriniz.");
          return false;
        }
        if (!username.trim()) {
          Alert.alert("Hata", "Lütfen kullanıcı adı giriniz.");
          return false;
        }
        if (username.length < 3) {
          Alert.alert("Hata", "Kullanıcı adı en az 3 karakter olmalıdır.");
          return false;
        }
        return true;

      case 1: // Personal Info
        if (!firstName.trim()) {
          Alert.alert("Hata", "Lütfen adınızı giriniz.");
          return false;
        }
        if (!lastName.trim()) {
          Alert.alert("Hata", "Lütfen soyadınızı giriniz.");
          return false;
        }
        if (phoneNumber && !isPhoneValid(phoneNumber.trim())) {
          Alert.alert("Hata", "Lütfen geçerli bir telefon numarası giriniz.");
          return false;
        }
        return true;

      case 2: // Password Creation
        if (!password.trim()) {
          Alert.alert("Hata", "Lütfen şifre giriniz.");
          return false;
        }
        if (password.length < 6) {
          Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
          return false;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
          Alert.alert("Hata", "Şifre en az bir büyük ve bir küçük harf içermelidir.");
          return false;
        }
        if (!/(?=.*\d)/.test(password)) {
          Alert.alert("Hata", "Şifre en az bir rakam içermelidir.");
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert("Hata", "Şifreler eşleşmiyor.");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Effect to update progress animation when step changes
  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Handle next step button
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        // Start slide animation
        Animated.timing(slideAnim, {
          toValue: -1, // Slide to left
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          // Reset position and update step after animation completes
          slideAnim.setValue(1); // Position next content off screen to right
          setCurrentStep(currentStep + 1);

          // Slide in from right
          Animated.timing(slideAnim, {
            toValue: 0, // Slide to center
            duration: 300,
            useNativeDriver: true
          }).start();
        });
      } else {
        handleRegister();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      // Start slide animation (to right direction)
      Animated.timing(slideAnim, {
        toValue: 1, // Slide to right
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        // Reset position and update step after animation completes
        slideAnim.setValue(-1); // Position next content off screen to left
        setCurrentStep(currentStep - 1);

        // Slide in from left
        Animated.timing(slideAnim, {
          toValue: 0, // Slide to center
          duration: 300,
          useNativeDriver: true
        }).start();
      });
    }
  };

  // Handle register button press (final step)
  const handleRegister = async () => {
    try {
      console.log("🚀 Starting registration...");

      // Backend'in beklediği format
      const userData = {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        password_confirmation: confirmPassword.trim(),
        phone_number: phoneNumber.trim() || "",
        birth_date: birthDate || "",
      };

      console.log("📋 Registration data:", userData);

      const result = await dispatch(registerUser(userData));

      if (result.type === "auth/registerUser/fulfilled") {
        console.log("✅ Registration successful!");
        Alert.alert("Success", "Your account has been created successfully!");
        // Navigation will be handled by useEffect hook
      } else {
        console.log("❌ Registration failed:", result.payload);
        // Error will be shown by Redux error state
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  // Render Progress Indicators
  const renderProgressIndicators = () => {
    return (
      <View className="mb-6 px-5">
        <View className="flex-row justify-center items-center w-full space-x-2">
          {Array(totalSteps)
            .fill(0)
            .map((_, index) => {
              const isCompleted = index < currentStep;
              const isCurrentStep = index === currentStep;

              return (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: '#444444',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  {isCompleted ? (
                    <View
                      style={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#1B77CD',
                        borderRadius: 6,
                      }}
                    />
                  ) : isCurrentStep ? (
                    <Animated.View
                      style={{
                        height: '100%',
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: '#1B77CD',
                        borderRadius: 6,
                      }}
                    />
                  ) : null}
                </View>
              );
            })}
        </View>
      </View>
    );
  };

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "Account Information";
      case 1:
        return "Personal Information";
      case 2:
        return "Create Password";
      default:
        return "";
    }
  };

  // Initialize animation on first render
  useEffect(() => {
    slideAnim.setValue(1);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  // Format birthdate for display
  const getDisplayBirthDate = () => {
    if (birthDate) {
      const parts = birthDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY format for display
      }
      return birthDate;
    }
    return "";
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Account Info
        return (
          <>
            {/* Email Input */}
            <View className="w-[100%] mb-4">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Email
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <FontAwesomeIcon icon={faEnvelopes} size={24} color="#fafafc" />
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="Enter your email"
                  placeholderTextColor="#888888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  ref={emailInputRef}
                  returnKeyType="next"
                  onSubmitEditing={() => usernameInputRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!registerLoading}
                />
              </Pressable>
            </View>

            {/* Username Input */}
            <View className="w-[100%]">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Username
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <FontAwesomeIcon icon={faPersonRunningFast} size={24} color="#fafafc" />
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="Enter your username"
                  placeholderTextColor="#888888"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  ref={usernameInputRef}
                  returnKeyType="done"
                  onSubmitEditing={handleNextStep}
                  editable={!registerLoading}
                />
              </Pressable>
            </View>
          </>
        );

      case 1: // Personal Info
        return (
          <>
            {/* First Name */}
            <View className="w-[100%] mb-4">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Name
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <FontAwesomeIcon icon={faUser} size={24} color="#fafafc" />
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="Enter your name"
                  placeholderTextColor="#888888"
                  value={firstName}
                  onChangeText={setFirstName}
                  ref={firstNameInputRef}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameInputRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!registerLoading}
                />
              </Pressable>
            </View>

            {/* Last Name */}
            <View className="w-[100%] mb-4">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Surname
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <FontAwesomeIcon icon={faSignature} size={24} color="#fafafc" />
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="Enter your surname"
                  placeholderTextColor="#888888"
                  value={lastName}
                  onChangeText={setLastName}
                  ref={lastNameInputRef}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!registerLoading}
                />
              </Pressable>
            </View>

            {/* Phone Number */}
            <View className="w-[100%] mb-4">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Phone number (Optional)
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <FontAwesomeIcon icon={faPhoneIntercom} size={24} color="#fafafc" />
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="Enter your phone number"
                  placeholderTextColor="#888888"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  ref={phoneInputRef}
                  returnKeyType="done"
                  editable={!registerLoading}
                />
              </Pressable>
            </View>

            {/* Birth Date */}
            <View className="w-[100%]">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Birth Date (Optional)
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <View className="flex-row items-center gap-2 flex-1">
                  <FontAwesomeIcon icon={faCakeCandles} size={24} color="#fafafc" />
                  <TextInput
                    className="flex-1 py-4 text-white"
                    placeholder="Select birth date"
                    placeholderTextColor="#888888"
                    value={getDisplayBirthDate()}
                    editable={false}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleOpenDatePicker}
                  disabled={registerLoading}
                >
                  <FontAwesomeIcon icon={faCalendarDays} size={22} color="#fafafc" />
                </TouchableOpacity>
              </Pressable>

              {/* DateTimePicker */}
              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1920, 0, 1)}
                />
              )}
            </View>
          </>
        );

      case 2: // Password Creation
        return (
          <>
            {/* Password Input */}
            <View className="w-[100%] mb-4">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Password
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <FontAwesomeIcon icon={faLock} size={24} color="#fafafc" />
                <TextInput
                  className="flex-1 py-4 text-white"
                  placeholder="Enter your password"
                  placeholderTextColor="#888888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  ref={passwordInputRef}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!registerLoading}
                />
              </Pressable>
            </View>

            {/* Confirm Password Input */}
            <View className="w-[100%] mb-4">
              <Text className="text-white text-base font-medium mb-2 ml-1">
                Password Confirmation
              </Text>
              <Pressable
                className="flex-row gap-3 px-4 justify-center items-center bg-[#252525] rounded-xl"
                style={Shadows.shadow1}
              >
                <View className="flex-row items-center gap-2 flex-1">
                  <FontAwesomeIcon icon={faLock} size={24} color="#fafafc" />
                  <TextInput
                    className="flex-1 py-4 text-white"
                    placeholder="Enter your password again"
                    placeholderTextColor="#888888"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    ref={confirmPasswordInputRef}
                    returnKeyType="done"
                    onSubmitEditing={handleNextStep}
                    editable={!registerLoading}
                  />
                </View>
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={registerLoading}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEye : faEyeSlash}
                    size={22}
                    color="#fafafc"
                  />
                </Pressable>
              </Pressable>
            </View>

            {/* Password Requirements */}
            <View className="w-[100%]  rounded-lg p-3">
              <Text className="text-white text-sm font-semibold mb-2">
                Password Requirements:
              </Text>
              <Text className={`text-xs ${password.length >= 6 ? "text-green-400" : "text-gray-400"}`}>
                • At least 6 characters
              </Text>
              <Text className={`text-xs ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "text-green-400" : "text-gray-400"}`}>
                • Uppercase and lowercase letters
              </Text>
              <Text className={`text-xs ${/(?=.*\d)/.test(password) ? "text-green-400" : "text-gray-400"}`}>
                • At least one number
              </Text>
              <Text className={`text-xs ${password === confirmPassword && password ? "text-green-400" : "text-gray-400"}`}>
                • Passwords must match
              </Text>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-[#171717]">
        {/* Header */}
        <View className="flex-row items-center justify-center relative pt-6 pb-2">
          {/* Back Button */}
          <View className="absolute left-5 top-6 z-10">
            {currentStep > 0 ? (
              <TouchableOpacity
                onPress={handlePreviousStep}
                className="flex-row items-center"
                disabled={registerLoading}
              >
                <FontAwesomeIcon icon={faArrowLeft} size={18} color="#1B77CD" />
                <Text className="text-[#1B77CD] ml-2 font-medium">Geri</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("OnboardingScreen")}
                className="flex-row items-center"
                disabled={registerLoading}
              >
                <FontAwesomeIcon icon={faArrowLeft} size={18} color="#1B77CD" />
              </TouchableOpacity>
            )}
          </View>

          {/* App Title */}
          <View className="items-center">
            <Image source={require('../../assets/finvisor-logo.png')} className="w-36 h-36 mb-2" />

          </View>
        </View>

        {/* Progress Bar */}
        {renderProgressIndicators()}

        {/* Step Title */}
        <View className="px-5 mb-4">
          <Text className="text-[#1B77CD] text-xl font-bold text-center">
            {getStepTitle()}
          </Text>
        </View>

        {/* Error Display */}
        {registerError && (
          <View className="bg-red-500 bg-opacity-20 p-3 rounded-lg mx-5 mb-4 border border-red-500">
            <Text className="text-red-400 text-center">
              {registerError}
            </Text>
          </View>
        )}

        {/* Main Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          {/* Scrollable Content Area */}
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              className="flex"
              style={{
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-(width * 0.8), 0, width * 0.8]
                  })
                }]
              }}
            >
              {/* Current Step Content */}
              {renderStepContent()}
            </Animated.View>
          </ScrollView>

          {/* Button Area */}
          <View className="bg-[#171717] px-5 py-4">
            {/* Continue Button */}
            <TouchableOpacity
              className="rounded-[14px] bg-[#1B77CD] items-center justify-center py-3 w-full"
              style={[
                Shadows.shadow2,
                registerLoading && { opacity: 0.6 }
              ]}
              onPress={handleNextStep}
              disabled={registerLoading}
            >
              {registerLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-[15px] text-white font-semibold">
                  {currentStep === totalSteps - 1 ? "Create your account" : "Next"}
                </Text>
              )}
            </TouchableOpacity>


          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;