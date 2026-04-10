import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface AuthUser {
  id?: number;
  username?: string;
  email?: string;
  // add more fields if your API returns them
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuth: boolean;
  isLeft: "left" | "right";
}

/* ===================== INITIAL STATE ===================== */

const initialState: AuthState = {
  user: null,
  token: null,
  isAuth: false,
  isLeft: "right",
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    register: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isLeft = "left";
    },
    login: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.isAuth = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
    },
  },
});

export const { register, login, logout } = authSlice.actions;
export default authSlice.reducer;
