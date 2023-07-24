import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { tourneySlice } from "./tourney/tourneySlice";
import { uiSlice } from "./ui/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    tourney: tourneySlice.reducer,
    ui: uiSlice.reducer,
  },
});
