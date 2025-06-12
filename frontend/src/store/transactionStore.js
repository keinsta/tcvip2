import { create } from "zustand";
import axiosInstance from "../config/axiosInstance";
import useAuthStore from "./authStore";
import toast from "react-hot-toast";

const useTransactionStore = create((set, get) => ({
  transactions: [],
  financeDetails: {},
  bankDetails: {},
  usdtDetails: {},
  walletDetails: {},
  isLoading: false,

  // Fetch all transactions
  fetchAllTransactions: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    set({ isLoading: true });

    try {
      const response = await axiosInstance.get("/transaction/history", {
        params: { type: "All" }, // ✅ Corrected query parameter
      });

      set({
        transactions: response.data?.transactions || [],
        isLoading: false,
      });
    } catch (error) {
      // console.error("Failed to fetch transactions:", error);
      set({ transactions: [], isLoading: false });
    }
  },

  // Get deposit transactions
  depositTransactionHistory: () => {
    const { transactions } = get();
    return transactions.filter((transaction) =>
      transaction.type.toLowerCase().includes("deposit")
    );
  },

  // Get withdrawal transactions
  withdrawalTransactionHistory: () => {
    const { transactions } = get();
    return transactions.filter((transaction) =>
      transaction.type.toLowerCase().includes("withdraw")
    );
  },

  bettingTransactionHistory: async () => {},

  // Fetch finance account details
  fetchUserFinanceAccountDetails: async () => {
    const { user, userId } = useAuthStore.getState();
    if (!userId) return;

    set({ isLoading: true });

    // ✅ Check if at least one withdrawal method is set
    const hasPaymentMethod =
      user?.withdrawalMethodSet?.bankCard ||
      user?.withdrawalMethodSet?.usdt ||
      user?.withdrawalMethodSet?.wallet;

    if (hasPaymentMethod) {
      try {
        const response = await axiosInstance.get(
          "/finance/get-user-finance-details"
        );

        set({
          financeDetails: response.data.methodDetails || {},
          isLoading: false,
        });

        get().extractFinanceMethodDetails(); // ✅ Ensure this runs after setting data
      } catch (error) {
        // console.error("Failed to fetch finance details:", error);
        set({ financeDetails: {}, isLoading: false });
      }
    }
  },

  // Extract finance method details and store them separately
  extractFinanceMethodDetails: () => {
    const { financeDetails } = get();

    if (!financeDetails) {
      set({
        bankDetails: {},
        usdtDetails: {},
        walletDetails: {},
      });
      return;
    }

    set({
      bankDetails: {
        bank: financeDetails?.bank || "",
        cardholderName: financeDetails?.cardholderName || "",
        accountNumber: financeDetails?.accountNumber || "",
        ifscCode: financeDetails?.ifscCode || "",
        email: financeDetails?.email || "",
        phone: financeDetails?.phone || "",
        state: financeDetails?.state || "",
        city: financeDetails?.city || "",
        branch: financeDetails?.branch || "",
      },
      usdtDetails: {
        usdtType: financeDetails?.usdtType || "",
        usdtWalletAddress: financeDetails?.usdtWalletAddress || "",
      },
      walletDetails: {
        walletType: financeDetails?.walletType || "",
        walletAddress: financeDetails?.walletAddress || "",
      },
    });
  },
}));

// Auto-fetch transactions and finance details when user logs in
useAuthStore.subscribe((state) => {
  if (state.userId) {
    useTransactionStore.getState().fetchAllTransactions();
    useTransactionStore.getState().fetchUserFinanceAccountDetails();
  }
});

export default useTransactionStore;
