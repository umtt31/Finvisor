// screens/Profile/ProfileScreen.js - Fixed Follow Count Synchronization
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

// Redux Actions
import {
  getUserProfile,
  logoutUser,
} from '../../redux/login-register/LoginRegisterActions';

// Components
import ProfileUserInfo from '../../components/profile/ProfileUserInfo';
import Posts from '../../components/post/Posts';

const EmptyPostsContent = React.memo(({ isProfileOwner }) => (
  <View className="w-full justify-center flex mt-4 px-4">
    <View className="rounded-2xl p-8 bg-[#252525] w-full">
      <View className="flex-col items-center justify-center py-12 gap-3">
        <Text className="text-xl font-bold text-white mb-2 text-center">
          {isProfileOwner ? "Henüz hiç gönderi paylaşmadınız" : "Bu kullanıcı henüz gönderi paylaşmamış"}
        </Text>
        <Text className="text-gray-400 text-center">
          {isProfileOwner ? "İlk gönderinizi paylaşmaya ne dersiniz?" : ""}
        </Text>
      </View>
    </View>
  </View>
));

const ProfileScreen = () => {
  // Redux connections
  const dispatch = useDispatch();
  const reduxCurrentUser = useSelector((state) => state.auth?.user || null);
  const allPosts = useSelector((state) => state.posts?.posts || []);

  const navigation = useNavigation();
  const route = useRoute();

  // ✅ DEBUG: Navigation parametrelerini kontrol edin
  console.log('🔍 ProfileScreen Route Params Debug:', {
    routeName: route.name,
    allParams: route.params,
    userId: route.params?.userId,
    isOwnProfile: route.params?.isOwnProfile,
    refresh: route.params?.refresh,
    paramsKeys: route.params ? Object.keys(route.params) : 'no params'
  });

  // ✅ DEBUG: Current user'ı kontrol edin
  console.log('🔍 Current User Debug:', {
    hasCurrentUser: !!reduxCurrentUser,
    currentUserId: reduxCurrentUser?.user_id || reduxCurrentUser?.id,
    currentUsername: reduxCurrentUser?.username
  });

  // STATE & REFS
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localProfileData, setLocalProfileData] = useState(null);
  const [error, setError] = useState(null);

  // ✅ FIX: Local stats state for real-time updates
  const [localStats, setLocalStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const flatListRef = useRef(null);
  const isMountedRef = useRef(true);

  // Store initial current user properly
  const [initialCurrentUser] = useState(() => {
    if (reduxCurrentUser) {
      return {
        user_id: reduxCurrentUser.user_id || reduxCurrentUser.id,
        username: reduxCurrentUser.username,
        firstname: reduxCurrentUser.firstname,
        lastname: reduxCurrentUser.lastname,
        bio: reduxCurrentUser.bio,
        email: reduxCurrentUser.email,
        profile_image: reduxCurrentUser.profile_image
      };
    }
    return null;
  });

  // Use initial user if available, otherwise fall back to Redux
  const currentUser = initialCurrentUser || reduxCurrentUser;

  // Safe route params extraction
  const userId = route.params?.userId || null;
  const isOwnProfile = route.params?.isOwnProfile;
  const refresh = route.params?.refresh;

  // ✅ DEBUG: Extracted parameters
  console.log('🔍 Extracted Parameters Debug:', {
    userId,
    userIdType: typeof userId,
    isOwnProfile,
    isOwnProfileType: typeof isOwnProfile,
    refresh
  });

  // Safe currentUser access
  const currentUserId = useMemo(() => {
    // ✅ FIX: Use initial current user to prevent Redux state changes
    if (!initialCurrentUser) return null;
    return initialCurrentUser.user_id || initialCurrentUser.id || null;
  }, [initialCurrentUser]); // ✅ FIX: Depend on initialCurrentUser instead of currentUser

  // ✅ DEBUG: Current user ID
  console.log('🔍 Current User ID Debug:', {
    currentUserId,
    currentUserIdType: typeof currentUserId,
    hasCurrentUser: !!currentUser
  });

  // Profile ownership detection
  const targetProfileId = useMemo(() => {
    if (userId) return userId;
    if (!userId && currentUserId) return currentUserId;
    return null;
  }, [userId, currentUserId]);

  // ✅ DEBUG: Target profile ID
  console.log('🔍 Target Profile ID Debug:', {
    targetProfileId,
    targetProfileIdType: typeof targetProfileId,
    calculatedFrom: userId ? 'route.params.userId' : 'currentUserId'
  });

  const isProfileOwner = useMemo(() => {
    // ✅ DEBUG: Profile ownership calculation
    console.log('🔍 Profile Ownership Calculation:', {
      isOwnProfileParam: isOwnProfile,
      isOwnProfileType: typeof isOwnProfile,
      userId,
      currentUserId,
      userIdEqualsCurrentUserId: userId && currentUserId ? String(userId) === String(currentUserId) : 'one is null'
    });

    if (typeof isOwnProfile === 'boolean') {
      if (isOwnProfile && userId && currentUserId) {
        const actuallyOwner = String(userId) === String(currentUserId);
        if (!actuallyOwner) {
          console.warn('⚠️ isOwnProfile=true but userId mismatch', { userId, currentUserId });
          return false;
        }
      }
      console.log('✅ Using explicit isOwnProfile param:', isOwnProfile);
      return isOwnProfile;
    }

    if (!userId && currentUser) {
      console.log('✅ No userId provided, treating as own profile');
      return true;
    }

    if (userId && currentUserId) {
      const isOwner = String(userId) === String(currentUserId);
      console.log('✅ Calculated ownership from ID comparison:', isOwner);
      return isOwner;
    }

    console.log('✅ Defaulting to false (no ownership detected)');
    return false;
  }, [isOwnProfile, userId, currentUserId, currentUser]);

  // ✅ FIX: Reset everything when profile changes
  const resetProfileState = useCallback(() => {
    console.log('🔄 COMPLETE RESET: Resetting all profile state');
    setLocalProfileData(null);
    setIsLoading(true);
    setError(null);
    setRefreshing(false);
    setLocalStats({ posts: 0, followers: 0, following: 0 });
  }, []);

  // Profile change detection
  const lastTargetRef = useRef(null);
  useEffect(() => {
    if (!targetProfileId) {
      resetProfileState();
      return;
    }

    if (String(targetProfileId) !== String(lastTargetRef.current)) {
      console.log('🚨 PROFILE ID CHANGED - COMPLETE RESET', {
        from: lastTargetRef.current,
        to: targetProfileId,
        isOwner: isProfileOwner
      });
      lastTargetRef.current = targetProfileId;
      resetProfileState();
    }
  }, [targetProfileId, resetProfileState, isProfileOwner]);

  // ✅ FIX: Enhanced profile loading function
  const loadProfile = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);

      if (!targetProfileId) {
        console.error('❌ loadProfile: No profile ID available');
        setError('Profil ID bulunamadı');
        setIsLoading(false);
        return;
      }

      console.log('🚀 Loading profile:', {
        targetProfileId,
        isOwner: isProfileOwner,
        forceRefresh
      });

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await dispatch(getUserProfile(targetProfileId)).unwrap();

      if (isMountedRef.current && String(targetProfileId) === String(targetProfileId)) {
        const profileData = response?.user || response?.data || response;

        if (!profileData) {
          throw new Error('Profil verileri alınamadı');
        }

        const receivedUserId = profileData.user_id || profileData.id;
        if (String(receivedUserId) !== String(targetProfileId)) {
          console.error('❌ Profile data mismatch!', {
            expected: targetProfileId,
            received: receivedUserId
          });
          throw new Error('Profil verisi uyuşmuyor');
        }

        console.log('✅ Profile data loaded:', {
          user_id: profileData?.user_id,
          username: profileData?.username,
          posts_count: profileData?.posts?.length || 0,
          followers_count: profileData?.followers_count || 0,
          following_count: profileData?.following_count || 0
        });

        setLocalProfileData(profileData);

        const newStats = {
          posts: profileData?.posts?.length || 0,
          followers: profileData?.followed_by_count ||  // ✅ followed_by_count
            (Array.isArray(profileData?.followed_by) ? profileData.followed_by.length : 0), // ✅ followed_by
          following: profileData?.follows_count ||  // ✅ follows_count
            (Array.isArray(profileData?.follows) ? profileData.follows.length : 0)
        };

        setLocalStats(newStats);
        setIsLoading(false);
        setRefreshing(false);
      }
    } catch (loadError) {
      console.error('❌ Profile load error:', loadError);
      if (isMountedRef.current) {
        setError(loadError.message || 'Profil yüklenemedi');
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, [targetProfileId, isProfileOwner, dispatch]);

  // screens/Profile/ProfileScreen.js - handleFollowChange Optimized

  const handleFollowChange = useCallback(({ userId, wasFollowing, isNowFollowing, followerChange, newFollowerCount }) => {
    console.log('🔄 ProfileScreen: Follow change received:', {
      userId,
      wasFollowing,
      isNowFollowing,
      followerChange,
      newFollowerCount,
      currentStats: localStats
    });

    // ✅ PRIORITY: Use exact backend count if provided
    if (typeof newFollowerCount === 'number') {
      console.log('✅ Using exact backend follower count:', newFollowerCount);
      setLocalStats(prev => ({
        ...prev,
        followers: newFollowerCount
      }));
    } else {
      // ✅ FALLBACK: Calculate based on change
      console.log('⚡ Calculating follower count:', {
        current: localStats.followers,
        change: followerChange,
        result: Math.max(localStats.followers + followerChange, 0)
      });
      setLocalStats(prev => ({
        ...prev,
        followers: Math.max(prev.followers + followerChange, 0)
      }));
    }

    // ✅ UPDATE PROFILE DATA: Add/remove current user from followers array
    if (localProfileData && String(localProfileData.user_id || localProfileData.id) === String(userId)) {
      setLocalProfileData(prev => {
        if (!prev) return prev;

        const currentFollowedBy = prev.followed_by || [];
        let newFollowedBy;

        if (isNowFollowing) {
          // ✅ ADD: Current user to followers if not already there
          const alreadyFollowing = currentFollowedBy.some(f =>
            String(f.user_id || f.id) === String(currentUserId)
          );

          if (!alreadyFollowing) {
            newFollowedBy = [...currentFollowedBy, { user_id: currentUserId }];
            console.log('➕ Added current user to followed_by array');
          } else {
            newFollowedBy = currentFollowedBy;
            console.log('⚠️ Current user already in followed_by array');
          }
        } else {
          // ✅ REMOVE: Current user from followers
          newFollowedBy = currentFollowedBy.filter(f =>
            String(f.user_id || f.id) !== String(currentUserId)
          );
          console.log('➖ Removed current user from followed_by array');
        }

        return {
          ...prev,
          followed_by: newFollowedBy,
          followed_by_count: typeof newFollowerCount === 'number' ? newFollowerCount : newFollowedBy.length
        };
      });
    }

    // ✅ UPDATE FOLLOWING COUNT: For current user's own profile
    if (isProfileOwner && currentUserId) {
      console.log('🔄 Updating current user following count');
      setLocalStats(prev => ({
        ...prev,
        following: isNowFollowing
          ? prev.following + 1
          : Math.max(prev.following - 1, 0)
      }));
    }

    // ✅ IMMEDIATE VISUAL FEEDBACK LOG
    console.log('✅ ProfileScreen: Follow change applied successfully');
  }, [localStats, localProfileData, isProfileOwner, currentUserId]);


  // Focus effect
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 Focus effect:', {
        targetProfileId,
        isOwner: isProfileOwner,
        refresh
      });

      if (refresh) {
        navigation.setParams({ refresh: undefined });
      }

      if (!targetProfileId) {
        setError('Geçersiz profil');
        setIsLoading(false);
        return;
      }

      loadProfile(!!refresh);

      return () => { };
    }, [targetProfileId, refresh, navigation, loadProfile, isProfileOwner])
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Enhanced userPosts processing
  const userPosts = useMemo(() => {
    if (!localProfileData?.posts || !Array.isArray(localProfileData.posts)) {
      return [];
    }

    try {
      const normalizedPosts = localProfileData.posts.map(post => {
        if (!post) return null;

        let normalizedUser;
        if (typeof post.user === 'string') {
          normalizedUser = {
            user_id: localProfileData.user_id || localProfileData.id,
            username: post.user,
            firstname: localProfileData.firstname || '',
            lastname: localProfileData.lastname || '',
            profile_image: localProfileData.profile_image || ''
          };
        } else if (typeof post.user === 'object' && post.user) {
          normalizedUser = {
            user_id: post.user.user_id || post.user.id,
            username: post.user.username,
            firstname: post.user.firstname || '',
            lastname: post.user.lastname || '',
            profile_image: post.user.profile_image || ''
          };
        } else {
          normalizedUser = {
            user_id: localProfileData.user_id || localProfileData.id,
            username: localProfileData.username,
            firstname: localProfileData.firstname || '',
            lastname: localProfileData.lastname || '',
            profile_image: localProfileData.profile_image || ''
          };
        }

        return { ...post, user: normalizedUser };
      }).filter(Boolean);

      // Sync with global posts for like/comment counts
      if (allPosts?.length > 0) {
        const globalPostsMap = new Map();
        allPosts.forEach(post => {
          if (post) {
            const postId = post.post_id || post.id;
            if (postId) globalPostsMap.set(postId, post);
          }
        });

        normalizedPosts.forEach(post => {
          if (post) {
            const postId = post.post_id || post.id;
            const globalPost = globalPostsMap.get(postId);
            if (globalPost) {
              post.is_liked = globalPost.is_liked;
              post.likes_count = globalPost.likes_count;
              post.comments_count = globalPost.comments_count;
            }
          }
        });
      }

      return [...normalizedPosts].sort((a, b) => {
        const aId = (a?.post_id || a?.id || 0);
        const bId = (b?.post_id || b?.id || 0);
        return bId - aId;
      });
    } catch (error) {
      console.error('❌ UserPosts processing error:', error);
      return [];
    }
  }, [localProfileData, allPosts]);

  // Update post count when userPosts changes
  useEffect(() => {
    if (userPosts.length !== localStats.posts) {
      setLocalStats(prev => ({
        ...prev,
        posts: userPosts.length
      }));
    }
  }, [userPosts.length, localStats.posts]);

  // CALLBACKS
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await dispatch(logoutUser());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('❌ Logout error:', error);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  }, [dispatch, navigation, isLoggingOut]);

  const onRefresh = useCallback(() => {
    loadProfile(true);
  }, [loadProfile]);

  const navigateToUserProfile = useCallback((targetUserId) => {
    if (!targetUserId) {
      console.warn('❌ navigateToUserProfile: No target user ID');
      return;
    }

    if (String(targetUserId) === String(currentUserId)) {
      navigation.navigate('MainTabs', {
        screen: 'Profile',
        params: { refresh: Date.now() }
      });
    } else {
      navigation.navigate('OtherUserProfile', {
        userId: targetUserId,
        isOwnProfile: false,
        refresh: Date.now()
      });
    }
  }, [navigation, currentUserId]);

  // Safe profile data selection with validation
  const profileData = useMemo(() => {
    if (localProfileData) {
      const dataProfileId = localProfileData.user_id || localProfileData.id;
      if (String(dataProfileId) === String(targetProfileId)) {
        return localProfileData;
      } else {
        console.warn('⚠️ Profile data mismatch in profileData memo', {
          dataProfileId,
          targetProfileId
        });
        return null;
      }
    }
    return null;
  }, [localProfileData, targetProfileId]);

  // Posts content
  const PostsContent = useMemo(() => {
    if (!userPosts.length) {
      return <EmptyPostsContent isProfileOwner={isProfileOwner} />;
    }

    return (
      <View className="w-full px-2 mt-1">
        <Posts
          posts={userPosts}
          onUserPress={navigateToUserProfile}
          fromProfile={true}
        />
      </View>
    );
  }, [userPosts, isProfileOwner, navigateToUserProfile]);

  // ProfileScreen.js - HeaderComponent kısmında userInfo oluşturma düzeltmesi

  const HeaderComponent = useMemo(() => {
    if (!profileData) return null;

    try {
      // ✅ FIXED: Backend'den gelen RAW data'yı kullan, normalize etme!
      const userInfoData = {
        id: profileData.user_id || profileData.id,
        name: `${profileData.firstname || ''} ${profileData.lastname || ''}`.trim() ||
          profileData.username ||
          'Kullanıcı',
        username: profileData.username || 'username',
        profilePicture: (profileData.profile_image && profileData.profile_image.trim() !== '')
          ? { uri: profileData.profile_image }
          : require('../../assets/Images/UserImages/user1_pp.jpg'),
        bio: profileData.bio || 'Henüz bir açıklama eklenmemiş.',
        email: isProfileOwner ? profileData.email : undefined,
        verified: profileData.verified || false,

        // ✅ CRITICAL FIX: Backend'den gelen RAW followers data'sını kullan
        followers: profileData.followed_by || profileData.followers || [], // Backend field'ı
        followRequests: Array.isArray(profileData.followRequests) ? profileData.followRequests : [],

        // ✅ FIX: Follow state fields for initial detection
        isFollowing: profileData.isFollowing || profileData.is_following || false,
        followers_count: profileData.followed_by_count || profileData.followers_count,
        following_count: profileData.follows_count || profileData.following_count,

        // ✅ ADDITIONAL: Backend'den gelen diğer takip field'larını da geç
        followed_by: profileData.followed_by, // Raw backend data
        followed_by_count: profileData.followed_by_count,
        follows: profileData.follows,
        follows_count: profileData.follows_count
      };

      console.log('🔧 FIXED userInfo creation:', {
        backendFollowed_by: profileData.followed_by,
        backendFollowed_by_count: profileData.followed_by_count,
        userInfoFollowers: userInfoData.followers,
        userInfoFollowed_by: userInfoData.followed_by,
        comparison: {
          backend_length: profileData.followed_by?.length,
          userInfo_length: userInfoData.followers?.length
        }
      });

      return (
        <>
          <View className="bg-[#171717]">
            <ProfileUserInfo
              userInfo={userInfoData}
              totalPost={localStats.posts}
              totalFollowers={localStats.followers}
              totalFollowings={localStats.following}
              isOwnProfile={isProfileOwner}
              onUserPress={navigateToUserProfile}
              onLogout={isProfileOwner ? handleLogout : undefined}
              onFollowChange={handleFollowChange}
              currentUserId={currentUserId}
            />
          </View>
          {PostsContent}
        </>
      );
    } catch (error) {
      console.error('❌ HeaderComponent error:', error);
      return (
        <View className="bg-[#171717] p-4">
          <Text className="text-red-400 text-center">Profil yüklenirken hata oluştu</Text>
          <TouchableOpacity onPress={onRefresh} className="bg-[#1B77CD] py-2 px-4 rounded-lg mt-2">
            <Text className="text-white font-semibold text-center">Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }, [profileData, localStats, isProfileOwner, PostsContent, navigateToUserProfile, handleLogout, onRefresh, handleFollowChange, currentUserId]);

  // RENDER STATES
  if (isLoading && !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-[#171717]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B77CD" />
          <Text className="mt-3 text-white">Profil Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profileData) {
    return (
      <SafeAreaView className="flex-1 bg-[#171717]">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-400 text-lg mb-2">Hata Oluştu</Text>
          <Text className="text-gray-400 text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={() => loadProfile(true)} className="bg-[#1B77CD] py-2 px-4 rounded-lg">
            <Text className="text-white font-semibold">Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#171717]">
      <FlatList
        ref={flatListRef}
        data={[{ id: 'profile-content' }]}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1B77CD']}
            tintColor={'#1B77CD'}
          />
        }
        ListHeaderComponent={HeaderComponent}
        renderItem={() => null}
        initialNumToRender={1}
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;