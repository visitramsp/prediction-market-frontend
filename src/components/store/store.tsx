"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice from "./slice/auth";
import categorySlice from "./slice/category";
import watchListSlice from "./slice/watchList";
import reelsSlice from "./slice/reels";
import chatSlice from "./slice/chat";

const rootReducer = combineReducers({
  user: authSlice,
  category: categorySlice,
  watchlist: watchListSlice,
  reels: reelsSlice,
  chat: chatSlice,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // slices you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false, // required by redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
