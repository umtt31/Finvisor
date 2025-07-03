// App.js - Redux Provider entegrasyonu
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css"
import Navigation from './Navigation';
import { useFonts, Jost_400Regular, Jost_500Medium, Jost_600SemiBold, Jost_700Bold } from '@expo-google-fonts/jost';
import { useEffect } from 'react';

// Redux imports
import { Provider } from 'react-redux';
import { store } from './redux/store';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Jost-Regular': Jost_400Regular,
    'Jost-Medium': Jost_500Medium,
    'Jost-SemiBold': Jost_600SemiBold,
    'Jost-Bold': Jost_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Fontlar yüklendiğinde splash screen'i gizle
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Fontlar yüklenene kadar hiçbir şey gösterme
  }


  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}

