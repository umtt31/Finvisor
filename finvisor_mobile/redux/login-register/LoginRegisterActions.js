// redux/login-register/LoginRegisterActions.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../apiClient";
import AsyncStorage from '@react-native-async-storage/async-storage';

// redux/login-register/LoginRegisterActions.js - loginUser kontrol

// Düzeltilmiş loginUser action
// Düzeltilmiş loginUser action
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      const { token, user } = response.data;

      // Token kontrolü
      if (!token || token.trim() === '') {
        return rejectWithValue('Token bulunamadı');
      }

      // Token'ı kaydet
      await AsyncStorage.setItem('auth_token', token);

      // User data'yı kaydet
      if (user) {
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      }

      if (__DEV__) {
        console.log('✅ Login başarılı');
        console.log('🔍 User ID:', user?.user_id || user?.id);
      }

      return { token, user };

    } catch (error) {
      if (__DEV__) {
        console.log('❌ Login error:', error.response?.data || error.message);
      }

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Giriş işlemi başarısız."
      );
    }
  }
);


// LoginRegisterActions.js - registerUser action'ını düzeltin

// redux/login-register/LoginRegisterActions.js - registerUser düzeltme

// Düzeltilmiş registerUser action
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🚀 Original userData:', userData);

      // Backend validation'ına göre field mapping
      const requestData = {
        firstname: userData.fullName ? userData.fullName.split(' ')[0] : (userData.firstname || ''),
        lastname: userData.fullName ? userData.fullName.split(' ').slice(1).join(' ') : (userData.lastname || ''),
        username: userData.username,
        email: userData.email,
        phone_number: userData.phoneNumber || userData.phone_number,
        birth_date: userData.birthDate || userData.birth_date,
        password: userData.password,
        password_confirmation: userData.password,
      };

      console.log('📋 Mapped request data:', requestData);

      const response = await apiClient.post("/auth/register", requestData);

      console.log('✅ Register success:', response.data);

      // ✅ Backend response'u kontrol et - hangi format geliyor?
      if (response.data.user && response.data.token) {
        // Resource format: { user: {...}, token: "..." }
        const { token, user } = response.data;

        console.log('🔍 Register user object:', user);
        console.log('🔍 Register user_id:', user.user_id);

        if (token && token.trim() !== '') {
          await AsyncStorage.setItem('auth_token', token);
          console.log('✅ Token saved to AsyncStorage');

          // ✅ Backend'den gelen user object'ini olduğu gibi kaydet
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          console.log('✅ User data saved to AsyncStorage');

          return { token, user };
        }
      } else if (response.data.token && response.data.user_id) {
        // Minimal format: { success: true, user_id: 123, token: "..." }
        const { token, user_id } = response.data;

        if (token && token.trim() !== '') {
          await AsyncStorage.setItem('auth_token', token);
          console.log('✅ Token saved to AsyncStorage');

          // ✅ Mock user objesi oluştur - user_id field'ı ile
          const mockUser = {
            user_id: user_id, // ✅ DÜZELTME: user_id field'ı kullan
            username: requestData.username,
            email: requestData.email,
            firstname: requestData.firstname,
            lastname: requestData.lastname,
            phone_number: requestData.phone_number,
            birth_date: requestData.birth_date,
            bio: '',
            profile_image: '',
            background_image: ''
          };

          await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
          console.log('✅ Mock user data saved to AsyncStorage');

          return { token, user: mockUser };
        }
      }

      console.log('❌ No token received from backend');
      return rejectWithValue('Token bulunamadı');

    } catch (error) {
      console.log('❌ Register error details:', error.response?.data);

      // Validation hatalarını kullanıcı dostu hale getir
      if (error.response?.status === 422 && error.response.data?.errors) {
        const errors = error.response.data.errors;
        console.log('📋 Validation errors:', errors);

        const firstErrorField = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorField][0];

        return rejectWithValue(firstErrorMessage);
      }

      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Kayıt işlemi başarısız."
      );
    }
  }
);

// Logout Action
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      // Önce token'ı kontrol et
      const token = await AsyncStorage.getItem('auth_token');

      if (token && token.trim() !== '') {
        const response = await apiClient.post("/auth/logout");
        console.log('✅ Logout successful:', response.data);
      } else {
        console.log('⚠️ No token for logout, just clearing local data');
      }

      // Token'ı her durumda sil
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');

      return { success: true };
    } catch (error) {
      // Hata olsa bile token'ı sil
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');

      console.log('⚠️ Logout error but continuing:', error.message);
      return { success: true }; // Error değil success döndür
    }
  }
);


// Düzeltilmiş checkAuthToken action
// checkAuthToken action'ını düzelt
// redux/login-register/LoginRegisterActions.js - checkAuthToken güncellemesi

