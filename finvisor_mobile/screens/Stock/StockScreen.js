// screens/Stock/StockScreen.js - Converted to TailwindCSS/className
import { SafeAreaView, Text, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRefresh } from '@fortawesome/pro-solid-svg-icons';
import { Image } from 'expo-image'; // ✅ Expo Image for better performance

// Redux Actions
import { getStockQuote } from '../../redux/stock/stockActions';
import { setRefreshing, clearErrors } from '../../redux/stock/stockReducers';
import apiClient from '../../apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StockScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    // Redux state
    const { quotes, quotesLoading, quotesError, refreshing } = useSelector(state => state.stock || {});

    // Local state
    const [availableStocks, setAvailableStocks] = useState([]);
    const [allStocksData, setAllStocksData] = useState([]);

    // Component mount'ta hisse senetlerini yükle
    useEffect(() => {
        console.log('🚀 StockScreen mounted, loading stocks from backend...');
        loadStocksFromBackend();
    }, []);

    // Backend'den tüm hisseleri yükle
    // Backend'den gelen response'u detaylı logla
    const loadStocksFromBackend = useCallback(async () => {
        console.log('📊 Loading stocks from backend...');
        dispatch(setRefreshing(true));
        dispatch(clearErrors());

        try {
            const token = await AsyncStorage.getItem('auth_token');
            console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

            const response = await fetch(`${apiClient.defaults.baseURL}/stocks/quote`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend response received');
                console.log('📊 Response type:', typeof data);
                console.log('📊 Response keys:', Object.keys(data));
                console.log('📊 Full response:', JSON.stringify(data, null, 2));

                processBackendStocks(data);
            } else {
                const errorText = await response.text();
                console.log('❌ Backend error response:', errorText);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

        } catch (error) {
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            Alert.alert('Hata', `Hisse senetleri yüklenirken bir hata oluştu: ${error.message}`);
        } finally {
            dispatch(setRefreshing(false));
        }
    }, [dispatch]);

    // ✅ UPDATED: Backend'den gelen stock data'sını işle (Image desteği ile)
    const processBackendStocks = useCallback((stockData) => {
        if (!Array.isArray(stockData)) {
            console.warn('⚠️ Invalid stock data format:', stockData);
            return;
        }

        console.log('📈 Processing backend stocks with images:', stockData.length);

        const processedStocks = stockData.map(stock => {
            // ✅ Image source handling
            let logoSource;
            if (stock.image && stock.image.trim() !== '') {
                logoSource = {
                    uri: stock.image,
                    cachePolicy: 'memory-disk',
                };
                console.log('🖼️ Using remote image for', stock.symbol, ':', stock.image);
            } else {
                logoSource = require('../../assets/Images/UserImages/user1_pp.jpg');
                console.log('📷 Using placeholder image for', stock.symbol);
            }

            return {
                symbol: stock.symbol,
                name: getStockName(stock.symbol),
                price: parseFloat(stock.price) || 0,
                change: parseFloat(stock.change) || 0,
                changePercent: parseFloat(stock.change_percent?.replace('%', '')) || 0,
                latest_trading_day: stock.latest_trading_day,
                volume: parseInt(stock.volume) || 0,
                open: parseFloat(stock.open) || 0,
                high: parseFloat(stock.high) || 0,
                low: parseFloat(stock.low) || 0,
                previous_close: parseFloat(stock.previous_close) || 0,
                // ✅ NEW: Image support
                image: stock.image || null,
                logo: logoSource,
                color: (parseFloat(stock.change) || 0) >= 0 ? '#1DB954' : '#FF4136'
            };
        });

        setAvailableStocks(processedStocks);
        setAllStocksData(stockData);

        console.log('✅ Processed stocks with images:', processedStocks.length);
    }, []);

    // Redux'tan stokları işle (eğer Redux'ta varsa)
    const processAllStocks = useCallback(() => {
        const allQuotes = Object.values(quotes || {});

        if (allQuotes.length === 0) {
            console.log('⚠️ No quotes in Redux yet');
            return;
        }

        console.log('📈 Processing Redux stocks:', allQuotes.length);

        const processedStocks = allQuotes.map(quote => {
            // ✅ Image source handling for Redux data
            let logoSource;
            if (quote.image && quote.image.trim() !== '') {
                logoSource = {
                    uri: quote.image,
                    cachePolicy: 'memory-disk',
                };
            } else {
                logoSource = require('../../assets/Images/UserImages/user1_pp.jpg');
            }

            return {
                symbol: quote.symbol,
                name: getStockName(quote.symbol),
                price: quote.price || 0,
                change: quote.change || 0,
                changePercent: parseFloat(quote.change_percent?.replace('%', '')) || 0,
                latest_trading_day: quote.latest_trading_day,
                volume: quote.volume || 0,
                open: quote.open || 0,
                high: quote.high || 0,
                low: quote.low || 0,
                previous_close: quote.previous_close || 0,
                // ✅ NEW: Image support
                image: quote.image || null,
                logo: logoSource,
                color: (quote.change || 0) >= 0 ? '#1DB954' : '#FF4136'
            };
        });

        setAvailableStocks(processedStocks);
        console.log('✅ Processed Redux stocks:', processedStocks.length);
    }, [quotes]);

    // Symbol'dan company name tahmin et
    const getStockName = useCallback((symbol) => {
        const stockNames = {
            'AAPL': 'Apple Inc.',
            'GOOGL': 'Alphabet Inc.',
            'MSFT': 'Microsoft Corporation',
            'TSLA': 'Tesla Inc.',
            'AMZN': 'Amazon.com Inc.',
            'META': 'Meta Platforms Inc.',
            'NVDA': 'NVIDIA Corporation',
            'NFLX': 'Netflix Inc.',
            'ORCL': 'Oracle Corporation',
            'JPM': 'JPMorgan Chase & Co.'
        };

        return stockNames[symbol] || `${symbol} Corporation`;
    }, []);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        console.log('🔄 Refreshing stocks...');
        loadStocksFromBackend();
    }, [loadStocksFromBackend]);

    // Hisse detayına git
    const handleStockPress = useCallback((stock) => {
        console.log('📱 Stock pressed:', stock.symbol);

        navigation.navigate('SingleStockScreen', {
            ...stock,
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            logo: stock.logo,
            image: stock.image, // ✅ NEW: Pass image
            color: stock.color
        });
    }, [navigation]);

    // Loading check
    const isLoading = useCallback(() => {
        return refreshing || availableStocks.length === 0;
    }, [refreshing, availableStocks.length]);

    // ✅ CONVERTED: Render single stock item with TailwindCSS classes
    const renderStockItem = useCallback(({ item }) => {
        return (
            <TouchableOpacity
                className="bg-[#252525] p-3 my-2 rounded-lg"
                onPress={() => handleStockPress(item)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center">
                    {/* ✅ Stock Logo */}
                    <View className="mr-3 w-14 h-14 rounded-full bg-[#fff] justify-center items-center overflow-hidden">
                        <Image
                            source={item.logo}
                            style={{ width: 34, height: 34 }}
                            contentFit="contain"
                            transition={200}
                            placeholder={require('../../assets/Images/UserImages/user1_pp.jpg')}
                            onError={(error) => {
                                console.warn('❌ Stock logo load error for', item.symbol, ':', error);
                            }}
                        />
                    </View>

                    {/* Stock Symbol & Name */}
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold mb-1">
                            {item.symbol}
                        </Text>
                        <Text className="text-[#AAAAAA] text-sm" numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>

                    {/* Price & Change */}
                    <View className="items-end min-w-[120px]">
                        <Text className="text-white text-base font-bold mb-1">
                            ${item.price.toFixed(2)}
                        </Text>
                        <View
                            className="px-2 py-1 rounded mb-1"
                            style={{ backgroundColor: item.color }}
                        >
                            <Text className="text-white text-xs font-semibold">
                                {item.change >= 0 ? '+' : ''}
                                {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [handleStockPress]);

    return (
        <SafeAreaView className="flex-1 bg-[#171717]">
            <View className="p-4 w-full flex-1">
                {/* Loading State */}
                {isLoading() ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#1B77CD" />
                        <Text className="text-[#1B77CD] text-base mt-3">
                            Stocks are loading...
                        </Text>
                    </View>
                ) : (
                    /* Stocks List */
                    <FlatList
                        data={availableStocks}
                        keyExtractor={(item) => item.symbol}
                        renderItem={renderStockItem}
                        showsVerticalScrollIndicator={false}
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 20 }}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                )}

            </View>
        </SafeAreaView>
    );
};

export default StockScreen;