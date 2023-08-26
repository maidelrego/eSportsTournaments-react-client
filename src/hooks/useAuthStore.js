import { useDispatch, useSelector } from "react-redux";
import { doAPIGet, doAPIPost, doAPIPut, doAPIDelete } from "../services/api";
import {
  onChenking,
  onLogin,
  onLogout,
  onSetMyTournaments,
  onSetFriendsOnline,
  onSetNotifications,
  onSetNotificationsAfterDelete,
  onSetNotificationsAfterRead,
  onSetNewNotification
} from "../store/auth/authSlice";
import {
  setErrorToast,
  setSuccessToast,
  setLoading,
  setOnlineActivity,
  friendRequestToast
} from "../store/ui/uiSlice";
import { useNavigate } from "react-router-dom";
import { singInWithGoogle } from "../firebase/providers";
import { Manager, Socket } from "socket.io-client";
let socket = Socket;

export const useAuthStore = () => {
  const { authStatus, user, myTournaments, friends, myNotifications } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const startLogin = async ({ email, password }) => {
    dispatch(onChenking());
    await doAPIPost("auth/login", { email, password }).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
        dispatch(onSetNotifications(user.receivedNotifications))
      } else {
        dispatch(setLoading(false));
        dispatch(onLogout(res.data.message));
        dispatch(setErrorToast(res.data.message));
      }
    });
  };

  const startRegister = async ({ email, password, fullName }) => {
    dispatch(setLoading(true));
    await doAPIPost("auth/register", { email, password, fullName }).then(
      (res) => {
        if (res.status === 201) {
          dispatch(setLoading(false));
          navigate("/login");
        } else {
          dispatch(setLoading(false));
          dispatch(onLogout(res.data.message));
          dispatch(setErrorToast(res.data.message));
        }
      }
    );
  };

  const startCheckAuthToken = async () => {
    const token = localStorage.getItem("tourneyForgeToken");
    if (!token) return dispatch(onLogout());

    await doAPIGet("auth/check-auth-status").then((res) => {
      if (res.status === 200) {
        const { token, ...user } = res.data;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
        dispatch(onSetNotifications(user.receivedNotifications))
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

  const startLoginGoogle = async () => {
    dispatch(onChenking());
    const result = await singInWithGoogle();
    if (!result.ok) return dispatch(onLogout("Register error action"));
    const payload = {
      email: result.email,
      fullName: result.displayName,
      googleId: result.uid,
      avatar: result.photoURL,
    };

    await doAPIPost("auth/login-google", payload).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
        dispatch(onSetNotifications(user.receivedNotifications))
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        dispatch(onLogout(res.data.message));
        dispatch(setErrorToast(res.data.message));
      }
    });
  };

  const startForgotPassword = async (data) => {
    const { email } = data;
    dispatch(setLoading(true));
    await doAPIPost("auth/forgot-password", { email }).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast(res.data.message));
      } else {
        dispatch(setLoading(false));
        dispatch(
          setSuccessToast(
            "If the email is correct, you will receive an email with the instructions to reset your password"
          )
        );
      }
    });
  };

  const startResetPassword = async (data) => {
    const { password, token } = data;
    dispatch(setLoading(true));
    await doAPIPost("auth/reset-password", { token, password }).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast("Password changed successfully"));
        navigate("/login");
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
      }
    });
  };

  const startConnectToGeneral = async () => {
    let manager = null;
   
    manager = new Manager("http://localhost:3000/socket.io/socket.io.js", {
      extraHeaders: { auth: user.id },
    });
    
    socket = manager.socket("/general");

    socket.on("connectedClient", (payload) => {
      dispatch(setOnlineActivity(payload));
    });

    socket.on("disconnectedClient", () => {
    });

    socket.on("friend-request-notification", (payload) => {
      dispatch(friendRequestToast(payload));
      dispatch(onSetNewNotification(payload));
    });

    socket.on("connected-clients", (payload) => {
      dispatch(onSetFriendsOnline(payload));
    });
  };

  const startDisconnectToGeneral = async () => {
    socket.disconnect();
  };

  const startGetConnectedClients = async () => {
    socket.emit("get-connected-clients");
  };

  const startUpdateProfile = async (data) => {
    const { id } = user;  

    dispatch(setLoading(true));
    await doAPIPost(`auth/update/${id}`, data).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast("Profile updated successfully"));
        dispatch(onLogin(res.data));
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
      }
    }); 
  }

  const imageUpload = async (image) => {
    const { id } = user;
    const form = new FormData();
    form.append("image", image);

    dispatch(setLoading(true));
    await doAPIPost(`auth/update/${id}`, form).then((res) => {
      if (res.status === 201) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast("Image uploaded successfully"));
        dispatch(onLogin(res.data));
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
      }
    }); 
  }

  const startMarkNotificationAsRead = async (id) => {
    dispatch(setLoading(true));
    await doAPIPut(`notifications/${id}`).then((res) => {
      if (res.status === 200) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast("Notification marked as read"));
        dispatch(onSetNotificationsAfterRead(id))
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
      }
    });
  }

  const startDeleteNotifications = async (id) => {
    dispatch(setLoading(true));
    await doAPIDelete(`notifications/${id}`).then((res) => {
      if (res.status === 200) {
        dispatch(setLoading(false));
        dispatch(setSuccessToast("Notification deleted"));
        dispatch(onSetNotificationsAfterDelete(id))
      } else {
        dispatch(setLoading(false));
        dispatch(setErrorToast(res.data.message));
      }
    });
  }

  const startSendGenericRequest = async (receiver,type) => {
    let state = {
      status: '',
      msg: ''
    };
    dispatch(setLoading(true));
    await doAPIPost('notifications',{receiver, type}).then((res) => {
      dispatch(setLoading(false));
      if (res.status === 201) {
        if(res.data.ok){
          state.status = 'success';
        }else{
          state.status = 'error';
        }
        state.msg = res.data.msg;
      } else {
        state.status = 'error';
        state.msg = res.data.message;
      }
    });
  
    return state;
  }

  return {
    //properties
    authStatus,
    user,
    myTournaments,
    friends,
    myNotifications,

    //methods
    startLogin,
    dispatch,
    startCheckAuthToken,
    startGetMyTournaments,
    startRegister,
    startLoginGoogle,
    startForgotPassword,
    startResetPassword,
    startConnectToGeneral,
    startDisconnectToGeneral,
    startGetConnectedClients,
    startUpdateProfile,
    imageUpload,
    startMarkNotificationAsRead,
    startDeleteNotifications,
    startSendGenericRequest
  };
};
