import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import useAuthStore from "../../store/authStore";
import {
  ArrowLeft,
  RefreshCcw,
  Timer,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");
const socket = io(`${API_BASE_URL}/game/k3`, {
  transports: ["websocket"],
  autoConnect: false,
});

const gameModes = [
  { label: "K3 30sec", mode: "30s", time: 30 },
  { label: "K3 1min", mode: "1min", time: 60 },
  { label: "K3 3min", mode: "3min", time: 180 },
  { label: "K3 5min", mode: "5min", time: 300 },
];

const tabMap = {
  A: "Sum",
  B: "SingleDice",
  C: "DoubleDice",
  D: "Triple",
  E: "TwoDiceCombination",
};

const DiceMap = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
};
const betTypeLetters = {
  Sum: "A",
  SingleDice: "B",
  DoubleDice: "C",
  Triple: "D",
  TwoDiceCombination: "E",
};

const DiceIcon = ({ number, size = 24 }) => {
  const Icon = DiceMap[number];
  return <Icon className="text-yellow-500" size={size} />;
};

const K3Game = () => {
  const { user, userId, fetchUser } = useAuthStore();
  const userBalance = user?.totalBalance;
  const [balance, setBalance] = useState(null);

  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentMode, setCurrentMode] = useState("30s");
  const [timeLeft, setTimeLeft] = useState(0);
  const [dice, setDice] = useState([]);
  const [result, setResult] = useState([]);
  const [betAmount, setBetAmount] = useState("");
  const [betType, setBetType] = useState("Sum");
  const [betValue, setBetValue] = useState("");
  const [betOddEven, setBetOddEven] = useState("None");
  const [betBigSmall, setBetBigSmall] = useState("None");

  const [selectedTab, setSelectedTab] = useState("gameHistory"); // Default tab
  // Game History States
  const [gameHistory, setGameHistory] = useState([]);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const [gameTotalPages, setGameTotalPages] = useState(1);
  // My History States
  const [myHistory, setMyHistory] = useState([]);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true); // Start spinning
    await fetchUser(); // Fetch updated user details
    setIsRefreshing(false); // Stop spinning
  };

  // ✅ Fetches all game history (without user-specific filtering)
  const fetchGameHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/k3/history/${currentMode}?page=${page}`
      );
      setGameHistory(response.data.history);
      setGameCurrentPage(response.data.currentPage);
      setGameTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };

  // ✅ Fetches personal bet history (only user's bets)
  const fetchMyHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/k3/my-history/${userId}?page=${page}`
      );

      setMyHistory(response.data.history);
      setMyCurrentPage(response.data.currentPage);
      setMyTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };

  // update user total balance after bet
  const handleUpdateUserBalance = async (balanceChange) => {
    try {
      const response = await axiosInstance.post(
        "/transaction/update-user-balance",
        { userId, amount: balanceChange }
      );

      setBalance(response.data.newBalance);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const placeBet = () => {
    if (!betAmount || !betValue) return toast("Fill all required fields");
    if (betAmount > balance) return toast("Invalid Bet Amount");

    socket.emit("place_bet", {
      mode: currentMode,
      userId, // replace with actual logged-in user ID
      betAmount: Number(betAmount),
      betType,
      betValue:
        betType === "TwoDiceCombination"
          ? betValue.split(",").map(Number)
          : isNaN(betValue)
          ? betValue
          : Number(betValue),
      betOddEven,
      betBigSmall,
    });

    handleUpdateUserBalance(-betAmount);

    toast.success("Bet Placed! Successfully");
    setBetAmount("");
    setBetValue("");
    setBetBigSmall("none");
    setBetOddEven("none");
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    fetchUser();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("timer_tick", ({ mode, timeLeft }) => {
      if (mode === currentMode) {
        setTimeLeft(timeLeft);
      }
    });

    socket.on("round_result", ({ mode, dice, result }) => {
      if (mode === currentMode) {
        setDice(dice);
        setResult(result);

        setTimeout(() => {
          setDice([]);
          setResult([]);
        }, 4000);
      }
    });

    return () => {
      socket.off("timer_tick");
      socket.off("round_result");
    };
  }, [currentMode]);

  useEffect(() => {
    // console.log("time left to 00000");
    // console.log(result);
    // // console.log(countdown, betResult);
    fetchGameHistory(gameCurrentPage);
    // fetchMyHistory(myCurrentPage);

    if (result?.result) {
      if (result.result === "Won") {
        toast("🏆 You Won the Bet");
      } else {
        toast("😢 You Lost the Bet");
      }

      // if payoutAmount then update other wise update 0
      if (result.winningAmount !== 0) {
        handleUpdateUserBalance(result?.winningAmount);
        handleRefreshBalance();
      }
    }
    // console.log(result);
  }, [result]);

  // Fetch data when page changes
  useEffect(() => {
    if (selectedTab === "gameHistory") {
      fetchGameHistory(gameCurrentPage);
    } else if (selectedTab === "myHistory") {
      console.log("3 of 3");
      fetchMyHistory(myCurrentPage);
    }
  }, [gameCurrentPage, myCurrentPage, selectedTab]);

  useEffect(() => {
    setBalance(userBalance);
  }, [userBalance]);

  return (
    <div className="mb-28 min-h-screen flex flex-col items-center">
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">🎲 K3</span>
        </div>
      </div>

      <div className="w-full p-4 space-y-4 flex flex-col items-center">
        {/* Balance */}
        <div className="flex items-center gap-2 text-lg text-white">
          💰 Balance:{" "}
          <span className="text-lg font-semibold text-yellow-500">
            ₹{balance}
          </span>{" "}
          <RefreshCcw
            className={`w-4 h-4 text-yellow-500 cursor-pointer transition-transform ${
              isRefreshing ? "animate-spin" : ""
            }`}
            onClick={handleRefreshBalance}
          />
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
          {gameModes.map((m, index) => (
            <button
              key={index}
              className={`p-2 rounded-lg font-semibold hover:opacity-80 transition flex flex-col gap-1 items-center justify-center 
              ${
                currentMode === m.mode
                  ? "bg-yellow-600 text-white"
                  : "border border-yellow-500 text-yellow-500"
              }`}
              onClick={() => handleModeChange(m.mode)}
            >
              <Timer className="w-6 h-6" />
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="w-full flex flex-col p-2 bg-yellow-600 rounded-md">
          <span className="text-sm font-semibold text-white">Time Left:</span>
          <span className="text-2xl text-white">
            {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
          </span>
        </div>

        {/* Dice Result */}
        {dice.length > 0 && (
          <>
            <div className="flex items-center justify-center gap-6 mt-6">
              {dice.map((d, idx) => {
                const DiceIcon = DiceMap[d];
                return (
                  <DiceIcon key={idx} size={52} className="text-yellow-600" />
                );
              })}
            </div>
          </>
        )}

        {/* Betting Form */}
        <div className="w-full bg-[#595959] p-4 shadow rounded-lg mt-6 space-y-4">
          {/* Tabs A–E */}
          <div className="flex gap-2 mb-4">
            {["A", "B", "C", "D", "E"].map((tab, i) => (
              <button
                key={tab}
                className={`w-10 h-10 rounded-full font-bold ${
                  betType === tabMap[tab]
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => {
                  setBetType(tabMap[tab]);
                  setBetValue("");
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <hr className="border-t border-gray-300 my-4" />

          {/* Bet Options Based on Selected Tab */}
          {betType === "Sum" && (
            <div className="grid grid-cols-4 gap-5">
              {Array.from({ length: 15 }, (_, i) => i + 3).map((num) => (
                <button
                  key={num}
                  className={`w-12 h-12 m-auto rounded-full font-bold text-sm flex items-center justify-center
          ${
            num % 2 === 0
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          } 
          ${betValue === num ? "ring-2 ring-yellow-500" : ""}`}
                  onClick={() => setBetValue(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          )}

          {betType === "SingleDice" && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  className={`p-4 rounded flex justify-center items-center ${
                    betValue === num ? "border" : ""
                  }`}
                  onClick={() => setBetValue(num)}
                >
                  <DiceIcon number={num} size={40} />
                </button>
              ))}
            </div>
          )}

          {betType === "DoubleDice" && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  className={`p-4 rounded flex items-center justify-center gap-1 ${
                    betValue === num ? "border" : ""
                  }`}
                  onClick={() => setBetValue(num)}
                >
                  <DiceIcon number={num} size={32} />
                  <DiceIcon number={num} size={32} />
                </button>
              ))}
            </div>
          )}

          {betType === "Triple" && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  className={`p-4 rounded flex items-center justify-center gap-1 ${
                    betValue === num ? "border" : ""
                  }`}
                  onClick={() => setBetValue(num)}
                >
                  <DiceIcon number={num} size={36} />
                  <DiceIcon number={num} size={36} />
                  <DiceIcon number={num} size={36} />
                </button>
              ))}
            </div>
          )}

          {betType === "TwoDiceCombination" && (
            <div className="grid grid-cols-3 gap-3">
              {[
                [1, 2],
                [1, 3],
                [1, 4],
                [1, 5],
                [1, 6],
                [2, 3],
                [2, 4],
                [2, 5],
                [2, 6],
                [3, 4],
                [3, 5],
                [3, 6],
                [4, 5],
                [4, 6],
                [5, 6],
              ].map(([a, b]) => {
                const key = `${a},${b}`;
                return (
                  <button
                    key={key}
                    className={`p-4 rounded  flex items-center justify-center gap-1 ${
                      betValue === key ? "border" : ""
                    }`}
                    onClick={() => setBetValue(key)}
                  >
                    <DiceIcon number={a} size={36} />
                    <DiceIcon number={b} size={36} />
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mt-4">
            <button
              onClick={() => setBetBigSmall("Big")}
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-500 ${
                betBigSmall === "Big" ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              Big 1.9
            </button>

            <button
              onClick={() => setBetBigSmall("Small")}
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 ${
                betBigSmall === "Small" ? "ring-2 ring-blue-400" : ""
              }`}
            >
              Small 1.9
            </button>
            <button
              onClick={() => setBetOddEven("Odd")}
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 ${
                betOddEven === "Odd" ? "ring-2 ring-purple-400" : ""
              }`}
            >
              Odd 1.9
            </button>

            <button
              onClick={() => setBetOddEven("Even")}
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 ${
                betOddEven === "Even" ? "ring-2 ring-green-400" : ""
              }`}
            >
              Even 1.9
            </button>
          </div>

          {betValue && (
            <>
              {/* Preset Amounts + Input */}
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 10, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`px-4 py-2 rounded font-semibold border ${
                        betAmount == amt
                          ? "border-yellow-500 text-yellow-500"
                          : " border-gray-300 text-white"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Place Bet Button */}
              <button
                onClick={placeBet}
                className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 w-full"
              >
                Place Bet
              </button>
            </>
          )}
        </div>

        {/* Tabs for History, Chart, and My History */}
        <div className="w-full flex justify-evenly mt-6 space-x-2">
          <button
            className={`px-4 py-2 rounded-md font-semibold transition flex items-center justify-center 
            ${
              selectedTab === "gameHistory"
                ? "bg-yellow-500 text-white"
                : "border border-yellow-500 text-yellow-500 bg-transparent"
            } text-white
        `}
            onClick={() => setSelectedTab("gameHistory")}
          >
            Game History
          </button>

          <button
            className={`px-4 py-2 rounded-md font-semibold transition flex items-center justify-center 
                      ${
                        selectedTab === "myHistory"
                          ? "bg-yellow-500 text-white"
                          : "border border-yellow-500 text-yellow-500 bg-transparent"
                      }
                  text-white`}
            onClick={() => setSelectedTab("myHistory")}
          >
            My History
          </button>
        </div>

        {/* Displaying selected tab */}
        <div className="w-full bg-gray-300 rounded-lg mt-4">
          {selectedTab === "gameHistory" && (
            <>
              <div className="grid grid-cols-5 py-2 text-center bg-yellow-500 rounded-t-lg">
                {/* Headers */}
                <div className="font-semibold">Round</div>
                <div className="font-semibold">Pips</div>
                <div className="font-semibold">B/S</div>
                <div className="font-semibold">E/O</div>
                <div className="font-semibold">Result</div>
              </div>

              <div className="grid grid-cols-5 text-center py-1">
                {/* Game History Data */}
                {gameHistory?.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <React.Fragment key={index}>
                      <div className="py-1 text-sm">{game.roundId}</div>
                      <div className="py-1 text-sm font-bold">
                        {game.diceResult?.reduce((a, b) => a + b, 0)}
                      </div>
                      <div className="py-1 text-xs md:text-sm">
                        {game.bigSmall || "None"}
                      </div>
                      <div className="py-1 text-xs md:text-sm">
                        {game.oddEven || "None"}
                      </div>
                      <div className="flex gap-1">
                        {game.diceResult.map((val, i) => {
                          const DiceIcon = DiceMap[val];
                          return (
                            <DiceIcon key={i} className="w-6 h-6 text-black" />
                          );
                        })}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-2 text-gray-400">
                    No history available
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between p-4 mt-4">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                  onClick={() =>
                    setGameCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={gameCurrentPage === 1}
                >
                  ⬅️ Previous
                </button>
                <span className="text-white">
                  Page {gameCurrentPage} of {gameTotalPages}
                </span>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                  onClick={() =>
                    setGameCurrentPage((prev) =>
                      Math.min(prev + 1, gameTotalPages)
                    )
                  }
                  disabled={gameCurrentPage === gameTotalPages}
                >
                  Next ➡️
                </button>
              </div>
            </>
          )}

          {selectedTab === "myHistory" && (
            <>
              <div className="grid grid-cols-4 py-2 text-center bg-yellow-500 rounded-t-lg">
                {/* Headers */}
                <div className="font-semibold">Round</div>
                <div className="font-semibold">Bet Details</div>
                <div className="font-semibold">Bet Amount</div>
                <div className="font-semibold">Result</div>
              </div>

              <div className="grid grid-cols-4 text-center py-1">
                {/* My History Data */}
                {myHistory?.length > 0 ? (
                  myHistory.map((game, index) => (
                    <React.Fragment key={index}>
                      <div className="text-sm py-1">{game.roundId}</div>

                      <div className="text-xs md:text-sm py-1">
                        {betTypeLetters[game.bets[0]?.betType] || "None"}-
                        {game.bets[0].betValue || "None"}
                      </div>
                      <div className="text-xs md:text-sm py-1">
                        {game.bets[0].betAmount || "None"}
                      </div>
                      <div className="text-xs md:text-sm py-1">
                        {game?.bets[0]?.result}
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-5 text-center py-2 text-gray-400">
                    No history available
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between mt-4 p-4">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                  onClick={() =>
                    setMyCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={myCurrentPage === 1}
                >
                  ⬅️ Previous
                </button>
                <span className="text-white">
                  Page {myCurrentPage} of {myTotalPages}
                </span>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
                  onClick={() =>
                    setMyCurrentPage((prev) => Math.min(prev + 1, myTotalPages))
                  }
                  disabled={myCurrentPage === myTotalPages}
                >
                  Next ➡️
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default K3Game;
