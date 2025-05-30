import { create } from "zustand";
import axiosInstance from "../config/axiosInstance";
import useAuthStore from "./authStore";

const useParentChildStore = create((set) => ({
  loading: false,
  error: null,
  subOrdinatesStats: null,
  childrenStats: null,
  teamStats: null,
  childrenDetails: null,
  childrenDepositsTree: null,

  getChildrenStats: async (date) => {
    const { userId } = useAuthStore.getState();
    try {
      const res = await axiosInstance.get(
        `/agent/subordinate-stats/${userId}`,
        { params: { date } }
      );
      // console.log(res.data);
      set({ subOrdinatesStats: res.data, loading: false });
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch data",
        loading: false,
      });
    }
  },
  getTeamStats: async () => {
    const { userId } = useAuthStore.getState();
    try {
      const res = await axiosInstance.get(
        `/agent/subordinate-team-stats-daily/${userId}`
      );
      // console.log(res.data);
      set({ childrenStats: res.data.directSubordinates, loading: false });
      set({ teamStats: res.data.teamSubordinates, loading: false });
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch data",
        loading: false,
      });
    }
  },

  fetchChildrenDeposits: async () => {
    const { userId } = useAuthStore.getState();

    try {
      set({ loading: true, error: null });

      const res = await axiosInstance.get(
        `/agent/child-deposit-history/${userId}`
      );
      // console.log(res.data.childrenDeposits);
      set({ childrenDepositsTree: res.data.childrenDeposits, loading: false });
    } catch (error) {
      // console.error("Failed to fetch children deposits:", error);
      set({
        error: error?.response?.data?.message || "Failed to fetch data",
        loading: false,
      });
    }
  },

  fetchAllChildrenDetails: async () => {
    const { userId } = useAuthStore.getState();

    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.get(`/agent/parent-to-child/${userId}`);
      // console.log(res.data);
      set({ childrenDetails: res.data, loading: false });
    } catch (error) {
      // console.error("Failed to fetch children deposits:", error);
      set({
        error: error?.response?.data?.message || "Failed to fetch data",
        loading: false,
      });
    }
  },

  clearChildrenDeposits: () => set({ childrenDepositsTree: null, error: null }),
}));

// Auto-fetch transactions and finance details when user logs in
useAuthStore.subscribe((state) => {
  if (state.userId) {
    useParentChildStore.getState().fetchChildrenDeposits();
    useParentChildStore.getState().fetchAllChildrenDetails();
    useParentChildStore.getState().getTeamStats();
    useParentChildStore.getState().getChildrenStats();
  }
});

export default useParentChildStore;
