// redux/comment/commentActions.js - Comments Redux Actions
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";

// Get Post Comments Action - Post detail'den yorumları al
export const getPostComments = createAsyncThunk(
    "comments/getPostComments",
    async (postId, { rejectWithValue }) => {
        try {
            console.log('🚀 Getting post with comments for post:', postId);
            console.log('🔧 ApiClient config:', apiClient.defaults);

            // Post detail endpoint'ini çağır - yorumlar dahil gelecek
            const response = await apiClient.get(`/posts/${postId}`);

            console.log('✅ Get post response:', response);
            console.log('📊 Response status:', response.status);
            console.log('📄 Response data:', response.data);

            // Post data'sından comments array'ini al
            const postData = response.data;
            const comments = postData.comments || [];

            console.log('📝 Comments found:', comments.length);
            console.log('🔍 Comments array:', comments);

            return { postId, comments };

        } catch (error) {
            console.log('❌ Get post comments error:', error);
            console.log('❌ Error message:', error.message);
            console.log('❌ Error response:', error.response?.data);
            console.log('❌ Error status:', error.response?.status);

            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Post yorumları alınamadı."
            );
        }
    }
);

// Create Comment Action
export const createComment = createAsyncThunk(
    "comments/createComment",
    async (commentData, { rejectWithValue }) => {
        try {
            console.log('🚀 Creating comment with data:', commentData);

            const formData = new FormData();

            // Post ID - backend validation'a göre required
            if (commentData.postId) {
                formData.append('post_id', commentData.postId.toString());
                console.log('📌 Added post_id:', commentData.postId);
            } else {
                return rejectWithValue('Post ID gereklidir');
            }

            // Content - backend validation'a göre required_without:media
            if (commentData.content && commentData.content.trim()) {
                formData.append('content', commentData.content.trim());
                console.log('📝 Added content:', commentData.content.trim());
            }

            // Media (eğer varsa)
            if (commentData.media) {
                console.log('📎 Adding media:', commentData.media);

                formData.append('media', {
                    uri: commentData.media.uri,
                    type: commentData.media.type || 'image/jpeg',
                    name: commentData.media.name || 'comment_media.jpg',
                });
            }

            // Validation check - backend: required_without
            if (!commentData.content?.trim() && !commentData.media) {
                return rejectWithValue('İçerik veya medya gereklidir');
            }

            console.log('📤 Sending comment FormData to backend...');

            const response = await apiClient.post("/comments", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Create comment response:', response.data);

            // Backend'den dönen comment'ı postId ile birlikte döndür
            return {
                postId: commentData.postId,
                comment: response.data
            };
        } catch (error) {
            console.log('❌ Create comment error:', error);
            console.log('❌ Error response:', error.response?.data);
            console.log('❌ Error status:', error.response?.status);

            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Yorum oluşturulamadı."
            );
        }
    }
);

// Delete Comment Action (assuming this endpoint exists)
export const deleteComment = createAsyncThunk(
    "comments/deleteComment",
    async ({ commentId, postId }, { rejectWithValue }) => {
        try {
            console.log('🗑️ Deleting comment:', commentId);

            const response = await apiClient.delete(`/comments/${commentId}`);

            console.log('✅ Delete comment response:', response.data);

            return { commentId, postId };
        } catch (error) {
            console.log('❌ Delete comment error:', error);
            console.log('❌ Error response:', error.response?.data);
            console.log('❌ Error status:', error.response?.status);

            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Yorum silinemedi."
            );
        }
    }
);

// Toggle Like Comment Action
export const toggleLikeComment = createAsyncThunk(
    "comments/toggleLikeComment",
    async ({ commentId, postId }, { rejectWithValue }) => {
        try {
            console.log('🚀 Toggle like comment request for commentId:', commentId);

            // CommentId validation
            if (!commentId || isNaN(commentId) || commentId <= 0) {
                console.error('❌ Invalid commentId:', commentId);
                return rejectWithValue('Geçersiz yorum ID\'si');
            }

            const response = await apiClient.post(`/comments/${commentId}/toggle-like`);

            console.log('✅ Toggle like comment response:', response);
            console.log('📊 Response status:', response.status);
            console.log('📄 Response data:', response.data);

            // Backend response kontrolü
            if (response.status === 200 || response.status === 204) {
                // Success - backend'den gelen action'ı kullan
                const action = response.data?.action || 'toggled';
                console.log('✅ Comment like toggle successful, action:', action);

                return {
                    commentId: parseInt(commentId),
                    postId: postId,
                    action: action
                };
            } else {
                console.warn('⚠️ Unexpected response status:', response.status);
                return rejectWithValue('Beklenmeyen sunucu yanıtı');
            }

        } catch (error) {
            console.error('❌ Toggle like comment error:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);

            // Specific error handling
            if (error.response?.status === 500) {
                const errorMessage = error.response.data?.error_message || error.response.data?.message;

                if (errorMessage && errorMessage.includes('ambiguous')) {
                    console.error('🔧 SQL ambiguous column error detected in comments');
                    return rejectWithValue('Sunucu hatası: Veri tabanı sorgu hatası. Lütfen daha sonra tekrar deneyin.');
                }

                return rejectWithValue('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
            }

            if (error.response?.status === 404) {
                return rejectWithValue('Yorum bulunamadı');
            }

            if (error.response?.status === 401 || error.response?.status === 403) {
                return rejectWithValue('Bu işlem için yetkiniz yok');
            }

            // Network errors
            if (error.code === 'NETWORK_ERROR' || !error.response) {
                return rejectWithValue('İnternet bağlantınızı kontrol edin');
            }

            // Generic error
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.first_error ||
                error.message ||
                "Beğeni işlemi başarısız."
            );
        }
    }
);

// Update Comment Action (assuming this endpoint might exist)
export const updateComment = createAsyncThunk(
    "comments/updateComment",
    async ({ commentId, postId, commentData }, { rejectWithValue }) => {
        try {
            console.log('✏️ Updating comment:', commentId, 'with data:', commentData);

            const formData = new FormData();

            // Content
            if (commentData.content) {
                formData.append('content', commentData.content.trim());
            }

            // Media (if updating)
            if (commentData.media) {
                formData.append('media', commentData.media);
            }

            const response = await apiClient.put(`/comments/${commentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Update comment response:', response.data);

            return {
                commentId,
                postId,
                comment: response.data
            };
        } catch (error) {
            console.log('❌ Update comment error:', error);
            console.log('❌ Error response:', error.response?.data);
            console.log('❌ Error status:', error.response?.status);

            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                "Yorum güncellenemedi."
            );
        }
    }
);