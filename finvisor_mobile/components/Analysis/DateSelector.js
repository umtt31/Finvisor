// components/Analysis/DateSelector.js
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
    Dimensions,
    FlatList
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCalendarDays,
    faChevronLeft,
    faChevronRight,
    faTimes,
    faCheck,
    faCalendarDay
} from '@fortawesome/pro-solid-svg-icons';

const { width, height } = Dimensions.get('window');

const DateSelector = ({ selectedDate, onDateSelect, availableDates = [] }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Format date for display
    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Format date for modal display
    const formatModalDate = (dateString) => {
        const date = new Date(dateString);
        return {
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            fullDate: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
    };

    // Get current selected date info
    const selectedDateInfo = useMemo(() => {
        if (!selectedDate) return null;
        return formatModalDate(selectedDate);
    }, [selectedDate]);

    // Group dates by month for better organization
    const groupedDates = useMemo(() => {
        const groups = {};
        availableDates.forEach(date => {
            const dateObj = new Date(date);
            const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            if (!groups[monthKey]) {
                groups[monthKey] = {
                    monthName,
                    dates: []
                };
            }

            groups[monthKey].dates.push(date);
        });

        return Object.values(groups);
    }, [availableDates]);

    const handleDateSelect = (date) => {
        onDateSelect(date);
        setIsModalVisible(false);
    };

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    // Render date item in modal
    const renderDateItem = ({ item: date }) => {
        const isSelected = date === selectedDate;
        const dateInfo = formatModalDate(date);

        return (
            <TouchableOpacity
                onPress={() => handleDateSelect(date)}
                className={`flex-row items-center justify-between p-4 mx-4 mb-2 rounded-xl ${isSelected ? 'bg-[#1B77CD]' : 'bg-[#333333]'
                    }`}
                activeOpacity={0.8}
            >
                <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-white bg-opacity-20' : 'bg-[#1B77CD] bg-opacity-20'
                        }`}>
                        <Text className={`text-sm font-bold ${isSelected ? 'text-[#1B77CD]' : 'text-white'
                            }`}>
                            {dateInfo.dayNumber}
                        </Text>
                    </View>

                    <View>
                        <Text className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-white'
                            }`}>
                            {formatDisplayDate(date)}
                        </Text>
                        <Text className={`text-sm ${isSelected ? 'text-white text-opacity-80' : 'text-gray-400'
                            }`}>
                            {dateInfo.dayName}, {dateInfo.month}
                        </Text>
                    </View>
                </View>

                {isSelected && (
                    <FontAwesomeIcon
                        icon={faCheck}
                        size={18}
                        color="white"
                    />
                )}
            </TouchableOpacity>
        );
    };

    // Render month section
    const renderMonthSection = ({ item: monthGroup }) => (
        <View className="mb-6">
            <View className="px-4 py-2">
                <Text className="text-lg font-bold text-white">
                    {monthGroup.monthName}
                </Text>
            </View>
            <FlatList
                data={monthGroup.dates}
                renderItem={renderDateItem}
                keyExtractor={(date) => date}
                scrollEnabled={false}
            />
        </View>
    );

    return (
        <>
            {/* Main Date Selector Button */}
            <TouchableOpacity
                onPress={openModal}
                className="bg-[#252525] rounded-xl p-4 mx-4 mb-4"
                activeOpacity={0.8}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-[#1B77CD] bg-opacity-20 items-center justify-center mr-3">
                            <FontAwesomeIcon icon={faCalendarDay} size={16} color="#fff" />
                        </View>

                        <View>
                            <Text className="text-gray-400 text-sm">Analysis Date</Text>
                            <Text className="text-white text-base font-semibold">
                                {selectedDate ? formatDisplayDate(selectedDate) : 'Select Date'}
                            </Text>
                            {selectedDateInfo && (
                                <Text className="text-gray-500 text-xs">
                                    {selectedDateInfo.dayName}, {selectedDateInfo.month}
                                </Text>
                            )}
                        </View>
                    </View>

                    <FontAwesomeIcon
                        icon={faChevronRight}
                        size={14}
                        color="#888"
                    />
                </View>
            </TouchableOpacity>

            {/* Date Selection Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeModal}
            >
                <View className="flex-1 bg-[#171717]">
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-[#333333]">
                        <View>
                            <Text className="text-white text-xl font-bold">
                                Select Analysis Date
                            </Text>
                            <Text className="text-gray-400 text-sm mt-1">
                                Choose from {availableDates.length} available dates
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={closeModal}
                            className="w-10 h-10 rounded-full bg-[#333333] items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faTimes} size={16} color="#888" />
                        </TouchableOpacity>
                    </View>

                    {/* Selected Date Display */}
                    {selectedDate && (
                        <View className="bg-[#1B77CD] bg-opacity-10 p-4 m-4 rounded-xl border border-[#1B77CD] border-opacity-30">
                            <View className="flex-row items-center">
                                <FontAwesomeIcon icon={faCalendarDays} size={16} color="#fff" />
                                <Text className="text-[#1B77CD] text-sm font-medium ml-2">
                                    Currently Selected
                                </Text>
                            </View>
                            <Text className="text-white text-lg font-bold mt-2">
                                {selectedDateInfo?.fullDate}
                            </Text>
                        </View>
                    )}

                    {/* Date List */}
                    <FlatList
                        data={groupedDates}
                        renderItem={renderMonthSection}
                        keyExtractor={(monthGroup) => monthGroup.monthName}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
            </Modal>
        </>
    );
};

export default DateSelector;