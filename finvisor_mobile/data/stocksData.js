// stocksData.js - Dummy veriler
import { stockImages } from './dummyImages';

export const stocks = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple',
    price: 198.45,
    change: 3.27,
    changePercent: 1.68,
    logo: stockImages.stockApple,
    color: '#A2AAAD',
    marketCap: '3.12T',
    peRatio: 32.4,
    dividend: 0.92,
    volume: 62384000
  },
  {
    id: 2,
    symbol: 'AMZN',
    name: 'Amazon',
    price: 178.75,
    change: -2.35,
    changePercent: -1.30,
    logo: stockImages.stockAmazon,
    color: '#FF9900',
    marketCap: '1.85T',
    peRatio: 60.2,
    dividend: 0,
    volume: 35891000
  },
  {
    id: 3,
    symbol: 'GOOGL',
    name: 'Google',
    price: 142.72,
    change: 1.85,
    changePercent: 1.31,
    logo: stockImages.stockGoogle,
    color: '#4285F4',
    marketCap: '1.79T',
    peRatio: 25.8,
    dividend: 0,
    volume: 28560000
  },
  {
    id: 4,
    symbol: 'MSFT',
    name: 'Microsoft',
    price: 417.32,
    change: 5.28,
    changePercent: 1.28,
    logo: stockImages.stockMicrosoft,
    color: '#00A4EF',
    marketCap: '3.08T',
    peRatio: 35.1,
    dividend: 2.72,
    volume: 21980000
  },
  {
    id: 5,
    symbol: 'TSLA',
    name: 'Tesla',
    price: 251.92,
    change: -8.43,
    changePercent: -3.24,
    logo: stockImages.stockTesla,
    color: '#E31937',
    marketCap: '802.8B',
    peRatio: 70.3,
    dividend: 0,
    volume: 118750000
  },
  {
    id: 6,
    symbol: 'META',
    name: 'Meta Platforms',
    price: 472.10,
    change: 11.52,
    changePercent: 2.50,
    logo: stockImages.stockMeta,
    color: '#1877F2',
    marketCap: '1.23T',
    peRatio: 28.6,
    dividend: 0,
    volume: 18350000
  },
  {
    id: 7,
    symbol: 'MA',
    name: 'MasterCard',
    price: 451.75,
    change: -3.12,
    changePercent: -0.69,
    logo: stockImages.stockMasterCard,
    color: '#EB001B',
    marketCap: '412.8B',
    peRatio: 34.2,
    dividend: 2.28,
    volume: 2150000
  },
  {
    id: 8,
    symbol: 'WMT',
    name: 'Walmart',
    price: 68.92,
    change: 1.37,
    changePercent: 2.03,
    logo: stockImages.stockWallmart,
    color: '#0071CE',
    marketCap: '552.4B',
    peRatio: 29.5,
    dividend: 0.64,
    volume: 14280000
  },
  {
    id: 9,
    symbol: 'SPOT',
    name: 'Spotify',
    price: 451.82,
    change: 12.25,
    changePercent: 3.28,
    logo: stockImages.stockSpotify,
    color: '#1DB954',
    marketCap: '90.2B',
    peRatio: 152.8,
    dividend: 0,
    volume: 1750000
  },
  {
    id: 10,
    symbol: 'NVDA',
    name: 'NVIDIA',
    price: 872.28,
    change: 25.44,
    changePercent: 3.01,
    logo: stockImages.stockNvidia,
    color: '#76B900',
    marketCap: '2.15T',
    peRatio: 74.5,
    dividend: 0.16,
    volume: 42680000
  }
];

