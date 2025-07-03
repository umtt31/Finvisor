import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faSearch } from '@fortawesome/pro-solid-svg-icons'
const SearchBar = () => {
    return (
        <View className="gap-2 px-1">
            <View className="flex-row justify-between gap-3">
                <View className="flex-row gap-2 w-full rounded-xl p-3 bg-[#252525] " >
                    <FontAwesomeIcon icon={faSearch} size={20} color="#1B77CD" />
                    <TextInput className="text-[#1b77cd] text-[15px] w-full font-semibold" placeholder='Search...' placeholderTextColor={'#1b77cd'} />
                </View>
            </View>
            <View className="flex w-full flex-row-reverse " >
                <Text className="underline text-[#1b77cd] ">Clear All</Text>
            </View>
        </View>
    )
}

export default SearchBar;

const styles = StyleSheet.create({})