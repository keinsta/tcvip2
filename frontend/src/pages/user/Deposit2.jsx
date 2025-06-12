import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, XCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { images } from "../../assets/images/payment-methods";
import axiosInstance from "../../config/axiosInstance";
import toast from "react-hot-toast";

const Deposit = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showBalance, setShowBalance] = useState(false);
  const [selected, setSelected] = useState("");
  const [selectMethod, setSelectedMethod] = useState(null);
  const [selectPaymentOption, setSelectPaymentOption] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);

  // Initialize default selections
  useEffect(() => {
    if (images.length > 0) {
      const firstMethod = images[0];
      setSelected(firstMethod.id);
      setSelectedMethod(firstMethod);
      setSelectPaymentOption(firstMethod.details[0].name);

      if (firstMethod.details.length > 0) {
        setSelectedDetail(0);
        const firstAmount = firstMethod.details[0]?.initialDepositAmount?.[0];
        if (firstAmount) {
          handleAmount(firstAmount, firstMethod, firstMethod.details[0]?.bonus);
        }
      }
    }
  }, []);

  const handleAmount = (amount, method, bonus) => {
    const convertedAmount =
      typeof amount === "string" && amount.includes("k")
        ? parseInt(amount.replace("k", "")) * 1000
        : parseInt(amount);
    const bonusAmount = bonus ? convertedAmount * (method.bonus / 100) : null;
    setSelectedAmount(convertedAmount);
    setTotalAmount(bonusAmount + convertedAmount);
  };

  const payAmount = async () => {
    console.log(selectMethod);
    console.log(selectPaymentOption);
    // try {
    //   const response = await axiosInstance.post("/transaction/deposit", {
    //     amount: totalAmount,
    //     method: selectMethod.name,
    //     paymentOption: selectPaymentOption,
    //   });
    //   toast.success(response.data.message);
    // } catch (error) {
    //   toast.error(error.response.data.message);
    // }
  };

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-4 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Deposit</span>
        </div>
        <button
          className="text-yellow-900 text-xs"
          onClick={() => navigate("/deposit-history")}
        >
          Deposit History
        </button>
      </div>

      <div className="w-full px-4 mt-4">
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
            {showBalance
              ? `₹${user?.totalBalance.toLocaleString()}`
              : "•••••••"}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Member ID</p>
            <span className="text-lg font-semibold">
              {user?.uid.replace("MEMBER-", "")}
            </span>
          </div>
        </div>
        {/* Payment Methods */}
        <div className="w-full my-4 p-4 bg-[#595959] shadow-lg rounded-2xl">
          <h2 className="text-white text-xl font-semibold mb-4">
            Payment Methods
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {images.map((method) => (
              <button
                key={method.id}
                className={`relative flex items-center p-3 border rounded-lg transition duration-300 text-white ${
                  selected === method.id
                    ? "border-yellow-500 bg-app-bg"
                    : "border-gray-300"
                }`}
                onClick={() => {
                  setSelected(method.id);
                  setSelectedMethod(method);
                  setSelectedDetail(0); // Select first payment option by default
                  const firstAmount =
                    method.details[0]?.initialDepositAmount?.[0];
                  if (firstAmount) {
                    handleAmount(firstAmount, method, method.details[0]?.bonus);
                  }
                }}
              >
                <div className="mr-3 w-7 h-7">
                  <img src={method.image} alt={method.name} />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {method.name}
                </span>
                <span className="absolute top-0 right-0 bg-yellow-700 px-1 rounded-lg text-xs sm:text-sm">
                  +{method.bonus}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-4 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Payment Options</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectMethod?.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`p-3 bg-gradient-yellow-headers cursor-pointer shadow rounded-lg ${
                      selectedDetail === index
                        ? "border-2 border-yellow-500"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedDetail(index);
                      setSelectPaymentOption(detail.name);
                      const firstAmount = detail.initialDepositAmount?.[0];
                      if (firstAmount) {
                        handleAmount(firstAmount, selectMethod, detail.bonus);
                      }
                    }}
                  >
                    <h4 className="text-xs sm:text-sm font-semibold">
                      {detail.name}
                    </h4>
                    <p className="text-[12px] sm:text-xs">
                      Range: {detail.range}
                    </p>
                    {detail.bonus && (
                      <span className="text-[10px] sm:text-xs font-medium bg-app-bg p-1 rounded-">
                        {selectMethod.bonus}% Bonus
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deposit Amount */}
          {selectedDetail !== null && (
            <div className="mt-4 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">Deposit Amount</h3>
              <div className="grid grid-cols-3 gap-2">
                {selectMethod?.details[
                  selectedDetail
                ]?.initialDepositAmount.map((amount, index) => (
                  <div
                    key={index}
                    className={`p-3 bg-gray-700 cursor-pointer shadow rounded-lg text-center ${
                      selectedAmount ===
                      (typeof amount === "string" && amount.includes("k")
                        ? parseInt(amount.replace("k", "")) * 1000
                        : parseInt(amount))
                        ? "border-2 border-yellow-500"
                        : ""
                    }`}
                    onClick={() =>
                      handleAmount(
                        amount,
                        selectMethod,
                        selectMethod?.details[selectedDetail]?.bonus
                      )
                    }
                  >
                    {amount}
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalAmount !== null && (
            <div className="mt-4 p-4 bg-gradient-yellow-headers text-white rounded-lg shadow-lg flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">
                You Will Get
              </h3>
              <span className="text-2xl font-extrabold">{totalAmount}</span>
            </div>
          )}

          {/* Pay Button */}
          {totalAmount !== null && (
            <div className="w-full flex flex-col gap-4 mt-4">
              <button
                onClick={payAmount}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300"
              >
                Deposit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
