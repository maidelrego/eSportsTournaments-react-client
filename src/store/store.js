import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { tourneySlice } from "./tourney/tourneySlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    tourney: tourneySlice.reducer,
  },
});
