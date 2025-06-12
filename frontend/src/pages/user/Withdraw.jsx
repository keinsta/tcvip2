import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CreditCard,
  Bitcoin,
  Wallet,
  DollarSign,
  Key,
  PlusCircle,
  Clock,
  Repeat,
  AlertCircle,
  ChevronRight,
  XCircle,
} from "lucide-react";
import Select from "react-select";
import useAuthStore from "../../store/authStore";
import useUSDTPriceStore from "../../store/useUSDTPriceStore";
import useTransactionStore from "../../store/transactionStore";
import wallet_banner from "../../assets/images/banners/wallet_banner.jpg";
import axiosInstance from "../../config/axiosInstance";

import BankModal from "./withdrawModals/BankModal";
import USDTModal from "./withdrawModals/USDTModal";
import WalletModal from "./withdrawModals/WalletModal";
import toast from "react-hot-toast";
import usdtImageIcon from "../../assets/images/payment-methods/pay_icon_usdt_red.svg";

const withdrawalOptions = [
  {
    name: "Bank Card",
    icon: CreditCard,
    details: {
      time: "00:00 - 24:00",
      range: "₹110.00 - ₹100,000.00",
      remaining: 3,
      requirement: "₹278.00 to withdraw",
    },
  },
  {
    name: "USDT",
    icon: Bitcoin,
    details: {
      time: "00:00 - 24:00",
      range: "10.00 - 1,000.00 USDT",
      remaining: 3,
      requirement: "₹278.00 to withdraw",
    },
  },
  {
    name: "Wallet",
    icon: Wallet,
    details: {
      time: "00:00 - 24:00",
      range: "₹110.00 - ₹100,000.00",
      remaining: 3,
      requirement: "₹278.00 to withdraw",
    },
  },
];

