import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import WithdrawalRequestDetails from "./WIthdrawalRequestDetails";
import useUSDTPriceStore from "../../store/useUSDTPriceStore";

const UserRequests = () => {
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userFinanceDetails, setUserFinanceDetails] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(
        "/admin/get-all-users-withdrawal-requests",
        {
          params: {
            search,
            status,
            type,
            startDate,
            endDate,
            sortBy,
            order,
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

  const getUserFinancialDetails = async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/finance/get-user-finance-details?id=${userId}`
      );
      setUserFinanceDetails(response.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleTransactionApproval = async (status) => {
    const { transactionId, type } = selectedRequest;
    try {
      const response = await axiosInstance.post(
        "/transaction/approvalDepositWithdrawal",
        { status, transactionId, type }
      );

      toast.success(response.data.message);
      setTimeout(() => {
        setSelectedRequest(null);
      }, 1000);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, status, type, startDate, endDate, sortBy, order, page, limit]);

  const renderTable = (filteredRequests, color, label) => (
    <div className="mb-10 border">
      <h3 className={`text-xl font-bold p-4 text-${color}-500`}>
        {label} ({filteredRequests.length})
      </h3>
      {filteredRequests.length === 0 ? (
        <p className="text-center text-sm">No {label.toLowerCase()} found.</p>
      ) : (
        <div className="overflow-x-auto  shadow-md">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border text-center text-sm font-semibold bg-gray-800 text-white">
                <th className="p-2 border">Transaction ID</th>
                <th className="p-2 border">UID</th>
                <th className="p-2 border">Withdrawal Type</th>
                <th className="p-2 border">Receive Type</th>
                <th className="p-2 border">Withdrawal Info</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Fee</th>
                <th className="p-2 border">IP Address</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Apply Time</th>
                <th className="p-2 border">Remarks</th>
                <th className="p-2 border">Completed Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr
                  key={request._id}
                  className="border hover:bg-gray-700 text-xs text-center transition"
                >
                  <td className="p-2 border">{request.transactionId}</td>
                  <td className="p-2 border">
                    {request?.user.uid.replace("MEMBER-", "") || ""}
                  </td>
                  <td className="p-2 border">{request.type}</td>
                  <td className="p-2 border">{request.method}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-blue-600 rounded-md px-2 py-1 font-bold"
                      onClick={() => {
                        setSelectedRequest(request);
                        getUserFinancialDetails(request.user?._id);
                      }}
                    >
                      Withdrawal Info
                    </button>
                  </td>
                  <td className="p-2 border">
                    {request.method === "USDT"
                      ? `USDT ${(request.amount / usdtPriceInINR).toFixed(2)}`
                      : `INR ${request.amount}`}
                  </td>
                  <td className="p-2 border">0.00</td>
                  <td className="p-2 border">{request.userIP}</td>
                  <td
                    className={`p-2 border ${
                      request.status === "Pending"
                        ? "text-yellow-500"
                        : request.status === "Completed"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {request.status}
                  </td>
                  <td className="p-2 border">
                    {new Date(request.createdAt)
                      .toLocaleString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })
                      .replace(",", "")}
                  </td>
                  <td className="p-2 border max-w-[150px] truncate overflow-hidden">
                    {request.remarks}
                  </td>
                  <td className="p-2 border">
                    {new Date(request.updatedAt).getTime() ===
                    new Date(request.createdAt).getTime()
                      ? "No updated yet"
                      : new Date(request.updatedAt)
                          .toLocaleString("en-GB", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })
                          .replace(",", "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const completedRequests = requests.filter((r) => r.status === "Completed");
  const cancelledRequests = requests.filter((r) => r.status === "Cancelled");

  return (
    <div className="mb-6 h-full min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        All Users Withdrawal Requests
      </h2>

      {/* Filters & Search */}
      <div className="mb-4 flex items-center gap-4 w-full">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Transaction ID or Method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-transparent border p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Sections */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          {renderTable(pendingRequests, "yellow", "Pending Requests")}
          {renderTable(completedRequests, "green", "Completed Requests")}
          {renderTable(cancelledRequests, "red", "Cancelled Requests")}
        </>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg ${
            page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } transition`}
        >
          Previous
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg ${
            page === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } transition`}
        >
          Next
        </button>
      </div>

      {selectedRequest && (
        <WithdrawalRequestDetails
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleTransactionApproval}
          userFinanceDetails={userFinanceDetails}
        />
      )}
    </div>
  );
};

export default UserRequests;
