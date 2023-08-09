import { useDispatch, useSelector } from "react-redux";
import { doAPIGet, doAPIPost } from "../services/api";
import {
  onChenking,
  onLogin,
  onLogout,
  onSetMyTournaments,
} from "../store/auth/authSlice";
import {
  setErrorToast,
  setLoading,
} from "../store/ui/uiSlice";
import { useNavigate } from "react-router-dom";
import { singInWithGoogle } from "../firebase/providers";

export const useAuthStore = () => {
  const { authStatus, user, myTournaments } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const navigate  = useNavigate();

  const startLogin = async ({ email, password }) => {
    dispatch(onChenking());
    await doAPIPost("auth/login", { email, password }).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
      } else {
        dispatch(setLoading(false));
        dispatch(onLogout(res.data.message));
        dispatch(setErrorToast(res.data.message));
      }
    });
  };

  const startRegister = async ({ email, password, fullName }) => {
    dispatch(setLoading(true));
    await doAPIPost("auth/register", { email, password, fullName }).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        navigate('/login');
      } else {
        dispatch(setLoading(false));
        dispatch(onLogout(res.message));
        dispatch(setErrorToast("Something went wrong, check logs"));
      }
    });
  };


  const startCheckAuthToken = async () => {
    const token = localStorage.getItem("tourneyForgeToken");
    if (!token) return dispatch(onLogout());

    await doAPIGet("auth/check-auth-status").then((res) => {
      if (res.status === 200) {
        const { token, ...user } = res.data;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
      } else {
        localStorage.clear();
        dispatch(onLogout(res.message));
      }
    });
  };

  const startGetMyTournaments = async () => {
    dispatch(setLoading(true));
    doAPIGet("tournaments/byAdminId").then((res) => {
      if (res.status === 200) {
        dispatch(onSetMyTournaments(res.data));
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast("Something went wrong, check logs"));
      }
    });
  };

  const startRegisterGoogle = async () => {
   
    dispatch(onChenking());
    const result = await singInWithGoogle();
    if( !result.ok ) return  dispatch(onLogout("Register error action"));

    const payload = {
      email: result.email,
      fullName: result.displayName,
      googleId: result.uid
    }
   
    await doAPIPost("auth/register-google", payload).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        dispatch(onLogout(res.message));
        dispatch(setErrorToast("Something went wrong, check logs"));
      }
    });
  }
  const startLoginGoogle = async () => {
    dispatch(onChenking());
    const result = await singInWithGoogle();
    console.log(result);
    if( !result.ok ) return  dispatch(onLogout("Register error action"));

    const payload = {
      email: result.email,
      googleId: result.uid
    }
   
    await doAPIPost("auth/login-google", payload).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        dispatch(onLogout(res.data.message));
        dispatch(setErrorToast(res.data.message));
      }
    });
  }

  return {
    //properties
    authStatus,
    user,
    myTournaments,

    //methods
    startLogin,
    dispatch,
    startCheckAuthToken,
    startGetMyTournaments,
    startRegister,
    startRegisterGoogle,
    startLoginGoogle
  };
};
