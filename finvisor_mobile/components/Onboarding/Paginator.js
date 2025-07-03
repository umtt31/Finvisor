import { StyleSheet, Animated, useWindowDimensions, View } from 'react-native';
import React from 'react';

export default function Paginator({ data, scrollX }) {
    const { width } = useWindowDimensions();
    return (
        <View style={{ flexDirection: 'row', height: 64 }}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                // Dot genişliği interpolasyonu
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 20, 10],
                    extrapolate: 'clamp',
                });

                // Dot rengi interpolasyonu
                const dotColor = scrollX.interpolate({
                    inputRange,
                    outputRange: ['#fafafc', '#1B77CD', '#fafafc'], // Gri, Yeşil, Gri
                    extrapolate: 'clamp',
                });

                return (
                    <Animated.View
                        key={i.toString()}
                        style={[
                            styles.dot,
                            { width: dotWidth, backgroundColor: dotColor }, // Renk ve genişlik
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
});
