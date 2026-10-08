import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../services/supabase";
import { mapProfile, mapNotification } from "../services/mappers";
import { store } from "../store/store";
import {
  onChenking,
  onLogin,
  onLogout,
  onSetMyTournaments,
  onSetFriends,
  onSetFriendsOnline,
  onSetNotifications,
  onSetNotificationsAfterDelete,
  onSetNotificationsAfterRead,
  onSetNewNotification,
  onSetPendingFriendRequests,
} from "../store/auth/authSlice";

import { useUIStore } from "./useUIStore";

import { useNavigate } from "react-router-dom";

const AVATARS_BUCKET = "avatars";

// Realtime state lives outside React so it survives re-renders.
let notificationsChannel = null;
let presenceChannel = null;
let onlineIds = [];
let authListenerRegistered = false;

const notificationSelect = "*, sender:profiles!sender_id(*)";

const loadUserBundle = async (authUser) => {
  const [profileRes, friendsRes, notificationsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", authUser.id).single(),
    supabase
      .from("friendships")
      .select("friend:profiles!friend_id(*)")
      .eq("user_id", authUser.id),
    supabase
      .from("notifications")
      .select(notificationSelect)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (profileRes.error) throw profileRes.error;

  const friends = (friendsRes.data ?? []).map((row) => mapProfile(row.friend));
  const notifications = (notificationsRes.data ?? []).map(mapNotification);

  return {
    user: { ...mapProfile(profileRes.data), email: authUser.email, friends },
    notifications,
  };
};

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

  const applyBundle = ({ user: loadedUser, notifications }) => {
    dispatch(onLogin(loadedUser));
    dispatch(onSetNotifications(notifications));
  };

  const startLogin = async ({ email, password }) => {
    dispatch(onChenking());
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      startLoading(false);
      dispatch(onLogout(error.message));
      return startErrorToast(error.message);
    }

    try {
      applyBundle(await loadUserBundle(data.user));
    } catch (err) {
      await supabase.auth.signOut();
      dispatch(onLogout(err.message));
      startErrorToast(err.message);
    }
  };

  const startRegister = async ({ email, password, fullName }) => {
    startLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    startLoading(false);

    if (error) {
      dispatch(onLogout(error.message));
      return startErrorToast(error.message);
    }

    // Supabase hides duplicate emails when "Confirm email" is on: the fake user has no identities.
    if (data.user && data.user.identities?.length === 0) {
      return startErrorToast("This email is already registered");
    }

    if (data.session) {
      try {
        applyBundle(await loadUserBundle(data.user));
        startSuccessToast("Welcome to TourneyForge!");
      } catch (err) {
        startErrorToast(err.message);
      }
      return;
    }

    startSuccessToast("Check your email to confirm your account");
    navigate("/login");
  };

  const registerAuthListener = () => {
    if (authListenerRegistered) return;
    authListenerRegistered = true;
    // Keep this callback synchronous: no supabase calls inside onAuthStateChange.
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        dispatch(onLogout());
      }
    });
  };

  const startCheckAuthToken = async () => {
    registerAuthListener();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return dispatch(onLogout());

    try {
      applyBundle(await loadUserBundle(session.user));
    } catch (err) {
      await supabase.auth.signOut();
      dispatch(onLogout(err.message));
    }
  };

  const startLogout = async () => {
    await startDisconnectToGeneral();
    await supabase.auth.signOut();
    dispatch(onLogout());
  };

  const startGetMyTournaments = async () => {
    startLoading(true);
    const { data, error } = await supabase.rpc("get_my_tournaments");
    startLoading(false);
    if (error) return startErrorToast(error.message);
    dispatch(onSetMyTournaments(data));
  };

  const startLoginGoogle = async () => {
    dispatch(onChenking());
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      dispatch(onLogout(error.message));
      startErrorToast(error.message);
    }
  };

  const startForgotPassword = async ({ email }) => {
    startLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    startLoading(false);

    if (error) return startErrorToast(error.message);
    startSuccessToast(
      "If the email is correct, you will receive an email with the instructions to reset your password"
    );
  };

  const startResetPassword = async ({ password }) => {
    startLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      startLoading(false);
      return startErrorToast(
        error.message === "Auth session missing!"
          ? "This reset link is invalid or expired. Request a new one."
          : error.message
      );
    }
    await supabase.auth.signOut();
    dispatch(onLogout());
    startLoading(false);
    startSuccessToast("Password changed successfully");
    navigate("/login");
  };

  // ---- Realtime: notifications + online friends (replaces the Socket.IO gateway) ----

  const dispatchOnlineFriends = () => {
    dispatch(onSetFriendsOnline(onlineIds.map((id) => ({ id }))));
  };

  const startDisconnectToGeneral = async () => {
    const channels = [notificationsChannel, presenceChannel].filter(Boolean);
    notificationsChannel = null;
    presenceChannel = null;
    onlineIds = [];
    await Promise.all(channels.map((channel) => supabase.removeChannel(channel)));
  };

  const startConnectToGeneral = async () => {
    if (!user?.id) return;
    await startDisconnectToGeneral();

    notificationsChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiver_id=eq.${user.id}`,
        },
        async ({ new: row }) => {
          const { data } = await supabase
            .from("notifications")
            .select(notificationSelect)
            .eq("id", row.id)
            .single();
          if (!data) return;
          const notification = mapNotification(data);
          startFriendRequestToast(notification);
          dispatch(onSetNewNotification(notification));
        }
      )
      .subscribe();

    // Presence only carries the user id (the channel key); names come from the friends list.
    presenceChannel = supabase.channel("general", {
      config: { private: true, presence: { key: user.id } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        onlineIds = Object.keys(presenceChannel.presenceState());
        dispatchOnlineFriends();
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key === user.id) return;
        const friend = store.getState().auth.friends?.find((f) => f.id === key);
        if (friend) startOnlineActivity({ fullName: friend.fullName });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });
  };

  const refreshFriends = async () => {
    const { data, error } = await supabase
      .from("friendships")
      .select("friend:profiles!friend_id(*)")
      .eq("user_id", user.id);
    if (error) return;
    dispatch(onSetFriends(data.map((row) => mapProfile(row.friend))));
    dispatchOnlineFriends();
  };

  const startGetConnectedClients = async () => {
    await refreshFriends();
  };

  // ---- Profile ----

  const startUpdateProfile = async ({ fullName }) => {
    startLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)
      .select()
      .single();
    startLoading(false);

    if (error) return startErrorToast(error.message);
    startSuccessToast("Profile updated successfully");
    dispatch(onLogin({ ...user, ...mapProfile(data), friends }));
  };

  const imageUpload = async (image) => {
    startLoading(true);
    const extension = (image.type.split("/")[1] || "png").replace("jpeg", "jpg");
    const path = `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, image, { contentType: image.type });
    if (uploadError) {
      startLoading(false);
      return startErrorToast(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id)
      .select()
      .single();
    startLoading(false);

    if (error) return startErrorToast(error.message);

    // Remove the previous avatar if it was one of ours.
    const marker = `/${AVATARS_BUCKET}/`;
    if (user.avatar?.includes(marker)) {
      const oldPath = user.avatar.split(marker)[1];
      await supabase.storage.from(AVATARS_BUCKET).remove([oldPath]);
    }

    startSuccessToast("Profile updated successfully");
    dispatch(onLogin({ ...user, ...mapProfile(data), friends }));
  };

  // ---- Notifications and friends ----

  const startMarkNotificationAsRead = async (id) => {
    startLoading(true);
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    startLoading(false);

    if (error) return startErrorToast(error.message);
    startSuccessToast("Notification marked as read");
    dispatch(onSetNotificationsAfterRead(id));
  };

  const startDeleteNotifications = async (id, dontNotify = false) => {
    startLoading(true);
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    startLoading(false);

    if (error) return startErrorToast(error.message);
    if (!dontNotify) startSuccessToast("Notification deleted");
    dispatch(onSetNotificationsAfterDelete(id));
  };

  const startSendGenericRequest = async (receiver) => {
    const state = { status: "", msg: "" };

    startLoading(true);
    const { data, error } = await supabase.rpc("send_friend_request", {
      p_nickname: receiver,
    });
    startLoading(false);

    if (error) {
      state.status = "error";
      state.msg = error.message;
    } else {
      state.status = data.ok ? "success" : "error";
      state.msg = data.msg;
    }
    return state;
  };

  const startGetPendingFriendRequests = async () => {
    startLoading(true);
    const { data, error } = await supabase
      .from("friend_requests")
      .select("id, receiver:profiles!receiver_id(*)")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });
    startLoading(false);

    if (error) return startErrorToast(error.message);
    dispatch(
      onSetPendingFriendRequests(
        data.map((row) => ({ id: row.id, receiver: mapProfile(row.receiver) }))
      )
    );
  };

  const startDeletePendingFriendRequest = async (id) => {
    startLoading(true);
    const { error } = await supabase.from("friend_requests").delete().eq("id", id);
    startLoading(false);

    if (error) return startErrorToast(error.message);
    startSuccessToast("Friend request deleted");
  };

  const startAcceptFriendRequest = async (id, notificationId) => {
    startLoading(true);
    const { error } = await supabase.rpc("accept_friend_request", {
      p_request_id: id,
    });
    startLoading(false);

    if (error) return startErrorToast(error.message);
    startSuccessToast("Friend request accepted");
    // The RPC already removed the request and its notification.
    dispatch(onSetNotificationsAfterDelete(notificationId));
    await refreshFriends();
  };

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
    startLogout,
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
    startAcceptFriendRequest,
  };
};
