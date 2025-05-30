import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CoinsIcon } from "lucide-react";
import reward_image from "../../assets/images/gift/gift.png";

const AttendanceBonus = () => {
  const navigate = useNavigate();
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [totalReward, setTotalReward] = useState(0);
  const [attendedToday, setAttendedToday] = useState(false);

  const rewards = [
    { day: "1day", amount: 5 },
    { day: "2day", amount: 10 },
    { day: "3day", amount: 15 },
    { day: "4day", amount: 20 },
    { day: "5day", amount: 25 },
    { day: "6day", amount: 30 },
    { day: "7day", amount: 50 },
  ];

  const handleAttendance = () => {
    if (!attendedToday) {
      const newDays = consecutiveDays + 1;
      setConsecutiveDays(newDays);
      setTotalReward(totalReward + rewards[Math.min(newDays - 1, 6)].amount);
      setAttendedToday(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center space-y-4 pb-28">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Attendance</span>
        </div>
        <img src={reward_image} alt="Safe Banner" className="w-28" />
      </div>
      <div className="w-full flex flex-col items-center px-4 space-y-4">
        <div className="bg-[#595959] shadow-lg rounded-lg p-4 w-full text-center">
          <h2 className="text-white text-2xl font-extrabold text-gradient mb-4">
            🎁 Attendance Bonus
          </h2>
          <p className="text-white text-md mb-2">
            Get rewards based on consecutive login days
          </p>
          <p className="text-gray-300 text-sm font-bold">
            Attended consecutively: {consecutiveDays} days
          </p>
          <p className="text-white font-bold">
            Accumulated:{" "}
            <span className="text-yellow-500">₹{totalReward.toFixed(2)}</span>
          </p>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button className="text-xs sm:text-sm bg-yellow-600 text-white py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-all duration-300">
              📜 Game Rules
            </button>
            <button className="text-xs sm:text-sm  bg-yellow-600 text-white py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-all duration-300">
              📜 Attendance History
            </button>
          </div>
        </div>

        {/* Attendance Rewards Grid */}
        <div className="w-full bg-[#595959] shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-bold text-white border-b pb-2 mb-4">
            🎉 7 Days Rewards
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {rewards.slice(0, 6).map((reward, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center p-2 rounded-lg text-center bg-app-bg shadow-sm"
              >
                <CoinsIcon
                  size={30}
                  className="text-yellow-500 absolute top-[-5px] left-[-5px]"
                />
                <p className="text-lg text-yellow-400">
                  ₹{reward.amount.toFixed(2)}
                </p>
                <p className="text-white text-sm">{reward.day}</p>
              </div>
            ))}
          </div>
          <div className="relative flex items-center justify-center gap-2 mt-4 p-3 rounded-lg text-center bg-app-bg shadow-sm font-bold">
            <CoinsIcon
              size={30}
              className="text-yellow-500 absolute top-[-5px] left-[-5px]"
            />
            <span className="text-4xl">🎁</span>
            <div>
              <p className="text-xl text-yellow-500">
                ₹{rewards[6].amount.toFixed(2)}
              </p>
              <p className="text-white">{rewards[6].day}</p>
            </div>
          </div>
        </div>

        {/* Attendance Button */}
        <button
          onClick={handleAttendance}
          disabled={attendedToday}
          className={`mt-6 py-3 px-6 rounded-lg text-lg font-bold shadow-md transition-all duration-300 ${
            attendedToday
              ? "bg-yellow-600 text-white cursor-not-allowed"
              : "bg-yellow-500 text-white animate-pulse hover:scale-105"
          }`}
        >
          {attendedToday && <span>✅</span>} Mark Attendance
        </button>
      </div>
    </div>
  );
};

export default AttendanceBonus;
