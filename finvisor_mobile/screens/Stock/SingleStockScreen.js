// screens/Stock/SingleStockScreen.js - Fixed Image Loading Issues
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Image as RNImage // ✅ React Native Image as fallback
} from 'react-native';
import { Image } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRefresh, faArrowLeft } from '@fortawesome/pro-solid-svg-icons';

// Redux Actions
import { getStockQuote, getStockDailyData } from '../../redux/stock/stockActions';
import { setCurrentStock, setCurrentTimeFrame } from '../../redux/stock/stockReducers';

// Components
import StockChart from '../../components/stock/StockChart';
import TimeFrameSelector from '../../components/stock/TimeFrameSelector';

const SingleStockScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  // Route params'dan stock bilgisini al
  const stockParam = route.params;
  const { symbol, name, price, change, changePercent, logo, image, color } = stockParam || {};

  // ✅ DEBUG: Log all received params
  console.log('🔍 SingleStockScreen Params Debug:', {
    symbol,
    name,
    hasLogo: !!logo,
    logoType: typeof logo,
    hasImage: !!image,
    imageType: typeof image,
    imageValue: image,
    logoValue: logo
  });

  // Redux state
  const { quotes, dailyData, quotesLoading, dailyDataLoading, quotesError, dailyDataError, currentTimeFrame } = useSelector(state => state.stock || {});

  // Local state
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(currentTimeFrame || '1M');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [useExpoImage, setUseExpoImage] = useState(true); // ✅ NEW: Toggle between Expo Image and RN Image

  // Current stock data from Redux (more up-to-date than route params)
  const currentStockData = quotes?.[symbol];
  const chartData = dailyData?.[symbol]?.data || [];

  // ✅ DEBUG: Log Redux data
  console.log('🔍 Redux Data Debug:', {
    hasCurrentStockData: !!currentStockData,
    reduxImage: currentStockData?.image,
    quotesKeys: Object.keys(quotes || {})
  });

  // Use current data if available, fallback to route params (with image support)
  const displayData = {
    symbol: symbol,
    name: name,
    price: currentStockData?.price || price || 0,
    change: currentStockData?.change || change || 0,
    changePercent: currentStockData?.change_percent ?
      parseFloat(currentStockData.change_percent.replace('%', '')) :
      (changePercent || 0),
    latest_trading_day: currentStockData?.latest_trading_day || 'Unknown',
    volume: currentStockData?.volume || 0,
    open: currentStockData?.open || 0,
    high: currentStockData?.high || 0,
    low: currentStockData?.low || 0,
    previous_close: currentStockData?.previous_close || 0,
    // ✅ FIXED: Image priority handling
    image: currentStockData?.image || image || null
  };

  // ✅ ENHANCED: Better image source handling with multiple fallbacks
  const getImageSource = useCallback(() => {
    console.log('🖼️ Building image source:', {
      displayDataImage: displayData.image,
      routeParamImage: image,
      routeParamLogo: logo,
      logoType: typeof logo
    });

    // Priority 1: Redux image
    if (displayData.image && displayData.image.trim() !== '') {
      console.log('✅ Using Redux/displayData image:', displayData.image);
      return displayData.image;
    }

    // Priority 2: Route param image
    if (image && typeof image === 'string' && image.trim() !== '') {
      console.log('✅ Using route param image string:', image);
      return image;
    }

    // Priority 3: Route param logo (if it's an object with uri)
    if (logo && typeof logo === 'object' && logo.uri) {
      console.log('✅ Using route param logo object:', logo.uri);
      return logo.uri;
    }

    // Priority 4: Route param logo (if it's a string)
    if (logo && typeof logo === 'string' && logo.trim() !== '') {
      console.log('✅ Using route param logo string:', logo);
      return logo;
    }

    // Fallback: null (will use placeholder)
    console.log('⚠️ No valid image found, using placeholder');
    return null;
  }, [displayData.image, image, logo]);

  const imageUri = getImageSource();

  const isPositive = displayData.change >= 0;
  const displayColor = isPositive ? '#1DB954' : '#FF4136';

  // Component mount'ta data yükle
  useEffect(() => {
    if (symbol) {
      console.log('🚀 SingleStockScreen mounted for:', symbol);
      dispatch(setCurrentStock(symbol));
      loadStockData();
    }
  }, [symbol, dispatch]);

  // Time frame değiştiğinde chart data yükle
  useEffect(() => {
    if (symbol && selectedTimeFrame) {
      console.log('📊 Time frame changed to:', selectedTimeFrame);
      dispatch(setCurrentTimeFrame(selectedTimeFrame));
      loadChartData();
    }
  }, [selectedTimeFrame, symbol, dispatch]);

  // Stock data yükle (quote)
  const loadStockData = useCallback(async () => {
    if (!symbol) return;

    try {
      console.log('📈 Loading stock data for:', symbol);
      await dispatch(getStockQuote(symbol));
    } catch (error) {
      console.error('❌ Error loading stock data:', error);
    }
  }, [symbol, dispatch]);

  // Chart data yükle (daily data)
  const loadChartData = useCallback(async () => {
    if (!symbol || !selectedTimeFrame) return;

    try {
      console.log('📊 Loading chart data for:', symbol, selectedTimeFrame);
      await dispatch(getStockDailyData(symbol));
    } catch (error) {
      console.error('❌ Error loading chart data:', error);
    }
  }, [symbol, selectedTimeFrame, dispatch]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    if (!symbol) return;

    console.log('🔄 Refreshing stock data for:', symbol);
    setIsRefreshing(true);

    try {
      await Promise.all([
        dispatch(getStockQuote(symbol)),
        dispatch(getStockDailyData(symbol))
      ]);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      Alert.alert('Error', 'An error occurred while refreshing data');
    } finally {
      setIsRefreshing(false);
    }
  }, [symbol, dispatch]);

  // Time frame selector handler
  const handleTimeFrameChange = useCallback((timeFrame) => {
    console.log('⏰ Time frame selected:', timeFrame);
    setSelectedTimeFrame(timeFrame);
  }, []);

  // Back button handler
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ✅ ENHANCED: Image load handlers with fallback logic
  const handleExpoImageLoad = useCallback(() => {
    console.log('✅ Expo Image loaded successfully for', symbol);
    setImageLoadError(false);
  }, [symbol]);

  const handleExpoImageError = useCallback((error) => {
    console.error('❌ Expo Image load error for', symbol, ':', error);
    console.log('🔄 Switching to React Native Image as fallback');
    setUseExpoImage(false); // Switch to RN Image
    setImageLoadError(false); // Reset error since we're trying fallback
  }, [symbol]);

  const handleRNImageError = useCallback((error) => {
    console.error('❌ React Native Image also failed for', symbol, ':', error);
    setImageLoadError(true); // Show fallback symbol
  }, [symbol]);

  // ✅ NEW: Render stock logo with multiple fallback strategies
  const renderStockLogo = useCallback(() => {
    // Show symbol as fallback if all images fail
    if (imageLoadError) {
      return (
        <View className="w-12 h-12 rounded-full bg-gray-600 justify-center items-center">
          <Text className="text-white font-bold text-xs">{symbol}</Text>
        </View>
      );
    }

    // Show placeholder if no image URL
    if (!imageUri) {
      return (
        <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
          <RNImage
            source={require('../../assets/Images/UserImages/user1_pp.jpg')}
            style={{ width: 20, height: 20, borderRadius: 10 }}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View className="relative">
        {/* Background circle for better contrast */}
        <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
          {useExpoImage ? (
            // ✅ Try Expo Image first (better SVG support)
            <Image
              source={{
                uri: imageUri,
                cachePolicy: 'memory-disk',
              }}
              style={{
                width: 30,
                height: 30,
                backgroundColor: 'transparent',
              }}
              contentFit="contain"
              transition={200}
              onLoad={handleExpoImageLoad}
              onError={handleExpoImageError}
              placeholder={require('../../assets/Images/UserImages/user1_pp.jpg')}
            />
          ) : (
            // ✅ Fallback to React Native Image
            <RNImage
              source={{ uri: imageUri }}
              style={{
                width: 30,
                height: 30,
                backgroundColor: 'transparent',
              }}
              resizeMode="contain"
              onLoad={() => {
                console.log('✅ RN Image loaded successfully for', symbol);
                setImageLoadError(false);
              }}
              onError={handleRNImageError}
            />
          )}
        </View>
      </View>
    );
  }, [imageUri, imageLoadError, symbol, useExpoImage, handleExpoImageLoad, handleExpoImageError, handleRNImageError]);

  // Loading states
  const isQuoteLoading = quotesLoading?.[symbol] || false;
  const isChartLoading = dailyDataLoading?.[symbol] || false;
  const isAnyLoading = isQuoteLoading || isChartLoading || isRefreshing;

  // Error states
  const quoteError = quotesError?.[symbol];
  const chartError = dailyDataError?.[symbol];

  if (!symbol) {
    return (
      <SafeAreaView className="flex-1 bg-[#121212]">
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-400 text-lg">Stock information not found</Text>
          <TouchableOpacity onPress={handleBack} className="mt-4 bg-[#1B77CD] px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#1B77CD"
            colors={['#1B77CD']}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Stock Info Container */}
        <View className="p-4 rounded-xl">
          {/* Stock Header */}
          <View className="flex-row items-center mb-2">
            {/* ✅ ENHANCED: Smart stock logo with multiple fallbacks */}
            <View className="mr-4">
              {renderStockLogo()}
            </View>

            <Text className="text-gray-200 text-xl font-bold">{name}</Text>
          </View>


          {/* Price Display */}
          {isQuoteLoading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#1B77CD" />
              <Text className="text-gray-400 mt-2">Loading price...</Text>
            </View>
          ) : quoteError ? (
            <View className="items-center py-4">
              <Text className="text-red-400 text-center">{quoteError}</Text>
              <TouchableOpacity onPress={loadStockData} className="mt-2 bg-[#1B77CD] px-3 py-1 rounded">
                <Text className="text-white text-sm">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-2xl font-bold mb-1">
                  ${displayData.price.toFixed(2)}
                </Text>
                <View
                  className="px-3 py-1 rounded-xl w-36 justify-center flex-row  items-center"
                  style={{ backgroundColor: displayColor }}
                >
                  <Text className="text-white text-sm font-semibold">
                    {isPositive ? '+' : ''}{displayData.change.toFixed(2)} ({displayData.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Stock Details */}
          {!isQuoteLoading && !quoteError && (
            <View className="flex-row justify-between w-full mt-4 pt-4 border-t border-gray-600">
              <View className="items-center gap-1">
                <Text className="text-gray-400 text-xs">Open</Text>
                <Text className="text-white text-m font-semibold">
                  ${displayData.open.toFixed(2)}
                </Text>
              </View>
              <View className="items-center gap-1">
                <Text className="text-gray-400 text-xs">High</Text>
                <Text className="text-white text-m font-semibold">
                  ${displayData.high.toFixed(2)}
                </Text>
              </View>
              <View className="items-center gap-1">
                <Text className="text-gray-400 text-xs">Low</Text>
                <Text className="text-white text-m font-semibold">
                  ${displayData.low.toFixed(2)}
                </Text>
              </View>
              <View className="items-center gap-1">
                <Text className="text-gray-400 text-xs">Previous</Text>
                <Text className="text-white text-m font-semibold">
                  ${displayData.previous_close.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Time Frame Selector */}
        <View className="mt-4">
          <TimeFrameSelector
            selectedTimeFrame={selectedTimeFrame}
            onSelectTimeFrame={handleTimeFrameChange}
          />
        </View>

        {/* Chart Container */}
        <View className="mt-4">
          {isChartLoading ? (
            <View className="justify-center items-center py-20">
              <ActivityIndicator size="large" color="#1B77CD" />
              <Text className="text-gray-400 mt-2">Loading chart...</Text>
            </View>
          ) : chartError ? (
            <View className="justify-center items-center py-20 px-4">
              <Text className="text-red-400 text-center mb-4">{chartError}</Text>
              <TouchableOpacity onPress={loadChartData} className="bg-[#1B77CD] px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : chartData && chartData.length > 0 ? (
            <StockChart data={chartData} color={displayColor} symbol={symbol} />
          ) : (
            <View className="justify-center items-center py-20 px-4">
              <Text className="text-gray-400 text-center mb-4">
                No chart data available for {selectedTimeFrame}
              </Text>
              <TouchableOpacity onPress={loadChartData} className="bg-[#1B77CD] px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Reload</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Performance Summary */}
        {!isQuoteLoading && !quoteError && (
          <View className="mx-4 mt-4 rounded-xl p-4">
            <Text className="text-white text-lg font-semibold mb-4">Performance Summary</Text>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400">Today's Change</Text>
              <View className="flex-row items-center">
                <Text
                  className="font-semibold mr-2"
                  style={{ color: displayColor }}
                >
                  {isPositive ? '+' : ''}${Math.abs(displayData.change).toFixed(2)}
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: displayColor }}
                >
                  ({isPositive ? '+' : ''}{displayData.changePercent.toFixed(2)}%)
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-400">Day's Range</Text>
              <Text className="text-white font-medium">
                ${displayData.low.toFixed(2)} - ${displayData.high.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-400">Previous Close</Text>
              <Text className="text-white font-medium">
                ${displayData.previous_close.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Chart Info Footer */}
        <View className="mx-4 mt-4 mb-4">
          <View className="p-4">
            <View className="flex-row items-center justify-center">
              <View className="w-3 h-3 bg-[#1B77CD] rounded-full mr-2" />
              <Text className="text-gray-400 text-sm">
                Real-time market data • Powered by Finvisor
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SingleStockScreen;