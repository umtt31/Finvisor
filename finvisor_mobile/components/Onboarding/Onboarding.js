import { View, FlatList, Animated } from 'react-native';
import React, { useRef } from 'react';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import slides from '../../slides';

export default function Onboarding({ flatListRef, onIndexChange }) {
    const scrollX = useRef(new Animated.Value(0)).current;

    const viewItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            onIndexChange(newIndex);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    return (
        <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
            <FlatList
                data={slides}
                renderItem={({ item }) => <OnboardingItem item={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={32}
                onViewableItemsChanged={viewItemsChanged}
                viewabilityConfig={viewConfig}
                ref={flatListRef} // FlatList'e ref bağlanıyor
            />
            <Paginator data={slides} scrollX={scrollX} />
        </View>
    );
}

