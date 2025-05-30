import { create } from "zustand";
import axiosInstance from "../config/axiosInstance";
import useAuthStore from "./authStore"; // Import auth store to get userId

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  // Fetch all notifications for the logged-in user
  fetchNotifications: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    try {
      const response = await axiosInstance.get(
        `/notify/get-notifications?userId=${userId}`
      );
      const notifications = response.data.notifications || [];

      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length, // Count unread notifications
      });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ notifications: [], unreadCount: 0 });
    }
  },

  // Mark a single notification as read
  markAsRead: async (notificationId) => {
    try {
      await axiosInstance.patch(`/notify/mark-as-read/${notificationId}`);

      set((state) => {
        const updatedNotifications = state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );

        return {
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
        };
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const { userId } = useAuthStore.getState();
      await axiosInstance.patch(`/notify/mark-all-read`, { userId });

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },
}));

// Auto-fetch notifications when user logs in
useAuthStore.subscribe((state) => {
  if (state.userId) {
    useNotificationStore.getState().fetchNotifications();
  }
});

export default useNotificationStore;
