import { createSlice } from "@reduxjs/toolkit";

export const authStatusName = {
  authenticated: "authenticated",
  not_authenticated: "no_authenticated",
  checking: "checking",
};

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    authStatus: authStatusName.checking,
    user: {},
    myTournaments: [],
    errorMessage: "",
  },
  reducers: {
    onLogin: (state, { payload }) => {
      state.authStatus = authStatusName.authenticated;
      state.user = payload;
      state.errorMessage = null;
    },
    onLogout: (state, { payload }) => {
      state.authStatus = authStatusName.not_authenticated;
      state.user = {};
      state.errorMessage = payload;
    },
    onChenking: (state) => { 
      state.authStatus = authStatusName.checking;
      state.user = {};
      state.errorMessage = null;
      state.myTournaments = [];
    },
    onSetMyTournaments: (state, { payload }) => {
      state.myTournaments = payload;
    }
  },
});
// Action creators are generated for each case reducer function
export const { onLogin, onChenking, onLogout, onSetMyTournaments } = authSlice.actions;
