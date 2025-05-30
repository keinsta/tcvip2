import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { ArrowLeft, History, Gift as GiftIcon } from "lucide-react";
import safe_money from "../../assets/images/gift/gift.png";
import axiosInstance from "../../config/axiosInstance";
import toast from "react-hot-toast";

const Gift = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [giftCode, setGiftCode] = useState("");
  const [giftHistory, setGiftHistory] = useState([]);

  const handleRedeem = async () => {
    try {
      if (giftCode.trim() === "") {
        toast.error("Please enter a valid gift code!");
        return;
      }
      const response = await axiosInstance.post("/gifts/redeem-gift", {
        code: giftCode,
      });
      toast.success(response.data.message);
      fetchAllUserGifts();
      setGiftCode("");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchAllUserGifts = async () => {
    try {
      const response = await axiosInstance.get("/gifts/get-all-user-gifts", {
        params: { userId: user?.userId },
      });

      const formattedGifts = response.data.gifts.map((gift) => ({
        code: gift.code,
        date: new Date(gift.claimedAt).toISOString().split("T")[0], // Formatting date
        status: gift.status,
      }));

      setGiftHistory(formattedGifts);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchAllUserGifts();
  }, []);

  return (
    <div className="mb-28 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Gifts</span>
        </div>
        <img src={safe_money} alt="Safe Banner" className="w-28" />
      </div>

      {/* Gift Message */}
      <div className="w-full max-w-md mt-6 p-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg text-center text-white">
        <GiftIcon className="w-12 h-12 mx-auto mb-2" />
        <h2 className="text-xl font-semibold">Hi, We have a gift for you!</h2>
        <p className="text-sm opacity-90">
          Enter the code below to claim your reward.
        </p>
      </div>

      {/* Gift Code Input */}
      <div className="w-full max-w-md mt-6">
        <label className="block text-gray-700 font-medium mb-2">
          Please enter the gift code below
        </label>
        <input
          type="text"
          placeholder="Enter gift code..."
          value={giftCode}
          onChange={(e) => setGiftCode(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm"
        />
        <button
          onClick={handleRedeem}
          className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-md shadow-lg transition"
        >
          Redeem Gift
        </button>
      </div>

      {/* Gift History Table */}
      <div className="w-full max-w-md mt-8">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
          <History className="w-5 h-5 mr-2" />
          Gift History
        </h3>
        {giftHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 shadow-md bg-white rounded-lg overflow-hidden">
              <thead className="bg-yellow-500 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">Gift Code</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {giftHistory.map((gift, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-2 px-4">{gift.code}</td>
                    <td className="py-2 px-4 text-gray-500">{gift.date}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        gift.status === "redeemed"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {gift.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center bg-white p-4 rounded-lg shadow">
            No gift collected yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Gift;
