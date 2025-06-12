import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { ArrowLeft, Timer, RefreshCcw } from "lucide-react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import axiosInstance from "../../config/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");
const socket = io(`${API_BASE_URL}/game/fiveD`, {
  transports: ["websocket"],
  autoConnect: false,
});
const gameModes = [
  { label: "K3 30sec", mode: "30s", time: 30 },
  { label: "K3 1min", mode: "1min", time: 60 },
  { label: "K3 3min", mode: "3min", time: 180 },
  { label: "K3 5min", mode: "5min", time: 300 },
];
// ... top imports remain unchanged

const tabMap = { A: "A", B: "B", C: "C", D: "D", E: "E", SUM: "SUM" };

export default function FiveDGame() {
  const { user, userId, fetchUser } = useAuthStore();
  const userBalance = user?.totalBalance;
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mode, setMode] = useState("30s");
  const [timer, setTimer] = useState(0);
  const [result, setResult] = useState(null);
  const [betBigSmall, setBetBigSmall] = useState(null);
  const [betOddEven, setBetOddEven] = useState(null);

  const [selectedTab, setSelectedTab] = useState("gameHistory"); // Default tab
  // Game History States
  const [gameHistory, setGameHistory] = useState([]);
  const [gameCurrentPage, setGameCurrentPage] = useState(1);
  const [gameTotalPages, setGameTotalPages] = useState(1);
  // My History States
  const [myHistory, setMyHistory] = useState([]);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);

  // ✅ Fetches all game history (without user-specific filtering)
  const fetchGameHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/five-d/history/${mode}?page=${page}`
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
        `/game/five-d/my-history/${userId}?page=${page}`
      );

      setMyHistory(response.data.history);
      setMyCurrentPage(response.data.currentPage);
      setMyTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };

  const [bet, setBet] = useState({
    position: "A",
    type: "Number",
    number: null,
    amount: 0,
  });

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();
    fetchUser();

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    socket.emit("joinMode", mode);

    socket.on("roundStart", ({ roundId, timer }) => {
      setTimer(timer);
      setResult(null);
    });

    socket.on("timer", ({ timer }) => setTimer(timer));
    socket.on("roundResult", ({ result }) => {
      // console.log("Round Result Received:", result);
      setResult(result);
    });

    socket.on("betConfirmed", () => toast("✅ Bet placed!"));
    socket.on("betRejected", ({ message }) => toast("❌ " + message));

    return () => {
      socket.off("roundStart");
      socket.off("timer");
      socket.off("roundResult");
      socket.off("betConfirmed");
      socket.off("betRejected");
    };
  }, [mode]);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await fetchUser();
    setIsRefreshing(false);
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
    if (!bet.amount || !bet.number) return toast("Fill all required fields");
    if (bet.amount > balance) return toast("Invalid Bet Amount");
    socket.emit("placeBet", {
      mode,
      bet: {
        ...bet,
        userId,
        bigSmall: betBigSmall, // can be null
        oddEven: betOddEven, // can be null
      },
    });

    handleUpdateUserBalance(-bet.amount);

    setBet({
      position: "A",
      type: "Number",
      number: null,
      amount: 0,
    });
    setBetBigSmall(null);
    setBetOddEven(null);
  };

  useEffect(() => {
    fetchGameHistory(gameCurrentPage);
    if (result) {
      if (result[0]?.won) {
        toast("🏆 You Won the Bet");
      } else {
        toast("😢 You Lost the Bet");
      }

      if (result[0].payout !== 0) {
        handleUpdateUserBalance(result[0]?.payout);
        handleRefreshBalance();
      }
    }
  }, [result]);

  // Fetch data when page changes
  useEffect(() => {
    if (selectedTab === "gameHistory") {
      fetchGameHistory(gameCurrentPage);
    } else if (selectedTab === "myHistory") {
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
          <span className="text-lg">🎲 5D</span>
        </div>
      </div>

      <div className="w-full p-4 space-y-4 flex flex-col items-center">
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

        <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
          {gameModes.map((m) => (
            <button
              key={m.mode}
              className={`p-2 rounded-lg font-semibold hover:opacity-80 transition flex flex-col gap-1 items-center justify-center ${
                mode === m.mode
                  ? "bg-yellow-600 text-white"
                  : "border border-yellow-500 text-yellow-500"
              }`}
              onClick={() => setMode(m.mode)}
            >
              <Timer className="w-6 h-6" />
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="w-full flex flex-col p-2 bg-yellow-600 rounded-md">
          <span className="text-sm font-semibold text-white">Time Left:</span>
          <span className="text-2xl text-white">
            {timer !== null ? formatTime(timer) : "Loading..."}
          </span>
        </div>

        {/* Bet Tabs */}
        <div className="w-full bg-[#595959] p-4 shadow rounded-lg mt-6 space-y-4">
          {/* Position Tabs */}
          <div className="flex gap-2">
            {Object.keys(tabMap).map((key) => (
              <button
                key={key}
                className={`px-4 py-2 rounded-full font-bold ${
                  bet.position === tabMap[key]
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => {
                  setBet({ ...bet, number: null, position: tabMap[key] });
                }}
              >
                {key}
              </button>
            ))}
          </div>

          <hr className="border-t border-gray-300 my-4" />

          {/* Number Selection */}
          {bet.position !== "SUM" && bet.type === "Number" && (
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i}
                  className={`w-12 h-12 rounded-full font-bold text-sm flex items-center justify-center
          ${
            i % 2 === 0
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          } 
          ${bet.number === i ? "ring-2 ring-yellow-500" : ""}`}
                  onClick={() => setBet({ ...bet, number: i })}
                >
                  {i}
                </button>
              ))}
            </div>
          )}

          {/* Big / Small and Odd / Even */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <button
              onClick={() =>
                setBetBigSmall(betBigSmall === "Big" ? null : "Big")
              }
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-500 ${
                betBigSmall === "Big" ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              Big 1.9
            </button>
            <button
              onClick={() =>
                setBetBigSmall(betBigSmall === "Small" ? null : "Small")
              }
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 ${
                betBigSmall === "Small" ? "ring-2 ring-blue-400" : ""
              }`}
            >
              Small 1.9
            </button>
            <button
              onClick={() => setBetOddEven(betOddEven === "Odd" ? null : "Odd")}
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 ${
                betOddEven === "Odd" ? "ring-2 ring-purple-400" : ""
              }`}
            >
              Odd 1.9
            </button>
            <button
              onClick={() =>
                setBetOddEven(betOddEven === "Even" ? null : "Even")
              }
              className={`w-full px-4 py-2 rounded font-semibold text-white bg-gradient-to-r from-pink-600 to-pink-500 ${
                betOddEven === "Even" ? "ring-2 ring-pink-400" : ""
              }`}
            >
              Even 1.9
            </button>
          </div>

          {/* Amount */}
          {bet.number !== null && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBet({ ...bet, amount: amt })}
                    className={`px-4 py-2 rounded font-semibold border ${
                      bet.amount == amt
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
                value={bet.amount}
                onChange={(e) =>
                  setBet({ ...bet, amount: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {/* Place Bet */}
          <button
            onClick={placeBet}
            disabled={timer <= 3}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Place Bet
          </button>
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
              <div className="grid grid-cols-3 py-2 text-center bg-yellow-500 rounded-t-lg">
                {/* Headers */}
                <div className="font-semibold">Round</div>
                <div className="font-semibold">Result</div>
                <div className="font-semibold">Sum</div>
              </div>

              <div className="grid grid-cols-3 text-center py-1">
                {/* Game History Data */}
                {gameHistory?.length > 0 ? (
                  gameHistory.map((game, index) => (
                    <React.Fragment key={index}>
                      <div className="py-1 text-sm">{game.roundId}</div>
                      <div className="flex gap-2">
                        {game.drawResult?.fullNumber
                          ?.split("")
                          .map((digit, index) => (
                            <div
                              key={index}
                              className="w-8 h-6 flex items-center justify-center rounded-full bg-gray-200 text-black font-bold text-sm"
                            >
                              {digit}
                            </div>
                          ))}
                      </div>

                      <div className="py-1 text-xs md:text-sm">
                        {game.drawResult?.sum}
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
                        {game.bets[0]?.position || "None"}-
                        {game.bets[0]?.number || "None"}
                      </div>
                      <div className="text-xs md:text-sm py-1">
                        {game.bets[0].amount || "None"}
                      </div>
                      <div className="text-xs md:text-sm py-1">
                        {game?.bets[0]?.won ? "Won" : "Lose"}
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
}
