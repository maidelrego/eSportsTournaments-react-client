import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loading: false,
    notificationsSidebar: false,
    profileSidebar: false,
  },
  reducers: {
    onSetNotificationsSidebar: (state, action) => {
      state.notificationsSidebar = action.payload;
    },
    onSetProfileSidebar: (state, action) => {
      state.profileSidebar = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});
// Action creators are generated for each case reducer function
export const {
  setLoading,
  setSuccessToast,
  setErrorToast,
  setOnlineActivity,
  friendRequestToast,
  onSetNotificationsSidebar,
  onSetProfileSidebar,
} = uiSlice.actions;
