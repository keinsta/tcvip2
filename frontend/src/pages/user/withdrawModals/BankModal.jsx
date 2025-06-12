import React, { useEffect, useState } from "react";
// import { banks } from "../banks";
import { XCircle } from "lucide-react";
import Select from "react-select";
import axiosInstance from "../../../config/axiosInstance";
import toast from "react-hot-toast";

const BankModal = ({ setShowBankModal, setDetails }) => {
  const [response, setResponse] = useState(null);
  const [banks, setBanks] = useState([]);
  const [bankDetails, setBankDetails] = useState({
    bank: null,
    cardholderName: "",
    accountNumber: "",
    ifscCode: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    branch: "",
  });
  const handleBankDetailsChange = (e) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleBankCardPayment = async () => {
    try {
      const response = await axiosInstance.post(
        "/finance/update-user-finance-details",
        { details: bankDetails, method: "bankCard" }
      );
      setResponse(response.data);

      const details = response.data.financeAccount?.methodDetails;
      const {
        bank,
        cardholderName,
        accountNumber,
        ifscCode,
        email,
        phone,
        state,
        city,
        branch,
      } = details;

      setDetails({
        bank,
        cardholderName,
        accountNumber,
        ifscCode,
        email,
        phone,
        state,
        city,
        branch,
      });
      setTimeout(() => {
        setShowBankModal(false);
      }, 1000);
    } catch (error) {
      setResponse(error.response.data);
      setTimeout(() => {
        setShowBankModal(false);
      }, 1000);
    }
  };

  const fetchWithdrawPaymentMethods = async () => {
    try {
      const response = await axiosInstance.get(
        "payment-methods/withdraw/get-all-methods-by-type?type=Bank"
      );
      // console.log(response.data);
      setBanks(
        response.data
          .filter((bank) => bank.status === true)
          .map((bank) => ({
            label: bank.value,
            value: bank._id,
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
          onClick={() => setShowBankModal(false)}
        />
        <h2 className="text-lg font-semibold mb-4">Add Bank Account</h2>
        <Select
          options={banks}
          isSearchable
          placeholder="Search and select Bank"
          className="text-xs sm:text-sm"
          onChange={(selected) =>
            setBankDetails({ ...bankDetails, bank: selected })
          }
        />
        {Object.keys(bankDetails).map((key) =>
          key !== "bank" ? (
            <input
              key={key}
              type="text"
              required
              name={key}
              placeholder={`Please enter ${key.replace(/([A-Z])/g, " $1")}`}
              onChange={handleBankDetailsChange}
              className="w-full mt-2 p-2 border rounded text-xs sm:text-sm"
            />
          ) : null
        )}
        <button
          className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md w-full"
          onClick={handleBankCardPayment}
        >
          Add
        </button>
        {response?.success === true && (
          <p className="text-sm text-center text-green-600 font-semibold mt-1">
            Bank Account Added Successfully
          </p>
        )}
        {response?.success === false && (
          <p className="text-sm text-center text-red-600 font-semibold mt-1">
            Failed to Add Bank Details
          </p>
        )}
        <p className="text-center text-xs text-gray-600 mt-2">
          Warm reminder: Please fill in the withdrawal bank card information
          carefully. Once submitted, this information will be your only
          withdrawal bank.
        </p>
      </div>
    </div>
  );
};

export default BankModal;
