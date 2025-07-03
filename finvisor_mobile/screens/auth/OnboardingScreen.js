import { View, Text, SafeAreaView, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Onboarding from '../../components/Onboarding/Onboarding';

const slides = [
    { id: '1', title: 'Feature 1', description: 'Details of the first feature.' },
    { id: '2', title: 'Feature 2', description: 'Details of the second feature.' },
    { id: '3', title: 'Feature 3', description: 'Details of the third feature.' },
    { id: '4', title: 'Feature 4', description: 'Details of the fourth feature.' },
];

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
    const navigation = useNavigation(); // 🔹 useNavigation() ile Navigation erişimi sağladık
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (flatListRef.current) {
            if (currentIndex < slides.length - 1) {
                flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
            } else {
                navigation.navigate("SignupScreen"); // 🔹 Son slide'da yönlendirme yap
            }
        } else {
            console.log("❌ FlatList ref is null!");
        }
    };

    const handleSkip = () => {
        navigation.navigate("LoginScreen"); // 🔹 Atla butonu Login ekranına yönlendiriyor
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.logoPart}>
                <Image source={require('../../assets/finvisor-logo.png')} className="w-48 h-48 mb-2" />
            </View>

            {/* Onboarding bileşenine flatListRef'i geçiyoruz */}
            <Onboarding onIndexChange={setCurrentIndex} flatListRef={flatListRef} />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButtonContainer} onPress={handleNext}>
                    <Text style={styles.nextButton}>
                        {currentIndex === slides.length - 1 ? 'Sign Up' : 'Next'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButtonContainer} onPress={handleSkip}>
                    <Text style={styles.skipButton}>
                        {currentIndex === slides.length - 1 ? 'Login' : 'Skip'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
    container: {

        flex: 1,
        alignItems: 'center',
        backgroundColor: '#171717',

    },
    logoPart: {
        alignItems: 'center',
        marginTop: 20,
    },
    title: {
        color: '#1B77CD',
        fontWeight: 'bold',
        fontSize: 40,
        paddingTop: 8,
    },
    subtitle: {
        color: '#1B77CD',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 20,
        gap: 12,
        marginBottom: 30,
    },
    nextButtonContainer: {
        width: width * 0.8,
        borderRadius: 20,
        paddingVertical: 12,
        backgroundColor: "#1B77CD",
        alignItems: 'center',
    },
    nextButton: {
        fontSize: 15,
        fontWeight: "500",
        color: "#fafafc",
    },
    skipButtonContainer: {
        width: width * 0.8,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ebebeb",
        alignItems: "center",
        paddingVertical: 12,
    },
    skipButton: {
        fontSize: 15,
        fontWeight: "500",
        color: "#1B77CD",
    },
});
