import {
  setLoading,
  onSetNotificationsSidebar,
  onSetProfileSidebar,
} from "../store/ui/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { generateTemplateMessage } from "../helper/templatesFactory";

export const useUIStore = () => {
  const dispatch = useDispatch();

  const { loading, notificationsSidebar, profileSidebar } = useSelector(
    (state) => state.ui
  );

  const startLoading = (value) => {
    dispatch(setLoading(value));
  };

  const startErrorToast = (message) => {
    toast.error(message);
  };

  const startSuccessToast = (message) => {
    toast.success(message);
  };

  const startOnlineActivity = (payload) => {
    const msg = generateTemplateMessage('online_activity', {senderName: payload.fullName})
    toast(msg, {
      icon: '🤝',
    });
  };

  const startFriendRequestToast = (payload) => {
    const { sender } = payload;
    const msg = generateTemplateMessage(payload.type, {senderName: sender.fullName})
    toast.success(msg);
  };

  const toggleNotificationsSidebar = (value) => {
    dispatch(onSetNotificationsSidebar(value));
  };
  const startProfileSidebar = (value) => {
    dispatch(onSetProfileSidebar(value));
  };

  return {
    loading,
    notificationsSidebar,
    profileSidebar,
    dispatch,
    startLoading,
    startErrorToast,
    startSuccessToast,
    startOnlineActivity,
    startFriendRequestToast,
    toggleNotificationsSidebar,
    startProfileSidebar,
  };
};
