import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "./config";

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  headers: {
    // ✅ FIX: Default Content-Type'ı kaldır, sadece Accept bırak
    "Accept": "application/json",
  },
  timeout: 300000, // 30 saniye timeout
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (__DEV__) {
          console.log(`🔑 Token added to request: ${token.substring(0, 20)}...`);
        }
      } else {
        if (__DEV__) {
          console.log(`❌ No token found for request: ${config.method?.toUpperCase()} ${config.url}`);
        }
      }

      // ✅ FIX: FormData kontrolü ve Content-Type ayarlama
      if (config.data instanceof FormData) {
        // FormData için Content-Type'ı TAMAMEN kaldır, axios otomatik boundary eklesin
        delete config.headers['Content-Type'];
        if (__DEV__) {
          console.log('📎 FormData detected, completely removing Content-Type for auto boundary');
        }
      } else if (!config.headers['Content-Type']) {
        // Normal request'ler için JSON Content-Type
        config.headers['Content-Type'] = 'application/json';
      }

      if (__DEV__) {
        console.log(`🔄 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        console.log(`🔧 Request headers:`, {
          'Content-Type': config.headers['Content-Type'] || 'AUTO (FormData)',
          'Accept': config.headers['Accept'],
          'Authorization': config.headers.Authorization ? 'Bearer ***' : 'Not set'
        });
      }

      return config;
    } catch (error) {
      console.error("❌ Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ Response: ${response.status} from ${response.config.url}`);

      // Özel endpoint'ler için detaylı log
      if (response.config.url?.includes('/posts')) {
        console.log(`📊 Posts response status: ${response.status}`);
        console.log(`📄 Posts response data:`, response.data);
      }

      if (response.config.url?.includes('/auth/')) {
        console.log(`🔐 Auth response:`, {
          status: response.status,
          hasToken: !!(response.data?.token),
          hasUser: !!(response.data?.user),
          endpoint: response.config.url
        });
      }
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error("❌ Response Error:", error.message);

      if (error.response) {
        console.log(`❌ Error status: ${error.response.status}`);
        console.log(`❌ Error response:`, error.response.data);

        // 401 özel durumu için detaylı log
        if (error.response.status === 401) {
          console.log(`🚫 Unauthorized request to: ${error.config?.url}`);
          console.log(`🔍 Request had Authorization header: ${!!error.config?.headers?.Authorization}`);
        }
      }
    }

    // 401 durumunda token'ı temizle
    if (error.response?.status === 401) {
      console.log(`🗑️ Removing token due to 401 error`);
      await AsyncStorage.removeItem("auth_token");
    }

    return Promise.reject(error);
  }
);

export default apiClient;