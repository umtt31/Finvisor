import { SafeAreaView, StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSearch } from '@fortawesome/pro-solid-svg-icons'
import SearchBar from '../../components/search/SearchBar'
import SearchElement from '../../components/search/SearchElement'

const SearchScreen = () => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-[#171717]">

                <View className="flex-1 p-3 gap-2  ">
                    <SearchBar />
                    <SearchElement />

                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}

export default SearchScreen

const styles = StyleSheet.create({})