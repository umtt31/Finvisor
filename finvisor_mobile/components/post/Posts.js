// components/post/Posts.js - Simple & Clean
import React from "react";
import SinglePost from "./SinglePost";
import { View } from "react-native";

const Posts = ({ posts, onUserPress, fromProfile = false }) => {
  if (!posts || posts.length === 0) {
    return null; // Let parent handle empty state
  }

  return (
    <View>
      {posts.map((post) => (
        <SinglePost
          key={`post-${post.post_id}`}
          post={post}
          onUserPress={onUserPress}
          fromProfile={fromProfile}
        />
      ))}
    </View>
  );
};

export default React.memo(Posts, (prevProps, nextProps) => {
  if (prevProps.posts.length !== nextProps.posts.length) return false;

  for (let i = 0; i < prevProps.posts.length; i++) {
    const prevPost = prevProps.posts[i];
    const nextPost = nextProps.posts[i];

    if (
      prevPost.post_id !== nextPost.post_id ||
      prevPost.likes_count !== nextPost.likes_count ||
      prevPost.is_liked !== nextPost.is_liked ||
      prevPost.comments_count !== nextPost.comments_count
    ) {
      return false;
    }
  }

  return true;
});