// Grafik için örnek veri seti
export const getChartData = (symbol, timeFrame) => {
  // Gerçek bir API'dan alınacak veri yerine, her hisse için rastgele veri üretelim
  const data = [];
  let price = stocks.find(stock => stock.symbol === symbol)?.price || 100;
  let basePrice = price * 0.95;
  
  // Zaman çerçevesine göre veri noktası sayısını belirle
  let dataPoints;
  let startTime;
  let endTime;
  
  const now = new Date();
  
  switch(timeFrame) {
    case '1D':
      dataPoints = 24;
      startTime = '6:00';
      endTime = '2:00';
      break;
    case '5D':
      dataPoints = 5 * 8;
      startTime = now.getDate() - 5 + ' ' + now.toLocaleString('default', { month: 'short' });
      endTime = now.getDate() + ' ' + now.toLocaleString('default', { month: 'short' });
      break;
    case '1M':
      dataPoints = 30;
      startTime = now.getDate() - 30 + ' ' + now.toLocaleString('default', { month: 'short' });
      endTime = now.getDate() + ' ' + now.toLocaleString('default', { month: 'short' });
      break;
    case '6M':
      dataPoints = 180;
      startTime = now.toLocaleString('default', { month: 'short' }) + ' ' + (now.getFullYear() - (now.getMonth() < 6 ? 1 : 0));
      endTime = now.toLocaleString('default', { month: 'short' }) + ' ' + now.getFullYear();
      break;
    case '1Y':
      dataPoints = 12;
      startTime = now.toLocaleString('default', { month: 'short' }) + ' ' + (now.getFullYear() - 1);
      endTime = now.toLocaleString('default', { month: 'short' }) + ' ' + now.getFullYear();
      break;
    case '5Y':
      dataPoints = 5 * 12;
      startTime = now.getFullYear() - 5;
      endTime = now.getFullYear();
      break;
    default:
      dataPoints = 24;
      startTime = '6:00';
      endTime = '2:00';
  }
  
  // Belirli hisseler için eğilim belirle (gerçekçi olması için)
  let trend = 0;
  switch(symbol) {
    case 'AAPL': trend = 0.001; break;
    case 'AMZN': trend = -0.0005; break;
    case 'GOOGL': trend = 0.0008; break;
    case 'MSFT': trend = 0.0012; break;
    case 'TSLA': trend = -0.002; break;
    case 'META': trend = 0.0015; break;
    case 'MA': trend = -0.0003; break;
    case 'WMT': trend = 0.0007; break;
    case 'SPOT': trend = 0.002; break;
    case 'NVDA': trend = 0.0018; break;
    default: trend = 0;
  }
  
  for (let i = 0; i < dataPoints; i++) {
    // Her bir veri noktası için rastgele değer oluştur
    const randomFactor = 0.02 * Math.random() - 0.01 + trend; // -1% to +1% + trend
    price = price * (1 + randomFactor);
    
    // Zaman eksenini oluştur
    let time;
    if (timeFrame === '1D') {
      const hour = 6 + Math.floor(i * (20 / dataPoints));
      const displayHour = hour > 23 ? hour - 24 : hour;
      time = `${displayHour.toString().padStart(2, '0')}:00`;
    } else {
      time = i.toString();
    }
    
    // Historik veri noktasını ekle
    const dataPoint = {
      time,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000 + 10000) // Rastgele işlem hacmi
    };
    
    // 1D görünümü için özel tooltip noktası (screenshot'taki gibi)
    if (symbol === 'SPOT' && timeFrame === '1D' && i === Math.floor(dataPoints * 0.65)) {
      dataPoint.tooltip = true;
      dataPoint.tooltipTime = '22:00';
      dataPoint.tooltipDate = '28 Eki 2022';
      dataPoint.tooltipPrice = 197.12;
      dataPoint.tooltipVolume = '102K';
    }
    
    data.push(dataPoint);
  }
  
  return { 
    data,
    timeRange: { startTime, endTime }
  };
};

// Popüler listeler
export const watchlists = {
  trending: ['NVDA', 'TSLA', 'AAPL', 'META'],
  topGainers: ['SPOT', 'NVDA', 'META', 'WMT'],
  topLosers: ['TSLA', 'AMZN', 'MA'],
  mostActive: ['TSLA', 'AAPL', 'NVDA', 'AMZN']
};

// Haber dummy verileri
export const stockNews = {
  AAPL: [
    { id: 1, title: 'Apple Plans Major AI Features for iOS 18', source: 'Bloomberg', time: '2 saat önce' },
    { id: 2, title: 'iPhone Sales Beat Expectations in Q3', source: 'Wall Street Journal', time: '5 saat önce' }
  ],
  MSFT: [
    { id: 1, title: 'Microsoft Cloud Revenue Surges 25%', source: 'CNBC', time: '1 saat önce' },
    { id: 2, title: 'New Xbox Series Expected Next Year', source: 'The Verge', time: '7 saat önce' }
  ],
  TSLA: [
    { id: 1, title: 'Tesla Expands Gigafactory in Berlin', source: 'Reuters', time: '3 saat önce' },
    { id: 2, title: 'Model Y Becomes Best-Selling EV Globally', source: 'Electrek', time: '8 saat önce' }
  ],
  SPOT: [
    { id: 1, title: 'Spotify Premium Subscription Hits 250M Users', source: 'TechCrunch', time: '1 saat önce' },
    { id: 2, title: 'Podcast Ad Revenue Growing 30% YoY', source: 'Bloomberg', time: '6 saat önce' }
  ],
  NVDA: [
    { id: 1, title: 'NVIDIA Announces Next-Gen GPU Architecture', source: 'AnandTech', time: '4 saat önce' },
    { id: 2, title: 'AI Chip Demand Continues to Outpace Supply', source: 'CNBC', time: '9 saat önce' }
  ],
  default: [
    { id: 1, title: 'Markets Close Higher On Tech Rally', source: 'MarketWatch', time: '1 saat önce' },
    { id: 2, title: 'Fed Signals Potential Rate Cut', source: 'CNBC', time: '5 saat önce' }
  ]
};