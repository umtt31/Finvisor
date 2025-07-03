// components/post/PostLikeComment.js - Correct Like State Fix

import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHeart as faHeartRegular,
  faComment,
  faUpFromBracket,
  faBookmark
} from '@fortawesome/pro-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/pro-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';

// Finvisor Redux
import { toggleLikePost, getAllPosts } from '../../redux/post/postActions';

// Comments Modal
import CommentModal from '../comments/CommentModal';

const PostLikeComment = ({ post, fromProfile = false }) => {
  const dispatch = useDispatch();

  // ✅ CRITICAL FIX: Get global posts for like state sync
  const allPosts = useSelector(state => state.posts?.posts || []);

  // ✅ SAFE: Comments count with fallback
  const commentsCount = useMemo(() => {
    return post.comments_count ||
      post.commentsCount ||
      (post.comments && Array.isArray(post.comments) ? post.comments.length : 0) ||
      0;
  }, [post.comments_count, post.commentsCount, post.comments]);

  // ✅ SAFE: Likes count with fallback  
  const likesCount = useMemo(() => {
    return post.likes_count ||
      post.likesCount ||
      (post.likes && Array.isArray(post.likes) ? post.likes.length : 0) ||
      0;
  }, [post.likes_count, post.likesCount, post.likes]);

  // ✅ NEW: Find this post in global store to get correct like state
  const globalPost = useMemo(() => {
    return allPosts.find(globalP => {
      const globalPostId = globalP.post_id || globalP.id;
      const currentPostId = post.post_id || post.id;
      return String(globalPostId) === String(currentPostId);
    });
  }, [allPosts, post.post_id, post.id]);

  // ✅ FIXED: Use global post like state if available, otherwise use prop
  const initialLikeState = useMemo(() => {
    if (globalPost) {
      console.log('🌐 Using global post like state:', {
        postId: globalPost.post_id || globalPost.id,
        is_liked: globalPost.is_liked,
        likes_count: globalPost.likes_count
      });
      return {
        isLiked: globalPost.is_liked || false,
        likesCount: globalPost.likes_count || 0
      };
    } else {
      console.log('📄 Using prop like state:', {
        postId: post.post_id || post.id,
        is_liked: post.is_liked,
        likes_count: likesCount
      });
      return {
        isLiked: post.is_liked || false,
        likesCount: likesCount
      };
    }
  }, [globalPost, post.is_liked, likesCount, post.post_id, post.id]);

  // ✅ OPTIMISTIC UI STATE - Initialize with global data
  const [optimisticState, setOptimisticState] = useState({
    isLiked: false,
    likesCount: 0,
    isProcessing: false
  });

  // Comments Modal state
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // ✅ UPDATED: Initialize optimistic state with global data
  useEffect(() => {
    setOptimisticState({
      isLiked: initialLikeState.isLiked,
      likesCount: initialLikeState.likesCount,
      isProcessing: false
    });
  }, [initialLikeState]);

  // ✅ ALSO: Update when global post changes
  useEffect(() => {
    if (globalPost) {
      setOptimisticState(prev => ({
        ...prev,
        isLiked: globalPost.is_liked || false,
        likesCount: globalPost.likes_count || 0
      }));
    }
  }, [globalPost?.is_liked, globalPost?.likes_count]);

  // ✅ INSTANT OPTIMISTIC LIKE HANDLER with Global Sync
  const handleLike = useCallback(async () => {
    if (!post.post_id) {
      console.warn('❌ handleLike: No post_id');
      return;
    }

    // Store previous state for potential rollback
    const previousState = {
      isLiked: optimisticState.isLiked,
      likesCount: optimisticState.likesCount
    };

    // Calculate new optimistic state
    const newIsLiked = !optimisticState.isLiked;
    const newLikesCount = newIsLiked
      ? optimisticState.likesCount + 1
      : Math.max(optimisticState.likesCount - 1, 0);

    // ✅ IMMEDIATE UI UPDATE
    setOptimisticState({
      isLiked: newIsLiked,
      likesCount: newLikesCount,
      isProcessing: false
    });

    console.log('❤️ Optimistic like update:', { newIsLiked, newLikesCount });

    // Background API call
    dispatch(toggleLikePost(post.post_id))
      .then(result => {
        if (result.type === 'posts/toggleLikePost/fulfilled') {
          console.log('✅ Like successful - syncing global state');

          // Update with server response if different from optimistic
          const serverData = result.payload;
          if (serverData && typeof serverData === 'object') {
            setOptimisticState({
              isLiked: serverData.is_liked ?? newIsLiked,
              likesCount: serverData.likes_count ?? newLikesCount,
              isProcessing: false
            });
          }

          // ✅ CRITICAL: Refresh global posts to sync all like states
          setTimeout(() => {
            console.log('🔄 Refreshing global posts for like sync');
            dispatch(getAllPosts());
          }, 500);

        } else {
          // ✅ ROLLBACK on error
          console.error('❌ Like failed - rolling back:', result.payload);
          setOptimisticState({
            ...previousState,
            isProcessing: false
          });
        }
      })
      .catch(error => {
        // ✅ ROLLBACK on exception
        console.error('❌ Like exception - rolling back:', error);
        setOptimisticState({
          ...previousState,
          isProcessing: false
        });
      });
  }, [post.post_id, optimisticState, dispatch]);

  // ✅ COMMENT HANDLER - SAFE
  const handleComment = useCallback(() => {
    if (!post.post_id) {
      console.warn('❌ handleComment: No post_id');
      return;
    }

    console.log('📱 Opening comments modal for post:', post.post_id);
    setShowCommentsModal(true);
  }, [post.post_id]);

  // ✅ CLOSE COMMENTS MODAL
  const handleCloseCommentsModal = useCallback(() => {
    setShowCommentsModal(false);
  }, []);

  // ✅ MEMOIZED VALUES
  const likeButtonColor = useMemo(() => {
    return optimisticState.isLiked ? "#1B77CD" : "#fafafc";
  }, [optimisticState.isLiked]);

  const likeIcon = useMemo(() => {
    return optimisticState.isLiked ? faHeartSolid : faHeartRegular;
  }, [optimisticState.isLiked]);

  // ✅ DEBUG INFO (Development only)
  if (__DEV__) {
    console.log('🔍 PostLikeComment Debug:', {
      post_id: post.post_id,
      comments_count: commentsCount,
      likes_count: optimisticState.likesCount,
      is_liked: optimisticState.isLiked,
      hasGlobalPost: !!globalPost,
      globalPostLiked: globalPost?.is_liked,
      propIsLiked: post.is_liked,
      raw_post: {
        comments_count: post.comments_count,
        likes_count: post.likes_count,
        comments_length: post.comments?.length,
        likes_length: post.likes?.length
      }
    });
  }

  // ✅ RENDER
  return (
    <>
      <View className="flex-row justify-between">
        <View className="flex-row items-center gap-3">
          {/* ✅ LIKE SECTION - Pure Optimistic UI with Global Sync */}
          <View className="flex-row gap-1 items-center">
            <TouchableOpacity
              onPress={handleLike}
              className="p-1"
              activeOpacity={0.7}
            >
              <FontAwesomeIcon
                icon={likeIcon}
                size={20}
                color={likeButtonColor}
              />
            </TouchableOpacity>

            {optimisticState.likesCount > 0 && (
              <Text className="font-semibold text-gray-200 text-sm">
                {optimisticState.likesCount}
              </Text>
            )}
          </View>

          {/* ✅ COMMENT SECTION - SAFE COUNT */}
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              onPress={handleComment}
              className="p-1"
              activeOpacity={0.7}
            >
              <FontAwesomeIcon
                icon={faComment}
                size={20}
                color='#fafafc'
              />
            </TouchableOpacity>

            {commentsCount > 0 && (
              <Text className="font-semibold text-gray-200 text-sm">
                {commentsCount}
              </Text>
            )}
          </View>

          {/* ✅ SHARE SECTION */}
          <TouchableOpacity
            className="p-1"
            activeOpacity={0.7}
          >
            <FontAwesomeIcon
              icon={faUpFromBracket}
              size={20}
              color='#fafafc'
            />
          </TouchableOpacity>
        </View>


      </View>

      {/* ✅ COMMENTS MODAL - SAFE PROPS */}
      {showCommentsModal && (
        <CommentModal
          visible={showCommentsModal}
          onClose={handleCloseCommentsModal}
          postId={post.post_id}
          postAuthor={post.user || null}
        />
      )}
    </>
  );
};

// ✅ MEMOIZATION - Only re-render when essential props change
export default React.memo(PostLikeComment, (prevProps, nextProps) => {
  const prevCommentsCount = prevProps.post.comments_count || prevProps.post.commentsCount || 0;
  const nextCommentsCount = nextProps.post.comments_count || nextProps.post.commentsCount || 0;
  const prevLikesCount = prevProps.post.likes_count || prevProps.post.likesCount || 0;
  const nextLikesCount = nextProps.post.likes_count || nextProps.post.likesCount || 0;

  return (
    prevProps.post.post_id === nextProps.post.post_id &&
    prevProps.post.is_liked === nextProps.post.is_liked &&
    prevLikesCount === nextLikesCount &&
    prevCommentsCount === nextCommentsCount &&
    prevProps.fromProfile === nextProps.fromProfile
  );
});