const Withdraw = () => {
  const navigate = useNavigate();
  const { user, userId, fetchUser } = useAuthStore();
  const userBalance = user?.totalBalance;
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const withdrawalMethodSet = user?.withdrawalMethodSet;
  const { bankDetails, usdtDetails, walletDetails } = useTransactionStore();

  const [showBalance, setShowBalance] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Bank Card");

  const [details, setDetails] = useState({});
  const [showBankModal, setShowBankModal] = useState(false);
  const [showUsdtModal, setShowUsdtModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalPassword, setWithdrawalPassword] = useState("");

  const selectedOption = withdrawalOptions.find(
    (option) => option.name === selectedMethod
  );

  const updateUserBalance = async (amount, userId) => {
    try {
      const response = await axiosInstance.post(
        "/transaction/update-user-balance",
        { amount, userId }
      );
      fetchUser();
    } catch (error) {
      toast.error("Error in updating User Balance");
    }
  };

  const handleBankWithdrawal = async () => {
    if (withdrawalAmount < 100) {
      toast.error("Deposit Amount should be more than 100 INR");
      return;
    }
    try {
      // First API call: Validate withdrawal password
      const validateResponse = await axiosInstance.post(
        "/auth/validate-withdrawal-password",
        {
          withdrawalPassword,
        }
      );

      // console.log(validateResponse.data.message);
      if (!validateResponse.data.success) {
        toast.error("Withdrawal Password validation failed!");
        return;
      }

      // If validation is successful, proceed with withdrawal
      const withdrawResponse = await axiosInstance.post(
        "/transaction/withdraw",
        {
          amount: withdrawalAmount,
          method: "Bank Card",
          methodDetails: bankDetails,
        }
      );

      if (withdrawResponse) {
        updateUserBalance(-withdrawalAmount, userId);
        toast.success(withdrawResponse.data.message);
        setWithdrawalAmount("");
        setWithdrawalPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setWithdrawalAmount("");
      setWithdrawalPassword("");
    }
  };
  const handleUSDTWithdrawal = async () => {
    if (withdrawalAmount < 10) {
      toast.error("Deposit Amount should be more than 10 USDT");
      return;
    }
    try {
      // First API call: Validate withdrawal password
      const validateResponse = await axiosInstance.post(
        "/auth/validate-withdrawal-password",
        {
          withdrawalPassword,
        }
      );

      // console.log(validateResponse.data.message);
      if (!validateResponse.data.success) {
        toast.error("Withdrawal Password validation failed!");
        return;
      }

      // If validation is successful, proceed with withdrawal
      const withdrawResponse = await axiosInstance.post(
        "/transaction/withdraw",
        {
          amount: usdtPriceInINR * withdrawalAmount,
          method: "USDT",
          methodDetails: usdtDetails,
        }
      );
      if (withdrawResponse) {
        updateUserBalance(-(usdtPriceInINR * withdrawalAmount), userId);
        toast.success(withdrawResponse.data.message);
        setWithdrawalAmount("");
        setWithdrawalPassword("");
      }
      // toast.success(withdrawResponse.data.message);
      // setWithdrawalAmount("");
      // setWithdrawalPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setWithdrawalAmount("");
      setWithdrawalPassword("");
    }
  };
  const handleWalletWithdrawal = async () => {
    if (withdrawalAmount < 100) {
      toast.error("Withdrawal Amount should be more than 100 INR");
      return;
    }
    try {
      // First API call: Validate withdrawal password
      const validateResponse = await axiosInstance.post(
        "/auth/validate-withdrawal-password",
        {
          withdrawalPassword,
        }
      );

      // console.log(validateResponse.data.message);
      if (!validateResponse.data.success) {
        toast.error("Withdrawal Password validation failed!");
        return;
      }

      // If validation is successful, proceed with withdrawal
      const withdrawResponse = await axiosInstance.post(
        "/transaction/withdraw",
        {
          amount: withdrawalAmount,
          method: "Wallet",
          methodDetails: walletDetails,
        }
      );
      if (withdrawResponse) {
        updateUserBalance(-withdrawalAmount, userId);
        toast.success(withdrawResponse.data.message);
        setWithdrawalAmount("");
        setWithdrawalPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      setWithdrawalAmount("");
      setWithdrawalPassword("");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [details]);

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex items-center">
          <ArrowLeft
            className="mr-4 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Withdraw</span>
        </div>
        <button
          className="text-yellow-900 text-xs"
          onClick={() => navigate("/withdraw-history")}
        >
          Withdraw History
        </button>
      </div>

      <div className="w-full px-4 mt-4 space-y-4">
        {/* Card Component */}
        <div className="relative h-40 bg-gradient-yellow-headers text-white rounded-2xl shadow-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Total Balance</h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="focus:outline-none"
            >
              {showBalance ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          <div className="text-2xl font-bold tracking-wide">
            {showBalance ? (
              <div className="flex items-center gap-1">
                ₹{userBalance}
                {selectedMethod === "USDT" && (
                  <span className="flex items-center gap-1">
                    <Repeat />{" "}
                    <img
                      src={usdtImageIcon}
                      alt="usdt-icon"
                      className="w-8 h-8"
                    />{" "}
                    {(userBalance / usdtPriceInINR).toFixed(2)}
                  </span>
                )}
              </div>
            ) : (
              "•••••••"
            )}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Member ID</p>
            <span className="text-lg font-semibold">
              {user?.uid.replace("MEMBER-", "")}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="flex flex-col items-center w-full my-4 p-4 bg-[#595959] shadow-lg rounded-2xl space-y-4">
          <div className="w-full max-w-[500px]">
            <div className="flex gap-4">
              {withdrawalOptions.map(({ icon: Icon, name }) => (
                <div
                  key={name}
                  className={`relative flex flex-col items-center justify-center flex-1 p-3 border rounded-lg shadow-md transition-transform transform hover:scale-105 bg-white cursor-pointer ${
                    selectedMethod === name ? "border-yellow-500" : ""
                  }`}
                  onClick={() => setSelectedMethod(name)}
                >
                  <Icon className="w-6 h-6 text-yellow-500" />
                  <p className="mt-1 text-xs sm:text-sm font-semibold">
                    {name}
                  </p>

                  {/* Checkmark Icon for Selected Option */}
                  {selectedMethod === name && (
                    <div className="absolute top-2 right-2 text-green-500">
                      ✔
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-white font-semibold">Receiving Amount</h3>
          </div>
          {/* Payment Input Field */}
          <div className="relative w-full mt-4">
            <span className="absolute inset-y-0 left-3 flex items-center text-yellow-500">
              <DollarSign className="w-5 h-5" />
            </span>
            <input
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              className="w-full p-3 pl-10 text-white placeholder-gray-300 rounded-md bg-app-bg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 no-spinner"
              placeholder={
                selectedMethod === "USDT"
                  ? "Please enter withdrawal USDT"
                  : "Please enter withdrawal Amount"
              }
              type="number"
            />
          </div>
          {/* Withdrawal Password Input Field */}
          <div className="relative w-full mt-4">
            <span className="absolute inset-y-0 left-3 flex items-center text-yellow-500">
              <Key className="w-5 h-5" />
            </span>
            <input
              value={withdrawalPassword}
              onChange={(e) => setWithdrawalPassword(e.target.value)}
              className="w-full p-3 pl-10 text-white placeholder-gray-300 rounded-md bg-app-bg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 no-spinner"
              placeholder="Enter withdrawal password"
              type="password"
            />
          </div>

          {/* Dynamic Section Based on Selected Method */}
          {selectedMethod === "Bank Card" &&
            (withdrawalMethodSet?.bankCard ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-white rounded-md border-1 border-yellow-500 p-2">
                  <h4 className="text-sm">
                    <span className="text-xs font-semibold">
                      Name On Card:{" "}
                    </span>
                    {bankDetails?.cardholderName}
                  </h4>
                  <h5>
                    <span className="text-xs font-semibold">
                      Account Number:{" "}
                    </span>
                    {bankDetails?.accountNumber
                      ? `${bankDetails.accountNumber.slice(
                          0,
                          2
                        )}*****${bankDetails.accountNumber.slice(-3)}`
                      : "N/A"}
                  </h5>
                </div>
                <button
                  onClick={handleBankWithdrawal}
                  className="w-[50%] py-2 text-white font-semibold bg-gradient-yellow-headers rounded-3xl shadow-xl transition-transform transform hover:scale-105 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Withdraw
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center items-center bg-white rounded-md border-2 border-yellow-500 cursor-pointer p-2">
                <button
                  onClick={() => setShowBankModal(true)}
                  className="flex items-center text-sm space-x-1 text-white bg-yellow-600 p-2 rounded-lg transition-transform transform hover:scale-105"
                >
                  <PlusCircle size={20} />
                  <span>Add Bank Account Number</span>
                </button>
              </div>
            ))}
          {selectedMethod === "USDT" &&
            (withdrawalMethodSet?.usdt ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-white rounded-md border-1 border-yellow-500 p-2">
                  <h4 className="text-sm">
                    <span className="text-xs font-semibold">
                      Network Type:{" "}
                    </span>
                    {usdtDetails?.usdtType?.label}
                  </h4>
                  <h5>
                    <span className="text-xs font-semibold">
                      Wallet Address #{" "}
                    </span>
                    {usdtDetails?.usdtWalletAddress
                      ? `${usdtDetails.usdtWalletAddress.slice(
                          0,
                          5
                        )}*****${usdtDetails.usdtWalletAddress.slice(-3)}`
                      : "N/A"}
                  </h5>
                </div>
                <button
                  onClick={handleUSDTWithdrawal}
                  className="w-[50%] py-2 text-white font-semibold bg-gradient-yellow-headers rounded-3xl shadow-xl transition-transform transform hover:scale-105 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Withdraw
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center items-center bg-white rounded-md border-2 border-yellow-500 cursor-pointer p-2">
                <button
                  onClick={() => setShowUsdtModal(true)}
                  className="flex items-center text-sm space-x-1 text-white bg-yellow-600 p-2 rounded-lg transition-transform transform hover:scale-105"
                >
                  <PlusCircle size={20} />
                  <span>Add USDT</span>
                </button>
              </div>
            ))}
          {selectedMethod === "Wallet" &&
            (withdrawalMethodSet?.wallet ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-white rounded-md border-1 border-yellow-500 p-2">
                  <h4 className="text-sm">
                    <span className="text-xs font-semibold">Wallet Type: </span>
                    {walletDetails?.walletType?.label}
                  </h4>
                  <h5>
                    <span className="text-xs font-semibold">
                      Wallet Address #{" "}
                    </span>
                    {walletDetails?.walletAddress
                      ? `${walletDetails.walletAddress.slice(
                          0,
                          5
                        )}*****${walletDetails.walletAddress.slice(-3)}`
                      : "N/A"}
                  </h5>
                </div>
                <button
                  onClick={handleWalletWithdrawal}
                  className="w-[50%] py-2 text-white font-semibold bg-gradient-yellow-headers rounded-3xl shadow-xl transition-transform transform hover:scale-105 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Withdraw
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center rounded-md bg-white cursor-pointer">
                <img src={wallet_banner} className="rounded-md" />
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center text-sm space-x-1 my-1 text-white bg-yellow-600 p-2 rounded-lg transition-transform transform hover:scale-105"
                >
                  <PlusCircle size={20} />
                  <span>Add Wallet</span>
                </button>
              </div>
            ))}
        </div>

        {/* Wallet Option Details */}
        <div className="w-full max-w-[500px] bg-white border-2 border-yellow-500 rounded-lg p-4 shadow-md">
          {selectedMethod === "Wallet" && (
            <div className="w-full max-w-[500px] bg-gray-100 border-2 border-yellow-500 rounded-lg p-4 shadow-md mt-4">
              <h3 className="text-lg font-semibold text-yellow-600">
                INCASH Pay
              </h3>
              <p className="text-sm text-gray-700">
                Supports UPI for fast payment, and 3% bonuses for withdrawals
                INCASH Pay transaction rules Your INCASH wallet has not been
                activated yet
              </p>

              <h3 className="text-lg font-semibold text-yellow-600 mt-2">
                INCASH Wallet
              </h3>
              <p className="text-sm text-gray-700">
                INCASH Wallet is a third-party payment service platform that
                facilitates fast payments on the platform using INCASH banlance
                (digital currency) Safe, stable and fastSupports UPI for fast
                payment, and 3% bonuses for withdrawals.
              </p>
              <a
                href="#"
                className="mt-1 flex items-center text-sm text-yellow-800"
              >
                How to activate INCASH Wallet <ChevronRight size={18} />
              </a>

              <h4 className="text-md font-semibold text-yellow-600 mt-2">
                INCASH Wallet Features:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                <li>Fast and secure digital payments.</li>
                <li>Withdraw balance easily to INCASH Wallet.</li>
                <li>Quickly sell balance through UPI to get rupees.</li>
                <li>Additional rewards for transactions via UPI.</li>
                <li>Avoid bank transaction limits while playing.</li>
              </ul>
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-300">
            <div className="flex flex-col items-center p-3">
              <Clock className="w-6 h-6 text-yellow-500 mb-1" />
              <p className="text-xs text-gray-600 text-center">
                Withdrawal Time
              </p>
              <p className="text-xs sm:text-sm font-semibold text-center">
                {selectedOption.details.time}
              </p>
            </div>
            <div className="flex flex-col items-center p-3">
              <DollarSign className="w-6 h-6 text-yellow-500 mb-1" />
              <p className="text-xs text-gray-600 text-center">Amount Range</p>
              <p className="text-xs sm:text-sm font-semibold text-center">
                {selectedOption.details.range}
              </p>
            </div>
            <div className="flex flex-col items-center p-3">
              <Repeat className="w-6 h-6 text-yellow-500 mb-1" />
              <p className="text-xs text-gray-600 text-center">
                Remaining Withdrawals
              </p>
              <p className="text-xs sm:text-sm font-semibold text-center">
                {selectedOption.details.remaining}
              </p>
            </div>
            <div className="flex flex-col items-center p-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 mb-1" />
              <p className="text-xs text-gray-600 text-center">
                Betting Requirement
              </p>
              <p className="text-xs sm:text-sm font-semibold text-center">
                {selectedOption.details.requirement}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Modal */}
      {showBankModal && (
        <BankModal
          setShowBankModal={setShowBankModal}
          setDetails={setDetails}
        />
      )}

      {/* USDT Modal */}
      {showUsdtModal && (
        <USDTModal
          setShowUsdtModal={setShowUsdtModal}
          setDetails={setDetails}
        />
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletModal
          setShowWalletModal={setShowWalletModal}
          setDetails={setDetails}
        />
      )}
    </div>
  );
};

export default Withdraw;
