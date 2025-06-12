import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";

const UserRacingGameHistory = ({ userId }) => {
  // My History States
  const [myHistory, setMyHistory] = useState([]);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);

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

  useEffect(() => {
    fetchMyHistory(myCurrentPage);
  }, [myCurrentPage]);
  return (
    <div className="w-full">
      <h2 className="text-center text-xl mb-4">Racing Game History</h2>
      <div className="grid grid-cols-6 py-2 text-center bg-gray-800 rounded-t-lg">
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
          className=" text-white rounded disabled:opacity-50"
          onClick={() => setMyCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={myCurrentPage === 1}
        >
          ⬅️
        </button>
        <span className="text-white text-sm">
          Page {myCurrentPage} of {myTotalPages}
        </span>
        <button
          className=" text-white rounded disabled:opacity-50"
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

export default UserRacingGameHistory;
