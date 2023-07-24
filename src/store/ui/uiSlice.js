

import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loading: false,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
});
// Action creators are generated for each case reducer function
export const { setLoading } = uiSlice.actions;
