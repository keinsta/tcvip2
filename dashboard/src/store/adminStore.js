import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";

const useAdminStore = create((set, get) => ({
  allUser: [],
  allTransactionStats: {},
  getAllUser: async () => {},
  getAllTransactionStats: async () => {
    try {
      const response = await axiosInstance.get(
        "/transaction/get-transactions-stats"
      );
      set({ allTransactionStats: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));

export default useAdminStore;
