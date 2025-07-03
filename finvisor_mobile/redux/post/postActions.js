// redux/posts/postActions.js - Debug edilmiş
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";

// redux/post/postActions.js - Geçici dummy data ile test

export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🚀 Making API request to /posts');

      const response = await apiClient.get("/posts");

      // ✅ GET CURRENT USER from auth state
      const { auth } = getState();
      const currentUserId = auth.user?.user_id || auth.user?.id;

      console.log('🔍 Current user for like calculation:', currentUserId);

      let posts = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        posts = response.data.data;
      } else if (Array.isArray(response.data)) {
        posts = response.data;
      }

      // ✅ FIXED: Sort posts by ID in descending order (newest first)
      posts = posts.sort((a, b) => {
        const aId = a.post_id || a.id || 0;
        const bId = b.post_id || b.id || 0;
        return bId - aId; // Descending order - newest first
      });

      console.log('📊 Posts sorted by ID (newest first):', {
        totalPosts: posts.length,
        firstPostId: posts[0]?.post_id || posts[0]?.id,
        lastPostId: posts[posts.length - 1]?.post_id || posts[posts.length - 1]?.id
      });

      // ✅ CALCULATE is_liked for each post
      const postsWithLikeState = posts.map(post => {
        let isLiked = false;

        if (post.likes && Array.isArray(post.likes) && currentUserId) {
          isLiked = post.likes.some(like => {
            const likeUserId = like.user_id || like.id;
            return String(likeUserId) === String(currentUserId);
          });
        }

        console.log('🔍 POST like calculation:', {
          postId: post.post_id,
          likesCount: post.likes?.length || 0,
          currentUserId,
          isLiked,
          likesArray: post.likes
        });

        return {
          ...post,
          is_liked: isLiked,
          likes_count: post.likes_count || post.likes?.length || 0
        };
      });

      console.log('✅ Posts with calculated like states:', {
        postsCount: postsWithLikeState.length,
        firstPostLikeState: postsWithLikeState[0] ? {
          id: postsWithLikeState[0].post_id,
          is_liked: postsWithLikeState[0].is_liked,
          likes_count: postsWithLikeState[0].likes_count
        } : null
      });

      return postsWithLikeState;

    } catch (error) {
      console.log('❌ API Error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Postlar alınamadı."
      );
    }
  }
);

// redux/posts/postActions.js - createPost
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      console.log('🚀 Creating post with data:', postData);

      const formData = new FormData();

      // Content - backend validation'a göre
      if (postData.content && postData.content.trim()) {
        formData.append('content', postData.content.trim());
        console.log('📝 Added content:', postData.content.trim());
      }

      // Image (backend'de media değil image field'ı var!)
      if (postData.media) {
        console.log('📎 Adding image:', postData.media);

        formData.append('image', {
          uri: postData.media.uri,
          type: postData.media.type || 'image/jpeg',
          name: postData.media.name || 'image.jpg',
        });
      }

      // Validation check - en az biri olmalı
      if (!postData.content?.trim() && !postData.media) {
        return rejectWithValue('İçerik veya resim gereklidir');
      }

      console.log('📤 Sending FormData to backend...');

      const response = await apiClient.post("/posts", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Create post response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Create post error:', error);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error status:', error.response?.status);

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Post oluşturulamadı."
      );
    }
  }
);

// Get Post by ID Action
export const getPostById = createAsyncThunk(
  "posts/getPostById",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Post alınamadı."
      );
    }
  }
);

// Update Post Action
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Text data
      if (postData.content) {
        formData.append('content', postData.content);
      }
      if (postData.caption) {
        formData.append('caption', postData.caption);
      }

      // Single media file (if updating)
      if (postData.media) {
        formData.append('media', postData.media);
      }

      const response = await apiClient.put(`/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Post güncellenemedi."
      );
    }
  }
);

// Delete Post Action
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Post silinemedi."
      );
    }
  }
);

// redux/post/postActions.js - toggleLikePost basitleştir

export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async (postId, { rejectWithValue }) => {
    try {
      console.log('🚀 Toggle like for post:', postId);

      const response = await apiClient.post(`/posts/${postId}/toggle-like`);

      console.log('✅ Toggle like response:', response.data);

      return {
        postId: parseInt(postId),
        action: response.data?.action || 'toggled',
        likes_count: response.data?.likes_count
      };
    } catch (error) {
      console.log('❌ Toggle like error:', error);
      console.log('❌ Error response:', error.response?.data);

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.first_error ||
        error.message ||
        "Beğeni işlemi başarısız."
      );
    }
  }
);