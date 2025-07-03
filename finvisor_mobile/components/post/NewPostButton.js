// components/post/NewPostButton.js - Aynı (zaten Redux uyumlu)
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { useNavigation } from '@react-navigation/native';
import Shadows from '../../styles/shadows';

const NewPostButton = ({ style }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('NewPost');
  };

  return (
    <TouchableOpacity
      style={[Shadows.shadow1, style]}
      className="absolute bottom-5 right-5 bg-[#1B77CD] w-14 h-14 rounded-full justify-center items-center"
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <FontAwesomeIcon icon={faPlus} size={20} color="#fff" />
    </TouchableOpacity>
  );
};

export default NewPostButton;