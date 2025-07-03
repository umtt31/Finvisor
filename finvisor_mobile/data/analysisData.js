// data/analysisData.js - NDX AI Analysis Dummy Data
export const mockAnalysisData = [
    {
        "date": "2025-05-25",
        "daily_sentiment_prediction": 1,
        "direction_prediction": {
            "daily": 1,
            "weekly": 1,
            "monthly": 0
        },
        "article_count": 186,
        "avg_score": 0.8745231947382195
    },
    {
        "date": "2025-05-26",
        "daily_sentiment_prediction": 0,
        "direction_prediction": {
            "daily": 0,
            "weekly": 1,
            "monthly": 1
        },
        "article_count": 203,
        "avg_score": 0.7892341203948572
    },
    {
        "date": "2025-05-27",
        "daily_sentiment_prediction": 1,
        "direction_prediction": {
            "daily": 1,
            "weekly": 0,
            "monthly": 1
        },
        "article_count": 241,
        "avg_score": 0.9234567890123456
    },
    {
        "date": "2025-05-28",
        "daily_sentiment_prediction": 0,
        "direction_prediction": {
            "daily": 0,
            "weekly": 0,
            "monthly": 1
        },
        "article_count": 167,
        "avg_score": 0.6789012345678901
    },
    {
        "date": "2025-05-29",
        "daily_sentiment_prediction": 1,
        "direction_prediction": {
            "daily": 1,
            "weekly": 1,
            "monthly": 1
        },
        "article_count": 229,
        "avg_score": 0.9330118708475188
    }
];

// Helper functions for data processing
export const getAnalysisForDate = (date) => {
    return mockAnalysisData.find(item => item.date === date);
};

export const getLatestAnalysis = () => {
    return mockAnalysisData[mockAnalysisData.length - 1];
};

export const getAnalysisRange = (startDate, endDate) => {
    return mockAnalysisData.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return itemDate >= start && itemDate <= end;
    });
};

export const formatSentimentLabel = (value) => {
    return value === 1 ? 'Positive' : 'Negative';
};

export const formatDirectionLabel = (value) => {
    return value === 1 ? 'Bullish' : 'Bearish';
};

export const formatConfidenceScore = (score) => {
    return `${(score * 100).toFixed(1)}%`;
};

export const getSentimentColor = (sentiment) => {
    return sentiment === 1 ? '#1DB954' : '#FF4136';
};

export const getDirectionColor = (direction) => {
    return direction === 1 ? '#1DB954' : '#FF4136';
};

export const getConfidenceColor = (score) => {
    if (score >= 0.8) return '#1DB954';
    if (score >= 0.6) return '#FFA500';
    return '#FF4136';
};