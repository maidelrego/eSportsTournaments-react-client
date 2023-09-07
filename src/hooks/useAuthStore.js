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
  onSetNewNotification,
  onSetPendingFriendRequests,
} from "../store/auth/authSlice";

import { useUIStore } from "./useUIStore";

import { useNavigate } from "react-router-dom";
import { singInWithGoogle } from "../firebase/providers";
import { Manager, Socket } from "socket.io-client";
let socket = Socket;

export const useAuthStore = () => {
  const {
    authStatus,
    user,
    myTournaments,
    friends,
    myNotifications,
    pendingFriendRequests,
  } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    startLoading,
    startErrorToast,
    startSuccessToast,
    startOnlineActivity,
    startFriendRequestToast,
  } = useUIStore();

  const startLogin = async ({ email, password }) => {
    dispatch(onChenking());
    await doAPIPost("auth/login", { email, password }).then((res) => {
      if (res.status === 201) {
        const { token, ...user } = res.data;
        delete user.password;
        localStorage.setItem("tourneyForgeToken", token);
        dispatch(onLogin(user));
        dispatch(onSetNotifications(user.receivedNotifications));
      } else {
        startLoading(false);
        dispatch(onLogout(res.data.message));
        startErrorToast(res.data.message);
      }
    });
  };

  const startRegister = async ({ email, password, fullName }) => {
    startLoading(true);
    await doAPIPost("auth/register", { email, password, fullName }).then(
      (res) => {
        if (res.status === 201) {
          startLoading(false);
          navigate("/login");
        } else {
          startLoading(false);
          dispatch(onLogout(res.data.message));
          startErrorToast(res.data.message);
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
        dispatch(onSetNotifications(user.receivedNotifications));
      } else {
        localStorage.clear();
        dispatch(onLogout(res.message));
      }
    });
  };

  const startGetMyTournaments = async () => {
    startLoading(true);
    doAPIGet("tournaments/byAdminId").then((res) => {
      if (res.status === 200) {
        dispatch(onSetMyTournaments(res.data));
        startLoading(false);
      } else {
        startLoading(false);
        startErrorToast("Something went wrong, check logs");
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
        dispatch(onSetNotifications(user.receivedNotifications));
        startLoading(false);
      } else {
        startLoading(false);
        dispatch(onLogout(res.data.message));
        startErrorToast(res.data.message);
      }
    });
  };

  const startForgotPassword = async (data) => {
    const { email } = data;
    startLoading(true);
    await doAPIPost("auth/forgot-password", { email }).then((res) => {
      if (res.status === 201) {
        startLoading(false);
        startErrorToast(res.data.message);
      } else {
        startLoading(false);
        startSuccessToast(
          "If the email is correct, you will receive an email with the instructions to reset your password"
        );
      }
    });
  };

  const startResetPassword = async (data) => {
    const { password, token } = data;
    startLoading(true);
    await doAPIPost("auth/reset-password", { token, password }).then((res) => {
      if (res.status === 201) {
        startLoading(false);
        startSuccessToast("Password changed successfully")
        navigate("/login");
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
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
      startOnlineActivity(payload);
    });

    socket.on("disconnectedClient", () => {});

    socket.on("friend-request-notification", (payload) => {
      startFriendRequestToast(payload);
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
    startLoading(true);
    await doAPIPost(`auth/update/${id}`, data).then((res) => {
      if (res.status === 201) {
        startLoading(false);
        startSuccessToast("Profile updated successfully");
        dispatch(onLogin(res.data));
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
      }
    });
  };

  const imageUpload = async (image) => {
    const { id } = user;
    const form = new FormData();
    form.append("image", image);

    startLoading(true);
    await doAPIPost(`auth/update/${id}`, form).then((res) => {
      if (res.status === 201) {
        startLoading(false);
        startSuccessToast("Profile updated successfully");
        dispatch(onLogin(res.data));
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
      }
    });
  };

  const startMarkNotificationAsRead = async (id) => {
    startLoading(true);
    await doAPIPut(`notifications/${id}`).then((res) => {
      if (res.status === 200) {
        startLoading(false);
        startSuccessToast("Notification marked as read");
        dispatch(onSetNotificationsAfterRead(id));
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
      }
    });
  };

  const startDeleteNotifications = async (id, dontNotify = false) => {
    startLoading(true);
    await doAPIDelete(`notifications/${id}`).then((res) => {
      if (res.status === 200) {
        startLoading(false);
        if (!dontNotify) startSuccessToast("Notification deleted");
        dispatch(onSetNotificationsAfterDelete(id));
      } else {
        startLoading(false);
        startErrorToast(res.data.message);
      }
    });
  };

  const startSendGenericRequest = async (receiver, type) => {
    let state = {
      status: "",
      msg: "",
    };

    startLoading(true);
    await doAPIPost("notifications", { receiver, type }).then((res) => {
      startLoading(false);
      if (res.status === 201) {
        if (res.data.ok) {
          state.status = "success";
        } else {
          state.status = "error";
        }
        state.msg = res.data.msg;
      } else {
        state.status = "error";
        state.msg = res.data.message;
      }
    });
    return state;
  };

  const startGetPendingFriendRequests = async () => {
    startLoading(true);
    await doAPIGet("friends/pendingFriendRequests").then((res) => {
      startLoading(false);
      if (res.status === 200) {
        dispatch(onSetPendingFriendRequests(res.data));
      } else {
        startErrorToast(res.data.message);
      }
    });
  };

  const startDeletePendingFriendRequest = async (id) => {
    startLoading(true);
    await doAPIDelete(`friends/${id}`).then((res) => {
      startLoading(false);
      if (res.status === 200) {
        startSuccessToast('Friend request deleted');
        dispatch(onSetPendingFriendRequests(res.data));
      } else {
        startErrorToast(res.data.message);
      }
    });
  };

  const startAcceptFriendRequest = async (id, notificationId) => {
    startLoading(true);
    await doAPIPost(`friends/approve/${id}`).then((res) => {
      startLoading(false);
      if (res.status === 201) {
        startSuccessToast('Friend request accepted');
        startDeleteNotifications(notificationId, true);
      } else {
        startErrorToast(res.data.message);
      }
    });
  }

  return {
    //properties
    authStatus,
    user,
    myTournaments,
    friends,
    myNotifications,
    pendingFriendRequests,

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
    startSendGenericRequest,
    startGetPendingFriendRequests,
    startDeletePendingFriendRequest,
    startAcceptFriendRequest
  };
};
