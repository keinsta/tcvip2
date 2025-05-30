import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Users, Wallet, FileWarning } from "lucide-react";
import axiosInstance from "../config/axiosInstance";

const filters = ["Today", "Yesterday", "This Week", "This Month"];

const AdminUserDepositHistory = ({ userId, setFirstThreeDeposits }) => {
  const [filter, setFilter] = useState("This Month");
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/get-user-deposit-report", {
        params: { userId, filter, page },
      });
      // console.log(res.data);
      setFirstThreeDeposits(res.data.lastThreeCompletedDeposits);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching deposit history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDeposits();
  }, [userId, filter, page]);

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-4">User Deposit Report</h2>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 rounded-md border ${
              filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            } hover:shadow-sm`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
        </div>
      ) : data?.totalDepositCount ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-3 text-white">
                <Wallet />
                <p className="text-lg font-semibold">
                  ₹ {data.completedDepositAmount}
                </p>
              </div>
              <p className="text-sm text-gray-200 mt-1">
                Total Completed Deposit Amount
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-3 text-white">
                <Wallet />
                <p className="text-lg font-semibold">
                  {data.statusSummary[1].count}
                </p>
              </div>
              <p className="text-sm text-gray-200 mt-1">Completed Deposits</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <p className="font-semibold mb-2">Status Summary</p>
              <ul className="text-sm text-gray-300 space-y-1">
                {data.statusSummary.map((status) => (
                  <li key={status.status}>
                    {status.status}: {status.count}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl shadow-md">
              <p className="font-semibold mb-2">Last 3 Deposits</p>
              <ul className="text-sm text-gray600 space-y-1">
                {data.lastThreeCompletedDeposits.map((tx) => (
                  <li key={tx._id}>
                    ₹{tx.amount} - {new Date(tx.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-gray-800 border overflow-x-auto">
              <thead className="bg-gray-700 text-white text-sm uppercase">
                <tr>
                  <th className="px-4 py-3 text-left border">Amount</th>
                  <th className="px-4 py-3 text-left border">Method</th>
                  <th className="px-4 py-3 text-left border">Status</th>
                  <th className="px-4 py-3 text-left border">Date</th>
                  <th className="px-4 py-3 text-left border">Remarks</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {data.transactions.map((tx) => (
                  <tr key={tx._id} className="border-t">
                    <td className="px-4 py-2 border">₹{tx.amount}</td>
                    <td className="px-4 py-2 border">{tx.method}</td>
                    <td className="px-4 py-2 border">
                      <span
                        className={`px-2 py-1 border rounded text-xs font-medium ${
                          tx.status === "Completed"
                            ? "bg-green-100 text-green-500"
                            : tx.status === "Pending"
                            ? "bg-yellow-100 text-yellow-500"
                            : "bg-red-100 text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm max-w-[100px] truncate overflow-hidden">
                      {tx.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">{page}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={data.transactions.length < 12}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-12 text-gray-500">
          <FileWarning className="w-12 h-12 mb-3" />
          <p>No deposit history found for this period.</p>
        </div>
      )}
    </div>
  );
};

export default AdminUserDepositHistory;
