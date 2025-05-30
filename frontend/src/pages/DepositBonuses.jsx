import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import gift_image from "../assets/images/gift/gift.png";
import useAuthStore from "../store/authStore.js";
import toast from "react-hot-toast";

const DEPOSIT_BONUSES = {
  firstDeposit: [
    { amount: 100, bonus: 20 },
    { amount: 300, bonus: 60 },
    { amount: 1000, bonus: 150 },
    { amount: 3000, bonus: 300 },
    { amount: 10000, bonus: 600 },
    { amount: 30000, bonus: 2000 },
    { amount: 100000, bonus: 5000 },
    { amount: 200000, bonus: 10000 },
  ],
  secondDeposit: [
    { amount: 100, bonus: 15 },
    { amount: 300, bonus: 40 },
    { amount: 1000, bonus: 100 },
    { amount: 3000, bonus: 200 },
    { amount: 10000, bonus: 400 },
    { amount: 30000, bonus: 1500 },
    { amount: 100000, bonus: 3000 },
    { amount: 200000, bonus: 7000 },
  ],
  thirdDeposit: [
    { amount: 100, bonus: 10 },
    { amount: 300, bonus: 20 },
    { amount: 1000, bonus: 50 },
    { amount: 3000, bonus: 100 },
    { amount: 10000, bonus: 200 },
    { amount: 30000, bonus: 1000 },
    { amount: 100000, bonus: 1500 },
    { amount: 200000, bonus: 5000 },
  ],
};

const DepositBonuses = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [bonuses] = useState(DEPOSIT_BONUSES);

  // useEffect(() => {
  //   if (user?.firstDepositRewardClaimed) {
  //     toast(
  //       "You have already completed your first deposit. Further deposits will not qualify for additional rewards."
  //     );
  //   } else {
  //     toast("Make your first deposit now to claim an exclusive reward!");
  //   }
  // }, []);

  return (
    <div className="min-h-screen flex flex-col items-center space-y-4 pb-28">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Recharge Bonus</span>
        </div>
        <img src={gift_image} alt="Safe Banner" className="w-28" />
      </div>

      <div className="px-4">
        {/* <h2 className="text-3xl text-white font-extrabold text-center text-gradient mb-6">
          🎉 First Deposit Bonus
        </h2> */}

        {[
          { key: "firstDeposit", label: "🥇 First Deposit Bonus" },
          { key: "secondDeposit", label: "🥈 Second Deposit Bonus" },
          { key: "thirdDeposit", label: "🥉 Third Deposit Bonus" },
        ].map(({ key, label }) => (
          <div
            key={key}
            className="w-full max-w-lg bg-[#595959] shadow-lg rounded-lg p-2 mb-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 border-b pb-2">
              {label}
            </h3>

            {bonuses[key].map((bonus, index) => {
              const depositAmount =
                key === "firstDeposit"
                  ? user?.firstDepositAmount || 0
                  : key === "secondDeposit"
                  ? user?.secondDepositAmount || 0
                  : user?.thirdDepositAmount || 0;

              const clampedValue = Math.min(
                bonus.amount,
                Math.max(depositAmount, 0)
              );
              const percentage = Math.floor(
                (clampedValue / bonus.amount) * 100
              );

              return (
                <div
                  key={index}
                  className="w-full bg-[#454545] rounded-lg shadow-md p-4 mb-4 space-y-3"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">
                      Deposit ₹{bonus.amount.toLocaleString()}
                    </span>
                    <span className="text-yellow-500 font-bold">
                      + ₹{bonus.bonus.toLocaleString()}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="text-gray-300 text-xs">
                    Deposit ₹{bonus.amount.toLocaleString()} and get ₹
                    {bonus.bonus.toLocaleString()} bonus
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden flex items-center">
                      <div
                        className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="w-full text-center z-10 text-xs font-semibold text-white">
                        ₹{depositAmount.toLocaleString()} / ₹
                        {bonus.amount.toLocaleString()}
                      </div>
                    </div>

                    {/* Deposit Button */}
                    <button className="w-full py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-md text-white text-sm font-bold hover:brightness-110 transition-all">
                      Deposit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="w-full max-w-lg bg-[#595959] shadow-lg rounded-lg p-5 mt-6">
          <h3 className="text-xl font-bold text-white border-b pb-2 mb-4">
            📜 Bonus Rules
          </h3>
          <ul className="list-disc list-inside text-gray-300 text-xs">
            <li>
              Exclusive fot the first recharge of the account. There is only one
              chance. The more you recharge, the more rewards you will receive.
              The highest reward is ₹10,000.00;
            </li>
            <li>Activities cannot be participated in repeatedly:</li>
            <li>
              Rewards can only be claimed manually on IOS, Android, HS and PC;
            </li>
            <li>
              The bonus (excluding the principal) given in this event requires 1
              times the coding turnover (i.e. valid bets) before it can be
              withdrawn, and the coding does not limit the platform;
            </li>
            <li>
              This event is limited to normal human operations by the account
              owner, it is prohibited to rent, use plugins, robots, gamble with
              different accounts, arbitrage, interfaces, protocols or group
              control, otherwise it will be cancelled or rewards will be
              deducted, frozen, or even blacklisted.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepositBonuses;
