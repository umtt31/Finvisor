// components/stock/TimeFrameSelector.js - Updated with className
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const TimeFrameSelector = ({ selectedTimeFrame, onSelectTimeFrame }) => {
  const timeFrames = ['1D', '5D', '1M', '6M', '1Y', '5Y'];

  return (
    <View className="flex-row justify-around py-3 px-2">
      {timeFrames.map((timeFrame) => (
        <TouchableOpacity
          key={timeFrame}
          className={`py-2 px-3 rounded-2xl ${selectedTimeFrame === timeFrame
            ? 'bg-[#1B77CD]'
            : 'bg-transparent'
            }`}
          onPress={() => onSelectTimeFrame(timeFrame)}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-medium ${selectedTimeFrame === timeFrame
              ? 'text-white'
              : 'text-gray-400'
              }`}
          >
            {timeFrame}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TimeFrameSelector;