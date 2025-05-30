import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useTransactionStore from "../../../store/transactionStore";
import useUSDTPriceStore from "../../../store/useUSDTPriceStore";

import { ArrowLeft, ChevronDown } from "lucide-react";
import usdtImageIcon from "../../../assets/images/payment-methods/pay_icon_usdt_red.svg";

const withdrawTypes = [
  "All",
  "Withdrawal",
  "Withdrawal cancellation",
  "Safe withdrawal",
];

const WithdrawHistory = () => {
  const navigate = useNavigate();
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const { fetchAllTransactions, withdrawalTransactionHistory } =
    useTransactionStore();
  const withdrawalHistory = withdrawalTransactionHistory();
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const handleCopy = (transactionId) => {
    navigator.clipboard.writeText(transactionId);
    setCopied(transactionId);

    // Reset tooltip after 2 seconds
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredWithdraws = withdrawalHistory.filter(
    (withdraw) => selectedType === "All" || withdraw.type === selectedType
  );

  useEffect(() => {
    fetchAllTransactions();
    withdrawalTransactionHistory();
  }, []);

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Withdraw History</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl p-4">
        {/* Date Picker */}
        <div className="relative w-full md:w-1/2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-md shadow border border-gray-300 focus:ring focus:ring-blue-400"
          />
        </div>

        {/* Withdraw Type Dropdown */}
        <div className="relative w-full md:w-1/2">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex justify-between items-center px-3 py-2 rounded-md shadow border border-gray-300 bg-white"
          >
            {selectedType} <ChevronDown />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 w-full bg-white shadow-md max-h-60 overflow-y-auto rounded-md mt-1 border border-gray-300">
              {withdrawTypes.map((type) => (
                <div
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-yellow-500 text-gray-900 text-sm md:text-base font-semibold border-b border-gray-300">
              <th className="p-3 whitespace-nowrap">Type</th>
              <th className="p-3 whitespace-nowrap">Time</th>
              <th className="p-3 whitespace-nowrap">Amount</th>
              <th className="p-3 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdraws.length > 0 ? (
              filteredWithdraws.map((withdraw, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="text-sm md:text-base transition hover:bg-[#595959] cursor-pointer relative"
                    onClick={() => handleCopy(withdraw.transactionId)}
                  >
                    <td className="p-3 text-white break-words">
                      {withdraw.type}
                      {copied === withdraw.transactionId && (
                        <span className="absolute top-1 left-1 text-yellow-500 text-xs">
                          Copied!
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-gray-300 break-words">
                      {new Date(withdraw.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-yellow-500 font-semibold break-words">
                      {withdraw.method === "USDT" ? (
                        <span className="flex items-center gap-1">
                          {(withdraw.amount / usdtPriceInINR).toFixed(2)}
                          <img
                            src={usdtImageIcon}
                            alt="usdt-icon"
                            className="w-6 h-6"
                          />
                        </span>
                      ) : (
                        <span>₹ {withdraw.amount}</span>
                      )}
                    </td>
                    <td
                      className={`p-3 font-semibold break-words ${
                        withdraw.status === "Completed"
                          ? "text-green-600"
                          : withdraw.status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {withdraw.status}
                    </td>
                  </tr>
                  {/* Divider Row */}
                  <tr>
                    <td colSpan="4" className="border-b border-gray-600"></td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-400 font-semibold"
                >
                  No Withdrawals Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawHistory;
