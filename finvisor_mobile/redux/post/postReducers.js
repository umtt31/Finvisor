// redux/posts/postSlice.js - Basit ve Temiz Yapı
import { createSlice } from '@reduxjs/toolkit';
import {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost
} from './postActions';

// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
  posts: [],
  loading: false,
  error: null,
};

// ==========================================
// POST SLICE
// ==========================================
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRefreshing: (state, action) => {
      state.loading = action.payload;
    },
    resetPosts: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // ==========================================
      // GET ALL POSTS
      // ==========================================
      .addCase(getAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ Posts already have calculated is_liked from action
        state.posts = action.payload;
        state.error = null;

        console.log('✅ REDUX: Posts with pre-calculated like states loaded:', {
          postsCount: state.posts.length,
          firstPostLikeState: state.posts[0] ? {
            id: state.posts[0].post_id,
            is_liked: state.posts[0].is_liked,
            likes_count: state.posts[0].likes_count
          } : null
        });
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================================
      // CREATE POST
      // ==========================================
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;

        // Backend tek post object dönecek
        const newPost = action.payload;

        console.log('🔍 newPost:', newPost);
        console.log('🔍 Current posts length:', state.posts.length);

        // Posts array'ine yeni post'u ekle
        state.posts.unshift(newPost);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================================
      // UPDATE POST
      // ==========================================
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPost = action.payload.data || action.payload;
        const postIndex = state.posts.findIndex(post => post.id === updatedPost.id);
        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost;
        }
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================================
      // DELETE POST
      // ==========================================
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        const postId = action.meta.arg;
        state.posts = state.posts.filter(post => post.id !== postId);
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================================
      // TOGGLE LIKE POST
      // ==========================================
      .addCase(toggleLikePost.pending, (state) => {
        // No loading for like - better UX
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, action: likeAction } = action.payload;

        console.log('🔄 REDUX toggleLikePost.fulfilled:', {
          postId,
          likeAction,
          currentPostsCount: state.posts.length
        });

        // ✅ CRITICAL FIX: Find post and update properly
        const postIndex = state.posts.findIndex(post => {
          const currentPostId = post.post_id || post.id;
          const match = String(currentPostId) === String(postId);
          return match;
        });

        if (postIndex !== -1) {
          console.log('✅ REDUX: Found post at index', postIndex);

          // ✅ IMMER CORRECT USAGE: Direct mutation on draft
          if (likeAction === 'liked') {
            state.posts[postIndex].is_liked = true;
            state.posts[postIndex].likes_count = (state.posts[postIndex].likes_count || 0) + 1;
          } else if (likeAction === 'unliked') {
            state.posts[postIndex].is_liked = false;
            state.posts[postIndex].likes_count = Math.max((state.posts[postIndex].likes_count || 0) - 1, 0);
          }

          console.log('✅ REDUX: Post updated', {
            postId,
            newLikeState: state.posts[postIndex].is_liked,
            newLikesCount: state.posts[postIndex].likes_count
          });

        } else {
          console.warn('❌ REDUX: Post not found for like toggle', {
            postId,
            availablePostIds: state.posts.map(p => p.post_id || p.id).slice(0, 5) // First 5 for debug
          });
        }
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// ==========================================
// SELECTORS
// ==========================================
export const selectPosts = (state) => state.posts.posts;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;

// Actions
// ==========================================
// SELECTORS


// Actions
export const { clearError, setRefreshing, resetPosts } = postSlice.actions;

// Reducer
export default postSlice.reducer;