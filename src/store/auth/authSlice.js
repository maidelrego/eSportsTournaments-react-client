
import { createSlice } from '@reduxjs/toolkit';

export const authStatusName = {
  authenticated: 'authenticated',
  not_authenticated: 'no_authenticated',
  checking: 'checking'
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        authStatus: authStatusName.not_authenticated,
        user: {},
        errorMessage: ''
    },
    reducers: {
        onLogin: (state, { payload } ) => {
           state.authStatus = authStatusName.authenticated;
           state.user = payload;
           state.errorMessage = null;
        },
        onLogout: (state, { payload } ) => {
           state.authStatus = authStatusName.not_authenticated;
           state.user = {};
           state.errorMessage = payload;
        },
        // onChenking: (state, { payload } ) => {
        //    state.authStatus = authStatusName.checking;

        // },
    }
});
// Action creators are generated for each case reducer function
export const { 
    onLogin,
    onChenking,
    onLogout
 } = authSlice.actions;