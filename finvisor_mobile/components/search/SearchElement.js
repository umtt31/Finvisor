// SearchElement.js
import { StyleSheet, View, FlatList } from 'react-native'
import React from 'react'
import { searchData } from '../../data/dummyData'
import SearchItem from './SearchItem' // SearchItem bileşenini import ediyoruz

const SearchElement = () => {
    return (
        <View className="flex-1">
            <FlatList
                data={searchData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <SearchItem item={item} />}
                contentContainerStyle={{ padding: 10 }}
            />
        </View>
    )
}

export default SearchElement

const styles = StyleSheet.create({})