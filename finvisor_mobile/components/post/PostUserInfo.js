// components/post/PostUserInfo.js - user_id'den user bilgisi çekme
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Image } from 'expo-image';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEllipsisVertical } from "@fortawesome/pro-solid-svg-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

const PostUserInfo = ({ post }) => {
  const navigation = useNavigation();
  const currentUser = useSelector((state) => state.auth?.user);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CDN URL hazırlama fonksiyonu
  const prepareImageUri = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }

    let finalUrl = imageUrl.trim();

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      const CDN_BASE_URL = 'https://api-social-sanalrekabet.b-cdn.net';

      if (!finalUrl.startsWith('/')) {
        finalUrl = '/' + finalUrl;
      }

      finalUrl = CDN_BASE_URL + finalUrl;
    }

    return finalUrl;
  }, []);

  // ✅ User bilgisini al - post.user veya user_id'den
  useEffect(() => {
    if (!post) {
      console.warn('❌ PostUserInfo: post is null/undefined');
      setUserData(null);
      setLoading(false);
      return;
    }

    // ✅ FIX: Önce post.user var mı kontrol et
    if (post.user && typeof post.user === 'object') {
      console.log('✅ Using post.user data');
      setUserData({
        user_id: post.user.user_id || post.user.id,
        username: post.user.username || 'unknown',
        firstname: post.user.firstname || '',
        lastname: post.user.lastname || '',
        profile_image: post.user.profile_image || '',
      });
      setLoading(false);
      return;
    }

    // ✅ FIX: post.user yoksa user_id'den currentUser'ı kontrol et
    const postUserId = post.user_id;
    const currentUserId = currentUser?.user_id || currentUser?.id;

    if (postUserId && currentUserId && String(postUserId) === String(currentUserId)) {
      console.log('✅ Using current user data for own post');
      setUserData({
        user_id: currentUser.user_id || currentUser.id,
        username: currentUser.username || 'unknown',
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        profile_image: currentUser.profile_image || '',
      });
      setLoading(false);
      return;
    }

    // ✅ FIX: Başka kullanıcının postu - default data
    if (postUserId) {
      console.log('⚠️ Other user post, using minimal data');
      setUserData({
        user_id: postUserId,
        username: `user_${postUserId}`,
        firstname: '',
        lastname: '',
        profile_image: '',
      });
      setLoading(false);
      return;
    }

    // ✅ FIX: Hiçbir user bilgisi yok
    console.warn('❌ PostUserInfo: No user information available');
    setUserData(null);
    setLoading(false);
  }, [post, currentUser]);

  const formattedTime = useMemo(() => {
    if (!post?.created_at) {
      return "1dk";
    }

    try {
      let timestamp;
      if (typeof post.created_at === 'string') {
        const parsed = new Date(post.created_at);
        if (!isNaN(parsed.getTime())) {
          timestamp = Math.floor(parsed.getTime() / 1000);
        } else {
          const parsedTimestamp = parseInt(post.created_at);
          if (!isNaN(parsedTimestamp)) {
            timestamp = parsedTimestamp;
          }
        }
      } else if (typeof post.created_at === 'number') {
        timestamp = post.created_at;
      }

      if (!timestamp || isNaN(timestamp)) {
        return "1dk";
      }

      const now = Math.floor(Date.now() / 1000);
      const diff = Math.max(0, now - timestamp);

      if (diff < 60) return `${diff}sn`;
      if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}g`;
      return `${Math.floor(diff / 604800)}h`;
    } catch (error) {
      console.error('❌ Time formatting error:', error);
      return "1dk";
    }
  }, [post?.created_at]);

  // ✅ CDN destekli profile image source
  const profileImageSource = useMemo(() => {
    const imageUrl = userData?.profile_image;
    const preparedUrl = prepareImageUri(imageUrl);

    if (!preparedUrl) {
      return require('../../assets/Images/UserImages/user1_pp.jpg');
    }

    return {
      uri: preparedUrl,
      cachePolicy: 'memory-disk',
    };
  }, [userData?.profile_image, prepareImageUri]);

  const userName = useMemo(() => {
    if (!userData) return 'Bilinmeyen Kullanıcı';

    try {
      const fullName = `${userData.firstname || ''} ${userData.lastname || ''}`.trim();
      return fullName || userData.username || 'Kullanıcı';
    } catch (error) {
      console.error('❌ User name error:', error);
      return 'Kullanıcı';
    }
  }, [userData]);

  const navigateToUserProfile = useCallback(() => {
    if (!userData?.user_id) {
      console.warn('❌ navigateToUserProfile: No valid user_id');
      return;
    }
    if (!currentUser?.user_id) {
      console.warn('❌ navigateToUserProfile: No current user');
      return;
    }

    try {
      if (String(userData.user_id) === String(currentUser.user_id)) {
        navigation.navigate('MainTabs', { screen: 'Profile' });
      } else {
        navigation.navigate('OtherUserProfile', {
          userId: userData.user_id,
          isOwnProfile: false,
          refresh: Date.now()
        });
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [userData?.user_id, currentUser?.user_id, navigation]);

  // ✅ Loading state
  if (loading) {
    return (
      <View className="flex-row justify-between items-center px-1">
        <View className="flex-row items-center flex-1">
          <Image
            source={require('../../assets/Images/UserImages/user1_pp.jpg')}
            style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
            contentFit="cover"
          />
          <View className="flex-1">
            <Text className="text-sm text-gray-400">Yükleniyor...</Text>
          </View>
        </View>
      </View>
    );
  }

  // ✅ Error state - kullanıcı bilgisi yok
  if (!userData) {
    return (
      <View className="flex-row justify-between items-center px-1">
        <View className="flex-row items-center flex-1">
          <Image
            source={require('../../assets/Images/UserImages/user1_pp.jpg')}
            style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
            contentFit="cover"
          />
          <View className="flex-1">
            <Text className="text-sm text-gray-400">Kullanıcı bilgisi bulunamadı</Text>
            {__DEV__ && (
              <Text className="text-xs text-red-400">
                Debug: post_id={post?.post_id}, user_id={post?.user_id}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity className="p-1 ml-2">
          <FontAwesomeIcon icon={faEllipsisVertical} color="#9CA3AF" size={16} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity onPress={navigateToUserProfile} activeOpacity={0.7}>
          <Image
            source={profileImageSource}
            style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
            contentFit="cover"
            transition={200}
            onError={(error) => {
              console.warn('❌ Profile image load error:', error);
            }}
            onLoad={() => {
              console.log('✅ Profile image loaded successfully');
            }}
            placeholder={require('../../assets/Images/UserImages/user1_pp.jpg')}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToUserProfile} className="flex-1" activeOpacity={0.7}>
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-white tracking-tight" numberOfLines={1}>
              {userName}
            </Text>
            <Text className="text-xs text-gray-400 ml-1">
              · {formattedTime}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="p-1 ml-2" activeOpacity={0.7}>
        <FontAwesomeIcon icon={faEllipsisVertical} color="#9CA3AF" size={16} />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(PostUserInfo, (prevProps, nextProps) => {
  return (
    prevProps.post?.post_id === nextProps.post?.post_id &&
    prevProps.post?.user_id === nextProps.post?.user_id &&
    prevProps.post?.created_at === nextProps.post?.created_at
  );
});