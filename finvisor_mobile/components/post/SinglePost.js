// components/post/SinglePost.js - Clean & Simple
import { View } from 'react-native';
import React, { memo } from 'react';
import PostUserInfo from './PostUserInfo';
import PostContent from './PostContent';
import PostLikeComment from './PostLikeComment';

const SinglePost = ({ post, onUserPress, fromProfile = false }) => {
  if (!post) {
    console.warn('⚠️ SinglePost: post is null/undefined');
    return null;
  }

  return (
    <View className="w-full bg-[#252525] px-3 py-4 gap-4 rounded-lg border border-[#252525] mb-4">
      <PostUserInfo post={post} onUserPress={onUserPress} />
      <PostContent post={post} />
      <PostLikeComment post={post} fromProfile={fromProfile} />
    </View>
  );
};

export default memo(SinglePost, (prevProps, nextProps) => {
  return (
    prevProps.post.post_id === nextProps.post.post_id &&
    prevProps.post.likes_count === nextProps.post.likes_count &&
    prevProps.post.is_liked === nextProps.post.is_liked &&
    prevProps.post.comments_count === nextProps.post.comments_count
  );
});