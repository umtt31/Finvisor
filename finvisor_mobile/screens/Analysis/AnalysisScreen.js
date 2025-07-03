// screens/Analysis/AnalysisScreen.js
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBrain, faChartLine } from '@fortawesome/pro-solid-svg-icons';

// Import Components
import DateSelector from '../../components/Analysis/DateSelector';
import AnalysisOverview from '../../components/Analysis/AnalysisOverview';
import AnalysisCharts from '../../components/Analysis/AnalysisCharts';

// Import Data
import {
    mockAnalysisData,
    getAnalysisForDate,
    getLatestAnalysis
} from '../../data/analysisData';
import { StatusBar } from 'expo-status-bar';

const AnalysisScreen = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Available dates from dummy data
    const availableDates = mockAnalysisData.map(item => item.date).sort();

    // Initialize with latest date
    useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            const latestDate = availableDates[availableDates.length - 1];
            setSelectedDate(latestDate);
            setCurrentAnalysis(getAnalysisForDate(latestDate));
            setLoading(false);
        }
    }, [availableDates, selectedDate]);

    // Handle date selection
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        const analysis = getAnalysisForDate(date);
        setCurrentAnalysis(analysis);
    };

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);

        // Simulate API call delay
        setTimeout(() => {
            // In real implementation, this would fetch fresh data from backend
            if (selectedDate) {
                setCurrentAnalysis(getAnalysisForDate(selectedDate));
            }
            setRefreshing(false);
        }, 1000);
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-[#171717]">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1B77CD" />
                    <Text className="text-white mt-3 text-lg">Loading AI Analysis...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#171717]">

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#1B77CD"
                        colors={['#1B77CD']}
                    />
                }
                contentContainerStyle={{ paddingVertical: 20 }}
            >
                {/* Date Selector */}
                <DateSelector
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    availableDates={availableDates}
                />

                {/* Analysis Overview */}
                {currentAnalysis && (
                    <AnalysisOverview analysisData={currentAnalysis} />
                )}

                <AnalysisCharts analysisData={mockAnalysisData} />

                {/* Model Information */}
                <View className=" rounded-xl p-4 mx-4 mb-4">
                    <Text className="text-white text-lg font-bold mb-3 text-center">Model Information</Text>

                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-400 text-sm">Model Type</Text>
                            <Text className="text-white text-sm font-medium">Neural Network</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-gray-400 text-sm">Training Data</Text>
                            <Text className="text-white text-sm font-medium">Financial News & NDX History</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-gray-400 text-sm">Update Frequency</Text>
                            <Text className="text-white text-sm font-medium">Daily</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-gray-400 text-sm">Confidence Range</Text>
                            <Text className="text-white text-sm font-medium">0% - 100%</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AnalysisScreen;