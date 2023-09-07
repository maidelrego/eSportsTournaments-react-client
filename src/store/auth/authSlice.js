import { createSlice } from "@reduxjs/toolkit";
import { generateTemplateMessage } from "../../helper/templatesFactory";

export const authStatusName = {
  authenticated: "authenticated",
  not_authenticated: "no_authenticated",
  checking: "checking",
};

export const notificationsStatus = {
  friend_request :'friend_request',
  tournament_request : 'tournament_request',
  invitation_tournament : 'invitation_tournament',
};

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    authStatus: authStatusName.checking,
    user: {},
    friends: [],
    myTournaments: [],
    myNotifications:[],
    pendingFriendRequests:[],
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
      const notifications = payload.map(notification => ({
        meta: notification.meta,
        id: notification.id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        message: generateTemplateMessage(notification.type, {senderName: notification.sender.fullName})
      }));
      
      state.myNotifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    onSetNewNotification : (state, { payload }) => {
      const notification = {
        meta: payload.meta,
        id: payload.id,
        type: payload.type,
        read: payload.read,
        createdAt: payload.createdAt,
        message: generateTemplateMessage(payload.type, {senderName: payload.sender.fullName})
      }
      
      state.myNotifications = [notification, ...state.myNotifications]
    },
    onSetPendingFriendRequests : (state, { payload }) => {
      state.pendingFriendRequests = payload
    }
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
  onSetNewNotification,
  onSetPendingFriendRequests,
  onSetNotifications } = authSlice.actions;
