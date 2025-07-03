import { Image, StyleSheet, Text, View, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthToken } from './redux/login-register/LoginRegisterActions';

// Auth Screens
import OnboardingScreen from './screens/auth/OnboardingScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// Bottom Tab Screens
import FlowScreen from './screens/Flow/FlowScreen';
import StockScreen from './screens/Stock/StockScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';
import ProfileEditScreen from './screens/Profile/ProfileEditScreen';

// Modal/Stack Screens
import NewPostScreen from './screens/Post/NewPostScreen';
import SingleStockScreen from './screens/Stock/SingleStockScreen';

// Icons
import { AntDesign } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faBarsStaggered as faFlowSolid,
    faCircleEuro as faStockSolid,
    faUser as faUserSolid,
    faArrowLeft,
    faMicrochipAi as faAiSolid
} from '@fortawesome/pro-solid-svg-icons';
import {
    faBarsStaggered as faFlowRegular,
    faCircleEuro as faStockRegular,
    faUser as faUserRegular,
    faMicrochipAi as faAiRegular
} from '@fortawesome/pro-regular-svg-icons';

import { clearErrors } from "./redux/login-register/LoginRegisterReducers";
import AnalysisScreen from './screens/Analysis/AnalysisScreen';

// Stack Navigators
const MainStack = createStackNavigator();
const AuthStack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

// Global screen options for consistent styling
const DEFAULT_SCREEN_OPTIONS = {
    headerStyle: {
        backgroundColor: "#252525",
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTintColor: "#FFF",
    headerTitleAlign: "center",
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    headerBackTitleVisible: false,
};

// Tab bar icons configuration
const getTabBarIcon = (route, { focused, color }) => {
    const iconMap = {
        Flow: focused ? faFlowSolid : faFlowRegular,
        Stock: focused ? faStockSolid : faStockRegular,
        Profile: focused ? faUserSolid : faUserRegular,
        Ai: focused ? faAiSolid : faAiRegular
    };

    return <FontAwesomeIcon icon={iconMap[route.name]} size={22} color={color} />;
};

// BackButton component for consistent back navigation
const BackButton = ({ onPress, title }) => (
    <TouchableOpacity
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}
    >
        <FontAwesomeIcon icon={faArrowLeft} size={16} color="#1B77CD" />
        {title && (
            <Text style={{ color: '#1B77CD', fontSize: 16, marginLeft: 5 }}>
                {title}
            </Text>
        )}
    </TouchableOpacity>
);

// NAVIGATORS

// Profile Stack Navigator
const ProfileStackNavigator = () => {
    const currentUser = useSelector((state) => state.auth.user);

    return (
        <ProfileStack.Navigator screenOptions={DEFAULT_SCREEN_OPTIONS}>
            <ProfileStack.Screen
                name="UserProfile"
                component={ProfileScreen}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Image
                            source={require('./assets/finvisor-logo.png')}
                            style={{ width: 180, height: 50, resizeMode: 'contain' }}
                        />
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("NewPost")}
                            style={{ marginRight: 16 }}
                        >
                            <AntDesign name="plus" size={20} color="#1B77CD" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <ProfileStack.Screen
                name="ProfileEdit"
                component={ProfileEditScreen}
                options={{
                    headerShown: false
                }}
            />
        </ProfileStack.Navigator>
    );
};

// Authentication Navigator
const AuthNavigator = () => {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                ...DEFAULT_SCREEN_OPTIONS
            }}
        >
            <AuthStack.Screen name="OnboardingScreen" component={OnboardingScreen} />
            <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
            <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
        </AuthStack.Navigator>
    );
};

