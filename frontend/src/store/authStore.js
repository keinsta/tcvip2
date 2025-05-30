import { create } from "zustand";
import axiosInstance from "../config/axiosInstance";

const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem("authToken"),
  authToken: localStorage.getItem("authToken") || null,
  user: null,
  userId: null, // Store extracted user ID

  login: async (token) => {
    localStorage.setItem("authToken", token);
    set({ authToken: token, isAuthenticated: true });

    // Fetch and store user details
    await useAuthStore.getState().fetchUser();
  },

  logout: () => {
    localStorage.removeItem("authToken");
    set({ authToken: null, user: null, userId: null, isAuthenticated: false });
  },

  setUser: (userData) => set({ user: userData, userId: userData?._id || null }),

  fetchUser: async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await axiosInstance.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        user: response.data,
        userId: response.data._id || null, // Extract and store user ID
      });
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      set({ user: null, userId: null, isAuthenticated: false });
    }
  },
}));

// Fetch user details when the app starts if the auth token exists
if (localStorage.getItem("authToken")) {
  useAuthStore.getState().fetchUser();
}

export default useAuthStore;
