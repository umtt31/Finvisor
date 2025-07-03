// redux/stock/stockActions.js - Updated with Image Support
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";

// ==========================================
// GET STOCK QUOTE - Updated with Image
// ==========================================
export const getStockQuote = createAsyncThunk(
    "stock/getStockQuote",
    async (symbol, { rejectWithValue }) => {
        try {
            console.log('🚀 Getting stock quote for:', symbol);

            if (!symbol || symbol.trim() === '') {
                return rejectWithValue('Hisse senedi sembolü gereklidir');
            }

            const response = await apiClient.get(`/stocks/quote`, {
                params: { symbol: symbol.toUpperCase() }
            });

            console.log('✅ Stock quote response:', response.data);

            // ✅ CHECK FOR ALPHA VANTAGE RATE LIMIT ERRORS
            if (response.data && typeof response.data === 'object') {
                // Check for rate limit messages
                if (response.data.Note || response.data.Information) {
                    const message = response.data.Note || response.data.Information;

                    if (message.includes('rate limit') ||
                        message.includes('API call frequency') ||
                        message.includes('25 requests per day') ||
                        message.includes('premium')) {

                        console.error('❌ Alpha Vantage rate limit exceeded:', message);
                        return rejectWithValue('API günlük limiti aşıldı (25/gün). Yarın tekrar deneyin veya premium plana geçin.');
                    }

                    if (message.includes('5 calls per minute')) {
                        console.error('❌ Alpha Vantage minute limit exceeded:', message);
                        return rejectWithValue('API dakikalık limiti aşıldı (5/dakika). Lütfen 1 dakika bekleyin.');
                    }

                    // Other Alpha Vantage messages
                    return rejectWithValue(`Alpha Vantage: ${message}`);
                }

                // Check if response contains error instead of data
                if (response.data.Error || response.data.error) {
                    const errorMsg = response.data.Error || response.data.error;
                    return rejectWithValue(`API Hatası: ${errorMsg}`);
                }
            }

            // Backend ARRAY formatında döndürüyor - istenen symbol'ü bul
            if (Array.isArray(response.data) && response.data.length > 0) {
                const foundQuote = response.data.find(item =>
                    item.symbol === symbol.toUpperCase()
                );

                if (foundQuote) {
                    return {
                        symbol: symbol.toUpperCase(),
                        quote: {
                            symbol: foundQuote.symbol || symbol,
                            open: parseFloat(foundQuote.open) || 0,
                            high: parseFloat(foundQuote.high) || 0,
                            low: parseFloat(foundQuote.low) || 0,
                            price: parseFloat(foundQuote.price) || 0,
                            volume: parseInt(foundQuote.volume) || 0,
                            latest_trading_day: foundQuote.latest_trading_day || '',
                            previous_close: parseFloat(foundQuote.previous_close) || 0,
                            change: parseFloat(foundQuote.change) || 0,
                            change_percent: foundQuote.change_percent || '0%',
                            image: foundQuote.image || null,
                            last_updated: new Date().toISOString()
                        }
                    };
                } else {
                    return rejectWithValue(`${symbol} bulunamadı`);
                }
            }

            return rejectWithValue('Geçersiz API yanıtı formatı');

        } catch (error) {
            console.error('❌ Get stock quote error:', error);

            // ✅ ENHANCED ERROR HANDLING
            if (error.response?.status === 500) {
                // 500 errors often indicate Alpha Vantage issues
                return rejectWithValue('API servis hatası. Lütfen daha sonra tekrar deneyin. (Günlük limit aşılmış olabilir)');
            }

            if (error.response?.status === 429) {
                return rejectWithValue('API limit aşıldı. Lütfen daha sonra tekrar deneyin.');
            }

            if (error.response?.status === 404) {
                return rejectWithValue('Hisse senedi bulunamadı');
            }

            // Network errors
            if (error.code === 'NETWORK_ERROR' || !error.response) {
                return rejectWithValue('İnternet bağlantınızı kontrol edin');
            }

            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Hisse senedi fiyatı alınamadı."
            );
        }
    }
);

export const getStockDailyData = createAsyncThunk(
    "stock/getStockDailyData",
    async (symbol, { rejectWithValue }) => {
        try {
            console.log('🚀 Getting stock daily data for:', symbol);

            if (!symbol || symbol.trim() === '') {
                return rejectWithValue('Hisse senedi sembolü gereklidir');
            }

            const response = await apiClient.get(`/stocks/daily/${symbol.toUpperCase()}`);

            console.log('✅ Stock daily data response:', response.data);

            // ✅ CHECK FOR ALPHA VANTAGE RATE LIMIT ERRORS
            if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                if (response.data.Note || response.data.Information) {
                    const message = response.data.Note || response.data.Information;

                    if (message.includes('rate limit') ||
                        message.includes('API call frequency') ||
                        message.includes('25 requests per day') ||
                        message.includes('premium')) {
                        return rejectWithValue('API günlük limiti aşıldı (25/gün). Yarın tekrar deneyin.');
                    }

                    if (message.includes('5 calls per minute')) {
                        return rejectWithValue('API dakikalık limiti aşıldı (5/dakika). Lütfen 1 dakika bekleyin.');
                    }

                    return rejectWithValue(`Alpha Vantage: ${message}`);
                }
            }

            // ✅ BACKEND ARRAY FORMAT
            if (Array.isArray(response.data)) {
                console.log('📊 Processing array format daily data');

                const dailyData = response.data
                    .map(item => ({
                        date: item.date,
                        open: parseFloat(item.open) || 0,
                        high: parseFloat(item.high) || 0,
                        low: parseFloat(item.low) || 0,
                        close: parseFloat(item.close) || 0,
                        volume: parseInt(item.volume) || 0,
                        price: parseFloat(item.close) || 0,
                        time: item.date
                    }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                console.log('✅ Processed daily data points:', dailyData.length);

                return {
                    symbol: symbol.toUpperCase(),
                    data: dailyData,
                    metaData: {
                        symbol: symbol.toUpperCase(),
                        lastRefreshed: new Date().toISOString(),
                        timeZone: 'US/Eastern',
                        dataPoints: dailyData.length
                    },
                    last_updated: new Date().toISOString()
                };
            }

            // Empty response
            if (!response.data || response.data.length === 0) {
                return rejectWithValue('Bu hisse senedi için günlük veri bulunamadı');
            }

            console.warn('⚠️ Unknown response format:', response.data);
            return rejectWithValue('Geçersiz API yanıt formatı');

        } catch (error) {
            console.error('❌ Get stock daily data error:', error);

            // ✅ ENHANCED ERROR HANDLING FOR DAILY DATA
            if (error.response?.status === 500) {
                return rejectWithValue('API servis hatası. Grafik verileri geçici olarak kullanılamıyor. (Günlük limit aşılmış olabilir)');
            }

            if (error.response?.status === 429) {
                return rejectWithValue('API limit aşıldı. Lütfen daha sonra tekrar deneyin.');
            }

            if (error.response?.status === 404) {
                return rejectWithValue('Hisse senedi bulunamadı');
            }

            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Hisse senedi günlük verileri alınamadı."
            );
        }
    }
);