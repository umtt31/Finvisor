// components/comments/CommentModal.js - Ters Sıralı Yorumlar
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    Platform,
    Keyboard,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

// Finvisor Redux imports
import {
    getPostComments,
    createComment
} from '../../redux/comment/commentActions';
import {
    selectCommentsByPostId,
    selectCommentsLoading,
    selectCommentsError,
    selectCreateCommentLoading,
    clearErrors,
} from '../../redux/comment/commentReducers';

// Finvisor Components
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ Alternative: Simple selectors without reselect
const getCommentsState = (state) => state.comments;
const getAuthState = (state) => state.auth;

const CommentModal = ({
    visible,
    onClose,
    postId,
    postAuthor
}) => {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();

    // ✅ Direct state selection with manual memoization
    const commentsState = useSelector(getCommentsState);
    const authState = useSelector(getAuthState);

    // ✅ Memoize the derived data with REVERSE SORTING
    const comments = useMemo(() => {
        const rawComments = commentsState?.commentsByPost?.[postId] || [];

        // ✅ YENİ: Yorumları ters sıralama - En yeni üstte
        const sortedComments = [...rawComments].sort((a, b) => {
            // Önce comment_id'ye göre sırala (en yeni en üstte)
            const aId = a.comment_id || a.id || 0;
            const bId = b.comment_id || b.id || 0;
            return bId - aId; // Büyükten küçüğe (ters sıra)
        });

        console.log('📊 Comments sorting debug:', {
            rawCount: rawComments.length,
            sortedCount: sortedComments.length,
            firstComment: sortedComments[0]?.comment_id || 'none',
            lastComment: sortedComments[sortedComments.length - 1]?.comment_id || 'none'
        });

        return sortedComments;
    }, [commentsState?.commentsByPost, postId]);

    const loading = useMemo(
        () => commentsState?.loading || false,
        [commentsState?.loading]
    );

    const createLoading = useMemo(
        () => commentsState?.createLoading || false,
        [commentsState?.createLoading]
    );

    const error = useMemo(
        () => commentsState?.error || null,
        [commentsState?.error]
    );

    const currentUser = useMemo(
        () => authState?.user || authState?.userProfile,
        [authState?.user, authState?.userProfile]
    );

    // Modal boyutları - Finvisor tasarımına uygun
    const FORM_HEIGHT = 80;
    const SNAP_POINTS = {
        MEDIUM: SCREEN_HEIGHT * 0.4,  // %60 ekran
        LARGE: SCREEN_HEIGHT * 0.1,   // %90 ekran
        CLOSED: SCREEN_HEIGHT
    };

    // Animation values
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);
    const keyboardHeight = useSharedValue(0);
    const formTranslateY = useSharedValue(SCREEN_HEIGHT);

    // Refs
    const flatListRef = useRef(null);

    // States
    const [currentSnapPoint, setCurrentSnapPoint] = useState(SNAP_POINTS.MEDIUM);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyToId, setReplyToId] = useState(null);
    const [replyToInfo, setReplyToInfo] = useState(null);
    const [parentCommentId, setParentCommentId] = useState(null);
    const [focusedCommentId, setFocusedCommentId] = useState(null);

    // Keyboard handling - Finvisor style
    useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                keyboardHeight.value = withSpring(e.endCoordinates.height, {
                    damping: 80,
                    stiffness: 300,
                });

                formTranslateY.value = withSpring(-e.endCoordinates.height, {
                    damping: 80,
                    stiffness: 300,
                });
            }
        );

        const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                keyboardHeight.value = withSpring(0, {
                    damping: 80,
                    stiffness: 300,
                });

                formTranslateY.value = withSpring(0, {
                    damping: 80,
                    stiffness: 300,
                });
            }
        );

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    // Modal açılış/kapanış - Finvisor Redux ile
    useEffect(() => {
        if (visible) {
            console.log('🟢 Finvisor Comments Modal Opening - PostID:', postId);

            // Clear previous errors
            dispatch(clearErrors());

            // Load comments using Finvisor Redux
            if (postId && comments.length === 0) {
                dispatch(getPostComments(postId));
            }

            // Modal animation
            translateY.value = withSpring(SNAP_POINTS.MEDIUM, {
                damping: 80,
                stiffness: 400,
            });

            formTranslateY.value = withSpring(0, {
                damping: 80,
                stiffness: 400,
            });

            backdropOpacity.value = withTiming(0.5, { duration: 300 });
            setCurrentSnapPoint(SNAP_POINTS.MEDIUM);
        } else {
            translateY.value = SCREEN_HEIGHT;
            formTranslateY.value = SCREEN_HEIGHT;
            backdropOpacity.value = 0;
        }
    }, [visible, postId, dispatch, comments.length]);

    // Snap to position
    const snapTo = useCallback((position) => {
        console.log(`Snap to position: ${position}`);

        if (position === SNAP_POINTS.CLOSED) {
            translateY.value = withSpring(SCREEN_HEIGHT, {
                damping: 80,
                stiffness: 400,
            });

            formTranslateY.value = withSpring(SCREEN_HEIGHT, {
                damping: 80,
                stiffness: 400,
            });

            backdropOpacity.value = withTiming(0, { duration: 300 });
            setTimeout(() => onClose(), 300);
            return;
        }

        setCurrentSnapPoint(position);

        translateY.value = withSpring(position, {
            damping: 80,
            stiffness: 400,
        });

        backdropOpacity.value = withTiming(0.5, { duration: 200 });
    }, [onClose]);

    // Gesture handler - YUKARİ/AŞAĞI hareket
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            const newY = currentSnapPoint + event.translationY;

            if (event.translationY > 0) {
                // AŞAĞI hareket - Modal kapanma
                translateY.value = Math.min(newY, SCREEN_HEIGHT);
                const progress = event.translationY / 200;
                backdropOpacity.value = Math.max(0, 0.5 - progress * 0.5);
            } else if (event.translationY < 0) {
                // YUKARI hareket - Modal büyüme
                translateY.value = Math.max(newY, SNAP_POINTS.LARGE);
                const progress = Math.abs(event.translationY) / 200;
                backdropOpacity.value = Math.min(0.7, 0.5 + progress * 0.2);
            }
        })
        .onEnd((event) => {
            const velocity = event.velocityY;
            const translation = event.translationY;

            // Hızlı aşağı hareket - direkt kapat
            if (velocity > 800) {
                runOnJS(snapTo)(SNAP_POINTS.CLOSED);
            }
            // BÜYÜK MODAL'dan aşağı hareket
            else if (currentSnapPoint === SNAP_POINTS.LARGE) {
                if (translation > 50) {
                    runOnJS(snapTo)(SNAP_POINTS.MEDIUM);
                } else {
                    runOnJS(snapTo)(SNAP_POINTS.LARGE);
                }
            }
            // KÜÇÜK MODAL'dan hareket
            else if (currentSnapPoint === SNAP_POINTS.MEDIUM) {
                if (translation < -100 || velocity < -500) {
                    runOnJS(snapTo)(SNAP_POINTS.LARGE);
                }
                else if (translation > 150 || velocity > 600) {
                    runOnJS(snapTo)(SNAP_POINTS.CLOSED);
                }
                else {
                    runOnJS(snapTo)(SNAP_POINTS.MEDIUM);
                }
            }
            else {
                runOnJS(snapTo)(currentSnapPoint);
            }

            backdropOpacity.value = withTiming(0.5, { duration: 200 });
        });

    // Animated styles
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const bottomSheetStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: translateY.value - keyboardHeight.value
        }],
    }));

    const formStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: formTranslateY.value
        }],
    }));

    // Helper functions
    const handleReplyPress = useCallback((commentId, replyToUserInfo = null, parentId = null) => {
        setReplyToId(commentId);
        setShowReplyForm(true);
        setFocusedCommentId(commentId);

        if (replyToUserInfo) {
            setReplyToInfo(replyToUserInfo);
            setParentCommentId(parentId || null);
        }
    }, []);

    // ✅ YENİ: Comment success handler - Yeni yorum eklenince en üste scroll
    const handleCommentSuccess = useCallback(async () => {
        setShowReplyForm(false);
        setReplyToId(null);
        setReplyToInfo(null);
        setParentCommentId(null);
        setFocusedCommentId(null);

        // Refresh comments using Finvisor Redux
        await dispatch(getPostComments(postId));

        // ✅ YENİ: Yeni yorum eklendikten sonra en üste scroll
        setTimeout(() => {
            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            }
        }, 300);
    }, [dispatch, postId]);

    const handleReplyCancel = useCallback(() => {
        setShowReplyForm(false);
        setReplyToId(null);
        setReplyToInfo(null);
        setParentCommentId(null);
        setFocusedCommentId(null);
        Keyboard.dismiss();
    }, []);

    const handleBackdropPress = useCallback(() => {
        console.log('🎯 Backdrop pressed - Closing modal');
        snapTo(SNAP_POINTS.CLOSED);
    }, [snapTo]);

    // Render comment item - Finvisor style
    const renderComment = useCallback(({ item }) => (
        <CommentItem
            comment={item}
            postId={postId}
            user={currentUser}
            scrollViewRef={flatListRef}
            onReplyPress={handleReplyPress}
            isFocused={focusedCommentId === item.comment_id}
            onReplySuccess={handleCommentSuccess}
        />
    ), [postId, currentUser, handleReplyPress, focusedCommentId, handleCommentSuccess]);

    // ✅ Memoized comments count to prevent unnecessary calculations
    const commentsCount = useMemo(() => comments?.length || 0, [comments]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={() => {
                console.log('🚪 Modal close requested');
                snapTo(SNAP_POINTS.CLOSED);
            }}
        >
            <GestureHandlerRootView className="flex-1">
                {/* Backdrop - Finvisor colors */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                        backdropStyle
                    ]}
                >
                    <TouchableWithoutFeedback onPress={handleBackdropPress}>
                        <View className="flex-1" />
                    </TouchableWithoutFeedback>
                </Animated.View>

                {/* Bottom Sheet - Finvisor Design */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                backgroundColor: '#171717', // Finvisor background
                                elevation: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -3 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                overflow: 'hidden',
                            },
                            bottomSheetStyle
                        ]}
                    >
                        {/* Header - Finvisor Style */}
                        <View className="items-center py-4 px-5 border-b border-[#252525] bg-[#171717]">
                            <View className="w-10 h-1 bg-[#444444] rounded-sm mb-3" />
                            <Text className="text-lg font-semibold text-white mb-1">
                                Comments ({commentsCount})
                            </Text>
                            {/* ✅ YENİ: Sıralama bilgisi */}
                            <Text className="text-xs text-gray-500">
                                Newest first
                            </Text>
                        </View>

                        {/* Loading/Empty State */}
                        {loading && commentsCount === 0 ? (
                            <View className="flex-1 justify-center items-center py-16">
                                <ActivityIndicator size="large" color="#1B77CD" />
                                <Text className="text-base text-gray-400 mt-2">Comments Loading...</Text>
                            </View>
                        ) : commentsCount === 0 ? (
                            <View className="flex-1  items-center py-12">
                                <Text className="text-xl font-bold text-gray-300">No comments yet</Text>
                                <Text className="text-sm text-gray-500 mt-1">Be the first to comment! 💬</Text>
                            </View>
                        ) : null}

                        {/* Comments List */}
                        {!loading && commentsCount > 0 && (
                            <View className="flex-1 bg-[#171717]">
                                {error ? (
                                    <View className="flex-1 justify-center items-center py-16">
                                        <Text className="text-base text-red-400 text-center">{error}</Text>
                                        <TouchableOpacity
                                            onPress={() => dispatch(getPostComments(postId))}
                                            className="mt-4 bg-[#1B77CD] px-4 py-2 rounded-lg"
                                        >
                                            <Text className="text-white font-medium">Tekrar Dene</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <FlatList
                                        ref={flatListRef}
                                        data={comments}
                                        renderItem={renderComment}
                                        keyExtractor={(item) => item.comment_id?.toString() || item.id?.toString()}
                                        contentContainerStyle={{
                                            paddingVertical: 10,
                                            paddingBottom: FORM_HEIGHT + 50
                                        }}
                                        keyboardShouldPersistTaps="handled"
                                        keyboardDismissMode="none"
                                        showsVerticalScrollIndicator={false}
                                        bounces={true}
                                        removeClippedSubviews={Platform.OS === 'android'}
                                        maxToRenderPerBatch={10}
                                        windowSize={10}
                                        initialNumToRender={8}
                                        className="flex-1"
                                        // ✅ YENİ: Yeni yorumlar eklenince otomatik scroll için
                                        maintainVisibleContentPosition={{
                                            minIndexForVisible: 0,
                                            autoscrollToTopThreshold: 10
                                        }}
                                    />
                                )}
                            </View>
                        )}
                    </Animated.View>
                </GestureDetector>

                {/* Comment Form - Outside Modal */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#171717',
                            borderTopWidth: 1,
                            borderTopColor: '#252525',
                            elevation: 15,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            zIndex: 200,
                            minHeight: 80,
                            paddingBottom: insets.bottom,
                        },
                        formStyle,
                    ]}
                >
                    <CommentForm
                        postId={postId}
                        replyId={replyToId}
                        replyTo={replyToInfo}
                        onSuccess={handleCommentSuccess}
                        onCancelReply={handleReplyCancel}
                        isReplyMode={showReplyForm}
                        parentCommentId={parentCommentId}
                        autoFocus={false}
                        loading={createLoading}
                    />
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
};

export default CommentModal;