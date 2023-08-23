

import { createSlice } from "@reduxjs/toolkit";
import toast from 'react-hot-toast';
import { Button } from "primereact/button";

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
      toast.success(payload)
    },
    setErrorToast: (state,{ payload }) => {
      toast.error(payload)
    },
    setOnlineActivity: (state,{ payload }) => {
      toast((t) => (
        <>
          <div className="flex flex-wrap flex-row align-items-center justify-content-between">
            <img src='https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png' alt="logo" height="40" className="mr-3 logo" />
            <div>
              <span className="block text-900 mr-3">{payload}</span>
            </div>
            <Button icon="pi pi-times" onClick={() => toast.dismiss(t.id)} className="p-button-text p-button-rounded p-button-plain p-mx-2" />
          </div>
        </>
      ));
    },
  },
});
// Action creators are generated for each case reducer function
export const { setLoading, setSuccessToast, setErrorToast, setOnlineActivity } = uiSlice.actions;
