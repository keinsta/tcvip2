import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Timer, RefreshCcw } from "lucide-react";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../config/axiosInstance";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");
const socket = io(`${API_BASE_URL}/game/racing`, {
  transports: ["websocket"],
  autoConnect: false,
});

const gameModes = [
  { label: "Racing 30sec", mode: "30s", time: 30 },
  { label: "Racing 1min", mode: "1min", time: 60 },
  { label: "Racing 3min", mode: "3min", time: 180 },
  { label: "Racing 5min", mode: "5min", time: 300 },
];

const RacingGame = () => {
  const { user, userId, fetchUser } = useAuthStore();
  const userBalance = user?.totalBalance;
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();

  const [mode, setMode] = useState("30s");
  const [roundId, setRoundId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [cars, setCars] = useState([]);
  const [result, setResult] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [betValue, setBetValue] = useState(null);
  const [selectedBigSmall, setSelectedBigSmall] = useState(null);
  const [selectedOddEven, setSelectedOddEven] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [selectedTab, setSelectedTab] = useState("gameHistory"); // Default tab
  // Game History States
  const [gameHistory, setGameHistory] = useState([]);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const [gameTotalPages, setGameTotalPages] = useState(1);
  // My History States
  const [myHistory, setMyHistory] = useState([]);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);

  const lastTimeRef = useRef(null);
  const pendingRaceResultRef = useRef(null);
  const queuedResultRef = useRef(null); // ✅ holds queued result

  const handleGameModeChange = (m) => {
    setMode(m.mode);
  };

  const handleBetResult = (data) => {
    // ✅ Store in both state and ref
    queuedResultRef.current = data;
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true); // Start spinning
    await fetchUser(); // Fetch updated user details
    setIsRefreshing(false); // Stop spinning
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

  const resetCars = () => {
    setCars(
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        speed: Math.random() * 3 + 2,
        placement: null,
      }))
    );
  };

  const startRace = (raceData) => {
    const updatedCars = Array.from({ length: 10 }, (_, i) => {
      const id = i + 1;
      const place = raceData.rankings.indexOf(id) + 1;

      let speed = Math.random() * 2 + 4.5;
      if (place === 1) speed = 3;
      else if (place === 2) speed = 3.5;
      else if (place === 3) speed = 4;

      return { id, speed, placement: place || null };
    });

    setCars(updatedCars);

    setTimeout(() => {
      if (queuedResultRef.current) {
        setResult(queuedResultRef.current);
        // console.log(queuedResultRef.current);
        setShowResult(true);

        setTimeout(() => {
          setShowResult(false);
          setResult(null);
        }, 4000);

        queuedResultRef.current = null; // clear ref
      }
    }, 100);
  };

  const calculateTotalBet = () => {
    let count = 0;
    if (betValue) count++;
    if (selectedBigSmall) count++;
    if (selectedOddEven) count++;
    return count;
  };

  const placeBet = () => {
    if (!betAmount || betAmount <= 0 || betAmount > balance) {
      toast.error("Invalid bet amount!");
      return;
    }

    if (!betValue || !selectedBigSmall || !selectedOddEven) {
      toast(
        "Please select a car number, Big/Small, and Odd/Even before placing a bet."
      );
      return;
    }

    socket.emit("placeRaceBet", {
      userId,
      mode,
      betAmount,
      betValue,
      bigSmall: selectedBigSmall,
      oddEven: selectedOddEven,
    });

    handleUpdateUserBalance(-betAmount);
    toast.success(
      `Bet placed on Car ${betValue} ${selectedOddEven} ${selectedBigSmall} with ₹${
        betAmount * 0.98
      }`
    );

    // Reset selections after placing the bet
    setBetValue(null);
    setSelectedBigSmall(null);
    setSelectedOddEven(null);
  };

  // ✅ Fetches all game history (without user-specific filtering)
  const fetchGameHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/racing/history/${mode}?page=${page}`
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
        `/game/racing/my-history/${userId}?page=${page}`
      );

      setMyHistory(response.data.history);
      setMyCurrentPage(response.data.currentPage);
      setMyTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
    socket.emit("joinRaceMode", mode);

    const handleTimerUpdate = ({ mode: serverMode, timeLeft: serverTime }) => {
      if (serverMode !== mode) return;

      if (serverTime !== lastTimeRef.current) {
        lastTimeRef.current = serverTime;
        setTimeLeft(serverTime);

        if (serverTime === 24) {
          setRaceInProgress(false);
          setResult(null);
          resetCars();
        }
      }
    };

    const handleCurrentRace = ({ latestRace }) => {
      pendingRaceResultRef.current = latestRace;
      setRoundId(latestRace.roundId);
    };

    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("currentRaceRound", handleCurrentRace);
    socket.on("raceBetResult", handleBetResult); // ✅ use top-level handler

    return () => {
      socket.emit("leaveRaceMode", mode);
      socket.off("timerUpdate", handleTimerUpdate);
      socket.off("currentRaceRound", handleCurrentRace);
      socket.off("raceBetResult", handleBetResult);
    };
  }, [mode]);

  useEffect(() => {
    if (timeLeft === 0 && !raceInProgress && pendingRaceResultRef.current) {
      const queuedRace = pendingRaceResultRef.current;
      setRaceInProgress(true);
      startRace(queuedRace);
      pendingRaceResultRef.current = null;
      fetchGameHistory(gameCurrentPage);
      fetchMyHistory(myCurrentPage);
    }
  }, [timeLeft, raceInProgress]);

  // Fetch data when page changes
  useEffect(() => {
    if (selectedTab === "myHistory") {
      fetchMyHistory(myCurrentPage);
    } else if (selectedTab === "gameHistory") {
      fetchGameHistory(gameCurrentPage);
    }
  }, [gameCurrentPage, myCurrentPage, selectedTab]);

  useEffect(() => {
    // console.log("time left to 00000");
    // console.log(result);

    // console.log(countdown, betResult);
    if (result?.result) {
      if (result.result === "Won") {
        toast("🏆 You Won the Bet");
      } else {
        toast("😢 You Lost the Bet");
      }

      // if payoutAmount then update other wise update 0
      if (result.payoutAmount !== 0) {
        handleUpdateUserBalance(result?.payoutAmount);
        handleRefreshBalance();
      }
    }
  }, [result]);

  useEffect(() => {
    resetCars();
  }, []);

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
          <span className="text-lg">Car Racing</span>
        </div>
      </div>

      <div className="w-full p-4">
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
        <div className="grid grid-cols-4 gap-2 w-full max-w-lg my-4">
          {gameModes.map((m, index) => (
            <button
              key={index}
              className={`p-2 rounded-lg font-semibold hover:opacity-80 transition flex flex-col items-center justify-center 
              ${
                mode === m.mode
                  ? "bg-yellow-600 text-white"
                  : "border border-yellow-500 text-yellow-500"
              }`}
              onClick={() => handleGameModeChange(m)}
            >
              <Timer className="w-6 h-6" />
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center gap-2 w-full max-w-lg text-lg mb-4">
          <div className="flex flex-col p-2 bg-yellow-600 w-1/2 rounded-md">
            <span className="text-sm font-semibold text-white">Round</span>
            <span className="text-white">
              {roundId ? roundId.split("-").pop() : "Loading..."}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-yellow-600 w-1/2 rounded-md">
            <span className="text-sm font-semibold text-white">Time Left:</span>
            <span className="text-lg text-white">
              {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
            </span>
          </div>
        </div>
        {showResult && result && (
          <div className="mt-4 bg-yellow-100 p-4 rounded">
            <p>🎉 Result: {result.result}</p>
            <p>Payout: {result.payoutAmount} INR</p>
            <p>
              🏁 1st: {result.raceResult.firstPlace} | Odd/Even:{" "}
              {result.raceResult.oddEven} | Big/Small:{" "}
              {result.raceResult.bigSmall}
            </p>
          </div>
        )}
        <div className="relative h-[160px] border rounded overflow-hidden mb-4 bg-[url('/images/games/car-racing/road.jpg')]">
          {cars.map((car, idx) => (
            <div
              key={car.id}
              className="absolute w-12 h-12 rounded-full overflow-hidden transition-all"
              style={{
                top: `${idx * 8}%`,
                right: raceInProgress ? "100%" : "8px",
                animationName: raceInProgress ? "carDrive" : "none",
                animationDuration: `${car.speed}s`,
                animationTimingFunction: "linear",
                animationFillMode: "forwards",
              }}
            >
              <img
                src={`/images/games/car-racing/car${car.id}.png`}
                alt={`Car ${car.id}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
        <div className="relative">
          {/* Timer Overlay */}
          {timeLeft > 0 && timeLeft <= 5 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-6xl font-bold text-white bg-yellow-800 px-6 py-4 rounded-xl shadow-lg backdrop-blur-md">
                {timeLeft}
              </div>
            </div>
          )}
          <div
            className={`bet-area transition-all duration-300 ${
              timeLeft > 0 && timeLeft <= 5 ? "blur-sm pointer-events-none" : ""
            }`}
          >
            {/* // Number selection 1-10 */}
            <div className="grid grid-cols-5 gap-4 my-6 max-w-md mx-auto">
              {Array.from({ length: 10 }, (_, i) => {
                const num = (i + 1).toString();
                const colorClasses = [
                  "border-yellow-500",
                  "border-blue-500",
                  "border-gray-800",
                  "border-orange-500",
                  "border-sky-400",
                  "border-purple-600",
                  "border-gray-400",
                  "border-red-400",
                  "border-red-500",
                  "border-green-400",
                ];
                return (
                  <div key={num} className="flex flex-col items-center">
                    <button
                      onClick={() => setBetValue(betValue === num ? null : num)}
                      className={`text-white w-12 h-12 rounded-full border-[8px] flex items-center justify-center font-bold ${
                        colorClasses[i]
                      } ${betValue === num ? "bg-gray-500 text-black" : ""}`}
                    >
                      {num}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="w-full flex justify-between gap-2">
              {/* // Big / Small */}
              <div className="w-full flex justify-between gap-2 ">
                {["Big", "Small"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedBigSmall(
                        selectedBigSmall === type ? null : type
                      )
                    }
                    className={`w-full rounded-lg text-white font-semibold py-2 px-4 shadow-md ${
                      selectedBigSmall === type
                        ? "bg-yellow-600"
                        : "bg-gradient-to-r from-yellow-600 to-yellow-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {/* // Odd / Even */}
              <div className="w-full flex justify-between gap-2 ">
                {["Odd", "Even"].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedOddEven(selectedOddEven === type ? null : type)
                    }
                    className={`w-full rounded-lg text-white font-semibold py-2 px-4 shadow-md ${
                      selectedOddEven === type
                        ? "bg-yellow-600"
                        : "bg-gradient-to-r from-green-600 to-green-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* // Bet Summary + Place Bet */}
            <div className="w-full max-w-md mx-auto">
              {calculateTotalBet() > 0 && (
                <>
                  <div className="my-4 flex justify-between items-center w-full max-w-md mx-auto">
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Adjust Bet Amount:{" "}
                      </p>
                    </div>

                    {calculateTotalBet() > 0 && (
                      <div className="flex gap-2">
                        {[1, 5, 10, 100].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setBetAmount(amt)}
                            className={`px-3 py-1 rounded-md font-semibold border ${
                              betAmount === amt
                                ? "bg-yellow-600 text-white border-yellow-600"
                                : "border-yellow-500 text-yellow-500"
                            }`}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="w-full flex justify-between mb-2">
                    <label className="text-white">Bet Amount:</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full max-w-[140px] px-4 py-2 rounded-xl border border-yellow-500 text-white bg-yellow-500/10 backdrop-blur-md placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-400 transition-all duration-300 shadow-inner no-spinner"
                    />
                  </div>

                  <button
                    onClick={placeBet}
                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md my-2"
                  >
                    Place Bet
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <style>{`
        .bet-area {
  transition: filter 0.3s ease;
}
.blur-sm {
  filter: blur(4px);
}

          @keyframes carDrive {
  from {
    right: 8px;
  }
  to {
    right: 100%;
  }
}

@keyframes scrollScenery {
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: -1000px;
  }
}

.animate-scenery {
  animation: scrollScenery 10s linear infinite;
  background-image: url('/images/games/car-racing/scenery.png');
  background-size: cover;
}

.animate-road {
  animation: scrollScenery 4s linear infinite;
  background-image: url('/images/games/car-racing/road-overlay.png');
  background-size: cover;
}

        `}</style>
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
              <div className="font-semibold">First Place</div>
              <div className="font-semibold">Rank</div>
              <div className="font-semibold">B/S</div>
              <div className="font-semibold">E/O</div>
            </div>

            <div className="grid grid-cols-5 text-center py-1">
              {/* Game History Data */}
              {gameHistory?.length > 0 ? (
                gameHistory.map((game, index) => (
                  <React.Fragment key={index}>
                    <div className="py-1 text-sm">{game.roundId}</div>
                    <div className="py-1 text-sm font-bold">
                      {game.firstPlace}
                    </div>
                    <div>
                      {game.rankings[0]} {game.rankings[1]} {game.rankings[2]}
                    </div>
                    <div className="py-1 text-xs md:text-sm">
                      {game.bigSmall || "None"}
                    </div>
                    <div className="py-1 text-xs md:text-sm">
                      {game.oddEven || "None"}
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
            <div className="grid grid-cols-6 py-2 text-center bg-yellow-500 rounded-t-lg">
              {/* Headers */}
              <div className="font-semibold">Round</div>
              <div className="font-semibold">My Place</div>
              <div className="font-semibold">Rank</div>
              <div className="font-semibold">B/S</div>
              <div className="font-semibold">E/O</div>
              <div className="font-semibold">Result</div>
            </div>

            <div className="grid grid-cols-6 text-center py-1">
              {/* My History Data */}
              {myHistory?.length > 0 ? (
                myHistory.map((game, index) => (
                  <React.Fragment key={index}>
                    <div className="text-sm py-1">{game.roundId}</div>
                    <div className="py-1 text-sm font-bold">
                      {game.firstPlace}
                    </div>
                    <div>
                      {game.rankings[0]} {game.rankings[1]} {game.rankings[2]}
                    </div>
                    <div className="text-xs md:text-sm py-1">
                      {game.bigSmall || "None"}
                    </div>
                    <div className="text-xs md:text-sm py-1">
                      {game.oddEven || "None"}
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
  );
};

export default RacingGame;
