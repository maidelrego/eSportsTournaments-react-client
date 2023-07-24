

import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loading: false,
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSuccessToast: (state,{ payload }) => {
      toast.success(payload, {
        position: toast.POSITION.TOP_RIGHT
      });
    },
    setErrorToast: (state,{ payload }) => {
      toast.error(payload, {
        position: toast.POSITION.TOP_RIGHT
      });
    },
  },
});
// Action creators are generated for each case reducer function
export const { setLoading,setSuccessToast,setErrorToast } = uiSlice.actions;