export const checkAuthToken = createAsyncThunk(
  "auth/checkAuthToken",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Checking stored token...');

      const token = await AsyncStorage.getItem('auth_token');

      // Token yoksa direkt reject et
      if (!token || token.trim() === '') {
        console.log('⚠️ No token found, user needs to login');
        return rejectWithValue("No token found");
      }

      // Local user data'yı al
      let localUser = null;
      try {
        const localUserData = await AsyncStorage.getItem('user_data');
        if (localUserData) {
          localUser = JSON.parse(localUserData);
          console.log('✅ Local user data found:', localUser.username);
        }
      } catch (parseError) {
        console.log('⚠️ User data parse error:', parseError);
      }

      // Token varsa başarılı döndür (API çağrısı YOK)
      if (token) {
        console.log('✅ Token found, assuming valid without API call');
        return {
          token,
          user: localUser || {
            username: 'user',
            user_id: 1,
            firstname: '',
            lastname: '',
            email: ''
          },
          userProfile: localUser || {
            username: 'user',
            user_id: 1,
            firstname: '',
            lastname: '',
            email: ''
          }
        };
      }

      return rejectWithValue("Token kontrol edilemedi");

    } catch (error) {
      console.log('❌ checkAuthToken error:', error);
      return rejectWithValue("Token kontrol edilemedi");
    }
  }
);
// Change Password Action
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Şifre değiştirilemedi."
      );
    }
  }
);





// Get Followers Action
export const getFollowers = createAsyncThunk(
  "auth/getFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}/followers`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Takipçi listesi alınamadı."
      );
    }
  }
);

// Get Following Action
export const getFollowing = createAsyncThunk(
  "auth/getFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}/follows`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Takip edilen listesi alınamadı."
      );
    }
  }
);



