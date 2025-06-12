import { create } from "zustand";
import axios from "axios";

const useUSDTPriceStore = create((set) => ({
  usdtPriceInINR: null,
  fetchUSDTPrice: async () => {
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr"
      );
      const price = res.data?.tether?.inr || null;
      // console.log(price);
      set({ usdtPriceInINR: price });
    } catch (error) {
      console.error("Failed to fetch USDT price:", error);
    }
  },
}));
export default useUSDTPriceStore;
