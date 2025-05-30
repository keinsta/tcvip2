import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";

const User5DGameHistory = ({ userId }) => {
  // My History States
  const [myHistory, setMyHistory] = useState([]);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);

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

  useEffect(() => {
    fetchMyHistory(myCurrentPage);
  }, [myCurrentPage]);
  return (
    <div className="w-full">
      <h2 className="text-center text-xl mb-4">5D Game History</h2>
      <div className="grid grid-cols-4 py-2 text-center bg-gray-800 rounded-t-lg">
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
          className="text-white rounded disabled:opacity-50"
          onClick={() => setMyCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={myCurrentPage === 1}
        >
          ⬅️
        </button>
        <span className="text-white text-sm">
          Page {myCurrentPage} of {myTotalPages}
        </span>
        <button
          className="text-white rounded disabled:opacity-50"
          onClick={() =>
            setMyCurrentPage((prev) => Math.min(prev + 1, myTotalPages))
          }
          disabled={myCurrentPage === myTotalPages}
        >
          ➡️
        </button>
      </div>
    </div>
  );
};

export default User5DGameHistory;
