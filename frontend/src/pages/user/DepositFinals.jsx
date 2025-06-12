import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import useUSDTPriceStore from "../../store/useUSDTPriceStore";

const TransactionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { amount, method, paymentOption } = location.state || {};
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const [transactionId, setTransactionId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error("Transaction ID is required!");
      return;
    }

    let finalAmount;
    if (method === "USDT") {
      finalAmount = (amount * usdtPriceInINR).toFixed(2);
    } else {
      finalAmount = amount;
    }
    // console.log({
    //   transactionId,
    //   paymentAmount: amount,
    //   method,
    //   paymentOption,
    // });

    try {
      const response = await axiosInstance.post("/transaction/deposit", {
        amount: finalAmount,
        method,
        paymentOption: paymentOption.name,
        transactionId,
      });
      toast.success(response.data.message);
      toast("You will be notified soon!");
      setTimeout(() => {
        // Clear state and redirect
        navigate("/deposit-history", { replace: true });
      }, 2000);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    // console.log(amount, method, paymentOption);
    if (!amount || !method || !paymentOption) {
      toast.error("Invalid payment session!");
      navigate("/deposit");
    }
  }, []);

  return (
    <div className="flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Proceed with Payment
        </h1>

        {/* QR Code and Account Info */}
        <div className="flex flex-col items-center mb-8">
          {paymentOption.image && (
            <img
              src={paymentOption.image}
              alt={paymentOption.name}
              className="w-40 h-40 mb-4 rounded"
            />
          )}
          <div className="text-center">
            <p className="font-semibold text-gray-700">
              Account Number / Wallet Address
            </p>
            <p className="text-gray-500">{paymentOption.accountAddress}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 rounded-md mb-4 text-sm">
            Transfer the payment to the provided account and paste the{" "}
            <strong>Transaction ID / Reference ID</strong> here along with the
            exact transferred amount for verification purposes.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID / Reference ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter Transaction ID"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount ({method === "USDT" ? "$" : "₹"})
            </label>
            <input
              type="text"
              value={`${method === "USDT" ? "$" : "₹"} ${Number(amount).toFixed(
                2
              )}`}
              disabled
              className="w-full px-4 py-2 border bg-gray-100 text-gray-700 rounded-lg focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300"
          >
            Submit Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionPage;
