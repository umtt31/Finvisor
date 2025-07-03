// components/comments/CommentItem.js - Working Version with User Object Fix
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faHeart as faHeartSolid,
    faTrash,
} from '@fortawesome/pro-solid-svg-icons';
import {
    faHeart as faHeartRegular,
} from '@fortawesome/pro-regular-svg-icons';

// Finvisor Redux
import {
    toggleLikeComment,
    deleteComment
} from '../../redux/comment/commentActions';

// ✅ Simple user cache
const userCache = new Map();

const CommentItem = ({
    comment,
    postId,
    user,
    postAuthor,
    scrollViewRef,
    onReplyPress,
    isFocused,
    onReplySuccess,
}) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    // ✅ STATE HOOKS
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [optimisticState, setOptimisticState] = useState({
        isLiked: false,
        likesCount: 0
    });
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ✅ SELECTORS
    const allPosts = useSelector(state => state.posts?.posts || []);
    const currentUser = useSelector(state => state.auth?.user || state.auth?.userProfile);

    // ✅ FIXED: Extract user_id from user object
    const safeComment = useMemo(() => {
        if (!comment) return null;

        // ✅ user_id'yi farklı yerlerden çıkarmaya çalış
        let userId = comment.user_id || comment.author_id;

        // ✅ TEMEL ÇÖZÜM: Eğer user object var ise oradan user_id al
        if (!userId && comment.user) {
            userId = comment.user.user_id || comment.user.id;
            console.log('✅ Extracted user_id from user object:', userId);
        }

        return {
            comment_id: comment.comment_id || comment.id,
            content: comment.content || '',
            created_at: comment.created_at,
            is_liked: comment.is_liked || false,
            likes_count: comment.likes_count || 0,
            user_id: userId,
            user: comment.user // ✅ User object'ini de sakla
        };
    }, [comment]);

    const isOwner = useMemo(() => {
        if (!currentUserId || !userData) return false;
        const commentUserId = userData.user_id || userData.id;
        return Number(currentUserId) === Number(commentUserId);
    }, [currentUserId, userData]);

    const formattedTime = useMemo(() => {
        if (!safeComment?.created_at) return '';

        const date = new Date(safeComment.created_at);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const minutes = Math.floor(diff / (1000 * 60));

        if (days > 0) return `${days}g`;
        if (hours > 0) return `${hours}s`;
        if (minutes > 0) return `${minutes}d`;
        return 'Şimdi';
    }, [safeComment?.created_at]);

    const userName = useMemo(() => {
        if (!userData) return 'Bilinmeyen Kullanıcı';
        const fullName = `${userData.firstname || ''} ${userData.lastname || ''}`.trim();
        return fullName || userData.username || 'Bilinmeyen Kullanıcı';
    }, [userData]);

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

    const profileImageSource = useMemo(() => {
        if (!userData) return require('../../assets/Images/UserImages/user1_pp.jpg');

        const preparedUrl = prepareImageUri(userData.profile_image);
        if (!preparedUrl) {
            return require('../../assets/Images/UserImages/user1_pp.jpg');
        }

        return {
            uri: preparedUrl,
            cachePolicy: 'memory-disk',
        };
    }, [userData, prepareImageUri]);

    const likeButtonProps = useMemo(() => ({
        icon: optimisticState.isLiked ? faHeartSolid : faHeartRegular,
        color: optimisticState.isLiked ? "#FF3040" : "#888"
    }), [optimisticState.isLiked]);

    // ✅ EFFECTS
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user_data');
                if (userData) {
                    const user = JSON.parse(userData);
                    setCurrentUserId(user.user_id || user.id);
                }
            } catch (error) {
                console.log('❌ CommentItem: AsyncStorage error:', error);
            }
        };

        getCurrentUser();
    }, []);

    // ✅ SIMPLIFIED: User data resolve
    useEffect(() => {
        const resolveUserData = async () => {
            if (!safeComment) {
                setUserLoading(false);
                return;
            }

            console.log('🔍 Comment debug:', {
                comment_id: safeComment.comment_id,
                user_id: safeComment.user_id,
                has_user_object: !!safeComment.user,
                user_object: safeComment.user
            });

            // ✅ 1. ÖNCE: Comment'te user object var mı? (En güvenilir)
            if (safeComment.user && typeof safeComment.user === 'object') {
                console.log('✅ Using user object from comment');
                setUserData(safeComment.user);
                setUserLoading(false);
                return;
            }

            // ✅ 2. user_id varsa cache'e bak
            const commentUserId = safeComment.user_id;
            if (commentUserId && userCache.has(commentUserId)) {
                console.log('✅ Found user in cache');
                setUserData(userCache.get(commentUserId));
                setUserLoading(false);
                return;
            }

            // ✅ 3. Current user kontrolü
            if (commentUserId && currentUserId && String(commentUserId) === String(currentUserId)) {
                console.log('✅ Comment belongs to current user');
                const currentUserData = {
                    user_id: currentUser?.user_id || currentUserId,
                    username: currentUser?.username || 'You',
                    firstname: currentUser?.firstname || '',
                    lastname: currentUser?.lastname || '',
                    profile_image: currentUser?.profile_image || ''
                };
                setUserData(currentUserData);
                userCache.set(commentUserId, currentUserData);
                setUserLoading(false);
                return;
            }

            // ✅ 4. Redux posts'dan user ara
            if (commentUserId && allPosts.length > 0) {
                console.log('🔍 Searching user in Redux posts...');
                let foundUser = null;

                for (const post of allPosts) {
                    // Post author kontrolü
                    if (post.user && (post.user.user_id === commentUserId || post.user.id === commentUserId)) {
                        foundUser = post.user;
                        break;
                    }

                    // Post likes'da user arama
                    if (post.likes && Array.isArray(post.likes)) {
                        foundUser = post.likes.find(like =>
                            (like.user_id === commentUserId || like.id === commentUserId)
                        );
                        if (foundUser) break;
                    }
                }

                if (foundUser) {
                    console.log('✅ Found user in Redux posts');
                    setUserData(foundUser);
                    userCache.set(commentUserId, foundUser);
                    setUserLoading(false);
                    return;
                }
            }

            // ✅ 5. Fallback: Generic user data
            if (commentUserId) {
                console.log('⚠️ Creating generic user data for user_id:', commentUserId);
                const genericUser = {
                    user_id: commentUserId,
                    username: `user${commentUserId}`,
                    firstname: 'User',
                    lastname: commentUserId.toString(),
                    profile_image: ''
                };
                setUserData(genericUser);
                userCache.set(commentUserId, genericUser);
            } else {
                console.log('❌ No user information available');
                setUserData({
                    user_id: null,
                    username: 'Anonymous',
                    firstname: 'Anonymous',
                    lastname: 'User',
                    profile_image: ''
                });
            }

            setUserLoading(false);
        };

        resolveUserData();
    }, [safeComment, currentUserId, currentUser, allPosts]);

    useEffect(() => {
        if (safeComment) {
            setOptimisticState({
                isLiked: safeComment.is_liked || false,
                likesCount: safeComment.likes_count || 0
            });
        }
    }, [safeComment]);

    // ✅ CALLBACKS
    const handleLike = useCallback(async () => {
        if (!safeComment?.comment_id) return;

        const previousState = { ...optimisticState };
        const newIsLiked = !optimisticState.isLiked;
        const newLikesCount = newIsLiked
            ? optimisticState.likesCount + 1
            : Math.max(optimisticState.likesCount - 1, 0);

        setOptimisticState({
            isLiked: newIsLiked,
            likesCount: newLikesCount
        });

        dispatch(toggleLikeComment({
            commentId: safeComment.comment_id,
            postId: postId
        }))
            .then(result => {
                if (result.type === 'comments/toggleLikeComment/fulfilled') {
                    const serverData = result.payload;
                    if (serverData && typeof serverData === 'object') {
                        setOptimisticState({
                            isLiked: serverData.is_liked ?? newIsLiked,
                            likesCount: serverData.likes_count ?? newLikesCount
                        });
                    }
                } else {
                    setOptimisticState(previousState);
                }
            })
            .catch(() => setOptimisticState(previousState));
    }, [safeComment?.comment_id, postId, optimisticState, dispatch]);

    const handleDeletePress = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!safeComment?.comment_id || isDeleteLoading) return;

        setIsDeleteLoading(true);
        try {
            const result = await dispatch(deleteComment({
                commentId: safeComment.comment_id,
                postId: postId
            }));

            if (result.type === 'comments/deleteComment/fulfilled') {
                setShowDeleteModal(false);
            } else {
                Alert.alert('Hata', result.payload || 'Yorum silinemedi');
            }
        } catch (error) {
            Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
        } finally {
            setIsDeleteLoading(false);
        }
    }, [safeComment?.comment_id, postId, isDeleteLoading, dispatch]);

    const handleModalClose = useCallback(() => {
        if (!isDeleteLoading) setShowDeleteModal(false);
    }, [isDeleteLoading]);

    const handleUserPress = useCallback(() => {
        const userId = userData?.user_id || userData?.id;
        if (currentUserId === userId) {
            navigation.navigate('ProfileScreen');
        } else {
            navigation.navigate('ProfileScreen', { userId: userId });
        }
    }, [userData, currentUserId, navigation]);

    // ✅ EARLY RETURNS
    if (!comment || !safeComment) {
        return null;
    }

    if (userLoading) {
        return (
            <View className="flex-row py-3 px-4 bg-[#171717]">
                <View className="w-10 h-10 rounded-full bg-gray-600" />
                <View className="ml-3 flex-1">
                    <View className="h-4 bg-gray-600 rounded mb-2" />
                    <View className="h-3 bg-gray-700 rounded w-3/4" />
                </View>
            </View>
        );
    }

    return (
        <View className="flex-row py-3 px-4 bg-[#171717]">
            {/* Profile Image */}
            <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
                <Image
                    source={profileImageSource}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                    contentFit="cover"
                    transition={200}
                    placeholder={require('../../assets/Images/UserImages/user1_pp.jpg')}
                />
            </TouchableOpacity>

            {/* Comment Content */}
            <View className="ml-3 flex-1">
                {/* User Info & Time */}
                <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-2 flex-1">
                        <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
                            <Text className="text-white font-semibold text-sm">
                                {userName}
                            </Text>
                        </TouchableOpacity>
                        <Text className="text-gray-400 text-xs">
                            @{userData?.username || 'bilinmeyen'}
                        </Text>
                        <Text className="text-gray-500 text-xs">•</Text>
                        <Text className="text-gray-500 text-xs">
                            {formattedTime}
                        </Text>
                    </View>

                    {/* Delete button for owner */}
                    {isOwner && (
                        <TouchableOpacity
                            onPress={handleDeletePress}
                            disabled={isDeleteLoading}
                            className="p-1 ml-2"
                            activeOpacity={0.7}
                        >
                            <FontAwesomeIcon icon={faTrash} size={14} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Comment Text */}
                {safeComment.content && (
                    <Text className="text-white text-sm leading-5 mb-2">
                        {safeComment.content}
                    </Text>
                )}

                {/* Action Buttons */}
                <View className="flex-row items-center gap-4 mt-1">
                    <View className="flex-row items-center gap-1">
                        <TouchableOpacity onPress={handleLike} className="p-1" activeOpacity={0.7}>
                            <FontAwesomeIcon
                                icon={likeButtonProps.icon}
                                size={16}
                                color={likeButtonProps.color}
                            />
                        </TouchableOpacity>

                        {optimisticState.likesCount > 0 && (
                            <Text className="text-gray-400 text-xs">
                                {optimisticState.likesCount}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Delete Modal */}
            {showDeleteModal && (
                <Modal
                    visible={showDeleteModal}
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={handleModalClose}
                >
                    <View style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}>
                        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleModalClose} />
                    </View>

                    <View style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'box-none',
                    }}>
                        <View className="bg-[#252525] rounded-2xl p-6 mx-8 max-w-sm shadow-lg">
                            <View className="items-center mb-6">
                                <View className="w-12 h-12 bg-red-500/20 rounded-full items-center justify-center mb-3">
                                    <FontAwesomeIcon icon={faTrash} size={20} color="#EF4444" />
                                </View>
                                <Text className="text-white text-lg font-semibold text-center mb-2">
                                    Delete Comment
                                </Text>
                                <Text className="text-gray-400 text-sm text-center">
                                    Are you sure you want to permanently delete this comment?
                                </Text>
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleModalClose}
                                    disabled={isDeleteLoading}
                                    className={`flex-1 py-3 px-4 rounded-lg border border-gray-500 items-center ${isDeleteLoading ? 'opacity-50' : ''}`}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-gray-300 font-medium">Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleDeleteConfirm}
                                    disabled={isDeleteLoading}
                                    className={`flex-1 py-3 px-4 rounded-lg bg-red-500 items-center ${isDeleteLoading ? 'opacity-70' : ''}`}
                                    activeOpacity={0.8}
                                >
                                    {isDeleteLoading ? (
                                        <View className="flex-row items-center gap-2">
                                            <ActivityIndicator size="small" color="white" />
                                            <Text className="text-white font-medium text-xs">Deleting...</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-white font-medium">Delete</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default React.memo(CommentItem, (prevProps, nextProps) => {
    return (
        prevProps.comment?.comment_id === nextProps.comment?.comment_id &&
        prevProps.comment?.is_liked === nextProps.comment?.is_liked &&
        prevProps.comment?.likes_count === nextProps.comment?.likes_count &&
        prevProps.comment?.content === nextProps.comment?.content &&
        prevProps.isFocused === nextProps.isFocused
    );
});