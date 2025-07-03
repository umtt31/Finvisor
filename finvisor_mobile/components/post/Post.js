// components/post/Post.js - Simple Fixed (No Auto Refresh Loop)
import { Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Posts from "./Posts";
import { getAllPosts } from '../../redux/post/postActions';

// components/post/Post.js - Like State Synchronization Fix

const Post = ({
    posts: passedPosts,
    onUserPress,
    fromProfile = false,
    showEmpty = true
}) => {
    const dispatch = useDispatch();

    // Redux selectors
    const reduxPosts = useSelector(state => state.posts?.posts || []);
    const loading = useSelector(state => state.posts?.loading || false);
    const error = useSelector(state => state.posts?.error);

    // ✅ FIXED: Current user bilgisini al
    const currentUser = useSelector(state => state.auth?.user || state.auth?.userProfile);

    // Use passed posts or redux posts
    const rawPosts = passedPosts || reduxPosts;

    // ✅ ENHANCED NORMALIZATION: Like state'lerini de sync et
    const posts = useMemo(() => {
        if (!rawPosts || rawPosts.length === 0) {
            return rawPosts;
        }

        if (!currentUser) {
            return rawPosts;
        }

        // ✅ CLIENT-SIDE NORMALIZATION with Like State Sync
        const normalizedPosts = rawPosts.map(post => {
            if (!post?.user) return post;

            // Post sahibinin ID'sini al
            const postUserId = post.user.user_id || post.user.id;
            const currentUserId = currentUser.user_id || currentUser.id;

            // Eğer bu post current user'a aitse, fresh data kullan
            const isCurrentUserPost = postUserId && currentUserId &&
                String(postUserId) === String(currentUserId);

            let normalizedPost = { ...post };

            if (isCurrentUserPost) {
                // ✅ FRONTEND OVERRIDE: User data'sını güncelle
                normalizedPost = {
                    ...post,
                    user: {
                        // Backend'den gelen temel field'ları koru
                        user_id: currentUser.user_id || currentUser.id,
                        id: currentUser.user_id || currentUser.id,

                        // Fresh data'yı override et
                        username: currentUser.username || post.user.username,
                        firstname: currentUser.firstname || post.user.firstname,
                        lastname: currentUser.lastname || post.user.lastname,
                        profile_image: currentUser.profile_image || post.user.profile_image,

                        // Optional field'lar
                        email: currentUser.email || post.user.email,
                        bio: currentUser.bio || post.user.bio,
                        verified: currentUser.verified || post.user.verified || false,

                        // Backend'den gelen diğer field'ları koru
                        created_at: post.user.created_at,
                        updated_at: post.user.updated_at,
                    }
                };
            }

            // ✅ CRITICAL FIX: Like state synchronization for profile posts
            if (fromProfile) {
                // Profile'da gösterilen post'lar için global posts'tan like state'ini sync et
                const globalPost = reduxPosts.find(globalP => {
                    const globalPostId = globalP.post_id || globalP.id;
                    const currentPostId = post.post_id || post.id;
                    return String(globalPostId) === String(currentPostId);
                });

                if (globalPost) {
                    console.log('🔄 Syncing like state from global posts:', {
                        postId: globalPost.post_id || globalPost.id,
                        is_liked: globalPost.is_liked,
                        likes_count: globalPost.likes_count
                    });

                    normalizedPost = {
                        ...normalizedPost,
                        is_liked: globalPost.is_liked,
                        likes_count: globalPost.likes_count,
                        comments_count: globalPost.comments_count || normalizedPost.comments_count
                    };
                }
            }

            return normalizedPost;
        });

        return normalizedPosts;
    }, [rawPosts, currentUser, fromProfile, reduxPosts]);

    // ✅ Initial load
    useEffect(() => {
        if (!passedPosts && reduxPosts.length === 0) {
            console.log('📡 Initial posts load');
            dispatch(getAllPosts());
        }
    }, [dispatch, passedPosts, reduxPosts.length]);

    // Loading state
    if (loading && posts.length === 0) {
        return (
            <View className="flex-1 justify-center items-center py-16">
                <ActivityIndicator size="large" color="#1B77CD" />
                <Text className="text-white mt-2">Posts loading...</Text>
            </View>
        );
    }

    // Error state
    if (error && posts.length === 0) {
        return (
            <View className="flex-1 justify-center items-center py-16">
                <Text className="text-red-400 text-center">{error}</Text>
            </View>
        );
    }

    // Empty state
    if (posts.length === 0 && showEmpty) {
        return (
            <View className="flex-1 justify-center items-center py-16">
                <Text className="text-gray-400 text-center">Henüz gönderi yok</Text>
            </View>
        );
    }

    return (
        <View>
            <Posts
                posts={posts}
                onUserPress={onUserPress}
                fromProfile={fromProfile}
            />
        </View>
    );
};

export default React.memo(Post);