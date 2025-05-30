import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance"; // Import your axios instance
import moment from "moment";

const AllUsersTransactionsRecord = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all requests with pagination
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(
        "/admin/get-user-transactions-requests",
        {
          params: {
            search,
            status,
            startDate,
            endDate,
            page,
            limit,
          },
        }
      );

      if (response.data.success) {
        setRequests(response.data.requests);
        setTotalPages(response.data.totalPages);
      } else {
        setError("Failed to load requests.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching requests.");
    }
    setLoading(false);
  };

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRequests();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounce);
  }, [search, status, startDate, endDate, page, limit]);

  return (
    <div className="mb-6 h-full min-h-screen">
      <h2 className="text-3xl font-semibold mb-6">
        All Users Transactions Record
      </h2>

      {/* Search and Filters */}
      <div className="mb-6 flex items-end flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by transactionId, type, method..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border p-2 rounded-lg w-full h-full md:w-[300px] outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-transparent border p-2 rounded-lg w-full h-full md:w-[200px] outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select> */}

        {/* <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}
      </div>

      {/* Limit Selector */}
      <div className="mb-6 flex items-center gap-2">
        <span>Show:</span>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-transparent border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="12">12</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
        <span>requests per page</span>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Requests Table */}
      <div className="p-4 shadow-md rounded-lg border overflow-x-auto">
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center">No requests found.</p>
        ) : (
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b text-left text-sm font-semibold">
                <th className="p-3">#</th>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Method</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr
                  key={request._id}
                  className="border-b hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3">{(page - 1) * limit + index + 1}</td>
                  <td className="p-3">{request?.transactionId || "N/A"}</td>
                  <td className="p-3">{request?.user?.email || "N/A"}</td>
                  <td className="p-3">{request.type}</td>
                  <td className="p-3">₹{request.amount}</td>
                  <td
                    className={`p-3 font-medium ${
                      request.status === "Pending"
                        ? "text-yellow-500"
                        : request.status === "Completed"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {request.status}
                  </td>
                  <td className="p-3">{request.method}</td>

                  <td className="p-3">
                    {moment(request.createdAt).format("YYYY-MM-DD HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllUsersTransactionsRecord;
