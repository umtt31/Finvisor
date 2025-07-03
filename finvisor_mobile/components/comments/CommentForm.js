// components/comments/CommentForm.js - CDN Profile Image Fix
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    Keyboard,
    Platform,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image'; // ✅ Expo Image kullan
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faPaperPlane } from '@fortawesome/pro-solid-svg-icons';

// Finvisor Redux
import { createComment } from '../../redux/comment/commentActions';

const CommentForm = ({
    postId,
    replyId = null,
    replyTo = null,
    onSuccess = null,
    onCancelReply = null,
    isReplyMode = false,
    autoFocus = false,
    parentCommentId = null,
    inputRef = null,
    loading = false
}) => {
    const dispatch = useDispatch();

    // Finvisor Redux selectors
    const { user, userProfile } = useSelector(state => state.auth);
    const currentUser = user || userProfile;

    // Local state
    const [content, setContent] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const internalInputRef = useRef(null);

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

    // ✅ Profile image source with CDN
    const profileImageSource = useMemo(() => {
        const imageUrl = currentUser?.profile_image;
        const preparedUrl = prepareImageUri(imageUrl);

        if (!preparedUrl) {
            return require('../../assets/Images/UserImages/user1_pp.jpg');
        }

        return {
            uri: preparedUrl,
            cachePolicy: 'memory-disk',
        };
    }, [currentUser?.profile_image, prepareImageUri]);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
        };
    }, []);

    // Input ref handling
    useEffect(() => {
        if (inputRef && internalInputRef.current) {
            inputRef.current = internalInputRef.current;
        }
    }, [inputRef, internalInputRef.current]);

    // AutoFocus handling
    useEffect(() => {
        if ((isReplyMode || autoFocus) && isMounted) {
            setTimeout(() => {
                try {
                    if (internalInputRef && internalInputRef.current) {
                        internalInputRef.current.focus();
                    }
                } catch (error) {
                    console.log("Focus error:", error);
                }
            }, 100);
        }
    }, [isReplyMode, autoFocus, isMounted]);

    // Handle text change
    const handleTextChange = (text) => {
        setContent(text);
        setCharCount(text.length);
    };

    // Handle cancel reply
    const handleCancelReply = () => {
        if (onCancelReply) {
            onCancelReply();
        }
        setContent('');
        setCharCount(0);
    };

    // Handle submit - Finvisor Redux ile
    const handleSubmit = async () => {
        console.log('🚀 Finvisor Comment Submit');

        const hasContent = content.trim() !== "";

        if (!hasContent || isSubmitting || loading) {
            console.log('❌ Submit blocked - empty content or already submitting');
            return;
        }

        console.log('✅ Submit process starting...');
        setIsSubmitting(true);

        try {
            // Finvisor comment data structure
            const commentData = {
                content: content.trim(),
                postId: postId,
            };

            // Reply handling
            if (replyId) {
                commentData.replyId = replyId;

                if (replyTo) {
                    commentData.replyToUserId = replyTo.user_id || replyTo.id;
                    commentData.replyToUsername = replyTo.username;
                }

                if (parentCommentId) {
                    commentData.parentCommentId = parentCommentId;
                }
            }

            console.log('📤 Sending comment data:', commentData);

            // Dispatch Finvisor createComment action
            const result = await dispatch(createComment(commentData));

            if (result.type === 'comments/createComment/fulfilled') {
                console.log('✅ Comment created successfully');

                // Clear form
                setContent('');
                setCharCount(0);

                // Dismiss keyboard
                setTimeout(() => {
                    Keyboard.dismiss();
                }, 100);

                // Success callback
                if (onSuccess) onSuccess(result.payload);

                // Cancel reply mode if active
                if (isReplyMode && onCancelReply) {
                    onCancelReply();
                }
            } else {
                console.log('❌ Comment creation failed:', result.payload);
                Alert.alert('Hata', result.payload || 'Yorum gönderilemedi');
            }

        } catch (error) {
            console.error('💥 Comment error:', error);
            Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form validation
    const isFormValid = content.trim().length > 0;
    const isDisabled = !isFormValid || isSubmitting || loading;

    // Reply header render
    const renderReplyHeader = () => {
        if (!isReplyMode || !replyTo) return null;

        return (
            <View className="flex-row justify-between items-center px-3 pt-2 pb-1 bg-[#252525] border-t border-[#444444]">
                <View className="flex-row items-center">
                    {replyTo.profilePicture && (
                        <Image
                            source={{ uri: replyTo.profilePicture }}
                            style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                            contentFit="cover"
                        />
                    )}
                    <View>
                        <Text className="text-sm">
                            <Text className="text-gray-400 font-medium">Yanıtlanıyor: </Text>
                            <Text className="text-[#1B77CD] font-semibold">@{replyTo.username}</Text>
                        </Text>
                        {replyTo.timestamp && (
                            <Text className="text-xs text-gray-500">• {replyTo.timestamp}</Text>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleCancelReply}
                    className="p-1"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <FontAwesomeIcon icon={faTimes} size={16} color="#888" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
            className="bg-[#171717]"
        >
            {/* Reply header */}
            {renderReplyHeader()}

            {/* Main form content */}
            <View className="flex-row items-center justify-between px-3 py-3 bg-[#171717]">
                <View className="flex-row items-center flex-1 gap-3">
                    {/* ✅ User profile image with CDN */}
                    <Image
                        source={profileImageSource}
                        style={{ width: 32, height: 32, borderRadius: 16 }}
                        contentFit="cover"
                        transition={200}
                        onError={(error) => {
                            console.warn('❌ CommentForm profile image load error:', error);
                        }}
                        onLoad={() => {
                            console.log('✅ CommentForm profile image loaded successfully');
                        }}
                        placeholder={require('../../assets/Images/UserImages/user1_pp.jpg')}
                    />

                    {/* Text input */}
                    <View className="flex-1">
                        <TextInput
                            ref={internalInputRef}
                            value={content}
                            onChangeText={handleTextChange}
                            placeholder={isReplyMode ? "Write a reply..." : "Write a comment..."}
                            placeholderTextColor="#888"
                            multiline
                            maxLength={500}
                            className="flex-1 border border-[#444444] px-4 py-2 rounded-xl text-white bg-[#252525] max-h-24"
                            returnKeyType="default"
                            blurOnSubmit={false}
                            editable={!isSubmitting && !loading}
                            style={{
                                textAlignVertical: 'top',
                            }}
                        />

                        {/* Character counter */}
                        {charCount > 400 && (
                            <Text className={`text-xs mt-1 text-right ${charCount > 500 ? 'text-red-400' : 'text-gray-500'}`}>
                                {charCount}/500
                            </Text>
                        )}
                    </View>
                </View>

                {/* Send button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isDisabled}
                    className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${isDisabled
                        ? 'bg-[#444444]'
                        : 'bg-[#1B77CD]'
                        }`}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.8}
                >
                    {isSubmitting || loading ? (
                        <ActivityIndicator size="small" color="#888" />
                    ) : (
                        <FontAwesomeIcon
                            icon={faPaperPlane}
                            size={16}
                            color={isDisabled ? '#888' : 'white'}
                        />
                    )}
                </TouchableOpacity>
            </View>


        </KeyboardAvoidingView>
    );
};

export default CommentForm;