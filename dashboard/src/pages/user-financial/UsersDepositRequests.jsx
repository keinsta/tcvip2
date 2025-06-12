import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import moment from "moment";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import DepositRequestDetails from "./DepositRequestDetails";
import useUSDTPriceStore from "../../store/useUSDTPriceStore";

const UserRequests = () => {
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userFinanceDetails, setUserFinanceDetails] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(
        "/admin/get-all-users-deposit-requests",
        {
          params: {
            search,
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
        setTotalPages(response.data.totalPages || 1);
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
      fetchRequests();
      setTimeout(() => {
        setSelectedRequest(null);
      }, 1000);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, startDate, endDate, sortBy, order, page]);

  const renderTable = (title, data, color) => (
    <div className="w-full shadow-md border mb-10">
      <h3 className={`text-xl font-bold p-4 text-${color}-500`}>
        {title} ({data.length})
      </h3>
      {data.length === 0 ? (
        <p className="text-center py-4">No {title.toLowerCase()} found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px] text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-2 border">Transaction ID</th>
                <th className="p-2 border">UID</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Method</th>
                <th className="p-2 border">Info</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Fee</th>
                <th className="p-2 border">IP</th>
                <th className="p-2 border">Apply Time</th>
                <th className="p-2 border">Remarks</th>
                <th className="p-2 border">Completed Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((request) => (
                <tr
                  key={request._id}
                  className="border-b hover:bg-gray-700 text-center text-xs"
                >
                  <td className="p-2 border">{request.transactionId}</td>
                  <td className="p-2 border">
                    {request?.user?.uid?.replace("MEMBER-", "")}
                  </td>
                  <td className="p-2 border">{request.type}</td>
                  <td className="p-2 border">{request.method}</td>
                  <td className="p-2 border">
                    <button
                      className="bg-blue-600 text-white rounded-md px-2 py-1 font-bold"
                      onClick={() => {
                        setSelectedRequest(request);
                        getUserFinancialDetails(request.user?._id);
                      }}
                    >
                      Deposit Info
                    </button>
                  </td>
                  <td className="p-2 border">
                    {request.method === "USDT"
                      ? // ? `USDT ${(request.amount / usdtPriceInINR).toFixed(2)}`
                        `USDT ${(request.amount / usdtPriceInINR).toFixed(2)}`
                      : `INR ${request.amount}`}
                  </td>
                  <td className="p-2 border">0.00</td>
                  <td className="p-2 border">{request.userIP}</td>
                  <td className="p-2 border">
                    {moment(request.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                  </td>
                  <td className="p-2 border max-w-[150px] truncate">
                    {request.remarks}
                  </td>
                  <td className="p-2 border">
                    {request.updatedAt === request.createdAt
                      ? "Not updated"
                      : moment(request.updatedAt).format("DD/MM/YYYY HH:mm:ss")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-6 h-full min-h-screen px-4">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        All Users Deposit Requests
      </h2>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4 w-full">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by TID, UID or Method..."
            value={search}
            onChange={(e) => {
              setPage(1); // reset page when search changes
              setSearch(e.target.value);
            }}
            className="pl-10 bg-transparent border p-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {renderTable(
            "Pending Requests",
            requests.filter((r) => r.status === "Pending"),
            "yellow"
          )}
          {renderTable(
            "Completed Requests",
            requests.filter((r) => r.status === "Completed"),
            "green"
          )}
          {renderTable(
            "Cancelled Requests",
            requests.filter((r) => r.status === "Cancelled"),
            "red"
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Details Panel */}
      {selectedRequest && (
        <DepositRequestDetails
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
