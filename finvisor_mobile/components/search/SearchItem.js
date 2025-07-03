// SearchItem.js
import { Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/pro-solid-svg-icons'
import { useNavigation } from '@react-navigation/native'

const SearchItem = ({ item }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={()=> navigation.navigate('ProfileScreen')} className="w-full py-2 px-2 rounded-lg flex-row items-center justify-between bg-[#252525] mb-2" >
            <View className="flex-row items-center gap-2" >
                <Image source={item.profilePicture} className="w-10 h-10 rounded-full" />
                <View>
                    <Text className="font-semibold text-white">{item.name}</Text>
                    <Text className="text-gray-400">{item.username}</Text>
                </View>
            </View>
            <FontAwesomeIcon icon={faXmark} size={18} color="#fafafc" />
        </TouchableOpacity>
    )
}

export default SearchItem