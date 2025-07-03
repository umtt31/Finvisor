// components/profile/ProfileUserInfo.js - Fixed Follow Detection & Optimistic UI
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faUserPlus,
    faUserMinus,
    faUserPen,
    faEllipsisVertical,
    faSignOut
} from '@fortawesome/pro-regular-svg-icons';
import { faBadgeCheck } from '@fortawesome/pro-solid-svg-icons';

// Components
import PostImageViewer from '../post/PostImageViewer';

// Redux Actions
import { toggleFollowUser, getUserProfile } from '../../redux/login-register/LoginRegisterActions';

const ProfileUserInfo = ({
    userInfo,
    totalPost = 0,
    totalFollowers = 0,
    totalFollowings = 0,
    isOwnProfile = false,
    onMenuPress,
    onLogout,
    onFollowChange
}) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    // Redux selectors
    const currentUser = useSelector(state => state.auth?.user || state.auth?.userProfile);

    // ✅ LOCAL STATE: Optimistic UI için takip durumu
    const [localIsFollowing, setLocalIsFollowing] = useState(false);
    const [localFollowerCount, setLocalFollowerCount] = useState(totalFollowers);
    const [isFollowActionPending, setIsFollowActionPending] = useState(false);
    const [stableCurrentUserId, setStableCurrentUserId] = useState(null);
    const [isStableUserLoaded, setIsStableUserLoaded] = useState(false);

    // ✅ NEW: Image viewer state
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    // ✅ CDN URL hazırlama fonksiyonu
    const prepareImageUri = useCallback((imageUrl) => {
        if (!imageUrl || imageUrl.trim() === '') return null;

        let finalUrl = imageUrl.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            const CDN_BASE_URL = 'https://api-social-sanalrekabet.b-cdn.net';
            if (!finalUrl.startsWith('/')) finalUrl = '/' + finalUrl;
            finalUrl = CDN_BASE_URL + finalUrl;
        }
        return finalUrl;
    }, []);

    // ✅ Profile image source
    const profileImageSource = useMemo(() => {
        let imageUrl = null;

        if (userInfo?.profile_image && typeof userInfo.profile_image === 'string') {
            imageUrl = userInfo.profile_image;
        } else if (userInfo?.profilePicture) {
            if (typeof userInfo.profilePicture === 'string') {
                imageUrl = userInfo.profilePicture;
            } else if (typeof userInfo.profilePicture === 'object' && userInfo.profilePicture.uri) {
                imageUrl = userInfo.profilePicture.uri;
            }
        }

        const preparedUrl = prepareImageUri(imageUrl);
        if (!preparedUrl) {
            return require('../../assets/Images/UserImages/user1_pp.jpg');
        }

        return {
            uri: preparedUrl,
            cachePolicy: 'memory-disk',
        };
    }, [userInfo?.profile_image, userInfo?.profilePicture, prepareImageUri]);

    // ✅ Profile image URI for viewer
    const profileImageUri = useMemo(() => {
        if (profileImageSource?.uri) {
            return profileImageSource.uri;
        }
        return null;
    }, [profileImageSource]);

    // ✅ Handle profile image press
    const handleProfileImagePress = useCallback(() => {
        if (profileImageUri) {
            console.log('🖼️ Opening profile image viewer:', profileImageUri);
            setIsImageViewerVisible(true);
        } else {
            console.log('⚠️ No profile image to display');
        }
    }, [profileImageUri]);

    // ✅ Close image viewer
    const handleCloseImageViewer = useCallback(() => {
        setIsImageViewerVisible(false);
    }, []);

    // ✅ Stable user ID loading
    useEffect(() => {
        const getStableUserId = async () => {
            try {
                const userData = await AsyncStorage.getItem('user_data');
                if (userData) {
                    const user = JSON.parse(userData);
                    const userId = user.user_id || user.id;
                    setStableCurrentUserId(userId);
                    setIsStableUserLoaded(true);
                    console.log('✅ Stable current user ID loaded:', userId);
                } else {
                    console.log('❌ No user data in AsyncStorage');
                    setIsStableUserLoaded(true);
                }
            } catch (error) {
                console.log('❌ AsyncStorage error:', error);
                setIsStableUserLoaded(true);
            }
        };

        getStableUserId();
    }, []);

    // ✅ CRITICAL FIX: Immediate follow state initialization
    useEffect(() => {
        if (!userInfo || !stableCurrentUserId || isOwnProfile) {
            setLocalIsFollowing(false);
            return;
        }

        console.log('🔧 IMMEDIATE FOLLOW DETECTION:', {
            userId: userInfo.id,
            currentUserId: stableCurrentUserId,
            followed_by: userInfo.followed_by,
            followed_by_length: userInfo.followed_by?.length
        });

        // ✅ Check if current user is in followed_by array
        if (userInfo.followed_by && Array.isArray(userInfo.followed_by)) {
            const isCurrentlyFollowing = userInfo.followed_by.some(follower => {
                const followerId = follower?.user_id || follower?.id;
                const match = String(followerId) === String(stableCurrentUserId);
                console.log('🔍 Checking follower:', { followerId, currentUserId: stableCurrentUserId, match });
                return match;
            });

            console.log('⚡ IMMEDIATE follow state set:', isCurrentlyFollowing);
            setLocalIsFollowing(isCurrentlyFollowing);
        } else {
            console.log('⚡ No followed_by array, setting false');
            setLocalIsFollowing(false);
        }
    }, [userInfo?.followed_by, stableCurrentUserId, isOwnProfile, userInfo?.id]);

    // ✅ Update local follower count when props change (with stability check)
    useEffect(() => {
        // Only update if there's a significant difference
        if (Math.abs(totalFollowers - localFollowerCount) > 0) {
            console.log('📊 Updating follower count:', { from: localFollowerCount, to: totalFollowers });
            setLocalFollowerCount(totalFollowers);
        }
    }, [totalFollowers]);

    const userId = userInfo?.id || userInfo?.user_id;

    const isSelfProfile = useMemo(() => {
        if (!stableCurrentUserId || !userId) return false;
        const isSelf = String(stableCurrentUserId) === String(userId);
        return isSelf;
    }, [stableCurrentUserId, userId]);

    // ✅ IMPROVED: Optimistic Follow Handler with Better Backend Integration
    const handleFollow = useCallback(async () => {
        if (isSelfProfile) {
            Alert.alert('Hata', 'Kendinizi takip edemezsiniz');
            return;
        }

        if (isFollowActionPending || !userId || !stableCurrentUserId) {
            console.log('⚠️ Follow action blocked:', {
                isFollowActionPending,
                userId: !!userId,
                stableCurrentUserId: !!stableCurrentUserId
            });
            return;
        }

        console.log('🚀 Starting follow action:', {
            userId,
            currentIsFollowing: localIsFollowing,
            currentFollowerCount: localFollowerCount
        });

        setIsFollowActionPending(true);

        // ✅ OPTIMISTIC UI UPDATE
        const newIsFollowing = !localIsFollowing;
        const optimisticFollowerCount = newIsFollowing
            ? localFollowerCount + 1
            : Math.max(localFollowerCount - 1, 0);

        // ✅ IMMEDIATE UI UPDATE
        setLocalIsFollowing(newIsFollowing);
        setLocalFollowerCount(optimisticFollowerCount);

        console.log('⚡ Optimistic UI updated:', {
            newIsFollowing,
            optimisticFollowerCount
        });

        try {
            const result = await dispatch(toggleFollowUser(userId)).unwrap();
            console.log('✅ Follow action backend response:', result);

            // ✅ CRITICAL: Backend response handling
            let finalIsFollowing = newIsFollowing; // fallback to optimistic
            let finalFollowerCount = optimisticFollowerCount; // fallback to optimistic

            // Check if backend provided follow state
            if (typeof result.isFollowing === 'boolean') {
                finalIsFollowing = result.isFollowing;
                console.log('🔧 Using backend follow state:', finalIsFollowing);
            } else if (result.action) {
                // Parse action string
                finalIsFollowing = result.action === 'follow';
                console.log('🔧 Parsed follow state from action:', finalIsFollowing);
            }

            // Check if backend provided follower count
            if (typeof result.followers_count === 'number') {
                finalFollowerCount = result.followers_count;
                console.log('🔧 Using backend follower count:', finalFollowerCount);
            } else {
                // Keep optimistic count since backend didn't provide
                console.log('🔧 Keeping optimistic follower count:', finalFollowerCount);
            }

            // ✅ UPDATE FINAL STATE
            setLocalIsFollowing(finalIsFollowing);
            setLocalFollowerCount(finalFollowerCount);

            // ✅ Call parent callback with exact data
            if (onFollowChange) {
                onFollowChange({
                    userId,
                    wasFollowing: !finalIsFollowing,
                    isNowFollowing: finalIsFollowing,
                    followerChange: finalIsFollowing ? 1 : -1,
                    newFollowerCount: finalFollowerCount
                });
            }

            // ✅ SHORTER DELAY: Refresh profile data to get updated followers array
            setTimeout(() => {
                console.log('🔄 Refreshing profile data after follow action');
                dispatch(getUserProfile(userId));
            }, 500); // Reduced from 1000ms to 500ms

        } catch (error) {
            console.error("❌ Follow action error:", error);

            // ✅ ROLLBACK optimistic update
            setLocalIsFollowing(!newIsFollowing);
            setLocalFollowerCount(localFollowerCount);

            Alert.alert('Hata', typeof error === 'string' ? error : 'Takip işlemi başarısız oldu');
        } finally {
            setIsFollowActionPending(false);
        }
    }, [
        localIsFollowing,
        localFollowerCount,
        isFollowActionPending,
        userId,
        stableCurrentUserId,
        dispatch,
        onFollowChange,
        isSelfProfile
    ]);

    // ✅ Profile edit handler
    const handleProfileEdit = useCallback(() => {
        try {
            navigation.navigate('ProfileEdit', {
                userInfo: userInfo
            });
        } catch (error) {
            console.error('❌ Navigation error:', error);
            Alert.alert('Hata', 'Profil düzenleme sayfasına gidilemedi');
        }
    }, [navigation, userInfo]);

    // ✅ DYNAMIC FOLLOW BUTTON
    const renderFollowButton = () => {
        let buttonText = 'Follow';
        let buttonStyle = 'bg-[#1B77CD]';
        let textStyle = 'text-white';
        let iconComponent = faUserPlus;

        if (localIsFollowing) {
            buttonText = 'Unfollow';
            buttonStyle = 'bg-gray-600';
            textStyle = 'text-gray-100';
            iconComponent = faUserMinus;
        }

        if (isFollowActionPending) {
            buttonText = 'Pending...';
            buttonStyle = 'bg-gray-400';
            textStyle = 'text-white';
        }

        return (
            <TouchableOpacity
                className={`${buttonStyle} px-4 py-2 rounded-lg flex-row items-center gap-2 ${isFollowActionPending ? 'opacity-70' : ''}`}
                onPress={handleFollow}
                disabled={isFollowActionPending}
            >
                {!isFollowActionPending && (
                    <FontAwesomeIcon
                        icon={iconComponent}
                        color="#fff"
                        size={14}
                    />
                )}
                <Text className={`font-medium ${textStyle} text-sm`}>
                    {buttonText}
                </Text>
            </TouchableOpacity>
        );
    };

    // ✅ Loading state
    if (!isStableUserLoaded) {
        return (
            <View className="bg-[#252525] rounded-xl p-4">
                <Text className="text-gray-400 text-center">Yükleniyor...</Text>
            </View>
        );
    }

    // ✅ Error state
    if (!userInfo || !userId) {
        console.warn('⚠️ ProfileUserInfo: Missing userInfo or userId');
        return (
            <View className="bg-[#252525] rounded-xl p-4">
                <Text className="text-gray-400 text-center">Kullanıcı bilgileri bulunamadı</Text>
            </View>
        );
    }

    return (
        <View className="bg-[#171717]">
            <View className="px-4 pt-6 pb-4">
                {/* Profile Photo and Basic Info */}
                <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start gap-4 flex-1">
                        {/* ✅ Clickable profile image */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleProfileImagePress}
                        >
                            <Image
                                source={profileImageSource}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    borderWidth: 2,
                                    borderColor: '#1B77CD'
                                }}
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

                        {/* User Info */}
                        <View className="flex-1 mt-1">
                            <View className="flex-row items-center gap-1">
                                <Text className="text-white text-lg font-bold" numberOfLines={1}>
                                    {userInfo.name || userInfo.username || 'İsimsiz Kullanıcı'}
                                </Text>
                                {userInfo.verified && (
                                    <FontAwesomeIcon
                                        icon={faBadgeCheck}
                                        color="#1B77CD"
                                        size={16}
                                    />
                                )}
                            </View>
                            <Text className="text-gray-400 text-sm">
                                @{userInfo.username || 'username'}
                            </Text>
                            {userInfo.email && (isSelfProfile || isOwnProfile) && (
                                <Text className="text-gray-500 text-xs mt-1">
                                    {userInfo.email}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row items-center gap-2">
                        {(isSelfProfile || isOwnProfile) ? (
                            <>
                                <TouchableOpacity
                                    onPress={handleProfileEdit}
                                    className="border-gray-400 border-[0.5px] px-3 py-2 rounded-full"
                                >
                                    <FontAwesomeIcon icon={faUserPen} color='#1B77CD' size={16} />
                                </TouchableOpacity>

                                {onLogout && (
                                    <TouchableOpacity
                                        onPress={onLogout}
                                        className="border-red-400 border-[0.5px] px-3 py-2 rounded-full"
                                    >
                                        <FontAwesomeIcon icon={faSignOut} color='#EF4444' size={16} />
                                    </TouchableOpacity>
                                )}

                                {onMenuPress && (
                                    <TouchableOpacity
                                        onPress={onMenuPress}
                                        className="border-gray-400 border-[0.5px] px-3 py-2 rounded-full"
                                    >
                                        <FontAwesomeIcon icon={faEllipsisVertical} color='#6B7280' size={16} />
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <>
                                {renderFollowButton()}

                                {onMenuPress && (
                                    <TouchableOpacity
                                        onPress={onMenuPress}
                                        className="border-gray-400 border-[0.5px] px-3 py-2 rounded-full"
                                    >
                                        <FontAwesomeIcon icon={faEllipsisVertical} color='#6B7280' size={16} />
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Bio */}
                {userInfo.bio && userInfo.bio.trim() !== '' && (
                    <View className="mt-4">
                        <Text className="text-gray-300 text-sm leading-5">
                            {userInfo.bio}
                        </Text>
                    </View>
                )}

                {/* Stats */}
                <View className="flex-row gap-6 mt-4 pt-4 border-t border-gray-600">
                    <TouchableOpacity className="items-center">
                        <Text className="font-bold text-white text-lg">{totalPost}</Text>
                        <Text className="text-gray-400 text-xs">Posts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <Text className="font-bold text-white text-lg">
                            {localFollowerCount}
                        </Text>
                        <Text className="text-gray-400 text-xs">Followers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <Text className="font-bold text-white text-lg">{totalFollowings}</Text>
                        <Text className="text-gray-400 text-xs">Following</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Profile Image Viewer */}
            {profileImageUri && (
                <PostImageViewer
                    visible={isImageViewerVisible}
                    imageUri={profileImageUri}
                    onClose={handleCloseImageViewer}
                />
            )}
        </View>
    );
};

export default React.memo(ProfileUserInfo);