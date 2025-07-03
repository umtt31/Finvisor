// components/Analysis/AnalysisCharts.js - React Native Wagmi Charts Version
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
} from 'react-native-reanimated';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChartWaterfall, faChartBar, faNewspaper, faArrowTrendUp, faArrowTrendDown } from '@fortawesome/pro-solid-svg-icons';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 200;
const CHART_WIDTH = width - 64;

const AnalysisCharts = ({ analysisData = [] }) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [activeChart, setActiveChart] = useState('confidence');

    // Animation values
    const chartOpacity = useSharedValue(0);
    const chartScale = useSharedValue(0.95);

    // Entry animations
    useEffect(() => {
        chartOpacity.value = withTiming(1, { duration: 800 });
        chartScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, [analysisData]);

    if (!analysisData || analysisData.length === 0) {
        return (
            <View className="bg-[#252525] rounded-xl p-4 mx-4 mb-4">
                <Text className="text-gray-400 text-center">No chart data available</Text>
            </View>
        );
    }

    // Process data for confidence chart
    const confidenceChartData = useMemo(() => {
        return analysisData.map((item, index) => ({
            timestamp: new Date(item.date).getTime(),
            value: item.avg_score * 100, // Convert to percentage
        })).sort((a, b) => a.timestamp - b.timestamp);
    }, [analysisData]);

    // Process data for article count chart
    const articleChartData = useMemo(() => {
        return analysisData.map((item, index) => ({
            timestamp: new Date(item.date).getTime(),
            value: item.article_count,
        })).sort((a, b) => a.timestamp - b.timestamp);
    }, [analysisData]);

    // Animated styles
    const chartAnimatedStyle = useAnimatedStyle(() => ({
        opacity: chartOpacity.value,
        transform: [{ scale: chartScale.value }],
    }));

    // Handle point selection
    const handleCursorActivated = (data) => {
        setSelectedPoint(data);
    };

    const handleCursorEnded = () => {
        setSelectedPoint(null);
    };

    // Format date for display
    const formatShortDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Chart selector buttons
    const ChartSelector = () => (
        <View className="flex-row justify-center mb-4 bg-[#252525] rounded-lg ">
            <TouchableOpacity
                onPress={() => setActiveChart('confidence')}
                className={`flex-1 py-2 px-4 rounded-md ${activeChart === 'confidence' ? 'bg-[#1B77CD]' : 'bg-transparent'}`}
            >
                <Text className={`text-center text-sm font-medium ${activeChart === 'confidence' ? 'text-white' : 'text-gray-400'}`}>
                    Confidence
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setActiveChart('articles')}
                className={`flex-1 py-2 px-4 rounded-md ${activeChart === 'articles' ? 'bg-[#1B77CD]' : 'bg-transparent'}`}
            >
                <Text className={`text-center text-sm font-medium ${activeChart === 'articles' ? 'text-white' : 'text-gray-400'}`}>
                    Articles
                </Text>
            </TouchableOpacity>
        </View>
    );

    // Current chart data based on selection
    const currentChartData = activeChart === 'confidence' ? confidenceChartData : articleChartData;
    const chartColor = activeChart === 'confidence' ? '#1B77CD' : '#10B981';
    const chartTitle = activeChart === 'confidence' ? 'Model Confidence Trend' : 'Daily Article Analysis';
    const chartSubtitle = activeChart === 'confidence' ? 'AI model confidence levels over time' : 'Number of articles analyzed daily';

    return (
        <View className="mx-4 mb-4 space-y-4">
            {/* Interactive Chart */}
            <View className=" rounded-xl p-4">
                <View className="flex-row justify-center items-center mb-4">
                    <FontAwesomeIcon
                        icon={activeChart === 'confidence' ? faChartWaterfall : faNewspaper}
                        size={18}
                        color="#1B77CD"
                    />
                    <Text className="text-white text-lg font-bold ml-2">
                        {chartTitle}
                    </Text>
                </View>
                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-400 text-sm mb-4">
                        {chartSubtitle}
                    </Text>
                </View>

                <ChartSelector />

                <Animated.View style={[chartAnimatedStyle, { width: '100%' }]}>
                    <LineChart.Provider data={currentChartData}>
                        <LineChart height={CHART_HEIGHT} width={CHART_WIDTH}>
                            {/* Main Line Path */}
                            <LineChart.Path color={chartColor} width={3}>
                                <LineChart.Gradient />
                            </LineChart.Path>

                            {/* Interactive Crosshair */}
                            <LineChart.CursorCrosshair
                                color={chartColor}
                                onActivated={handleCursorActivated}
                                onEnded={handleCursorEnded}
                            >
                                <LineChart.CursorLine
                                    color="rgba(255, 255, 255, 0.5)"
                                    strokeWidth={1}
                                    strokeDasharray="4,4"
                                />

                                <LineChart.Tooltip
                                    position="top"
                                    textStyle={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        color: 'white',
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 6,
                                        borderWidth: 1,
                                        borderColor: chartColor,
                                    }}
                                    cursorGutter={16}
                                />
                            </LineChart.CursorCrosshair>

                            <LineChart.HoverTrap />

                            {/* Grid Lines */}
                            {currentChartData.length > 0 && (
                                <>
                                    <LineChart.HorizontalLine
                                        color="rgba(255, 255, 255, 0.1)"
                                        strokeWidth={0.5}
                                        strokeDasharray="2,2"
                                        at={{ value: Math.max(...currentChartData.map(d => d.value)) }}
                                    />
                                    <LineChart.HorizontalLine
                                        color="rgba(255, 255, 255, 0.1)"
                                        strokeWidth={0.5}
                                        strokeDasharray="2,2"
                                        at={{ value: (Math.max(...currentChartData.map(d => d.value)) + Math.min(...currentChartData.map(d => d.value))) / 2 }}
                                    />
                                    <LineChart.HorizontalLine
                                        color="rgba(255, 255, 255, 0.1)"
                                        strokeWidth={0.5}
                                        strokeDasharray="2,2"
                                        at={{ value: Math.min(...currentChartData.map(d => d.value)) }}
                                    />
                                </>
                            )}
                        </LineChart>
                    </LineChart.Provider>

                    {/* X-axis labels */}
                    <View className="flex-row justify-between mt-2 px-4">
                        {currentChartData.length > 0 && (
                            <>
                                <Text className="text-xs text-gray-400">
                                    {formatShortDate(currentChartData[0].timestamp)}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {formatShortDate(currentChartData[Math.floor(currentChartData.length / 2)].timestamp)}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                    {formatShortDate(currentChartData[currentChartData.length - 1].timestamp)}
                                </Text>
                            </>
                        )}
                    </View>

                    <Text className="text-center text-gray-400 text-xs mt-2">
                        Days of May • {activeChart === 'confidence' ? 'Confidence Level (%)' : 'Articles Analyzed'}
                    </Text>
                </Animated.View>
            </View>

            {/* 5-Day Analysis Summary */}
            <View className=" rounded-xl p-1 mt-4">
                <View className="flex-row justify-center items-center mb-4">
                    <FontAwesomeIcon icon={faChartBar} size={18} color="#1B77CD" />
                    <Text className="text-white text-lg font-bold ml-2">
                        5-Day Analysis Summary
                    </Text>
                </View>

                <View className="space-y-3 gap-3">
                    {analysisData.map((item, index) => (
                        <View key={index} className="bg-[#252525] rounded-lg p-3">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-white text-sm font-medium">
                                    {new Date(item.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Text>
                                <Text className="text-gray-400 text-xs">
                                    {item.article_count} articles
                                </Text>
                            </View>

                            <View className="flex-row justify-between">
                                {/* Sentiment */}
                                <View className="flex-1 items-center">
                                    <Text className="text-sm  text-gray-400 mb-1">Sentiment</Text>
                                    <View
                                        className="px-2 py-1 rounded"
                                    >
                                        <Text className="text-white text-sm font-bold"
                                            style={{
                                                color: item.daily_sentiment_prediction === 1 ? '#1DB954' : '#FF4136'
                                            }}
                                        >
                                            {item.daily_sentiment_prediction === 1 ? 'Positive' : 'Negative'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Daily Direction */}
                                <View className="flex-1 items-center">
                                    <Text className="text-sm  text-gray-400 mb-1">Daily</Text>
                                    <View
                                        className="px-2 py-1 rounded flex-row items-center"
                                    >
                                        <FontAwesomeIcon
                                            icon={item.direction_prediction.daily === 1 ? faArrowTrendUp : faArrowTrendDown}
                                            size={10}
                                            color={item.daily_sentiment_prediction === 1 ? '#1DB954' : '#FF4136'}
                                        />
                                        <Text className="text-white text-sm  font-bold ml-1"
                                            style={{
                                                color: item.daily_sentiment_prediction === 1 ? '#1DB954' : '#FF4136'
                                            }}
                                        >
                                            {item.direction_prediction.daily === 1 ? 'Bull' : 'Bear'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Weekly Direction */}
                                <View className="flex-1 items-center">
                                    <Text className="text-sm  text-gray-400 mb-1">Weekly</Text>
                                    <View
                                        className="px-2 py-1 rounded flex-row items-center"
                                    >
                                        <FontAwesomeIcon
                                            icon={item.direction_prediction.weekly === 1 ? faArrowTrendUp : faArrowTrendDown}
                                            size={10}
                                            color={item.daily_sentiment_prediction === 1 ? '#1DB954' : '#FF4136'}
                                        />
                                        <Text className="text-white text-sm font-bold ml-1"
                                            style={{
                                                color: item.direction_prediction.weekly === 1 ? '#1DB954' : '#FF4136'
                                            }}
                                        >
                                            {item.direction_prediction.weekly === 1 ? 'Bull' : 'Bear'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Confidence */}
                                <View className="flex-1 items-center">
                                    <Text className="text-sm  text-gray-400 mb-1">Confidence</Text>
                                    <View className="px-2 py-1 ">
                                        <Text
                                            className="text-sm font-bold"
                                            style={{
                                                color: item.avg_score >= 0.8 ? '#1DB954' :
                                                    item.avg_score >= 0.6 ? '#FFA500' : '#FF4136'
                                            }}
                                        >
                                            {(item.avg_score * 100).toFixed(0)}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

        </View>
    );
};


export default AnalysisCharts;