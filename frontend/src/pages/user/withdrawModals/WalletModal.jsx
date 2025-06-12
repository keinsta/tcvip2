import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import Select from "react-select";
import axiosInstance from "../../../config/axiosInstance";
import toast from "react-hot-toast";

const walletOptions = [{ value: "INCASH", label: "INCASH" }];

const WalletModal = ({ setShowWalletModal, setDetails }) => {
  const [response, setResponse] = useState();
  const [wallets, setWallets] = useState([]);
  const [walletDetails, setWalletDetails] = useState({
    walletType: "",
    walletAddress: "",
  });
  const handleWalletDetailsChange = (e) => {
    setWalletDetails({ ...walletDetails, [e.target.name]: e.target.value });
  };
  const handleWalletPayment = async () => {
    try {
      const response = await axiosInstance.post(
        "/finance/update-user-finance-details",
        { details: walletDetails, method: "wallet" }
      );
      setResponse(response.data);

      const details = response.data.financeAccount?.methodDetails;
      const { walletType, walletAddress } = details;

      setDetails({
        walletType,
        walletAddress,
      });
      setTimeout(() => {
        setShowWalletModal(false);
      }, 1000);
    } catch (error) {
      setResponse(error.response.data);
      setTimeout(() => {
        setShowWalletModal(false);
      }, 1000);
    }
  };

  const fetchWithdrawPaymentMethods = async () => {
    try {
      const response = await axiosInstance.get(
        "payment-methods/withdraw/get-all-methods-by-type?type=Wallet"
      );
      // console.log(response.data);
      setWallets(
        response.data.map((wallet) => ({
          label: wallet.value,
          value: wallet._id,
        }))
      );
    } catch (error) {
      toast.error("Error while Fetching Banks");
    }
  };

  useEffect(() => {
    fetchWithdrawPaymentMethods();
  }, []);

  return (
    <div className="w-full max-w-[500px] mx-auto fixed inset-0 pt-4 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 mb-24 rounded-lg w-[90%]">
        <XCircle
          className="w-6 h-6 cursor-pointer float-right"
          onClick={() => setShowWalletModal(false)}
        />
        <h2 className="text-lg font-semibold mb-4">Add USDT</h2>
        <Select
          options={wallets}
          isSearchable
          placeholder="Wallet Type"
          className="text-xs sm:text-sm"
          onChange={(selected) =>
            setWalletDetails({ ...walletDetails, walletType: selected })
          }
        />
        {Object.keys(walletDetails).map((key) =>
          key !== "walletType" ? (
            <input
              key={key}
              type="text"
              name={key}
              placeholder={`Please enter ${key.replace(/([A-Z])/g, " $1")}`}
              onChange={handleWalletDetailsChange}
              className="w-full mt-2 p-2 border rounded text-xs sm:text-sm"
            />
          ) : null
        )}
        <button
          className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md w-full"
          onClick={handleWalletPayment}
        >
          Add
        </button>
        {response?.success === true && (
          <p className="text-sm text-center text-green-600 font-semibold mt-1">
            Wallet Details Added Successfully
          </p>
        )}
        {response?.success === false && (
          <p className="text-sm text-center text-red-600 font-semibold mt-1">
            Failed to Add Wallet Details
          </p>
        )}
        {/* <p className="text-center text-xs text-gray-600 mt-2">
      Warm reminder: Please fill in the withdrawal bank card information
      carefully. Once submitted, this information will be your only
      withdrawal bank.
    </p> */}
      </div>
    </div>
  );
};

export default WalletModal;
