import { createSlice } from "@reduxjs/toolkit";

const watchListSlice = createSlice({
  name: "watchlist",
  initialState: {
    watchlist: [],
    questionList: [],
  },
  reducers: {
    saveQuestion: (state, action) => {
      const { newData, newOffset } = action.payload;
      if (newOffset === 0) {
        state.questionList = newData;
      } else {
        const combined = [...state.questionList, ...newData];
        // Unique ID filter logic
        state.questionList = combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        );
      }
    },

    saveWatchList: (state, action) => {
      state.watchlist = action.payload;
    },

    addWatchList: (state, action) => {
      const itemToAdd = action.payload;
      const exists = state.watchlist.find((item) => item.id === itemToAdd.id);

      if (!exists) {
        // 1. Watchlist mein add karein
        state.watchlist = [itemToAdd, ...state.watchlist];

        // 2. QuestionList mein isBookmark ko true karein (ID ke base par)
        const questionIndex = state.questionList.findIndex(
          (q) => q.id === itemToAdd.id,
        );
        if (questionIndex !== -1) {
          state.questionList[questionIndex].isBookmark = true;
        }
      }
    },

    removeWatchList: (state, action) => {
      const idToRemove = action.payload;

      // 1. Watchlist se remove karein
      state.watchlist = state.watchlist.filter(
        (item) => item.id !== idToRemove,
      );

      // 2. QuestionList mein isBookmark ko false karein (ID ke base par)
      const questionIndex = state.questionList.findIndex(
        (q) => q.id === idToRemove,
      );
      if (questionIndex !== -1) {
        state.questionList[questionIndex].isBookmark = false;
      }
    },
  },
});

export const { saveWatchList, removeWatchList, addWatchList, saveQuestion } =
  watchListSlice.actions;
export default watchListSlice.reducer;
