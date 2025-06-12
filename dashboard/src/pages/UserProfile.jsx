import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";
import UserDepositTransactionsReports from "../components/UserDepositTransactionReports";
import UserWithdrawalTransactionReports from "../components/UserWithdrawalTransactionReport";
import UserFinancialDetails from "../components/UserFinancialDetails";

import UserWinGoGameHistory from "../components/games/UserWinGoGameHistory";
import UserTrxWinGoGameHistory from "../components/games/UserTrxWinGoGameHistory";
import UserRacingGameHistory from "../components/games/UserRacingGameHistory";
import UserK3GameHistory from "../components/games/UserK3GameHistory";
import User5DGameHistory from "../components/games/User5DGameHistory";

import ParentToChildTree from "../components/ParentToChildTree";

// Skeleton component to display loading placeholders
const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md ${className}`}
    ></div>
  );
};

// Card component to wrap content with shadow and rounded corners
const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 ${className}`}
    >
      {children}
    </div>
  );
};

// CardContent component to wrap content within a card
const CardContent = ({ children, className = "" }) => {
  return <div className={`${className}`}>{children}</div>;
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [updateProfileModal, setUpdateProfileModal] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const [newStatus, setNewStatus] = useState("active");
  const [statusRemarks, setStatusRemarks] = useState("");

  const [userData, setUserData] = useState(null);
  const [updateUserData, setUpdateUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstThreeDeposits, setFirstThreeDeposits] = useState([]);
  const [firstThreeWithdrawals, setFirstThreeWithdrawals] = useState([]);

  // Function to fetch user profile details from API
  const getUserProfile = async () => {
    try {
      const response = await axiosInstance.get(`/admin/get-user-profile/${id}`);
      // console.log("User Profile Data: ", response.data);
      setUserData(response.data?.user);
      setUpdateUserData(response.data?.user);
    } catch (error) {
      toast.error("Failed to load User Profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (selectedUser) => {
    setLoading1(true);
    try {
      const response = await axiosInstance.delete(
        `/admin/delete-user/${selectedUser._id}`
      );
      toast.success(response.data.message);
      setDeleteModal(false);
      navigate(-1);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading1(false);
    }
  };

  const handleUpdateUser = async (selectedUser) => {
    setLoading1(true);
    try {
      const response = await axiosInstance.put(
        `/admin/update-profile/${selectedUser._id}`,
        selectedUser
      );
      toast.success(response.data.message);
      setUpdateProfileModal(false);
      getUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      setLoading1(false);
    }
  };

  const handleStatusUpdate = async (selectedUser) => {
    setLoading1(true);
    try {
      const response = await axiosInstance.put(
        `/admin/update-user-profile-status/${selectedUser._id}`,
        {
          status: newStatus,
          statusRemarks,
        }
      );

      toast.success(response.data.message);
      getUserProfile();
      setStatusModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading1(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateUserData((prevUser) => ({
      ...prevUser,
      [name]: value, // Update only the changed field
    }));
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    getUserProfile();
  }, [id]);

  return (
    <div className="bg-background text-foreground space-y-4">
      {/* <h1 className="text-3xl font-bold text-center mb-2">User Profile</h1> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* Left Section - User Info */}
        <Card className="shadow-lg">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : // Check if userData is available and render it
            userData && userData ? (
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Nick Name
                </div>
                <div className="text-left">
                  {userData?.nickName ? userData?.nickName : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Member UID
                </div>
                <div className="text-left break-all">
                  {userData?.uid || "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Parent UID
                </div>
                <div className="text-left break-all">
                  {userData?.parentUID || "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Account Balance
                </div>
                <div className="text-left">
                  ₹{" "}
                  {userData?.totalBalance !== undefined &&
                  userData?.totalBalance !== null
                    ? userData?.totalBalance
                    : "N/A"}
                </div>

                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Account Level
                </div>
                <div className="text-left">
                  Level{" "}
                  {userData?.level !== undefined && userData?.level !== null
                    ? userData?.level
                    : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Account EXP
                </div>
                <div className="text-left">
                  EXP:{" "}
                  {userData?.exp !== undefined && userData?.exp !== null
                    ? userData?.exp
                    : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Account Status
                </div>
                <div className="text-left">
                  {userData?.status === "active" ? (
                    <span className="text-green-500">{userData?.status}</span>
                  ) : (
                    <span className="text-orange-500">{userData?.status}</span>
                  )}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Registration Account
                </div>
                <div className="text-left">
                  via{" "}
                  {userData?.authBy ? (
                    userData?.authBy === "email" ? (
                      <span>Email</span>
                    ) : (
                      <span>Phone Number</span>
                    )
                  ) : (
                    "N/A"
                  )}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Email Account
                </div>
                <div className="text-left">
                  {userData?.email ? userData?.email : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Phone Number
                </div>
                <div className="text-left">
                  {userData?.phone ? userData?.phone : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Withdrawal Methods
                </div>
                <div className="text-left">
                  {userData?.withdrawalPasswordStatus ? (
                    <div className="flex flex-col">
                      <span>
                        Bank Card:{" "}
                        {userData?.withdrawalMethodSet?.bankCard ? (
                          <span className="text-green-500">Active</span>
                        ) : (
                          <span className="text-red-500">Inactive</span>
                        )}
                      </span>
                      <span>
                        USDT:{" "}
                        {userData?.withdrawalMethodSet?.usdt ? (
                          <span className="text-green-500">Active</span>
                        ) : (
                          <span className="text-red-500">Inactive</span>
                        )}
                      </span>
                      <span>
                        Wallet:{" "}
                        {userData?.withdrawalMethodSet?.wallet ? (
                          <span className="text-green-500">Active</span>
                        ) : (
                          <span className="text-red-500">Inactive</span>
                        )}
                      </span>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </div>

                <div className="text-gray-500 dark:text-gray-400 font-medium">
                  Invitation Code
                </div>
                <div className="text-left">
                  {userData?.inviteCode ? userData?.inviteCode : "N/A"}
                </div>

                <div className="col-span-2 w-full border-t dark:border-gray-600">
                  <h3 className="text-sm font-semibold my-4">
                    Profile Actions
                  </h3>
                  <div className="flex justify-between">
                    <button
                      className="text-blue-400 text-sm md:text-lg"
                      onClick={() => setUpdateProfileModal(true)}
                    >
                      Update Profile
                    </button>
                    <button
                      className="text-yellow-500 text-sm md:text-lg"
                      onClick={() => setStatusModal(true)}
                    >
                      Profile Status
                    </button>
                    <button
                      className="text-red-500 text-sm md:text-lg"
                      onClick={() => setDeleteModal(true)}
                    >
                      Delete Profile
                    </button>
                  </div>
                </div>

                {/* Account Created */}
                <div className="col-span-2 flex justify-between pt-2 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-600 mt-4">
                  <span className="font-medium">Account Created</span>
                  <span>
                    {userData?.createdAt
                      ? new Date(userData.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No user data available</p>
            )}
          </CardContent>
        </Card>

        {/* Right Section - Login History */}
        <Card className="shadow-lg">
          <CardContent className="p-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Registration Details</h2>
            <div className="p-3 rounded-md border bg-muted/30">
              <p>
                <span className="font-medium">Join Date/Time:</span>{" "}
                {new Date(userData?.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </p>
              <p>
                <span className="font-medium">IP Address:</span>{" "}
                {userData?.registerTimeIP}
              </p>
            </div>
            <h2 className="text-xl font-semibold mb-4">Last 3 Login Details</h2>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : // Ensure loginHistory exists and display data
            userData?.loginHistory && userData?.loginHistory.length > 0 ? (
              <div className="space-y-4 text-sm">
                {userData?.loginHistory?.slice(0, 3).map((login, idx) => (
                  <div key={idx} className="p-3 rounded-md border bg-muted/30">
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {new Date(login.loginAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </p>
                    <p>
                      <span className="font-medium">IP Address:</span>{" "}
                      {login.ip}
                    </p>
                    <p>
                      <span className="font-medium">User Agent:</span>{" "}
                      {login.userAgent}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No login data available</p>
            )}
            {!loading && userData?.registerTimeIP && (
              <div className="mt-4 text-sm font-medium p-3 rounded-md border bg-muted/30">
                <p>
                  <span className="font-semibold">Unique IPs Used:</span>{" "}
                  {
                    new Set([
                      userData.registerTimeIP,
                      ...userData.loginHistory
                        ?.slice(0, 3)
                        .map((login) => login.ip),
                    ]).size
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deposit IPs */}
        <div className="bg-gray-800 rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Last 3 Deposits IPs
          </h3>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700 text-gray-100 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 ">IP Address</th>
                <th className="px-4 py-3">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y">
              {firstThreeDeposits?.map((withdrawal, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{withdrawal?.userIP || "N/A"}</td>
                  <td className="px-4 py-2">
                    {withdrawal?.transactionId || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Withdrawal IPs */}
        <div className="bg-gray-800 rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Last 3 Withdrawal IPs
          </h3>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-700 text-gray-100 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 ">IP Address</th>
                  <th className="px-4 py-3">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 divide-y">
                {firstThreeWithdrawals?.map((withdrawal, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{withdrawal?.userIP || "N/A"}</td>
                    <td className="px-4 py-2">
                      {withdrawal?.transactionId || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>
      <UserFinancialDetails userId={id} />
      <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>
      <UserDepositTransactionsReports
        userId={id}
        setFirstThreeDeposits={setFirstThreeDeposits}
      />
      <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>
      <UserWithdrawalTransactionReports
        userId={id}
        setFirstThreeWithdrawals={setFirstThreeWithdrawals}
      />
      <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <UserWinGoGameHistory userId={id} />
        <UserTrxWinGoGameHistory userId={id} />
        <UserRacingGameHistory userId={id} />
        <UserK3GameHistory userId={id} />
        <User5DGameHistory userId={id} />
      </div>
      <div className="border-t border-gray-300 dark:border-gray-700 my-4"></div>
      <ParentToChildTree rootId={id} />

      {/* Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Confirm Delete
            </h2>
            <p className="text-white mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{userData?.uid}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userData)}
                disabled={loading1}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading1 ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Update User Status</h2>

            <label className="block mb-2 text-sm">Select Status:</label>
            <select
              className="w-full p-2 border rounded mb-4 text-white bg-gray-900"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>

            <label className="block mb-2 text-sm">Remarks:</label>
            <textarea
              className="w-full p-2 border rounded mb-4 bg-transparent"
              rows="3"
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="Explain why this status is being set..."
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setStatusModal(false)}
                className="px-4 py-2 text-black bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(userData)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading1 ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {updateProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-2xl font-semibold mb-4">
              Update Profile Detail
            </h2>

            {/* ID (Read-Only) */}
            <label className="block text-sm font-medium">User ID</label>
            <input
              type="text"
              value={updateUserData._id || "N/A"}
              disabled
              className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
            />

            {/* UID (Read-Only) */}
            <label className="block text-sm font-medium">Member UID</label>
            <input
              type="text"
              value={updateUserData.uid || "N/A"}
              disabled
              className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
            />

            {/* Email (Read-Only) */}
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={updateUserData.email || "N/A"}
              disabled
              className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
            />

            {/* Phone (Read-Only) */}
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              value={updateUserData.phone || "N/A"}
              disabled
              className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
            />

            {/* Name (Editable) */}
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="nickName"
              value={updateUserData.nickName || ""}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2 bg-transparent"
            />

            {/* Name (Editable) */}
            <label className="block text-sm font-medium">Role</label>
            <input
              type="text"
              name="role"
              value={updateUserData.role || ""}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2 bg-transparent"
            />

            <label className="block text-sm font-medium">Password</label>
            <input
              type="text"
              name="password"
              value={updateUserData.password || ""}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2 bg-transparent"
            />

            {/* Status (Editable) */}
            {/* <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={userData.status || ""}
              onChange={handleInputChange}
              className="border p-2 w-full rounded mb-2 bg-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select> */}

            {/* Withdrawal Method (Editable Toggle) */}
            <label className="block text-sm font-medium">
              Withdrawal Method
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="withdrawalMethod"
                checked={updateUserData.withdrawalPasswordStatus || false}
                onChange={(e) =>
                  setUpdateUserData((prev) => ({
                    ...prev,
                    withdrawalPasswordStatus: e.target.checked,
                  }))
                }
                className="w-5 h-5"
              />
              <span className="text-white">
                {updateUserData.withdrawalPasswordStatus
                  ? "Unset Status"
                  : "Set Status"}
              </span>
            </div>

            <label className="block text-sm font-medium">
              Withdrawal Method Details
            </label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="bankCard"
                checked={updateUserData.withdrawalMethodSet.bankCard || false}
                onChange={(e) =>
                  setUpdateUserData((prev) => ({
                    ...prev,
                    // withdrawalMethodSet.bankCard: e.target.checked,
                    withdrawalMethodSet: {
                      ...prev.withdrawalMethodSet,
                      bankCard: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5"
              />
              <span className="text-white">
                {updateUserData.withdrawalMethodSet.bankCard
                  ? "Unset Bank Details"
                  : "Set Bank Details"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="usdt"
                checked={updateUserData.withdrawalMethodSet.usdt || false}
                onChange={(e) =>
                  setUpdateUserData((prev) => ({
                    ...prev,
                    // withdrawalMethodSet.bankCard: e.target.checked,
                    withdrawalMethodSet: {
                      ...prev.withdrawalMethodSet,
                      usdt: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5"
              />
              <span className="text-white">
                {updateUserData.withdrawalMethodSet.usdt
                  ? "Unset USDT Details"
                  : "Set USDT Details"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="wallet"
                checked={updateUserData.withdrawalMethodSet.wallet || false}
                onChange={(e) =>
                  setUpdateUserData((prev) => ({
                    ...prev,
                    // withdrawalMethodSet.bankCard: e.target.checked,
                    withdrawalMethodSet: {
                      ...prev.withdrawalMethodSet,
                      wallet: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5"
              />
              <span className="text-white">
                {updateUserData.withdrawalMethodSet.wallet
                  ? "Unset Wallet Details"
                  : "Set Wallet Details"}
              </span>
            </div>

            {/* isVerified (Editable Toggle) */}
            <label className="block text-sm font-medium">Verified</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isVerified"
                checked={updateUserData.isVerified || false}
                onChange={(e) =>
                  setUpdateUserData((prev) => ({
                    ...prev,
                    isVerified: e.target.checked,
                  }))
                }
                className="w-5 h-5"
              />
              <span className="text-white">
                {updateUserData.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="bg-red-400 text-white px-4 py-2 rounded"
                onClick={() => setUpdateProfileModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleUpdateUser(updateUserData)}
              >
                {loading1 ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
