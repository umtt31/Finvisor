// screens/Profile/ProfileEditScreen.js - CDN Fix ile profil resmi gösterimi
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Image } from 'expo-image'; // ✅ Expo Image kullan
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faCameraRotate,
    faCheck,
    faTimes
} from '@fortawesome/pro-solid-svg-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';

// Finvisor Redux
import { updateUserProfile } from '../../redux/login-register/LoginRegisterActions';

const ProfileEditScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    // Redux selectors
    const { user: currentUser, updateLoading, updateError } = useSelector(state => state.auth);

    // Route params'dan user data'sını al
    const userInfoFromParams = route.params?.userInfo;
    const userData = userInfoFromParams || currentUser;

    // Local state
    const [previewProfile, setPreviewProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [originalData, setOriginalData] = useState({});
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        bio: "",
        email: "",
        phone_number: "",
        profile_image: null,
    });

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
            userData: !!userData,
            profilePicture: userData?.profilePicture,
            profile_image: userData?.profile_image,
            previewProfile: previewProfile,
            profilePictureType: typeof userData?.profilePicture,
            profile_imageType: typeof userData?.profile_image
        });

        // Önce preview varsa onu kullan (yeni seçilen resim)
        if (previewProfile) {
            console.log('📷 Using preview profile:', previewProfile);
            return {
                uri: previewProfile,
                cachePolicy: 'memory-disk',
            };
        }

        // ✅ FIX: Handle both object and string formats (ProfileUserInfo ile aynı)
        let imageUrl = null;

        // Try profile_image first (string format)
        if (userData?.profile_image && typeof userData.profile_image === 'string') {
            imageUrl = userData.profile_image;
            console.log('🔍 Using profile_image (string):', imageUrl);
        }
        // Then try profilePicture (could be object or string)
        else if (userData?.profilePicture) {
            if (typeof userData.profilePicture === 'string') {
                imageUrl = userData.profilePicture;
                console.log('🔍 Using profilePicture (string):', imageUrl);
            } else if (typeof userData.profilePicture === 'object' && userData.profilePicture.uri) {
                imageUrl = userData.profilePicture.uri;
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
    }, [userData?.profile_image, userData?.profilePicture, previewProfile, prepareImageUri]);

    // Form data değişim handler
    const handleChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Permission isteme
    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('İzin Gerekli', 'Galeriye erişim izni gereklidir!');
                return false;
            }
            return true;
        }
        return true;
    };

    // Profil resmi seçme
    const pickProfileImage = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                const uri = selectedImage.uri;

                const uriParts = uri.split('.');
                const fileType = uriParts[uriParts.length - 1].toLowerCase();
                let mimeType = 'image/jpeg';
                if (fileType === 'png') mimeType = 'image/png';
                if (fileType === 'gif') mimeType = 'image/gif';
                if (fileType === 'webp') mimeType = 'image/webp';

                const imageFile = {
                    uri: uri,
                    type: mimeType,
                    name: `profile_${Date.now()}.${fileType}`,
                };

                console.log('📷 New image selected:', uri);
                setPreviewProfile(uri);
                setFormData(prev => ({
                    ...prev,
                    profile_image: imageFile,
                }));
            }
        } catch (error) {
            console.error('❌ Image picker error:', error);
            Alert.alert('Hata', 'Resim seçilirken bir sorun oluştu.');
        }
    };

    // ✅ Değişiklikleri kontrol et ve sadece değişenleri gönder
    const getChangedFields = () => {
        const changes = {};
        const fieldsToCheck = ['firstname', 'lastname', 'username', 'email', 'bio', 'phone_number'];

        fieldsToCheck.forEach(field => {
            const currentValue = formData[field].trim();
            const originalValue = originalData[field] || '';

            if (currentValue !== originalValue) {
                changes[field] = currentValue;
                console.log(`🔄 Field changed - ${field}: "${originalValue}" → "${currentValue}"`);
            }
        });

        // Profile image varsa ekle
        if (formData.profile_image && typeof formData.profile_image === 'object') {
            changes.profile_image = formData.profile_image;
            console.log('📷 Profile image changed');
        }

        console.log('📋 Changed fields:', Object.keys(changes));
        console.log('📋 Original data:', originalData);

        return changes;
    };

    // Form submit
    const handleSubmit = async () => {
        if (loading || updateLoading) return;

        const changedFields = getChangedFields();

        if (Object.keys(changedFields).length === 0) {
            Alert.alert('Bilgi', 'Hiçbir değişiklik yapılmadı.');
            return;
        }

        // Temel validation - sadece değişen field'lar için
        if (changedFields.firstname !== undefined && !changedFields.firstname.trim()) {
            Alert.alert('Hata', 'İsim alanı boş olamaz');
            return;
        }
        if (changedFields.lastname !== undefined && !changedFields.lastname.trim()) {
            Alert.alert('Hata', 'Soyisim alanı boş olamaz');
            return;
        }
        if (changedFields.username !== undefined && !changedFields.username.trim()) {
            Alert.alert('Hata', 'Kullanıcı adı boş olamaz');
            return;
        }

        setLoading(true);

        try {
            const userId = userData?.user_id || userData?.id;

            if (!userId) {
                Alert.alert("Hata", "Kullanıcı ID'si bulunamadı!");
                setLoading(false);
                return;
            }

            if (!originalData.username) {
                Alert.alert("Hata", "Orijinal kullanıcı verileri eksik!");
                setLoading(false);
                return;
            }

            console.log('🚀 Dispatching updateUserProfile...');
            console.log('📋 Changed fields:', Object.keys(changedFields));

            const result = await dispatch(updateUserProfile({
                userId: userId,
                profileData: changedFields,
                originalData: originalData
            }));

            if (result.type === 'auth/updateUserProfile/fulfilled') {
                Alert.alert(
                    'Success',
                    'Profile updated successfully',
                    [
                        {
                            text: 'Tamam',
                            onPress: () => {
                                navigation.goBack('');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Hata', result.payload || 'Profil güncellenirken bir hata oluştu');
            }
        } catch (error) {
            console.error("💥 Update error:", error);
            Alert.alert("Hata", "Profil güncellenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // Cancel handler
    const handleCancel = () => {
        const changedFields = getChangedFields();
        const hasChanges = Object.keys(changedFields).length > 0;

        if (hasChanges) {
            Alert.alert(
                'Değişiklikleri At?',
                'Yaptığınız değişiklikler kaydedilmeyecek. Emin misiniz?',
                [
                    { text: 'Devam Et', style: 'cancel' },
                    { text: 'Değişiklikleri At', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    // useEffect - userData değişince form'u doldur
    useEffect(() => {
        if (userData) {
            let firstname = userData.firstname || "";
            let lastname = userData.lastname || "";

            if (!firstname && !lastname && userData.name) {
                const nameParts = userData.name.split(' ');
                firstname = nameParts[0] || "";
                lastname = nameParts.slice(1).join(' ') || "";
            }

            const original = {
                firstname: firstname,
                lastname: lastname,
                username: userData.username || "",
                bio: userData.bio || "",
                email: userData.email || "",
                phone_number: userData.phone_number || "",
            };

            setOriginalData(original);

            setFormData({
                ...original,
                profile_image: null,
            });

            // ✅ REMOVED: Preview setting moved to useMemo
            console.log('📋 Original data loaded:', original);
        }
    }, [userData]);

    return (
        <SafeAreaView className="flex-1 bg-[#171717]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-[#252525]">
                <TouchableOpacity onPress={handleCancel} className="p-2">
                    <FontAwesomeIcon icon={faTimes} size={20} color="#888" />
                </TouchableOpacity>

                <Text className="text-white text-lg font-semibold">Edit your profile</Text>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading || updateLoading}
                    className={`p-2 ${(loading || updateLoading) ? 'opacity-50' : ''}`}
                >
                    {(loading || updateLoading) ? (
                        <ActivityIndicator size="small" color="#1B77CD" />
                    ) : (
                        <FontAwesomeIcon icon={faCheck} size={20} color="#1B77CD" />
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="flex-1 bg-[#171717]">

                            {/* Profile Image Section */}
                            <View className="items-center py-8 bg-[#252525] mx-4 mt-4 rounded-xl">
                                <View className="relative">
                                    {/* ✅ Expo Image ile CDN destekli profil fotoğrafı */}
                                    <Image
                                        source={profileImageSource}
                                        style={{
                                            width: 96,
                                            height: 96,
                                            borderRadius: 48,
                                            borderWidth: 2,
                                            borderColor: '#1B77CD'
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

                                    <TouchableOpacity
                                        className="absolute bottom-0 right-0 bg-[#1B77CD] w-8 h-8 justify-center items-center rounded-full"
                                        onPress={pickProfileImage}
                                    >
                                        <FontAwesomeIcon icon={faCameraRotate} color="#fff" size={16} />
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-gray-400 text-sm mt-2">Change profile photo</Text>
                            </View>

                            {/* Form Section */}
                            <View className="p-4 mt-4">

                                {/* First Name */}
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-sm mb-2">First Name</Text>
                                    <TextInput
                                        value={formData.firstname}
                                        onChangeText={(text) => handleChange('firstname', text)}
                                        className="bg-[#252525] text-white px-4 py-3 rounded-lg"
                                        placeholder="Enter your first name"
                                        placeholderTextColor="#888"
                                        maxLength={50}
                                    />
                                </View>

                                {/* Last Name */}
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-sm mb-2">Last Name</Text>
                                    <TextInput
                                        value={formData.lastname}
                                        onChangeText={(text) => handleChange('lastname', text)}
                                        className="bg-[#252525] text-white px-4 py-3 rounded-lg "
                                        placeholder="Enter your last name"
                                        placeholderTextColor="#888"
                                        maxLength={50}
                                    />
                                </View>

                                {/* Username */}
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-sm mb-2">Username</Text>
                                    <TextInput
                                        value={formData.username}
                                        onChangeText={(text) => handleChange('username', text)}
                                        className="bg-[#252525] text-white px-4 py-3 rounded-lg "
                                        placeholder="Enter your username"
                                        placeholderTextColor="#888"
                                        autoCapitalize="none"
                                        maxLength={30}
                                    />
                                </View>

                                {/* Bio */}
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-sm mb-2">Bio</Text>
                                    <TextInput
                                        value={formData.bio}
                                        onChangeText={(text) => handleChange('bio', text)}
                                        className="bg-[#252525] text-white px-4 py-3 rounded-lg  h-20"
                                        placeholder="A description about yourself"
                                        placeholderTextColor="#888"
                                        maxLength={150}
                                        multiline
                                        textAlignVertical="top"
                                    />
                                    <Text className="text-gray-500 text-xs mt-1 text-right">
                                        {formData.bio.length}/150
                                    </Text>
                                </View>

                                {/* Email */}
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-sm mb-2">Email</Text>
                                    <TextInput
                                        value={formData.email}
                                        onChangeText={(text) => handleChange('email', text)}
                                        className="bg-[#252525] text-white px-4 py-3 rounded-lg "
                                        placeholder="Enter your email"
                                        placeholderTextColor="#888"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        maxLength={100}
                                    />
                                </View>

                                {/* Telefon */}
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-sm mb-2">Phone number (Opsiyonel)</Text>
                                    <TextInput
                                        value={formData.phone_number}
                                        onChangeText={(text) => handleChange('phone_number', text)}
                                        className="bg-[#252525] text-white px-4 py-3 rounded-lg"
                                        placeholder="Enter your phone number"
                                        placeholderTextColor="#888"
                                        keyboardType="phone-pad"
                                        maxLength={20}
                                    />
                                </View>

                                {/* Error Display */}
                                {updateError && (
                                    <View className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-6">
                                        <Text className="text-red-400 text-center">{updateError}</Text>
                                    </View>
                                )}



                                <View className="h-32" />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileEditScreen;