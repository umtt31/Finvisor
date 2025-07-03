// components/stock/StockChart.js - Enhanced Interactive Version
import React, { useState, useEffect, useMemo } from 'react';
import { Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrendUp, faTrendDown, faChartLine } from '@fortawesome/pro-solid-svg-icons';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 280;
const CHART_WIDTH = width - 16;

const StockChart = ({ data, color, symbol }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // Animation values
  const chartOpacity = useSharedValue(0);
  const chartScale = useSharedValue(0.95);

  // Entry animations
  useEffect(() => {
    chartOpacity.value = withTiming(1, { duration: 800 });
    chartScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [data]);

  // Data validation and processing
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map((point, index) => {
      const timestamp = point.time ? new Date(point.time).getTime() :
        point.date ? new Date(point.date).getTime() :
          Date.now() + index * 86400000;

      const value = parseFloat(point.price || point.close || 0);

      return {
        timestamp,
        value: isNaN(value) ? 0 : value,
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const values = chartData.map(point => point.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
    const isPositive = change >= 0;

    return {
      firstValue,
      lastValue,
      minValue,
      maxValue,
      change,
      changePercent,
      isPositive,
      range: maxValue - minValue
    };
  }, [chartData]);

  // Dynamic colors
  const trendColor = stats?.isPositive ? '#10B981' : '#EF4444';
  const lineColor = color || '#1B77CD';

  // Calculate Y-axis values (5 levels)
  const yAxisValues = useMemo(() => {
    if (!stats) return [];

    const { minValue, maxValue } = stats;
    const range = maxValue - minValue;
    const step = range / 4;

    return [
      { value: maxValue, label: `$${maxValue.toFixed(0)}` },
      { value: maxValue - step, label: `$${(maxValue - step).toFixed(0)}` },
      { value: maxValue - (step * 2), label: `$${(maxValue - step * 2).toFixed(0)}` },
      { value: maxValue - (step * 3), label: `$${(maxValue - step * 3).toFixed(0)}` },
      { value: minValue, label: `$${minValue.toFixed(0)}` }
    ];
  }, [stats]);

  // Animated styles
  const chartAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ scale: chartScale.value }],
  }));

  // Handle point selection
  const handleCursorActivated = (data) => {
    setIsActive(true);
    setSelectedPoint(data);
  };

  const handleCursorEnded = () => {
    setIsActive(false);
    setSelectedPoint(null);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for short display
  const formatShortDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!stats) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <View className="w-full bg-[#1F2937] rounded-2xl p-8 items-center border border-gray-700">
          <View className="w-16 h-16 bg-[#1B77CD]/10 rounded-full items-center justify-center mb-4">
            <FontAwesomeIcon icon={faChartLine} size={24} color="#1B77CD" />
          </View>
          <Text className="text-white text-lg font-semibold mb-2">No Chart Data</Text>
          <Text className="text-gray-400 text-center text-sm">Unable to load chart data for {symbol}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full">
      {/* Main Chart Container */}
      <View className="items-center">
        <Animated.View style={[chartAnimatedStyle, { width: CHART_WIDTH }]}>
          <View className=" p-4 ">

            {/* Chart with Wagmi Charts */}
            <LineChart.Provider data={chartData}>
              <LineChart height={CHART_HEIGHT} width={CHART_WIDTH - 32}>

                {/* Main Line Path */}
                <LineChart.Path color={lineColor} width={3}>
                  <LineChart.Gradient />
                </LineChart.Path>

                {/* Interactive Crosshair with Grid Lines */}
                <LineChart.CursorCrosshair
                  color={lineColor}
                  onActivated={handleCursorActivated}
                  onEnded={handleCursorEnded}
                  crosshairWrapperProps={{
                    style: {
                      // Kesikli çizgiler için style
                    }
                  }}
                >
                  {/* Custom Crosshair Lines */}
                  <LineChart.CursorLine
                    color="rgba(255, 255, 255, 0.5)"
                    strokeWidth={1}
                    strokeDasharray="4,4" // Kesikli çizgi
                  />

                  {/* Hover Tooltip */}
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
                      borderColor: lineColor,
                    }}
                    cursorGutter={16}
                  />
                </LineChart.CursorCrosshair>

                {/* Hover Detection Area */}
                <LineChart.HoverTrap />

                {/* Grid Lines (Optional) */}
                <LineChart.HorizontalLine
                  color="rgba(255, 255, 255, 0.1)"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                  at={{ value: stats.maxValue }}
                />
                <LineChart.HorizontalLine
                  color="rgba(255, 255, 255, 0.1)"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                  at={{ value: (stats.maxValue + stats.minValue) / 2 }}
                />
                <LineChart.HorizontalLine
                  color="rgba(255, 255, 255, 0.1)"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                  at={{ value: stats.minValue }}
                />

              </LineChart>
            </LineChart.Provider>


            {/* X-axis labels overlay */}
            <View className="absolute bottom-2 left-8 right-8 flex-row justify-between">
              {chartData.length > 0 && (
                <>
                  <Text className="text-gray-300 text-xs  px-1">
                    {formatShortDate(chartData[0].timestamp)}
                  </Text>
                  <Text className="text-gray-300 text-xs  px-1">
                    {formatShortDate(chartData[Math.floor(chartData.length / 2)].timestamp)}
                  </Text>
                  <Text className="text-gray-300 text-xs  px-1">
                    {formatShortDate(chartData[chartData.length - 1].timestamp)}
                  </Text>
                </>
              )}
            </View>

          </View>
        </Animated.View>
      </View>


      {/* Price Range Summary */}
      <View className="mt-6">
        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs font-medium mb-1">MINIMUM</Text>
              <Text className="text-red-400 text-lg font-bold">
                ${stats.minValue.toFixed(2)}
              </Text>
            </View>

            <View className="w-px h-8 bg-gray-600" />

            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs font-medium mb-1">CURRENT</Text>
              <Text className="text-[#1B77CD] text-lg font-bold">
                ${stats.lastValue.toFixed(2)}
              </Text>
            </View>

            <View className="w-px h-8 bg-gray-600" />

            <View className="flex-1 items-center">
              <Text className="text-gray-400 text-xs font-medium mb-1">MAXIMUM</Text>
              <Text className="text-green-400 text-lg font-bold">
                ${stats.maxValue.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StockChart;