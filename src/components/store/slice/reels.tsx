"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReelItem } from "@/utils/typesInterface";

export interface ReelsState {
  reels: ReelItem[];
  currentIndex: number;
  hasMore: boolean;
  page: number;
  isLoading: boolean;
}

const initialState: ReelsState = {
  reels: [],
  currentIndex: 0,
  hasMore: true,
  page: 1,
  isLoading: false,
};

const reelsSlice = createSlice({
  name: "reels",
  initialState,
  reducers: {
    setReels: (state, action: PayloadAction<ReelItem[]>) => {
      state.reels = action.payload;
    },
    appendReels: (state, action: PayloadAction<ReelItem[]>) => {
      // avoid duplicates
      const ids = new Set(state.reels.map((r) => r.id));
      const newReels = action.payload.filter((r) => !ids.has(r.id));
      state.reels = [...state.reels, ...newReels];
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateReelLike: (
      state,
      action: PayloadAction<{ reelId: number; liked: boolean; likeCount: number }>
    ) => {
      const reel = state.reels.find((r) => r.id === action.payload.reelId);
      if (reel) {
        reel.isLiked = action.payload.liked ? 1 : 0;
        reel.likeCount = action.payload.likeCount;
      }
    },
    updateReelBookmark: (
      state,
      action: PayloadAction<{
        reelId: number;
        bookmarked: boolean;
        bookmarkCount: number;
      }>
    ) => {
      const reel = state.reels.find((r) => r.id === action.payload.reelId);
      if (reel) {
        reel.isBookmarked = action.payload.bookmarked ? 1 : 0;
        reel.bookmarkCount = action.payload.bookmarkCount;
      }
    },
    incrementCommentCount: (state, action: PayloadAction<number>) => {
      const reel = state.reels.find((r) => r.id === action.payload);
      if (reel) reel.commentCount += 1;
    },
    decrementCommentCount: (state, action: PayloadAction<number>) => {
      const reel = state.reels.find((r) => r.id === action.payload);
      if (reel && reel.commentCount > 0) reel.commentCount -= 1;
    },
    removeReel: (state, action: PayloadAction<number>) => {
      state.reels = state.reels.filter((r) => r.id !== action.payload);
    },
    resetReels: () => initialState,
  },
});

export const {
  setReels,
  appendReels,
  setCurrentIndex,
  setHasMore,
  setPage,
  setLoading,
  updateReelLike,
  updateReelBookmark,
  incrementCommentCount,
  decrementCommentCount,
  removeReel,
  resetReels,
} = reelsSlice.actions;
export default reelsSlice.reducer;
