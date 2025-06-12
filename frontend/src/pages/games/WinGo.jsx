import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCcw, Timer } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../config/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");
const winGoSocket = io(`${API_BASE_URL}/game/wingo`, {
  transports: ["websocket"],
  autoConnect: false, // ❌ Prevent auto-reconnecting on every mode change
});

const numbers = Array.from({ length: 10 }, (_, i) => i);
const gameModes = [
  { label: "Win Go 30sec", mode: "30s", time: 30 },
  { label: "Win Go 1min", mode: "1min", time: 60 },
  { label: "Win Go 3min", mode: "3min", time: 180 },
  { label: "Win Go 5min", mode: "5min", time: 300 },
];

const WinGoGame = () => {
  const { user, userId, fetchUser } = useAuthStore();
  const userBalance = user?.totalBalance;
  const navigate = useNavigate();
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [winningNumber, setWinningNumber] = useState(null);
  const [balance, setBalance] = useState(1000);
  const [activeBet, setActiveBet] = useState(false);
  const [selectedMode, setSelectedMode] = useState("30s");
  const [countdown, setCountdown] = useState(30);
  const [selectedTab, setSelectedTab] = useState("gameHistory"); // Default tab
  const [selectedBigSmall, setSelectedBigSmall] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [betResult, setBetResult] = useState({});

  // Game History States
  const [gameHistory, setGameHistory] = useState([]);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const [gameTotalPages, setGameTotalPages] = useState(1);
  // My History States
  const [myHistory, setMyHistory] = useState([]);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true); // Start spinning
    await fetchUser(); // Fetch updated user details
    setIsRefreshing(false); // Stop spinning
  };

  // Handle selecting game mode
  const handleGameModeChange = (mode) => {
    setSelectedMode(mode.mode); // Update selected mode (useEffect will handle rejoining)
  };

  // Format countdown as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
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

  // Function to place a bet
  const placeBet = () => {
    if (!betAmount || betAmount <= 0 || betAmount > balance) {
      toast.error("Invalid bet amount!");
      return;
    }

    // console.log(
    //   userId,
    //   selectedColor,
    //   selectedBigSmall,
    //   selectedMode,
    //   selectedNumber,
    //   betAmount
    // );

    winGoSocket.emit("placeBet", {
      userId,
      betColor: selectedColor,
      betCategory: selectedBigSmall,
      mode: selectedMode,
      betNumber: selectedNumber,
      betAmount,
    });

    // deduct bet amount from user balance
    handleUpdateUserBalance(-betAmount);

    toast.success(
      `Bet placed on ${selectedNumber} ${selectedColor} ${selectedBigSmall} with ₹${
        betAmount * 0.98
      }`
    );

    setSelectedBigSmall("");
    setSelectedColor("");
    setSelectedNumber(null);
    setBetAmount("");
  };

  // ✅ Fetches all game history (without user-specific filtering)
  const fetchGameHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/wingo/history/${selectedMode}?page=${page}`
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
        `/game/wingo/my-history/${userId}?page=${page}`
      );

      setMyHistory(response.data.history);
      setMyCurrentPage(response.data.currentPage);
      setMyTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };

  useEffect(() => {
    // console.log("running after mode:", selectedMode);
    // ✅ Connect only once when the page loads
    if (!winGoSocket.connected) {
      winGoSocket.connect();
      // console.log("✅ Socket connected");
    }

    // ✅ Join game mode when `selectedMode` changes (no reconnection)
    winGoSocket.emit("joinGameMode", selectedMode);
    // console.log(`📡 Joined mode: ${selectedMode}`);

    // ✅ Timer update listener (only for selected mode)
    const handleTimerUpdate = (mode) => {
      if (mode.mode === selectedMode) {
        setCountdown(mode.timeLeft);
      }
    };
    winGoSocket.on("timerUpdate", handleTimerUpdate);

    // ✅ Clear previous event listeners before adding a new one
    winGoSocket.off("newBetRound");
    winGoSocket.on("newBetRound", (data) => {
      // console.log("New Bet Round:", data);
    });

    let activeBetToastId = ""; // Define the toast ID outside the event handlers so it persists

    // ✅ Remove previous listener before adding a new one
    winGoSocket.off("currentBetRound");
    winGoSocket.on("currentBetRound", (data) => {
      // console.log(data);

      // Update activeBet state when new round data is received
      setActiveBet(data.activeBet);

      // If there is an active bet, dismiss any previous toast and do nothing
      if (data.activeBet) {
        if (activeBetToastId) {
          toast.dismiss(activeBetToastId); // Dismiss toast if it's shown
        }
        return; // Exit early if there is an active bet
      }

      // If no active bet, show a new loading toast and store its ID
      if (activeBetToastId) {
        toast.dismiss(activeBetToastId); // Dismiss any previous loading toast
      }

      // Show a new loading toast
      activeBetToastId = toast.loading(
        `No Active Bet! Wait for next Round: ${selectedMode}`
      );

      // Auto dismiss after a few seconds (optional)
      setTimeout(() => toast.dismiss(activeBetToastId), 2000);
    });

    // ✅ Check for active bet status
    winGoSocket.off("checkBetActive");
    winGoSocket.on("checkBetActive", (data) => {
      // Update activeBet state when new bet data is received
      setActiveBet(data.activeBet);

      // If there is an active bet, dismiss any previous toast and do nothing
      if (data.activeBet) {
        if (activeBetToastId) {
          toast.dismiss(activeBetToastId); // Dismiss toast if it's shown
        }
        return; // Exit early if there is an active bet
      }

      // If no active bet, show a new loading toast and store its ID
      if (activeBetToastId) {
        toast.dismiss(activeBetToastId); // Dismiss any previous loading toast
      }

      // Show a new loading toast
      activeBetToastId = toast.loading(
        `No Active Bet! Wait for next Round: ${selectedMode}`
      );

      // Auto dismiss after a few seconds (optional)
      setTimeout(() => toast.dismiss(activeBetToastId), 2000);
    });

    // // ✅ Listen for game results
    const handleWinGoResult = (data) => {
      setBetResult(data);
      // console.log(data);
    };
    winGoSocket.on("betResult", handleWinGoResult);

    return () => {
      // ✅ Remove only event listeners (Do not disconnect socket)
      winGoSocket.emit("leaveGameMode", selectedMode);
      winGoSocket.off("timerUpdate", handleTimerUpdate);
      // winGoSocket.off("winGoResult", handleWinGoResult);
      // console.log(`🚀 Left mode: ${selectedMode}`);
    };
  }, [selectedMode]); // 🔄 Runs when `selectedMode` changes

  useEffect(() => {
    return () => {
      // ✅ Disconnect only when leaving the page
      winGoSocket.disconnect();
      // console.log("❌ Socket disconnected");
    };
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    if (selectedTab === "myHistory") {
      fetchMyHistory(myCurrentPage);
    } else if (selectedTab === "gameHistory") {
      fetchGameHistory(gameCurrentPage);
    }
  }, [gameCurrentPage, myCurrentPage, selectedTab]);

  useEffect(() => {
    if (countdown === 0) {
      fetchGameHistory(gameCurrentPage);
      fetchMyHistory(myCurrentPage);

      // console.log(countdown, betResult);
      if (betResult.gameResult?.drawnNumber) {
        if (betResult.result === "Won") {
          toast("🏆 You Won the Bet");
        } else {
          toast("😢 You Lost the Bet");
        }
        setWinningNumber(betResult.gameResult?.drawnNumber);

        // if payoutAmount then update other wise update 0
        if (betResult.payoutAmount !== 0) {
          handleUpdateUserBalance(betResult?.payoutAmount);
          handleRefreshBalance();
        }
      }

      setTimeout(() => {
        setWinningNumber(null);
        setBetResult({});
      }, 2000);
    }
  }, [countdown]);

  useEffect(() => {
    setBalance(userBalance);
  }, [userBalance]);

  return (
    <div className="mb-28 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg font-semibold">🎲 Win Go</span>
        </div>
        <button
          className="font-semibold"
          onClick={() => navigate("/rules/WinGo30S")}
        >
          Game Rules
        </button>
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

        {/* Game Mode Selection */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-lg my-4">
          {gameModes.map((mode, index) => (
            <button
              key={index}
              className={`p-2 rounded-lg font-semibold hover:opacity-80 transition flex flex-col items-center justify-center 
                ${
                  selectedMode === mode.mode
                    ? "bg-yellow-600 text-white"
                    : "border border-yellow-500 text-yellow-500"
                }
            text-white`}
              onClick={() => handleGameModeChange(mode)}
            >
              <Timer className="w-6 h-6" />
              <span className="text-xs">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Winning Number Display */}
        {winningNumber !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-6 text-2xl font-bold text-yellow-400"
          >
            🎉 Winning Number: {winningNumber} 🎉 Mode: {selectedMode}
          </motion.div>
        )}

        {/* Betting Options with Blur Effect */}
        <div className="relative w-full max-w-lg">
          {/* Overlay if No active for related mode */}
          {!activeBet && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center 
        bg-black bg-opacity-50 text-yellow-500 text-3xl font-bold rounded-lg z-10"
            >
              ⏳ {countdown} sec
            </div>
          )}

          {/* Overlay Timer When Countdown ≤ 5 Seconds */}
          {countdown > 0 && countdown <= 10 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center 
        bg-black bg-opacity-50 text-yellow-500 text-3xl font-bold rounded-lg z-10"
            >
              ⏳ {countdown} sec
            </div>
          )}

          {/* Betting Options (Blur when countdown is ≤ 5) */}
          <div
            className={`bg-[#595959] text-white p-4 rounded-lg shadow-lg w-full space-y-4 transition-all 
      ${countdown <= 10 ? "blur-sm pointer-events-none" : ""} relative z-0`}
          >
            <div className="grid grid-cols-3 gap-2 w-full max-w-md">
              <button
                onClick={() => setSelectedColor("Green")}
                className={`flex justify-between p-2 rounded-lg ${
                  selectedColor === "Green" ? "bg-green-600" : "bg-green-500"
                }`}
              >
                <span>Green</span> <span>2</span>
              </button>
              <button
                onClick={() => setSelectedColor("Purple")}
                className={`flex justify-between p-2 rounded-lg ${
                  selectedColor === "Purple" ? "bg-purple-600" : "bg-purple-500"
                }`}
              >
                <span>Purple</span> <span>4.5</span>
              </button>
              <button
                onClick={() => setSelectedColor("Red")}
                className={`flex justify-between p-2 rounded-lg ${
                  selectedColor === "Red" ? "bg-red-600" : "bg-red-500"
                }`}
              >
                <span>Red</span>
                <span>2</span>
              </button>
            </div>

            <h2 className="text-lg font-semibold mb-2">Pick a Number:</h2>
            <div className="grid grid-cols-5 gap-4">
              {numbers.map((num) => {
                const isSelected = selectedNumber === num;

                let baseStyles =
                  "w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center text-base md:text-lg lg:text-xl font-extrabold rounded-full transition-all duration-300 shadow-md";

                let colorStyles = "";

                if (isSelected) {
                  colorStyles =
                    "bg-yellow-400 text-black ring-2 ring-yellow-300 shadow-lg shadow-yellow-300";
                } else if (num === 0 || num === 5) {
                  colorStyles =
                    "bg-gradient-to-br from-green-400 via-purple-500 to-red-500 text-white border border-purple-700 shadow-md shadow-purple-500/40";
                } else if (num % 2 === 0) {
                  colorStyles =
                    "bg-red-500 text-white hover:bg-red-600 shadow-inner shadow-red-700/50";
                } else {
                  colorStyles =
                    "bg-green-500 text-white hover:bg-green-600 shadow-inner shadow-green-700/50";
                }

                return (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedNumber(num)}
                    className={`${baseStyles} ${colorStyles}`}
                  >
                    {num}
                  </motion.button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-md mt-4">
              <button
                onClick={() => setSelectedBigSmall("Big")}
                className={`flex justify-between p-3 rounded-lg ${
                  selectedBigSmall === "Big" ? "bg-orange-600" : "bg-orange-500"
                }`}
              >
                <span>Big</span>
                <span>2</span>
              </button>
              <button
                onClick={() => setSelectedBigSmall("Small")}
                className={`flex justify-between p-3 rounded-lg ${
                  selectedBigSmall === "Small" ? "bg-gray-600" : "bg-gray-500"
                }`}
              >
                <span>Small</span>
                <span>2</span>
              </button>
            </div>

            {/* Bet Amount Input */}
            <div className="mt-4">
              <label className="block mb-2 text-sm">Enter Bet Amount (₹)</label>
              <input
                type="number"
                placeholder="Please enter betting amount..."
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full p-2 border-2 rounded-xl text-white bg-transparent focus:outline-none text-sm no-spinner"
              />
            </div>

            {/* Countdown Timer */}
            <div className="mt-4 text-center text-lg font-bold text-yellow-400">
              ⏳ Betting Closes In: {formatTime(countdown)}
            </div>

            {/* Place Bet Button */}
            <button
              onClick={placeBet}
              className="mt-4 w-full bg-yellow-500 p-3 rounded-lg font-semibold hover:bg-yellow-600"
            >
              Place Bet
            </button>
          </div>
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
              selectedTab === "chart"
                ? "bg-yellow-500 text-white"
                : "border border-yellow-500 text-yellow-500 bg-transparent"
            }
        text-white`}
            onClick={() => setSelectedTab("chart")}
          >
            Chart
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
              <div className="grid grid-cols-4 py-2 text-center bg-yellow-500 rounded-t-lg">
                {/* Headers */}
                <div className="font-semibold">Round</div>
                <div className="font-semibold">Number</div>
                <div className="font-semibold">Color</div>
                <div className="font-semibold">B/S</div>
              </div>

              <div className="grid grid-cols-4 text-center py-1">
                {/* Game History Data */}
                {gameHistory?.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <React.Fragment key={index}>
                      <div className="py-1 text-sm">
                        {/* {game.roundId.split("-")[2]?.slice(-8)} */}
                        {game.roundId}
                      </div>
                      <div className="py-1 text-sm font-bold">
                        {game.drawnNumber}
                      </div>
                      <div
                        className={`py-1 text-sm font-semibold ${
                          game.color === "Red"
                            ? "text-red-500"
                            : game.color === "Green"
                            ? "text-green-500"
                            : game.color === "Purple"
                            ? "text-purple-500"
                            : "text-gray-400"
                        }`}
                      >
                        {game.color || "None"}
                      </div>
                      <div className="py-1 text-xs md:text-sm">
                        {game.category || "None"}
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

          {selectedTab === "chart" && (
            <div className="p-4 rounded-lg w-full max-w-lg">
              <div className="grid grid-cols-[25%_75%]">
                {/* Left Column - Rounds (30%) */}
                <div className="">
                  <h3 className="font-semibold mb-2">Rounds</h3>
                  {gameHistory.map((game, index) => (
                    <p key={index} className="mb-1">
                      {game.roundId}
                    </p>
                  ))}
                </div>

                {/* Right Column - Chart (70%) */}
                <div className="">
                  <h3 className="font-semibold mb-2">Winning Numbers</h3>
                  {gameHistory.map((game, index) => (
                    <div key={index} className="flex justify-between">
                      {numbers.map((num) => (
                        <span
                          key={num}
                          className={`mb-1 p-1 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full 
              ${
                num === game.drawnNumber
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-gray-300"
              }`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === "myHistory" && (
            <>
              <div className="grid grid-cols-5 py-2 text-center bg-yellow-500 rounded-t-lg">
                {/* Headers */}
                <div className="font-semibold">Round</div>
                <div className="font-semibold">Number</div>
                <div className="font-semibold">Color</div>
                <div className="font-semibold">B/S</div>
                <div className="font-semibold">Result</div>
              </div>

              <div className="grid grid-cols-5 text-center py-1">
                {/* My History Data */}
                {myHistory?.length > 0 ? (
                  myHistory.map((game, index) => (
                    <React.Fragment key={index}>
                      <div className="text-sm py-1">
                        {/* {game.roundId.split("-")[2]?.slice(-8)} */}
                        {game.roundId}
                      </div>
                      <div className="py-1 text-sm font-bold">
                        {game.drawnNumber}
                      </div>
                      <div
                        className={`py-1 text-sm font-semibold ${
                          game.color === "Red"
                            ? "text-red-500"
                            : game.color === "Green"
                            ? "text-green-500"
                            : game.color === "Purple"
                            ? "text-purple-500"
                            : "text-gray-400"
                        }`}
                      >
                        {game.color || "None"}
                      </div>
                      <div className="text-xs md:text-sm py-1">
                        {game.category || "None"}
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

export default WinGoGame;
