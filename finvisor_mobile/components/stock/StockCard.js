import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

const StockCard = ({ stock, onPress }) => {
  const { symbol, name, price, change, changePercent, logo } = stock;
  const isPositive = change >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#1DB954' : '#FF4136' }]}>
          <Text style={styles.change}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8
  },
  logoContainer: {
    marginRight: 12
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  infoContainer: {
    flex: 1
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  name: {
    color: '#AAAAAA',
    fontSize: 14
  },
  priceContainer: {
    alignItems: 'flex-end'
  },
  price: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4
  },
  change: {
    color: '#FFFFFF',
    fontSize: 12
  }
});

export default StockCard;