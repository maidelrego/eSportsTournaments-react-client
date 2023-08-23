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
    friends: [],
    myTournaments: [],
    errorMessage: "",
  },
  reducers: {
    onLogin: (state, { payload }) => {
      state.authStatus = authStatusName.authenticated;
      state.user = payload;
      state.friends = payload.friends;
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
    },
    onSetFriendsOnline : (state, { payload }) => {
      console.log(payload);
      const updatedFriends = state.friends.map(friend => ({
        ...friend,
        online: payload.some(connectedUser => connectedUser.id === friend.id)
      }));
    
      return {
        ...state,
        friends: updatedFriends
      };
    }
  },
});
// Action creators are generated for each case reducer function
export const { onLogin, onChenking, onLogout, onSetMyTournaments, onSetFriendsOnline } = authSlice.actions;
