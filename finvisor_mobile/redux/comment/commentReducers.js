// redux/comment/commentReducers.js - Comments Redux Slice
import { createSlice } from '@reduxjs/toolkit';
import {
    getPostComments,
    createComment,
    deleteComment,
    updateComment,
    toggleLikeComment
} from './commentActions';

// ==========================================
// INITIAL STATE
// ==========================================
const initialState = {
    // Comments by post ID - { postId: [comments] }
    commentsByPost: {},

    // Loading states
    loading: false,
    createLoading: false,
    deleteLoading: false,
    updateLoading: false,
    likeLoading: false,

    // Error states
    error: null,
    createError: null,
    deleteError: null,
    updateError: null,
    likeError: null,

    // Current viewing post
    currentPostId: null,
};

// ==========================================
// COMMENT SLICE
// ==========================================
const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        // Error temizleme
        clearErrors: (state) => {
            state.error = null;
            state.createError = null;
            state.deleteError = null;
            state.updateError = null;
            state.likeError = null;
        },

        // Post ID ayarlama (bottomsheet için)
        setCurrentPostId: (state, action) => {
            state.currentPostId = action.payload;
        },

        // Belirli post'un yorumlarını temizle
        clearPostComments: (state, action) => {
            const postId = action.payload;
            if (state.commentsByPost[postId]) {
                delete state.commentsByPost[postId];
            }
        },

        // Tüm yorumları temizle
        clearAllComments: (state) => {
            state.commentsByPost = {};
            state.currentPostId = null;
        },

        // Refreshing state ayarlama
        setRefreshing: (state, action) => {
            state.loading = action.payload;
        },

        // Reset entire state
        resetCommentsState: () => initialState,
    },

    extraReducers: (builder) => {
        builder
            // ==========================================
            // GET POST COMMENTS
            // ==========================================
            .addCase(getPostComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPostComments.fulfilled, (state, action) => {
                state.loading = false;

                const { postId, comments } = action.payload;

                console.log('📥 Comments received for post:', postId, 'count:', comments.length);

                // Post'un yorumlarını state'e kaydet
                state.commentsByPost[postId] = comments;
                state.error = null;
            })
            .addCase(getPostComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ==========================================
            // CREATE COMMENT
            // ==========================================
            .addCase(createComment.pending, (state) => {
                state.createLoading = true;
                state.createError = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.createLoading = false;

                const { postId, comment } = action.payload;

                console.log('🔍 New comment created for post:', postId);
                console.log('🔍 Comment data:', comment);

                // Post'un yorumları yoksa boş array oluştur
                if (!state.commentsByPost[postId]) {
                    state.commentsByPost[postId] = [];
                }

                // Yeni yorumu listenin başına ekle (en yeni üstte)
                state.commentsByPost[postId].unshift(comment);

                state.createError = null;

                // Note: createComment'tan sonra getPostComments çağrılacak
                // bu yüzden burada manuel ekleme yerine refresh'e güveniyoruz
            })
            .addCase(createComment.rejected, (state, action) => {
                state.createLoading = false;
                state.createError = action.payload;
            })

            // ==========================================
            // DELETE COMMENT
            // ==========================================
            .addCase(deleteComment.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.deleteLoading = false;

                const { commentId, postId } = action.payload;

                // Post'un yorumları varsa, silinen yorumu kaldır
                if (state.commentsByPost[postId]) {
                    state.commentsByPost[postId] = state.commentsByPost[postId].filter(
                        comment => comment.comment_id !== commentId
                    );
                }

                state.deleteError = null;
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.payload;
            })

            // ==========================================
            // UPDATE COMMENT
            // ==========================================
            .addCase(updateComment.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.updateLoading = false;

                const { commentId, postId, comment: updatedComment } = action.payload;

                // Post'un yorumları varsa, güncellenen yorumu değiştir
                if (state.commentsByPost[postId]) {
                    const commentIndex = state.commentsByPost[postId].findIndex(
                        comment => comment.comment_id === commentId
                    );

                    if (commentIndex !== -1) {
                        state.commentsByPost[postId][commentIndex] = updatedComment;
                    }
                }

                state.updateError = null;
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload;
            })

            // ==========================================
            // TOGGLE LIKE COMMENT
            // ==========================================
            .addCase(toggleLikeComment.pending, (state) => {
                // Like için loading gösterme - better UX
                state.likeLoading = false;
            })
            .addCase(toggleLikeComment.fulfilled, (state, action) => {
                const { commentId, postId, action: likeAction } = action.payload;

                // Post'un yorumları varsa, beğenilen yorumu güncelle
                if (state.commentsByPost[postId]) {
                    const comment = state.commentsByPost[postId].find(
                        c => c.comment_id === commentId
                    );

                    if (comment) {
                        if (likeAction === 'liked') {
                            comment.is_liked = true;
                            comment.likes_count = (comment.likes_count || 0) + 1;
                        } else if (likeAction === 'unliked') {
                            comment.is_liked = false;
                            comment.likes_count = Math.max((comment.likes_count || 0) - 1, 0);
                        }
                    }
                }

                state.likeError = null;
            })
            .addCase(toggleLikeComment.rejected, (state, action) => {
                state.likeError = action.payload;
            });
    },
});

// ==========================================
// SELECTORS
// ==========================================

// Belirli post'un yorumlarını al
export const selectCommentsByPostId = (postId) => (state) =>
    state.comments.commentsByPost[postId] || [];

// Belirli post'un yorum sayısını al
export const selectCommentsCount = (postId) => (state) =>
    state.comments.commentsByPost[postId]?.length || 0;

// Loading states
export const selectCommentsLoading = (state) => state.comments.loading;
export const selectCreateCommentLoading = (state) => state.comments.createLoading;
export const selectDeleteCommentLoading = (state) => state.comments.deleteLoading;
export const selectUpdateCommentLoading = (state) => state.comments.updateLoading;
export const selectLikeCommentLoading = (state) => state.comments.likeLoading;

// Error states
export const selectCommentsError = (state) => state.comments.error;
export const selectCreateCommentError = (state) => state.comments.createError;
export const selectDeleteCommentError = (state) => state.comments.deleteError;
export const selectUpdateCommentError = (state) => state.comments.updateError;
export const selectLikeCommentError = (state) => state.comments.likeError;

// Current post ID
export const selectCurrentPostId = (state) => state.comments.currentPostId;

// All comments (for debugging)
export const selectAllComments = (state) => state.comments.commentsByPost;

// ==========================================
// ACTIONS EXPORT
// ==========================================
export const {
    clearErrors,
    setCurrentPostId,
    clearPostComments,
    clearAllComments,
    setRefreshing,
    resetCommentsState,
} = commentSlice.actions;

// ==========================================
// REDUCER EXPORT
// ==========================================
export default commentSlice.reducer;