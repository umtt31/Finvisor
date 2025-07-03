// screens/Post/NewPostScreen.js - CDN Fix ile profil resmi gösterimi
import {
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from 'expo-image'; // ✅ Expo Image kullan
import React, { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faImage, faTimes } from "@fortawesome/pro-solid-svg-icons";

// Doğru import path'leri
import { createPost } from "../../redux/post/postActions";
import { selectPostsLoading, selectPostsError } from "../../redux/post/postReducers";

const NewPostScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  // Navigation params'tan user bilgisini al
  const userInfo = route.params?.userInfo;

  // Redux state
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);

  // Local state
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Form validation
  const isFormValid = content.trim().length > 0 || selectedMedia;

  // ✅ FIXED: CDN URL hazırlama fonksiyonu (ProfileUserInfo ile aynı)
  const prepareImageUri = useCallback((imageUrl) => {
    console.log('🔍 prepareImageUri input:', {
      imageUrl: imageUrl,
      type: typeof imageUrl,
      isNull: imageUrl === null,
      isUndefined: imageUrl === undefined,
      isEmpty: imageUrl === ''
    });

    // ✅ FIX: Comprehensive null/undefined/empty checks
    if (!imageUrl ||
      imageUrl === null ||
      imageUrl === undefined ||
      typeof imageUrl !== 'string' ||
      imageUrl.trim() === '') {
      console.log('❌ Invalid image URL, returning null');
      return null;
    }

    let finalUrl = imageUrl.trim();

    // ✅ CDN base URL'i ekle (full URL değilse) - ProfileUserInfo ile aynı
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      const CDN_BASE_URL = 'https://api-social-sanalrekabet.b-cdn.net';

      // Başında / yoksa ekle
      if (!finalUrl.startsWith('/')) {
        finalUrl = '/' + finalUrl;
      }

      finalUrl = CDN_BASE_URL + finalUrl;
    }

    console.log('✅ Profile image URL prepared:', {
      original: imageUrl,
      final: finalUrl
    });

    return finalUrl;
  }, []);

  // ✅ FIXED: Profile image source with object/string handling (ProfileUserInfo mantığı)
  const profileImageSource = useMemo(() => {
    console.log('🔍 ProfileImageSource calculation:', {
      userInfo: !!userInfo,
      profilePicture: userInfo?.profilePicture,
      profile_image: userInfo?.profile_image,
      profilePictureType: typeof userInfo?.profilePicture,
      profile_imageType: typeof userInfo?.profile_image
    });

    // ✅ FIX: Handle both object and string formats (ProfileUserInfo ile aynı)
    let imageUrl = null;

    // Try profile_image first (string format)
    if (userInfo?.profile_image && typeof userInfo.profile_image === 'string') {
      imageUrl = userInfo.profile_image;
      console.log('🔍 Using profile_image (string):', imageUrl);
    }
    // Then try profilePicture (could be object or string)
    else if (userInfo?.profilePicture) {
      if (typeof userInfo.profilePicture === 'string') {
        imageUrl = userInfo.profilePicture;
        console.log('🔍 Using profilePicture (string):', imageUrl);
      } else if (typeof userInfo.profilePicture === 'object' && userInfo.profilePicture.uri) {
        imageUrl = userInfo.profilePicture.uri;
        console.log('🔍 Using profilePicture.uri (object):', imageUrl);
      }
    }

    console.log('🔍 Final selected image URL:', imageUrl);

    const preparedUrl = prepareImageUri(imageUrl);

    if (!preparedUrl) {
      console.log('📷 Using default profile image');
      return require('../../assets/Images/UserImages/user1_pp.jpg');
    }

    console.log('📷 Using prepared CDN URL:', preparedUrl);
    return {
      uri: preparedUrl,
      cachePolicy: 'memory-disk',
    };
  }, [userInfo?.profile_image, userInfo?.profilePicture, prepareImageUri]);

  // Media picker - Basit ve direkt
  const pickMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri erişimi gerekli.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Kırpma yok, olduğu gibi al
        quality: 0.8,
        base64: false,
      });

      console.log('📷 ImagePicker result:', result);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Dosya uzantısını URI'den al
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        // MIME type'ı doğru belirle
        let mimeType = 'image/jpeg';
        if (fileType === 'png') mimeType = 'image/png';
        if (fileType === 'gif') mimeType = 'image/gif';
        if (fileType === 'webp') mimeType = 'image/webp';

        const mediaData = {
          uri: asset.uri,
          type: mimeType,
          name: `image_${Date.now()}.${fileType}`,
          width: asset.width,
          height: asset.height,
        };

        console.log('📎 Image selected:', mediaData);
        setSelectedMedia(mediaData);
      }
    } catch (error) {
      console.error('❌ Image picker error:', error);
      Alert.alert("Hata", "Medya seçilirken bir hata oluştu: " + error.message);
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validation - backend rules'a uygun
    if (!content.trim() && !selectedMedia) {
      Alert.alert("Uyarı", "İçerik yazın veya resim ekleyin.");
      return;
    }

    try {
      console.log("📤 Post gönderiliyor...");
      console.log("📋 Content:", content);
      console.log("📷 Selected media:", selectedMedia);

      const postData = {};

      // Content varsa ekle
      if (content.trim()) {
        postData.content = content.trim();
      }

      // Media varsa ekle - BACKEND FİELD NAME'İ KONTROL ET
      if (selectedMedia) {
        postData.media = selectedMedia; // Backend'de 'image' field'ı bekleniyor
      }

      console.log("📋 Final Post Data:", postData);

      const result = await dispatch(createPost(postData));

      console.log("📊 Dispatch Result:", result);

      if (result.type === 'posts/createPost/fulfilled') {
        console.log("✅ Post successful!");
        Alert.alert("Success!", "Post successfully created.", [
          {
            text: "Okay",
            onPress: () => {
              setContent("");
              setSelectedMedia(null);
              navigation.goBack();
            },
          },
        ]);
      } else if (result.type === 'posts/createPost/rejected') {
        console.log("❌ Post failed:", result.payload);
        Alert.alert("Error", result.payload || "Post could not be created.");
      }
    } catch (error) {
      console.log("💥 Catch Error:", error);
      Alert.alert("Error", "An unexpected error occurred: " + error.message);
    }
  };

  const handleCancel = () => {
    if (content.trim() || selectedMedia) {
      Alert.alert("Discard Changes", "Your changes will be lost. Are you sure?", [
        { text: "Continue", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} className="px-4">
          <Text className="text-white font-jost-regular text-[16px]">Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
          className="px-4"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1B77CD" />
          ) : (
            <Text
              className={`font-jost-bold text-[16px] ${isFormValid ? "text-[#1B77CD]" : "text-gray-500"
                }`}
            >
              Share
            </Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, isFormValid, loading, content, selectedMedia]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-[#171717] p-4">
          <View className="flex-row gap-4">
            {/* ✅ Expo Image ile CDN destekli profil fotoğrafı */}
            <Image
              source={profileImageSource}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
              }}
              contentFit="cover"
              transition={200}
              onError={(error) => {
                console.warn('❌ Profile image load error:', error);
              }}
              onLoad={() => {
                console.log('✅ Profile image loaded successfully');
              }}
              placeholder={require('../../assets/Images/UserImages/user1_pp.jpg')}
            />
            <View className="flex-1">
              <TextInput
                className="font-jost-regular text-lg text-white"
                placeholder="What do you think?"
                placeholderTextColor="#c3c3c4"
                multiline={true}
                value={content}
                onChangeText={setContent}
                style={{
                  minHeight: 100,
                  textAlignVertical: "top",
                  fontSize: 18,
                }}
                maxLength={500}
                editable={!loading}
              />
              <Text className="text-gray-500 text-sm mt-2 self-end">
                {content.length}/500
              </Text>
            </View>
          </View>

          {/* Selected Media Preview - Sadece silme butonu */}
          {selectedMedia && (
            <View className="mt-4 relative">
              {/* ✅ Post için seçilen resimler normal React Native Image kullanabilir */}
              <Image
                source={{ uri: selectedMedia.uri }}
                style={{
                  width: '100%',
                  height: 256,
                  borderRadius: 8,
                }}
                contentFit="cover"
                onError={(error) => {
                  console.error('❌ Image preview error:', error);
                  Alert.alert('Hata', 'Seçilen resim önizlenemiyor');
                }}
                onLoad={() => {
                  console.log('✅ Image preview loaded successfully');
                }}
              />

              {/* Sadece silme butonu - Sağ üst köşe */}
              <TouchableOpacity
                onPress={removeMedia}
                className="absolute top-2 right-2 bg-black/70 rounded-lg p-2"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} size={16} color="white" />
              </TouchableOpacity>

              {/* Boyut bilgisi - Sol alt köşe */}
              <View className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded-lg">
                <Text className="text-white text-xs">
                  📏 {selectedMedia.width}x{selectedMedia.height}
                </Text>
              </View>
            </View>
          )}

          {/* Media Picker Button */}
          <TouchableOpacity
            onPress={pickMedia}
            className="flex-row items-center justify-center mt-6 border border-gray-600 rounded-lg p-4"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faImage} size={20} color="#1B77CD" />
            <Text className="text-[#1B77CD] font-jost-medium text-base ml-2">
              {selectedMedia ? "Change Photo" : "Add an image"}
            </Text>
          </TouchableOpacity>

          {/* Error Display */}
          {error && (
            <View className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-3">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          {/* Debug Info - Development için */}
          {__DEV__ && selectedMedia && (
            <View className="mt-4 bg-gray-800 p-3 rounded-lg">
              <Text className="text-white text-xs">Debug Info:</Text>
              <Text className="text-gray-300 text-xs">URI: {selectedMedia.uri}</Text>
              <Text className="text-gray-300 text-xs">Type: {selectedMedia.type}</Text>
              <Text className="text-gray-300 text-xs">Name: {selectedMedia.name}</Text>
              <Text className="text-gray-300 text-xs">Size: {selectedMedia.width}x{selectedMedia.height}</Text>
            </View>
          )}

          <View className="flex-1" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default NewPostScreen;