// Get User Comments Action
export const getUserComments = createAsyncThunk(
  "auth/getUserComments",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}/comments`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Kullanıcı yorumları alınamadı."
      );
    }
  }
);

// Get User Stock Comments Action
// export const getUserStockComments = createAsyncThunk(
//   "auth/getUserStockComments",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get(`/users/${userId}/stock-comments`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message ||
//         error.message ||
//         "Hisse senedi yorumları alınamadı."
//       );
//     }
//   }
// );

// Get User Stock Votes Action
// export const getUserStockVotes = createAsyncThunk(
//   "auth/getUserStockVotes",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get(`/users/${userId}/stock-votes`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message ||
//         error.message ||
//         "Hisse senedi oyları alınamadı."
//       );
//     }
//   }
// );


// export const getUserFavoriteStocks = createAsyncThunk(
//   "auth/getUserFavoriteStocks",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.get(`/users/${userId}/favorite-stocks`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message ||
//         error.message ||
//         "Favori hisse senetleri alınamadı."
//       );
//     }
//   }
// );

// export const addStockToFavorites = createAsyncThunk(
//   "auth/addStockToFavorites",
//   async (stockId, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.post(`/stocks/${stockId}/favorite`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message ||
//         error.message ||
//         "Hisse senedi favorilere eklenemedi."
//       );
//     }
//   }
// );


// export const removeStockFromFavorites = createAsyncThunk(
//   "auth/removeStockFromFavorites",
//   async (stockId, { rejectWithValue }) => {
//     try {
//       const response = await apiClient.delete(`/stocks/${stockId}/favorite`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message ||
//         error.message ||
//         "Hisse senedi favorilerden çıkarılamadı."
//       );
//     }
//   }
// );

// Upload Profile Image Action
export const uploadProfileImage = createAsyncThunk(
  "auth/uploadProfileImage",
  async (imageData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', imageData);

      const response = await apiClient.post("/auth/upload-profile-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Profil resmi yüklenemedi."
      );
    }
  }
);

// Upload Background Image Action
export const uploadBackgroundImage = createAsyncThunk(
  "auth/uploadBackgroundImage",
  async (imageData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('background_image', imageData);

      const response = await apiClient.post("/auth/upload-background-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Arka plan resmi yüklenemedi."
      );
    }
  }
);

// Delete User Account Action
export const deleteUserAccount = createAsyncThunk(
  "auth/deleteUserAccount",
  async (password, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete("/auth/delete-account", {
        data: { password }
      });

      // Token'ı sil
      await AsyncStorage.removeItem('auth_token');

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Hesap silinemedi."
      );
    }
  }
);

// Resend Email Verification Action (TODO için hazırlandı)
export const resendEmailVerification = createAsyncThunk(
  "auth/resendEmailVerification",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/email/resend");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Doğrulama emaili gönderilemedi."
      );
    }
  }
);

// Verify Email Action (TODO için hazırlandı)
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/email/verify", verificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Email doğrulanamadı."
      );
    }
  }
);

// Get Email Verification Status Action (TODO için hazırlandı)
export const getEmailVerificationStatus = createAsyncThunk(
  "auth/getEmailVerificationStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/email/verification-status");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Email doğrulama durumu alınamadı."
      );
    }
  }
);

// Send Password Reset Email Action (TODO için hazırlandı)
export const sendPasswordResetEmail = createAsyncThunk(
  "auth/sendPasswordResetEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/password-email", { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Şifre sıfırlama emaili gönderilemedi."
      );
    }
  }
);

// Reset Password Action (TODO için hazırlandı)
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/password-reset", resetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Şifre sıfırlanamadı."
      );
    }
  }
);



// redux/login-register/LoginRegisterActions.js - getUserProfile düzeltme

export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (userId = null, { rejectWithValue, getState }) => {
    try {
      console.log('🔍 Getting profile for user ID:', userId);

      // ✅ FIX: userId varsa direkt API'den al
      if (userId) {
        const response = await apiClient.get(`/users/${userId}`);
        const userData = response.data;

        // ✅ FIX: user_id field'ını normalize et
        if (userData && !userData.user_id && userData.id) {
          userData.user_id = userData.id;
        }

        return {
          success: true,
          user: userData
        };
      }

      // ✅ FIX: Kendi profilimiz için - Redux state'den user_id'yi al
      const { auth } = getState();

      if (auth.user?.user_id || auth.user?.id) {
        const currentUserId = auth.user.user_id || auth.user.id;
        console.log('🔍 Using current user ID:', currentUserId);

        const response = await apiClient.get(`/users/${currentUserId}`);
        const userData = response.data;

        // ✅ FIX: user_id field'ını normalize et
        if (userData && !userData.user_id && userData.id) {
          userData.user_id = userData.id;
        }

        return {
          success: true,
          user: userData
        };
      }

      // ✅ FIX: AsyncStorage'dan user_id'yi almaya çalış
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          const storedUserId = user.user_id || user.id;

          if (storedUserId) {
            console.log('🔍 Using stored user ID:', storedUserId);
            const response = await apiClient.get(`/users/${storedUserId}`);
            const responseData = response.data;

            // ✅ FIX: user_id field'ını normalize et
            if (responseData && !responseData.user_id && responseData.id) {
              responseData.user_id = responseData.id;
            }

            return {
              success: true,
              user: responseData
            };
          }
        }
      } catch (storageError) {
        console.log('❌ AsyncStorage error:', storageError);
      }

      // ✅ FIX: Hiçbir yerden ID alamıyorsak error döndür
      console.log('❌ No user ID found anywhere');
      return rejectWithValue('Profile ID bulunamadı');

    } catch (error) {
      console.log('💥 getUserProfile error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Profil bilgileri alınamadı."
      );
    }
  }
);

// User Posts with proper endpoint
export const getUserPosts = createAsyncThunk(
  "auth/getUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Kullanıcı postları alınamadı."
      );
    }
  }
);

// Get User by ID (show endpoint)
export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Kullanıcı bilgileri alınamadı."
      );
    }
  }
);

// Get All Users
export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Kullanıcılar alınamadı."
      );
    }
  }
);

// Follow/Unfollow (bunlar AuthController'da var, UserController'da yok)
// Eğer bunlar auth endpoints'inde ise:
export const followUser = createAsyncThunk(
  "auth/followUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/auth/follow/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Takip işlemi başarısız."
      );
    }
  }
);

export const unfollowUser = createAsyncThunk(
  "auth/unfollowUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/auth/unfollow/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Takibi bırakma işlemi başarısız."
      );
    }
  }
);



export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ userId, profileData, originalData }, { rejectWithValue }) => {
    try {
      console.log('🚀 Updating user profile:', { userId, profileData, originalData });

      const hasImage = profileData.profile_image &&
        typeof profileData.profile_image === 'object' &&
        profileData.profile_image.uri;

      // Backend required field'ları için tüm field'ları hazırla
      const completeData = {
        firstname: profileData.firstname !== undefined ? profileData.firstname : originalData?.firstname,
        lastname: profileData.lastname !== undefined ? profileData.lastname : originalData?.lastname,
        username: profileData.username !== undefined ? profileData.username : originalData?.username,
        email: profileData.email !== undefined ? profileData.email : originalData?.email,
        bio: profileData.bio !== undefined ? profileData.bio : originalData?.bio,
        phone_number: profileData.phone_number !== undefined ? profileData.phone_number : originalData?.phone_number,
      };

      console.log('📋 Complete data to send:', completeData);

      let response;

      if (hasImage) {
        console.log('📎 Image detected, using FormData exactly like POST creation...');

        // ✅ POST creation'daki gibi AYNI FormData yapısı
        const formData = new FormData();

        // Text field'ları ekle (POST'taki content gibi)
        Object.keys(completeData).forEach(field => {
          const value = completeData[field];
          if (value !== undefined && value !== null) {
            formData.append(field, value);
            console.log(`✅ Added text field ${field}: "${value}"`);
          }
        });

        // ✅ Image'ı POST'taki gibi AYNI formatta ekle
        // POST'ta: formData.append('image', { uri, type, name })
        formData.append('profile_image', {
          uri: profileData.profile_image.uri,
          type: profileData.profile_image.type || 'image/jpeg',
          name: profileData.profile_image.name || `profile_${Date.now()}.jpg`,
        });

        console.log('✅ Added profile_image exactly like post image');

        // ✅ POST'taki gibi headers ayarlama - MANUAL Content-Type KALDIRIYORUZ
        console.log('📤 Sending FormData to backend (like post creation)...');

        // apiClient FormData'yı otomatik handle etsin, manual header gönderme
        response = await apiClient.post(`/users/${userId}`, formData);

      } else {
        console.log('📝 No image, using JSON');
        response = await apiClient.post(`/users/${userId}`, completeData);
      }

      console.log('✅ Update profile response:', response.data);

      const updatedUser = response.data;
      if (updatedUser && !updatedUser.user_id && updatedUser.id) {
        updatedUser.user_id = updatedUser.id;
      }

      return {
        success: true,
        user: updatedUser,
        message: 'Profile Updated Successfully',
      };

    } catch (error) {
      console.log('❌ Update profile error:', error);
      console.log('❌ Error response:', error.response?.data);

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errors?.username?.[0] ||
        error.response?.data?.first_error ||
        error.message ||
        "Profil güncellenemedi."
      );
    }
  }
);


export const toggleFollowUser = createAsyncThunk(
  "auth/toggleFollowUser",
  async (userId, { rejectWithValue, getState }) => {
    try {
      console.log('🔄 Toggle follow for user:', userId);

      if (!userId || isNaN(userId) || userId <= 0) {
        return rejectWithValue('Geçersiz kullanıcı ID\'si');
      }

      // ✅ FIX: Get stable current user from AsyncStorage instead of Redux state
      let currentUserId;
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          currentUserId = user.user_id || user.id;
        }
      } catch (storageError) {
        console.error('❌ AsyncStorage error:', storageError);
      }

      // ✅ Fallback to Redux state if AsyncStorage fails
      if (!currentUserId) {
        const { auth } = getState();
        const currentUser = auth.user;

        if (!currentUser) {
          return rejectWithValue('Giriş yapmanız gerekiyor');
        }

        currentUserId = currentUser.user_id || currentUser.id;
      }

      if (!currentUserId) {
        return rejectWithValue('Giriş yapmanız gerekiyor');
      }

      const targetUserIdNum = Number(userId);
      const currentUserIdNum = Number(currentUserId);

      console.log('🔍 Toggle follow debug:', {
        targetUserId: targetUserIdNum,
        currentUserId: currentUserIdNum,
        targetUserType: typeof targetUserIdNum,
        currentUserType: typeof currentUserIdNum,
        areEqual: targetUserIdNum === currentUserIdNum
      });

      if (targetUserIdNum === currentUserIdNum) {
        console.error('❌ Self-follow attempt detected in thunk');
        return rejectWithValue('Kendinizi takip edemezsiniz');
      }

      console.log('📤 Sending toggle follow request (form-data)');

      // 🔧 FormData oluştur
      const formData = new FormData();
      formData.append('user_id', targetUserIdNum);

      // ✅ istek gönder
      const response = await apiClient.post('/users/toggle-follow', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Toggle follow response:', response.data);

      const action = response.data.action;
      const isFollowing = action === 'follow';

      const responseData = {
        userId: targetUserIdNum,
        action,
        isFollowing,
        success: true,
        message: response.data.message || (isFollowing ? 'Takip edildi' : 'Takipten çıkıldı'),
        followers_count: response.data.followers_count,
        following_count: response.data.following_count,
      };

      return responseData;

    } catch (error) {
      console.error('❌ Toggle follow error:', error);

      if (error.response?.status === 404) {
        return rejectWithValue('Kullanıcı bulunamadı');
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue('Bu işlem için yetkiniz yok');
      }

      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0];
          return rejectWithValue(Array.isArray(firstError) ? firstError[0] : firstError);
        }
        return rejectWithValue('Geçersiz istek verisi');
      }

      if (error.response?.status === 500) {
        return rejectWithValue('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }

      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return rejectWithValue('İnternet bağlantınızı kontrol edin');
      }

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.first_error ||
        error.message ||
        'Takip işlemi başarısız'
      );
    }
  }
);