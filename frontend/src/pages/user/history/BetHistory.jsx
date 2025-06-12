import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../config/axiosInstance";
import useAuthStore from "../../../store/authStore";

const betTypeLetters = {
  Sum: "A",
  SingleDice: "B",
  DoubleDice: "C",
  Triple: "D",
  TwoDiceCombination: "E",
};

const BetHistory = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  // Win Go History States
  const [winGoHistory, setWinGoHistory] = useState([]);
  const [winGoCurrentPage, setWinGoCurrentPage] = useState(1);
  const [winGoTotalPages, setWinGoTotalPages] = useState(1);

  // Trx Win Go History States
  const [trxWinGoHistory, setTrxWinGoHistory] = useState([]);
  const [trxWinGoCurrentPage, setTrxWinGoCurrentPage] = useState(1);
  const [trxWinGoTotalPages, setTrxWinGoTotalPages] = useState(1);

  // Racing History States
  const [racingHistory, setRacingHistory] = useState([]);
  const [racingCurrentPage, setRacingCurrentPage] = useState(1);
  const [racingTotalPages, setRacingTotalPages] = useState(1);

  // K3 History States
  const [k3History, setK3History] = useState([]);
  const [k3CurrentPage, setK3CurrentPage] = useState(1);
  const [k3TotalPages, setK3TotalPages] = useState(1);

  // Five D History States
  const [fiveDHistory, setFiveDHistory] = useState([]);
  const [fiveDCurrentPage, setFiveDCurrentPage] = useState(1);
  const [fiveDTotalPages, setFiveDTotalPages] = useState(1);

  const fetchWinGoGameHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/wingo/my-history/${userId}?page=${page}`
      );

      setWinGoHistory(response.data.history);
      setWinGoCurrentPage(response.data.currentPage);
      setWinGoTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };
  const fetchTrxWinGOGameHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/trxwingo/my-history/${userId}?page=${page}`
      );

      setTrxWinGoHistory(response.data?.history);
      setTrxWinGoCurrentPage(response.data?.currentPage);
      setTrxWinGoTotalPages(response.data?.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };
  const fetchRacingHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/racing/my-history/${userId}?page=${page}`
      );

      setRacingHistory(response.data.history);
      setRacingCurrentPage(response.data.currentPage);
      setRacingTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };
  const fetchK3History = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/k3/my-history/${userId}?page=${page}`
      );

      setK3History(response.data.history);
      setK3CurrentPage(response.data.currentPage);
      setK3TotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };
  const fetchFiveDHistory = async (page) => {
    try {
      const response = await axiosInstance(
        `/game/five-d/my-history/${userId}?page=${page}`
      );

      setFiveDHistory(response.data.history);
      setFiveDCurrentPage(response.data.currentPage);
      setFiveDTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching user bet history:", error);
    }
  };

  useEffect(() => {
    fetchWinGoGameHistory(winGoCurrentPage);
  }, [winGoCurrentPage, userId]);
  useEffect(() => {
    fetchTrxWinGOGameHistory(trxWinGoCurrentPage);
  }, [trxWinGoCurrentPage, userId]);
  useEffect(() => {
    fetchRacingHistory(racingCurrentPage);
  }, [racingCurrentPage, userId]);
  useEffect(() => {
    fetchK3History(k3CurrentPage);
  }, [k3CurrentPage, userId]);
  useEffect(() => {
    fetchFiveDHistory(fiveDCurrentPage);
  }, [fiveDCurrentPage, userId]);

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex items-center">
          <ArrowLeft
            className="mr-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg font-semibold">Bet History</span>
        </div>
      </div>

      {/* Win Go Game History */}
      <div className="w-full">
        <h2 className="my-2 text-center text-white text-xl font-bold">
          WIN GO Game
        </h2>
        <div className="grid grid-cols-6 py-2 text-center bg-yellow-500 rounded-t-lg">
          {/* Headers */}
          <div className="font-semibold">Round</div>
          <div className="font-semibold">Number</div>
          <div className="font-semibold">Color</div>
          <div className="font-semibold">B/S</div>
          <div className="font-semibold">Amount</div>
          <div className="font-semibold">Result</div>
        </div>

        <div className="grid grid-cols-6 text-center text-white py-1">
          {/* My History Data */}
          {winGoHistory?.length > 0 ? (
            winGoHistory.map((game, index) => (
              <React.Fragment key={index}>
                <div className="text-sm py-1">
                  {/* {game.roundId.split("-")[2]?.slice(-8)} */}
                  {game.roundId}
                </div>
                <div className="py-1 text-sm font-bold">{game.drawnNumber}</div>
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
                  {game?.bets[0]?.betAmount}
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
            onClick={() => setWinGoCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={winGoCurrentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span className="text-white">
            Page {winGoCurrentPage} of {winGoTotalPages}
          </span>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            onClick={() =>
              setWinGoCurrentPage((prev) => Math.min(prev + 1, winGoTotalPages))
            }
            disabled={winGoCurrentPage === winGoTotalPages}
          >
            Next ➡️
          </button>
        </div>
      </div>
      <div className="w-full border-t border-gray-400 my-1"></div>
      {/* Trx Win Go Game History */}
      <div className="w-full">
        <h2 className="my-2 text-center text-white text-xl font-bold">
          TRX WIN GO Game
        </h2>
        <div className="grid grid-cols-6 py-2 text-center bg-yellow-500 rounded-t-lg">
          {/* Headers */}
          <div className="font-semibold">Round</div>
          <div className="font-semibold">Number</div>
          <div className="font-semibold">Color</div>
          <div className="font-semibold">B/S</div>
          <div className="font-semibold">Amount</div>
          <div className="font-semibold">Result</div>
        </div>

        <div className="grid grid-cols-6 text-center text-white py-1">
          {/* My History Data */}
          {trxWinGoHistory?.length > 0 ? (
            trxWinGoHistory.map((game, index) => (
              <React.Fragment key={index}>
                <div className="text-sm py-1">{game.roundId}</div>
                <div className="py-1 text-sm font-bold">{game.drawnNumber}</div>
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
                  {game?.bets[0]?.betAmount}
                </div>
                <div className="text-xs md:text-sm py-1">
                  {game?.bets[0]?.result}
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="col-span-6 text-center py-2 text-gray-400">
              No history available
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between mt-4 p-4">
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            onClick={() =>
              setTrxWinGoCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={trxWinGoCurrentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span className="text-white">
            Page {trxWinGoCurrentPage} of {trxWinGoTotalPages}
          </span>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            onClick={() =>
              setTrxWinGoCurrentPage((prev) =>
                Math.min(prev + 1, trxWinGoTotalPages)
              )
            }
            disabled={trxWinGoCurrentPage === trxWinGoTotalPages}
          >
            Next ➡️
          </button>
        </div>
      </div>
      <div className="w-full border-t border-gray-400 my-1"></div>
      {/* Racing Game History */}
      <div className="w-full">
        <h2 className="my-2 text-center text-white text-xl font-bold">
          Racing Game
        </h2>
        <div className="grid grid-cols-7 py-2 text-center bg-yellow-500 rounded-t-lg">
          {/* Headers */}
          <div className="font-semibold">Round</div>
          <div className="font-semibold">My Place</div>
          <div className="font-semibold">Rank</div>
          <div className="font-semibold">B/S</div>
          <div className="font-semibold">E/O</div>
          <div className="font-semibold">Amount</div>
          <div className="font-semibold">Result</div>
        </div>

        <div className="grid grid-cols-7 text-center text-white py-1">
          {/* My History Data */}
          {racingHistory?.length > 0 ? (
            racingHistory.map((game, index) => (
              <React.Fragment key={index}>
                <div className="text-sm py-1">{game.roundId}</div>
                <div className="py-1 text-sm font-bold">{game.firstPlace}</div>
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
                  {game?.bets[0]?.betAmount}
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
              setRacingCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={racingCurrentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span className="text-white">
            Page {racingCurrentPage} of {racingTotalPages}
          </span>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            onClick={() =>
              setRacingCurrentPage((prev) =>
                Math.min(prev + 1, racingTotalPages)
              )
            }
            disabled={racingCurrentPage === racingTotalPages}
          >
            Next ➡️
          </button>
        </div>
      </div>
      <div className="w-full border-t border-gray-400 my-1"></div>
      {/* K3 Game History */}
      <div className="w-full">
        <h2 className="my-2 text-center text-white text-xl font-bold">
          K3 Game
        </h2>
        <div className="grid grid-cols-5 py-2 text-center bg-yellow-500 rounded-t-lg">
          {/* Headers */}
          <div className="font-semibold">Round</div>
          <div className="font-semibold">Bet Details</div>
          <div className="font-semibold">Bet Amount</div>
          <div className="font-semibold">Amount</div>
          <div className="font-semibold">Result</div>
        </div>

        <div className="grid grid-cols-5 text-center text-white py-1">
          {/* My History Data */}
          {k3History?.length > 0 ? (
            k3History.map((game, index) => (
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
                  {game?.bets[0]?.betAmount}
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
            onClick={() => setK3CurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={k3CurrentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span className="text-white">
            Page {k3CurrentPage} of {k3TotalPages}
          </span>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            onClick={() =>
              setK3CurrentPage((prev) => Math.min(prev + 1, k3TotalPages))
            }
            disabled={k3CurrentPage === k3TotalPages}
          >
            Next ➡️
          </button>
        </div>
      </div>
      <div className="w-full border-t border-gray-400 my-1"></div>
      {/* Five D Game History */}
      <div className="w-full">
        <h2 className="my-2 text-center text-white text-xl font-bold">
          FIve D Game
        </h2>
        <div className="grid grid-cols-4 py-2 text-center bg-yellow-500 rounded-t-lg">
          {/* Headers */}
          <div className="font-semibold">Round</div>
          <div className="font-semibold">Bet Details</div>
          <div className="font-semibold">Bet Amount</div>
          <div className="font-semibold">Result</div>
        </div>

        <div className="grid grid-cols-4 text-center text-white py-1">
          {/* My History Data */}
          {fiveDHistory?.length > 0 ? (
            fiveDHistory.map((game, index) => (
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
            onClick={() => setFiveDCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={fiveDCurrentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span className="text-white">
            Page {fiveDCurrentPage} of {fiveDTotalPages}
          </span>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            onClick={() =>
              setFiveDCurrentPage((prev) => Math.min(prev + 1, fiveDTotalPages))
            }
            disabled={fiveDCurrentPage === fiveDTotalPages}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetHistory;
