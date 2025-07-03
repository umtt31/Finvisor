import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./login-register/LoginRegisterReducers";
import postReducer from "./post/postReducers";
import commentReducer from "./comment/commentReducers"; // Yeni eklendi
import stockReducer from "./stock/stockReducers"; // Stock reducer eklendi

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    comments: commentReducer, // Comments reducer eklendi
    stock: stockReducer,     // Stocks reducer eklendi
  },
});