// Bottom Tab Navigator
const BottomTabNavigator = () => {
    const scrollY = useRef(new Animated.Value(0)).current;

    return (
        <BottomTab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: "#1B77CD",
                tabBarInactiveTintColor: "#11518D",
                tabBarStyle: {
                    borderTopWidth: 0,
                    backgroundColor: "#252525",
                    height: 70,
                },
                headerStyle: {
                    backgroundColor: "#252525",
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarShowLabel: false,
                tabBarIcon: (props) => getTabBarIcon(route, props),
            })}
        >
            <BottomTab.Screen
                name="Flow"
                component={FlowScreen}
                options={{
                    headerTitle: () => (
                        <Image
                            source={require('./assets/finvisor-logo.png')}
                            style={{ width: 180, height: 50, resizeMode: 'contain' }}
                        />
                    ),
                }}
                initialParams={{ scrollY }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (navigation.isFocused()) {
                            e.preventDefault();
                            if (global.scrollToTop) {
                                global.scrollToTop();
                            }
                        }
                    },
                })}
            />
            <BottomTab.Screen
                name="Ai"
                component={AnalysisScreen} // Ai özelliği henüz yoksa FlowScreen ile geçici olarak gösteriyoruz
                options={{
                    headerTitle: () => (
                        <Image
                            source={require('./assets/finvisor-logo.png')}
                            style={{ width: 180, height: 50, resizeMode: 'contain' }}
                        />
                    ),
                }}
            />
            <BottomTab.Screen
                name="Stock"
                component={StockScreen}
                options={{
                    headerTitle: () => (
                        <Image
                            source={require('./assets/finvisor-logo.png')}
                            style={{ width: 180, height: 50, resizeMode: 'contain' }}
                        />
                    ),
                }}
            />

            <BottomTab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{
                    headerShown: false
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Profile tab'ına basıldığında doğrudan UserProfile'e git
                        // e.preventDefault() kullanmıyoruz, normal navigation akışı devam etsin
                    }
                })}
            />
        </BottomTab.Navigator>
    );
};

// Main App Navigator
const MainAppNavigator = () => {
    return (
        <MainStack.Navigator
            screenOptions={{
                headerShown: false,
                ...DEFAULT_SCREEN_OPTIONS,
                detachPreviousScreen: false,
                freezeOnBlur: true,
            }}
        >
            {/* Main Tabs */}
            <MainStack.Screen
                name="MainTabs"
                component={BottomTabNavigator}
            />

            {/* Modal Screens */}
            <MainStack.Screen
                name="NewPost"
                component={NewPostScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerTitle: () => (
                        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: 'bold' }}>
                            New Post
                        </Text>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
                            <Text style={{ color: "#FFF", fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={{ marginRight: 16 }}>
                            <Text style={{ color: "#1B77CD", fontSize: 16, fontWeight: 'bold' }}>
                                Share
                            </Text>
                        </TouchableOpacity>
                    ),
                })}
            />

            <MainStack.Screen
                name="SingleStockScreen"
                component={SingleStockScreen}
                options={({ route, navigation }) => ({
                    headerShown: true,
                    headerTitle: () => (
                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>
                            {route.params?.symbol || 'Stock Detail'}
                        </Text>
                    ),
                    headerLeft: () => (
                        <BackButton
                            onPress={() => navigation.goBack()}
                        />
                    ),
                })}
            />

            {/* Other User Profile Screen */}
            <MainStack.Screen
                name="OtherUserProfile"
                component={ProfileScreen}
                options={({ navigation, route }) => ({
                    headerShown: true,
                    headerTitle: "",
                    headerLeft: () => (
                        <BackButton onPress={() => navigation.goBack()} />
                    ),
                })}
                initialParams={{ isOwnProfile: false }}
            />
        </MainStack.Navigator>
    );
};

// Root Navigator
const RootNavigator = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, tokenChecked, error } = useSelector(state => state.auth);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await dispatch(checkAuthToken());
            } catch (error) {
                console.log('Token check completed, user will see login screen if needed');
            } finally {
                setIsInitializing(false);
            }
        };

        initializeAuth();
    }, [dispatch]);

    // Auth durumu değiştiğinde hataları temizle
    useEffect(() => {
        if (tokenChecked && !isInitializing) {
            const timer = setTimeout(() => {
                dispatch(clearErrors());
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [tokenChecked, isInitializing, dispatch]);

    // Loading screen
    if (isInitializing || !tokenChecked) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingTitle}>Finvisor</Text>
                <Text style={styles.loadingSubtitle}>Stock Platform</Text>
                <ActivityIndicator color="#1B77CD" size="large" style={{ marginTop: 20 }} />
            </View>
        );
    }

    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <MainStack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <MainStack.Screen name="Main" component={MainAppNavigator} />
            )}
        </MainStack.Navigator>
    );
};

// Main Navigation Component
const Navigation = () => {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#171717'
    },
    loadingTitle: {
        color: '#1B77CD',
        fontSize: 40,
        fontWeight: 'bold'
    },
    loadingSubtitle: {
        color: '#1B77CD',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default Navigation;