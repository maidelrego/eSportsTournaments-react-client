import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
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
    setSuccessToast: (state, { payload }) => {
      toast.success(payload);
    },
    setErrorToast: (state, { payload }) => {
      toast.error(payload);
    },
    friendRequestToast: (state, { payload }) => {
      const { fullName, avatar } = payload.sender;


      toast((t) => (
        <>
          <div className="flex align-items-start flex-1 align-self-center mr-3">
            <img
              src={avatar}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "1px solid #35b2b2",
              }}
            />
            <div className="ml-3">
              <span className="text-xl font-medium text-900">{fullName}</span>
              <p className="text-600 mt-2 mb-3">
                  Send you a friend resquest
              </p>
              <button
                aria-label="Let's see"
                className="p-button p-component p-button-text p-2 mr-3"
              >
                <span className="p-button-label p-c">Accept</span>
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-button p-component p-button-text text-500 p-2"
              >
                <span className="p-button-label p-c">Declined</span>
              </button>
            </div>
          </div>
          <div>
            <Button icon="pi pi-times" onClick={() => toast.dismiss(t.id)} className="p-button-text p-button-rounded p-button-plain p-mx-2" />
          </div>
        </>
      ));
    },
    setOnlineActivity: (state, { payload }) => {
      const { fullName, avatar } = payload;
      toast((t) => (
        <>
          <div className="flex flex-wrap flex-row align-items-center justify-content-between">
            <img src={avatar}  
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid #35b2b2",
                marginRight: "10px",
              }} />
            <div>
              <span className="block text-900 mr-3">
                {fullName} is now online!
              </span>
            </div>
            <Button
              icon="pi pi-times"
              onClick={() => toast.dismiss(t.id)}
              className="p-button-text p-button-rounded p-button-plain p-mx-2"
            />
          </div>
        </>
      ));
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
} = uiSlice.actions;
