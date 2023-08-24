import { createSlice } from "@reduxjs/toolkit";
import { generateTemplateMessage } from "../../helper/templatesFactory";

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
    myNotifications:[],
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
      const updatedFriends = state.friends.map(friend => ({
        ...friend,
        online: payload.some(connectedUser => connectedUser.id === friend.id)
      }));
    
      return {
        ...state,
        friends: updatedFriends
      };
    },
    onSetNotifications : (state, { payload }) => {
      console.log(payload);
      const notifications = payload.map(notification => ({
        meta: notification.meta,
        id: notification.id,
        type: notification.type,
        read: notification.read,
        message: generateTemplateMessage(notification.type, {senderName: notification.sender.fullName})
      }));
      
      state.myNotifications = notifications
    },
    onSetNotificationsAfterRead : (state, { payload }) => {
      const notifications = state.myNotifications.map(notification => {
        if (notification.id === payload) {
          return {
            ...notification,
            read: true
          }
        }
        return notification;
      });
      
      state.myNotifications = notifications
    },
    onSetNotificationsAfterDelete : (state, { payload }) => {
      const notifications = state.myNotifications.filter(notification => notification.id !== payload);
      
      state.myNotifications = notifications
    },
  },
});
// Action creators are generated for each case reducer function
export const { 
  onLogin,
  onChenking, 
  onLogout, 
  onSetMyTournaments, 
  onSetFriendsOnline,
  onSetNotificationsAfterRead,
  onSetNotificationsAfterDelete,
  onSetNotifications } = authSlice.actions;
