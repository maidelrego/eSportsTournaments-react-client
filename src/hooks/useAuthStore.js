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

export const useAuthStore = () => {
  const { authStatus, user, myTournaments } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();

  const startLogin = async ({ email, password }) => {
    dispatch(onChenking());
    await doAPIPost("auth/login", { email, password }).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
      } else {
        dispatch(onLogout(res.message));
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
  };
};
