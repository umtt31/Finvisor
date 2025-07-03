// screens/Flow/FlowScreen.js - Clean Implementation
import React, { useCallback } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Alert,
  View,
  FlatList,
  RefreshControl
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { getAllPosts } from "../../redux/post/postActions";
import Post from "../../components/post/Post";

const FlowScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux state
  const { user, userProfile, isAuthenticated } = useSelector(state => state.auth);
  const { posts, loading } = useSelector(state => state.posts);
  const currentUser = user || userProfile;

  // Handle new post navigation
  const handleNewPost = useCallback(() => {
    if (!isAuthenticated || !currentUser) {
      Alert.alert('Hata', 'Lütfen giriş yapın');
      return;
    }

    navigation.navigate("NewPost", {
      userInfo: { ...currentUser, id: currentUser.user_id || currentUser.id }
    });
  }, [navigation, isAuthenticated, currentUser]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    dispatch(getAllPosts());
  }, [dispatch]);

  // Handle user profile navigation
  const handleUserPress = useCallback((userId) => {
    if (userId === currentUser?.user_id) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else {
      navigation.navigate('OtherUserProfile', {
        userId: userId,
        isOwnProfile: false,
        refresh: Date.now()
      });
    }
  }, [navigation, currentUser?.user_id]);

  return (
    <SafeAreaView className="flex-1 bg-[#171717]">
      <FlatList
        data={[{ id: 'posts' }]}
        keyExtractor={(item) => item.id}
        renderItem={() => (
          <View className="p-2">
            <Post onUserPress={handleUserPress} />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor="#1B77CD"
            colors={['#1B77CD']}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleNewPost}
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full bg-[#1B77CD] justify-center items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <FontAwesomeIcon icon={faPlus} size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FlowScreen;