import { create } from "zustand";
import axiosInstance from "../config/axiosInstance";

const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem("auth"),
  authToken: localStorage.getItem("auth") || null,
  user: null,
  userId: null,

  login: (token) => {
    localStorage.setItem("auth", token);
    set({ authToken: token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("auth");
    set({ user: null, userId: null, authToken: null, isAuthenticated: false });
  },

  setAdmin: (userData) =>
    set({ user: userData, userId: userData?._id || null }),

  fetchAdmin: async () => {
    const token = localStorage.getItem("auth");
    if (!token) return;

    try {
      const response = await axiosInstance.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        user: response.data,
        userId: response.data?._id,
        isAuthenticated: true,
      });
    } catch (error) {
      // console.error("failed to get user details", error);
      set({ user: null, userId: null, isAuthenticated: false });
    }
  },
}));

if (localStorage.getItem("auth")) {
  useAuthStore.getState().fetchAdmin();
}

export default useAuthStore;
