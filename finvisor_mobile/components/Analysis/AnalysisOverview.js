// components/Analysis/AnalysisOverview.js
import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faNewspaper,
    faChartWaterfall,
    faBrain,
    faThumbsUp,
    faThumbsDown,
    faArrowTrendUp,
    faArrowTrendDown
} from '@fortawesome/pro-solid-svg-icons';
import {
    formatSentimentLabel,
    formatDirectionLabel,
    formatConfidenceScore,
    getSentimentColor,
    getDirectionColor,
    getConfidenceColor
} from '../../data/analysisData';

const AnalysisOverview = ({ analysisData }) => {
    if (!analysisData) {
        return (
            <View className="bg-[#252525] rounded-xl p-4 mx-4 mb-4">
                <Text className="text-gray-400 text-center">No analysis data available</Text>
            </View>
        );
    }

    const {
        daily_sentiment_prediction,
        direction_prediction,
        article_count,
        avg_score,
        date
    } = analysisData;

    const sentimentColor = getSentimentColor(daily_sentiment_prediction);
    const dailyDirectionColor = getDirectionColor(direction_prediction.daily);
    const confidenceColor = getConfidenceColor(avg_score);

    return (
        <View className="mx-4 mb-4">
            {/* Main Analysis Card */}
            <View className="rounded-xl p-1 mb-4">
                <View className="flex-row items-center justify-center mb-4">
                    <Text className="text-white text-lg font-bold">NDX AI Analysis</Text>
                </View>

                {/* Main Sentiment & Direction */}
                <View className="flex-row justify-between mb-6">
                    {/* Daily Sentiment */}
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center mb-2">
                            <FontAwesomeIcon
                                icon={daily_sentiment_prediction === 1 ? faThumbsUp : faThumbsDown}
                                size={20}
                                color={sentimentColor}
                            />
                            <Text className="text-white text-sm font-medium ml-2">Sentiment</Text>
                        </View>
                        <Text
                            className="text-lg font-bold"
                            style={{ color: sentimentColor }}
                        >
                            {formatSentimentLabel(daily_sentiment_prediction)}
                        </Text>
                    </View>

                    {/* Daily Direction */}
                    <View className="flex-1 items-center">
                        <View className="flex-row items-center mb-2">
                            <FontAwesomeIcon
                                icon={direction_prediction.daily === 1 ? faArrowTrendUp : faArrowTrendDown}
                                size={20}
                                color={dailyDirectionColor}
                            />
                            <Text className="text-white text-sm font-medium ml-2">Direction</Text>
                        </View>
                        <Text
                            className="text-lg font-bold"
                            style={{ color: dailyDirectionColor }}
                        >
                            {formatDirectionLabel(direction_prediction.daily)}
                        </Text>
                    </View>
                </View>

                {/* Confidence Score */}
                <View className="bg-[#171717] rounded-lg p-3 mb-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <FontAwesomeIcon icon={faChartWaterfall} size={16} color="#888" />
                            <Text className="text-gray-300 text-sm font-medium ml-2">
                                Model Confidence
                            </Text>
                        </View>
                        <Text
                            className="text-lg font-bold"
                            style={{ color: confidenceColor }}
                        >
                            {formatConfidenceScore(avg_score)}
                        </Text>
                    </View>

                    {/* Confidence Bar */}
                    <View className="mt-3">
                        <View className="h-2 bg-[#444444] rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{
                                    width: `${avg_score * 100}%`,
                                    backgroundColor: confidenceColor
                                }}
                            />
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-xs text-gray-500">Low</Text>
                            <Text className="text-xs text-gray-500">High</Text>
                        </View>
                    </View>
                </View>

                {/* Article Count */}
                <View className="flex-row items-center justify-center bg-[#171717] rounded-lg p-3">
                    <FontAwesomeIcon icon={faNewspaper} size={16} color="#1B77CD" />
                    <Text className="text-white text-sm font-medium ml-2">
                        Analyzed Articles:
                    </Text>
                    <Text className="text-[#1B77CD] text-sm font-bold ml-1">
                        {article_count.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* Direction Predictions Grid */}
            <View className=" rounded-xl p-1">
                <View className="items-center justify-center" >
                    <Text className="text-white text-lg font-bold mb-4">Market Direction Predictions</Text>
                </View>

                <View className="space-y-3">
                    {/* Daily */}
                    <View className="flex-row items-center justify-between bg-[#252525] mb-2 rounded-lg p-3">
                        <Text className="text-gray-300 text-sm font-medium">Daily Outlook</Text>
                        <View className="flex-row items-center">
                            <FontAwesomeIcon
                                icon={direction_prediction.daily === 1 ? faArrowTrendUp : faArrowTrendDown}
                                size={14}
                                color={getDirectionColor(direction_prediction.daily)}
                            />
                            <Text
                                className="text-sm font-bold ml-2"
                                style={{ color: getDirectionColor(direction_prediction.daily) }}
                            >
                                {formatDirectionLabel(direction_prediction.daily)}
                            </Text>
                        </View>
                    </View>

                    {/* Weekly */}
                    <View className="flex-row items-center justify-between bg-[#252525] mb-2  rounded-lg p-3">
                        <Text className="text-gray-300 text-sm font-medium">Weekly Outlook</Text>
                        <View className="flex-row items-center">
                            <FontAwesomeIcon
                                icon={direction_prediction.weekly === 1 ? faArrowTrendUp : faArrowTrendDown}
                                size={14}
                                color={getDirectionColor(direction_prediction.weekly)}
                            />
                            <Text
                                className="text-sm font-bold ml-2"
                                style={{ color: getDirectionColor(direction_prediction.weekly) }}
                            >
                                {formatDirectionLabel(direction_prediction.weekly)}
                            </Text>
                        </View>
                    </View>

                    {/* Monthly */}
                    <View className="flex-row items-center justify-between bg-[#252525] mb-2  rounded-lg p-3">
                        <Text className="text-gray-300 text-sm font-medium">Monthly Outlook</Text>
                        <View className="flex-row items-center">
                            <FontAwesomeIcon
                                icon={direction_prediction.monthly === 1 ? faArrowTrendUp : faArrowTrendDown}
                                size={14}
                                color={getDirectionColor(direction_prediction.monthly)}
                            />
                            <Text
                                className="text-sm font-bold ml-2"
                                style={{ color: getDirectionColor(direction_prediction.monthly) }}
                            >
                                {formatDirectionLabel(direction_prediction.monthly)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default AnalysisOverview;