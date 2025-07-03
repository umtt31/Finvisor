// redux/stock/stockReducers.js - Finvisor Stock Reducers
import { createSlice } from '@reduxjs/toolkit';
import {
    getStockQuote,
    getStockDailyData
} from './stockActions';

// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
    // Stock quotes data - { [symbol]: quoteData }
    quotes: {},

    // Stock daily data - { [symbol]: dailyData }
    dailyData: {},

    // Currently viewing stock
    currentStock: null,
    currentTimeFrame: '1M',

    // Loading states
    quotesLoading: {},        // { [symbol]: boolean }
    dailyDataLoading: {},     // { [symbol]: boolean }

    // Error states
    quotesError: {},          // { [symbol]: string }
    dailyDataError: {},       // { [symbol]: string }

    // UI states
    refreshing: false,
};

// ==========================================
// STOCK SLICE
// ==========================================
const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        // Error temizleme
        clearErrors: (state) => {
            state.quotesError = {};
            state.dailyDataError = {};
        },

        // Current stock ayarlama
        setCurrentStock: (state, action) => {
            state.currentStock = action.payload;
        },

        // Current time frame ayarlama
        setCurrentTimeFrame: (state, action) => {
            state.currentTimeFrame = action.payload;
        },

        // Refreshing state ayarlama
        setRefreshing: (state, action) => {
            state.refreshing = action.payload;
        },

        // Reset entire state
        resetStockState: () => initialState,
    },

    extraReducers: (builder) => {
        builder
            // ==========================================
            // GET STOCK QUOTE
            // ==========================================
            .addCase(getStockQuote.pending, (state, action) => {
                const symbol = action.meta.arg;
                state.quotesLoading[symbol] = true;
                if (state.quotesError[symbol]) {
                    delete state.quotesError[symbol];
                }
            })
            .addCase(getStockQuote.fulfilled, (state, action) => {
                const { symbol, quote } = action.payload;

                state.quotesLoading[symbol] = false;
                state.quotes[symbol] = quote;

                if (state.quotesError[symbol]) {
                    delete state.quotesError[symbol];
                }

                console.log('✅ Stock quote stored in Redux:', { symbol, quote });
            })
            .addCase(getStockQuote.rejected, (state, action) => {
                const symbol = action.meta.arg;

                state.quotesLoading[symbol] = false;
                state.quotesError[symbol] = action.payload || 'Hisse senedi fiyatı alınamadı';
            })

            // ==========================================
            // GET STOCK DAILY DATA
            // ==========================================
            .addCase(getStockDailyData.pending, (state, action) => {
                const symbol = action.meta.arg;
                state.dailyDataLoading[symbol] = true;
                if (state.dailyDataError[symbol]) {
                    delete state.dailyDataError[symbol];
                }
            })
            .addCase(getStockDailyData.fulfilled, (state, action) => {
                const { symbol, data, metaData } = action.payload;

                state.dailyDataLoading[symbol] = false;
                state.dailyData[symbol] = {
                    data,
                    metaData,
                    lastUpdated: Date.now()
                };

                if (state.dailyDataError[symbol]) {
                    delete state.dailyDataError[symbol];
                }

                console.log('✅ Stock daily data stored in Redux:', {
                    symbol,
                    dataPoints: data.length
                });
            })
            .addCase(getStockDailyData.rejected, (state, action) => {
                const symbol = action.meta.arg;

                state.dailyDataLoading[symbol] = false;
                state.dailyDataError[symbol] = action.payload || 'Günlük veriler alınamadı';
            });
    },
});

// ==========================================
// ACTIONS EXPORT
// ==========================================
export const {
    clearErrors,
    setCurrentStock,
    setCurrentTimeFrame,
    setRefreshing,
    resetStockState,
} = stockSlice.actions;

// ==========================================
// REDUCER EXPORT
// ==========================================
export default stockSlice.reducer;