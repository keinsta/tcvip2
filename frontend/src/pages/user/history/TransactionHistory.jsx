import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTransactionStore from "../../../store/transactionStore";
import useUSDTPriceStore from "../../../store/useUSDTPriceStore";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import { transactions } from "./dummyData";
import usdtImageIcon from "../../../assets/images/payment-methods/pay_icon_usdt_red.svg";

const transactionTypes = [
  "All",
  "Deposit",
  "Deposit Cancelled",
  "Commission transferred",
  "Bet",
  "Cancel bet",
  "Bet rebate",
  "Withdrawal",
  "Withdrawal cancellation",
  "Win",
  "Re-settle deduction, winning recovery",
  "Manual fund addition",
  "Manual fund deduction",
  "Salary addition",
  "Salary deduction",
  "Bonus fund addition",
  "Bonus fund deduction",
  "Deposit bonus",
  "Registration bonus",
  "First deposit bonus",
  "Sign-in bonus",
  "Red envelope",
  "Payment level award",
  "Invitation reward",
  "Roulette reward",
  "SVIP upgrade reward",
  "SVIP cycle reward",
  "Betting rebate",
  "Task reward",
  "Agent Tasks reward",
  "Invitation first deposit reward",
  "Second deposit bonus",
  "Third deposit bonus",
  "Invitation second deposit reward",
  "Invitation third deposit reward",
  "Buy benefit card",
  "Claim daily benefit card reward",
  "Game moved in",
  "Game moved out",
  "Safe deposit",
  "Safe withdrawal",
  "Social media share award",
];

const TransactionHistory = () => {
  const navigate = useNavigate();
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const { transactions } = useTransactionStore();
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

  const filteredTransactions = transactions.filter((transaction) =>
    selectedType === "All" ? true : transaction.type === selectedType
  );

  return (
    <div className="min-h-screen mb-28 flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Transaction History</span>
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
            className="w-full px-3 py-2 rounded-md shadow border border-gray-300 focus:ring focus:ring-yellow-400"
          />
        </div>

        {/* Transaction Type Dropdown */}
        <div className="relative w-full md:w-1/2">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex justify-between items-center px-3 py-2 rounded-md shadow border border-gray-300 bg-white"
          >
            {selectedType} <ChevronDown />
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 w-full bg-white shadow-md max-h-60 overflow-y-auto rounded-md mt-1 border border-gray-300">
              {transactionTypes.map((type) => (
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

      <h3 className="text-gray-100 text-sm mb-1">
        Click any Transaction to copy TID
      </h3>
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="text-sm md:text-base transition hover:bg-[#595959] cursor-pointer relative"
                    onClick={() => handleCopy(transaction.transactionId)}
                  >
                    <td className="p-3 text-white break-words">
                      {transaction.type}
                      {copied === transaction.transactionId && (
                        <span className="absolute top-1 left-1 text-yellow-500 text-xs">
                          Copied!
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-gray-300 break-words">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-yellow-500 font-semibold break-words">
                      {transaction.method === "USDT" ? (
                        <span className="flex items-center gap-1">
                          {(transaction.amount / usdtPriceInINR).toFixed(2)}
                          <img
                            src={usdtImageIcon}
                            alt="usdt-icon"
                            className="w-6 h-6"
                          />
                        </span>
                      ) : (
                        <span>₹ {transaction.amount}</span>
                      )}
                    </td>

                    <td
                      className={`p-3 font-semibold break-words ${
                        transaction.status === "Completed"
                          ? "text-green-600"
                          : transaction.status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.status}
                    </td>
                  </tr>
                  {/* Divider */}
                  {index !== filteredTransactions.length - 1 && (
                    <tr>
                      <td colSpan="4">
                        <hr className="border-gray-600" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-4 text-center text-gray-400 font-semibold"
                >
                  No Transactions Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
