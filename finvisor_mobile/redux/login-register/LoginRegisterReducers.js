// redux/login-register/LoginRegisterReducers.js
import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUser,
  checkAuthToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserComments,
  // getUserStockComments,
  // getUserStockVotes,
  // getUserFavoriteStocks,
  // addStockToFavorites,
  // removeStockFromFavorites,
  uploadProfileImage,
  uploadBackgroundImage,
  deleteUserAccount,
  resendEmailVerification,
  verifyEmail,
  getEmailVerificationStatus,
  sendPasswordResetEmail,
  resetPassword,
  toggleFollowUser, // YENİ EKLENDİ
} from "./LoginRegisterActions";

const initialState = {
  // User data
  user: null,
  userProfile: null,
  token: null,
  isAuthenticated: false,

  // User related data
  followers: null,
  following: null,
  userPosts: null,
  userComments: null,
  userStockComments: null,
  userStockVotes: null,
  favoriteStocks: null,

  // ==========================================
  // FOLLOW STATES - YENİ EKLENDİ
  // ==========================================
  followStates: {}, // { userId: { isFollowing: boolean, isLoading: boolean } }


  // Loading states
  loading: false,
  loginLoading: false,
  registerLoading: false,
  logoutLoading: false,
  profileLoading: false,
  updateLoading: false,
  passwordLoading: false,
  followLoading: false,
  unfollowLoading: false,
  followersLoading: false,
  followingLoading: false,
  postsLoading: false,
  commentsLoading: false,
  stockCommentsLoading: false,
  stockVotesLoading: false,
  favoritesLoading: false,
  imageUploadLoading: false,
  accountDeleteLoading: false,
  emailVerificationLoading: false,
  passwordResetLoading: false,

  // Error states
  error: null,
  loginError: null,
  registerError: null,
  logoutError: null,
  profileError: null,
  updateError: null,
  passwordError: null,
  followError: null,
  unfollowError: null,
  followersError: null,
  followingError: null,
  postsError: null,
  commentsError: null,
  stockCommentsError: null,
  stockVotesError: null,
  favoritesError: null,
  imageUploadError: null,
  accountDeleteError: null,
  emailVerificationError: null,
  passwordResetError: null,

  // Success states
  updateSuccess: false,
  passwordChangeSuccess: false,
  followSuccess: false,
  unfollowSuccess: false,
  imageUploadSuccess: false,
  accountDeleteSuccess: false,
  emailVerificationSuccess: false,
  passwordResetSuccess: false,

  // Additional states
  tokenChecked: false,
  emailVerified: false,
  emailVerificationStatus: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Error temizleme
    clearErrors: (state) => {
      state.error = null;
      state.loginError = null;
      state.registerError = null;
      state.logoutError = null;
      state.profileError = null;
      state.updateError = null;
      state.passwordError = null;
      state.followError = null;
      state.unfollowError = null;
      state.followersError = null;
      state.followingError = null;
      state.postsError = null;
      state.commentsError = null;
      state.stockCommentsError = null;
      state.stockVotesError = null;
      state.favoritesError = null;
      state.imageUploadError = null;
      state.accountDeleteError = null;
      state.emailVerificationError = null;
      state.passwordResetError = null;
      // YENİ: Follow errors temizleme
      state.toggleFollowError = {};
    },

    // Auth verileri temizleme
    clearAuthData: (state) => {
      state.user = null;
      state.userProfile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.followers = null;
      state.following = null;
      state.userPosts = null;
      state.userComments = null;
      // state.userStockComments = null;
      // state.userStockVotes = null;
      // state.favoriteStocks = null;
      state.error = null;
      state.loginError = null;
      state.registerError = null;
      // YENİ: Follow states temizleme
      state.followStates = {};
      state.toggleFollowLoading = {};
      state.toggleFollowError = {};
      state.toggleFollowSuccess = {};
    },

    // Manuel credential ayarlama
    setCredentials: (state, action) => {
      const { user, userProfile, token } = action.payload;
      state.user = user;
      state.userProfile = userProfile;
      state.token = token;
      state.isAuthenticated = true;
    },

    // Success state'leri temizleme
    clearSuccessStates: (state) => {
      state.updateSuccess = false;
      state.passwordChangeSuccess = false;
      state.followSuccess = false;
      state.unfollowSuccess = false;
      state.imageUploadSuccess = false;
      state.accountDeleteSuccess = false;
      state.emailVerificationSuccess = false;
      state.passwordResetSuccess = false;
      // YENİ: Toggle follow success temizleme
      state.toggleFollowSuccess = {};
    },

    // User profile manuel güncelleme
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },

    // User profile field güncelleme
    updateUserProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.userProfile) {
        state.userProfile[field] = value;
      }
    },

    // Takipçi sayısı güncelleme
    setFollowersCount: (state, action) => {
      if (state.userProfile) {
        state.userProfile.followersCount = action.payload;
      }
    },

    // Takip edilen sayısı güncelleme
    setFollowingCount: (state, action) => {
      if (state.userProfile) {
        state.userProfile.followingCount = action.payload;
      }
    },

    // ==========================================
    // FOLLOW REDUCERS - YENİ EKLENDİ
    // ==========================================

    // Follow state manuel güncelleme
    setFollowState: (state, action) => {
      const { userId, isFollowing, isLoading = false, error = null } = action.payload;
      state.followStates[userId] = {
        isFollowing: Boolean(isFollowing),
        isLoading: Boolean(isLoading),
        error
      };
    },


    // Optimistic follow update
    optimisticFollowUpdate: (state, action) => {
      const { userId, isFollowing } = action.payload;

      if (!state.followStates[userId]) {
        state.followStates[userId] = { isFollowing: false, isLoading: false };
      }

      state.followStates[userId].isFollowing = isFollowing;

      // Update current user's following count
      if (state.userProfile) {
        if (isFollowing) {
          state.userProfile.follows_count = (state.userProfile.follows_count || 0) + 1;
        } else {
          state.userProfile.follows_count = Math.max((state.userProfile.follows_count || 0) - 1, 0);
        }
      }
    },

    // Follow states sıfırlama
    resetFollowStates: (state) => {
      state.followStates = {};
    },

    // Favori stock ekleme
    // addToFavoriteStocks: (state, action) => {
    //   if (state.favoriteStocks) {
    //     state.favoriteStocks.push(action.payload);
    //   } else {
    //     state.favoriteStocks = [action.payload];
    //   }
    // },

    // Favori stock çıkarma
    // removeFromFavoriteStocks: (state, action) => {
    //   if (state.favoriteStocks) {
    //     state.favoriteStocks = state.favoriteStocks.filter(
    //       (stock) => stock.id !== action.payload
    //     );
    //   }
    // },

    // Email doğrulama durumu
    setEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
    },

    // Tam state reset
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ==========================================
      // LOGIN REDUCERS
      // ==========================================
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;

        const { token, user } = action.payload;

        if (token && token.trim() !== "") {
          state.user = user;
          state.userProfile = user;
          state.token = token;
          state.isAuthenticated = true;
          state.loginError = null;
          state.error = null;

          // ✅ NEW: Store current user ID for like calculations
          state.currentUserId = user.user_id || user.id;
          console.log('✅ AUTH: Current user ID set:', state.currentUserId);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError =
          action.payload || "Giriş yapılırken bir hata oluştu.";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.userProfile = null;
        state.token = null;
      })

      // ==========================================
      // REGISTER REDUCERS
      // ==========================================
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;

        const { token, user } = action.payload;

        if (token && token.trim() !== "") {
          console.log("✅ Redux: Setting auth state with token");
          state.user = user;
          state.userProfile = user; // userProfile yoksa user'ı kullan
          state.token = token;
          state.isAuthenticated = true;
          state.registerError = null;
          state.error = null;
        } else {
          console.log("❌ Redux: No valid token in payload");
          state.registerError = "Token bulunamadı";
          state.isAuthenticated = false;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError =
          action.payload || "Kayıt olurken bir hata oluştu.";
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // ==========================================
      // LOGOUT REDUCERS
      // ==========================================
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
        state.logoutError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.userProfile = null;
        state.token = null;
        state.isAuthenticated = false;
        state.followers = null;
        state.following = null;
        state.userPosts = null;
        state.userComments = null;
        state.userStockComments = null;
        state.userStockVotes = null;
        state.favoriteStocks = null;
        state.error = null;
        state.loginError = null;
        state.registerError = null;
        state.logoutError = null;
        // YENİ: Follow states temizleme
        state.followStates = {};
        state.toggleFollowLoading = {};
        state.toggleFollowError = {};
        state.toggleFollowSuccess = {};
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;
        state.logoutError = action.payload;
        state.error = action.payload;
        // Logout başarısız olsa bile kullanıcıyı çıkar
        state.user = null;
        state.userProfile = null;
        state.token = null;
        state.isAuthenticated = false;
        // YENİ: Follow states temizleme
        state.followStates = {};
        state.toggleFollowLoading = {};
        state.toggleFollowError = {};
        state.toggleFollowSuccess = {};
      })

      // ==========================================
      // CHECK TOKEN REDUCERS
      // ==========================================
      .addCase(checkAuthToken.pending, (state) => {
        state.loading = true;
        // state.tokenChecked = false;
      })
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        console.log('🔍 checkAuthToken.fulfilled - payload:', action.payload);

        state.loading = false;
        state.tokenChecked = true;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;

        // ✅ BUNU EKLEYİN - User data'sını da set edin
        if (action.payload.user) {
          state.user = action.payload.user;
          state.userProfile = action.payload.user;
          console.log('✅ User data set in checkAuthToken:', action.payload.user.username);
        } else {
          console.log('⚠️ checkAuthToken payload\'ında user yok:', action.payload);
        }
      })
      .addCase(checkAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.tokenChecked = true;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.userProfile = null;
      })

      // ==========================================
      // GET PROFILE REDUCERS
      // ==========================================
      .addCase(getUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        console.log('🔄 getUserProfile.fulfilled payload:', action.payload);

        state.profileLoading = false;
        state.profileError = null;

        const userData = action.payload.user;

        if (userData) {
          // ✅ FIX: Check if this is current user's own profile
          const currentUserId = state.user?.user_id || state.user?.id;
          const fetchedUserId = userData.user_id || userData.id;

          if (currentUserId && String(currentUserId) === String(fetchedUserId)) {
            // ✅ Only update if it's current user's own profile
            console.log('✅ Updating current user profile data');
            state.user = {
              ...state.user,
              ...userData
            };
            state.userProfile = {
              ...state.userProfile,
              ...userData
            };
          } else {
            // ✅ For other users, store in a separate field or don't store in auth state
            console.log('✅ Profile loaded for other user:', fetchedUserId);
            // Don't update state.user or state.userProfile for other users
            // ProfileScreen will handle this data locally
          }

          console.log('✅ Profile data processed successfully');
        } else {
          console.log('❌ No user data in getUserProfile response');
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError =
          action.payload || "Profil bilgileri alınırken bir hata oluştu.";
      })

      // ==========================================
      // UPDATE PROFILE REDUCERS
      // ==========================================
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log('🔄 updateUserProfile.fulfilled payload:', action.payload);

        state.updateLoading = false;
        state.updateError = null;
        state.updateSuccess = true;

        // ✅ FIX: Direct user object'ini al (wrapped değil)
        const updatedUser = action.payload.user;

        if (updatedUser) {
          // ✅ FIX: Mevcut state'i preserve et, sadece güncellenen field'ları değiştir
          state.user = {
            ...state.user,
            ...updatedUser
          };

          state.userProfile = {
            ...state.userProfile,
            ...updatedUser
          };

          console.log('✅ User state updated successfully');
          console.log('✅ New user_id:', state.user.user_id);
        } else {
          console.log('❌ No user data in updateUserProfile response');
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || "Profil güncellenirken bir hata oluştu.";
        state.updateSuccess = false;
      })

      // ==========================================
      // CHANGE PASSWORD REDUCERS
      // ==========================================
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordChangeSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordError = null;
        state.passwordChangeSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError =
          action.payload || "Şifre değiştirilirken bir hata oluştu.";
        state.passwordChangeSuccess = false;
      })

      // ==========================================
      // FOLLOW/UNFOLLOW REDUCERS
      // ==========================================
      .addCase(followUser.pending, (state) => {
        state.followLoading = true;
        state.followError = null;
        state.followSuccess = false;
      })
      .addCase(followUser.fulfilled, (state) => {
        state.followLoading = false;
        state.followError = null;
        state.followSuccess = true;
        // Takip edilen sayısını artır
        if (state.userProfile) {
          state.userProfile.followingCount =
            (state.userProfile.followingCount || 0) + 1;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followLoading = false;
        state.followError = action.payload || "Takip işlemi başarısız.";
        state.followSuccess = false;
      })

      .addCase(unfollowUser.pending, (state) => {
        state.unfollowLoading = true;
        state.unfollowError = null;
        state.unfollowSuccess = false;
      })
      .addCase(unfollowUser.fulfilled, (state) => {
        state.unfollowLoading = false;
        state.unfollowError = null;
        state.unfollowSuccess = true;
        // Takip edilen sayısını azalt
        if (state.userProfile && state.userProfile.followingCount > 0) {
          state.userProfile.followingCount =
            state.userProfile.followingCount - 1;
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.unfollowLoading = false;
        state.unfollowError =
          action.payload || "Takibi bırakma işlemi başarısız.";
        state.unfollowSuccess = false;
      })

      // ==========================================
      // TOGGLE FOLLOW REDUCERS - YENİ EKLENDİ
      // ==========================================
      .addCase(toggleFollowUser.pending, (state, action) => {
        const userId = action.meta.arg;

        if (!state.followStates[userId]) {
          state.followStates[userId] = {
            isFollowing: false,
            isLoading: false,
            error: null
          };
        }

        state.followStates[userId].isLoading = true;
        state.followStates[userId].error = null;
      })
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { userId, isFollowing } = action.payload;

        state.followStates[userId] = {
          isFollowing: Boolean(isFollowing),
          isLoading: false,
          error: null
        };
      })
      .addCase(toggleFollowUser.rejected, (state, action) => {
        const userId = action.meta.arg;

        if (state.followStates[userId]) {
          state.followStates[userId].isLoading = false;
          state.followStates[userId].error = action.payload || 'Takip işlemi başarısız';
        }
      })

      // ==========================================
      // FOLLOWERS/FOLLOWING REDUCERS
      // ==========================================
      .addCase(getFollowers.pending, (state) => {
        state.followersLoading = true;
        state.followersError = null;
      })
      .addCase(getFollowers.fulfilled, (state, action) => {
        state.followersLoading = false;
        state.followers = action.payload.data;
        state.followersError = null;
      })
      .addCase(getFollowers.rejected, (state, action) => {
        state.followersLoading = false;
        state.followersError =
          action.payload || "Takipçi listesi alınırken bir hata oluştu.";
      })

      .addCase(getFollowing.pending, (state) => {
        state.followingLoading = true;
        state.followingError = null;
      })
      .addCase(getFollowing.fulfilled, (state, action) => {
        state.followingLoading = false;
        state.following = action.payload.data;
        state.followingError = null;
      })
      .addCase(getFollowing.rejected, (state, action) => {
        state.followingLoading = false;
        state.followingError =
          action.payload || "Takip edilen listesi alınırken bir hata oluştu.";
      })

      // ==========================================
      // USER POSTS REDUCERS
      // ==========================================
      .addCase(getUserPosts.pending, (state) => {
        state.postsLoading = true;
        state.postsError = null;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.postsLoading = false;
        state.userPosts = action.payload.data;
        state.postsError = null;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.postsLoading = false;
        state.postsError =
          action.payload || "Kullanıcı postları alınırken bir hata oluştu.";
      })

      // ==========================================
      // USER COMMENTS REDUCERS
      // ==========================================
      .addCase(getUserComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(getUserComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.userComments = action.payload.data;
        state.commentsError = null;
      })
      .addCase(getUserComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError =
          action.payload || "Kullanıcı yorumları alınırken bir hata oluştu.";
      })

      // ==========================================
      // IMAGE UPLOAD REDUCERS
      // ==========================================
      .addCase(uploadProfileImage.pending, (state) => {
        state.imageUploadLoading = true;
        state.imageUploadError = null;
        state.imageUploadSuccess = false;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.imageUploadLoading = false;
        state.imageUploadError = null;
        state.imageUploadSuccess = true;
        // Profil resmini güncelle
        if (state.userProfile) {
          state.userProfile.profile_image = action.payload.data?.profile_image;
        }
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.imageUploadLoading = false;
        state.imageUploadError =
          action.payload || "Profil resmi yüklenirken bir hata oluştu.";
        state.imageUploadSuccess = false;
      })

      .addCase(uploadBackgroundImage.pending, (state) => {
        state.imageUploadLoading = true;
        state.imageUploadError = null;
        state.imageUploadSuccess = false;
      })
      .addCase(uploadBackgroundImage.fulfilled, (state, action) => {
        state.imageUploadLoading = false;
        state.imageUploadError = null;
        state.imageUploadSuccess = true;
        // Arka plan resmini güncelle
        if (state.userProfile) {
          state.userProfile.background_image =
            action.payload.data?.background_image;
        }
      })
      .addCase(uploadBackgroundImage.rejected, (state, action) => {
        state.imageUploadLoading = false;
        state.imageUploadError =
          action.payload || "Arka plan resmi yüklenirken bir hata oluştu.";
        state.imageUploadSuccess = false;
      })

      // ==========================================
      // DELETE ACCOUNT REDUCERS
      // ==========================================
      .addCase(deleteUserAccount.pending, (state) => {
        state.accountDeleteLoading = true;
        state.accountDeleteError = null;
        state.accountDeleteSuccess = false;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.accountDeleteLoading = false;
        state.accountDeleteError = null;
        state.accountDeleteSuccess = true;
        // Tüm kullanıcı verilerini temizle
        state.user = null;
        state.userProfile = null;
        state.token = null;
        state.isAuthenticated = false;
        state.followers = null;
        state.following = null;
        state.userPosts = null;
        state.userComments = null;
        // YENİ: Follow states temizleme
        state.followStates = {};
        state.toggleFollowLoading = {};
        state.toggleFollowError = {};
        state.toggleFollowSuccess = {};
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.accountDeleteLoading = false;
        state.accountDeleteError =
          action.payload || "Hesap silinirken bir hata oluştu.";
        state.accountDeleteSuccess = false;
      })

      // ==========================================
      // EMAIL VERIFICATION REDUCERS
      // ==========================================
      .addCase(resendEmailVerification.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
      })
      .addCase(resendEmailVerification.fulfilled, (state) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = null;
        state.emailVerificationSuccess = true;
      })
      .addCase(resendEmailVerification.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError =
          action.payload || "Doğrulama emaili gönderilirken bir hata oluştu.";
        state.emailVerificationSuccess = false;
      })

      .addCase(verifyEmail.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError = null;
        state.emailVerified = true;
        state.emailVerificationSuccess = true;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError =
          action.payload || "Email doğrulanırken bir hata oluştu.";
        state.emailVerificationSuccess = false;
      })

      .addCase(getEmailVerificationStatus.pending, (state) => {
        state.emailVerificationLoading = true;
        state.emailVerificationError = null;
      })
      .addCase(getEmailVerificationStatus.fulfilled, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationStatus = action.payload.data;
        state.emailVerified = action.payload.data?.verified || false;
        state.emailVerificationError = null;
      })
      .addCase(getEmailVerificationStatus.rejected, (state, action) => {
        state.emailVerificationLoading = false;
        state.emailVerificationError =
          action.payload || "Email doğrulama durumu alınırken bir hata oluştu.";
      })

      // ==========================================
      // PASSWORD RESET REDUCERS
      // ==========================================
      .addCase(sendPasswordResetEmail.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
        state.passwordResetSuccess = false;
      })
      .addCase(sendPasswordResetEmail.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetError = null;
        state.passwordResetSuccess = true;
      })
      .addCase(sendPasswordResetEmail.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError =
          action.payload ||
          "Şifre sıfırlama emaili gönderilirken bir hata oluştu.";
        state.passwordResetSuccess = false;
      })

      .addCase(resetPassword.pending, (state) => {
        state.passwordResetLoading = true;
        state.passwordResetError = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordResetLoading = false;
        state.passwordResetError = null;
        state.passwordResetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.passwordResetLoading = false;
        state.passwordResetError =
          action.payload || "Şifre sıfırlanırken bir hata oluştu.";
        state.passwordResetSuccess = false;
      });
  },
});

// Actions export
export const {
  clearErrors,
  clearAuthData,
  setCredentials,
  clearSuccessStates,
  setUserProfile,
  updateUserProfileField,
  setFollowersCount,
  setFollowingCount,
  setFollowState, // YENİ EKLENDİ
  resetFollowStates, // YENİ EKLENDİ
  setEmailVerified,
  resetAuthState,
} = authSlice.actions;

// Reducer export
export default authSlice.reducer;