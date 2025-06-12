import React, { useState, useEffect } from "react";
import axiosInstance from "../config/axiosInstance";
import moment from "moment";
import { FaSearch, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Pending");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Request Details
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userFinanceDetails, setUserFinanceDetails] = useState(null);

  // Fetch Requests
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

  // Fetch user financial details
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

  return (
    <div className="mb-6 h-full min-h-screen">
      {/* Heading */}
      <h2 className="text-3xl font-semibold mb-6 text-center">
        All Users Financial Requests
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

      {/* Table & Details Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section - Table (Responsive) */}
        <div
          className={`${
            selectedRequest ? "lg:w-1/2" : ""
          }  w-full p-4 shadow-md rounded-lg border`}
        >
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : requests?.length === 0 ? (
            <p className="text-center">No requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b text-left text-sm font-semibold bg-gray-800 text-white">
                    <th className="p-3">#</th>
                    <th className="p-3">TID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => (
                    <tr
                      key={request._id}
                      onClick={() => {
                        setSelectedRequest(request);
                        getUserFinancialDetails(request.user?._id);
                      }}
                      className="border-b hover:bg-gray-700 cursor-pointer transition"
                    >
                      <td className="p-3">{(page - 1) * limit + index + 1}</td>
                      <td className="p-3 whitespace-nowrap text-ellipsis">
                        {request.transactionId.slice(-6)}**
                      </td>
                      <td className="p-3">{request.type}</td>
                      <td className="p-3 text-yellow-500">{request.status}</td>
                      <td className="p-3">
                        {moment(request.createdAt).format("YYYY-MM-DD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
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
        </div>

        {/* Right Section - Details Panel (Responsive) */}
        {selectedRequest && (
          <div className="lg:w-1/2 w-full p-6 shadow-lg rounded-lg border relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setSelectedRequest(null)}
            >
              <FaTimes size={20} />
            </button>

            {/* Heading */}
            <h3 className="text-2xl font-semibold mb-4 text-center">
              Transaction Details
            </h3>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Left Column - Keys (Labels) */}
              <div className="text-gray-700 font-semibold space-y-2">
                <p>User Name:</p>
                <p>User Email:</p>
                <p>Transaction ID:</p>
                <p>Transaction Type:</p>
                <p>Amount:</p>
                <p>Method:</p>
                <p>Payment Option (via):</p>
                <p>Status:</p>
                <p>Request Date:</p>
              </div>

              {/* Right Column - Values */}
              <div className="font-semibold space-y-2">
                <p>{selectedRequest.user?.nickName || "N/A"}</p>
                <p>{selectedRequest.user?.email}</p>
                <p>{selectedRequest.transactionId}</p>
                <p>{selectedRequest.type}</p>
                <p>₹ {selectedRequest.amount}</p>
                <p>{selectedRequest.method}</p>
                <p>{selectedRequest.paymentOption || "N/A"}</p>
                <p className="text-yellow-500">{selectedRequest.status}</p>
                <p>
                  {moment(selectedRequest.createdAt).format("YYYY-MM-DD HH:mm")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => handleTransactionApproval("Completed")}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                Proceed
              </button>
              <button
                onClick={() => handleTransactionApproval("Cancelled")}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRequests;
