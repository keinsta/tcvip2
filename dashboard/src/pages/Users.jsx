import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ParentToChildTree from "../components/ParentToChildTree";

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // Store users
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const [search, setSearch] = useState(""); // Search query
  const [sortBy, setSortBy] = useState("createdAt"); // Sorting field
  const [order, setOrder] = useState("asc"); // Sorting order
  const [status, setStatus] = useState(""); // User status filter
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  const [selectedUser, setSelectedUser] = useState(null); // Stores the user to edit
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevUser) => ({
      ...prevUser,
      [name]: value, // Update only the changed field
    }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/admin/get-all-users", {
        params: { page, limit: LIMIT, search, sortBy, order, status },
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        setError("Failed to load users.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching users.");
    }
    setLoading(false);
  };

  const handleUpdateUser = async (selectedUser) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put(
        `/admin/update-profile/${selectedUser._id}`,
        selectedUser
      );
      toast.success(response.data.message);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message);
      setError(err.response?.data?.message || "Error while updating users.");
    }
    setLoading(false);
  };

  const LIMIT = 15; // Users per page

  // useEffect(() => {
  //   fetchUsers();
  // }, [page, search, sortBy, order, status]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [page, search, sortBy, order, status]);

  // Separate admins and regular users
  const admins = users.filter((user) => user.role === "admin");
  const regularUsers = users.filter((user) => user.role !== "admin");

  // User Table Component
  const UserTable = ({ title, data, highlight }) => (
    <div
      className={`overflow-x-auto mt-4 ${
        highlight ? "bg-gray-200 dark:bg-gray-700 p-2 rounded-md" : ""
      }`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <table className="w-full border-collapse border border-gray-300 min-w-[800px]">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2">Account Level</th>

            <th className="border p-2">UID</th>
            <th className="border p-2">Parent UID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2 text-sm">Acc Balance</th>
            <th className="border p-2 text-sm">Status/Verified</th>
            <th className="border p-2 text-sm">Remarks</th>
            <th className="border p-2">Joined</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.length > 0 ? (
            data?.map((user, index) => (
              <tr key={user._id || index} className="text-center text-sm">
                <td className="border p-2 whitespace-nowrap text-ellipsis">
                  {user.level ? `Level ${user.level}` : "N/A"}
                </td>

                <td className="border p-2 whitespace-nowrap text-ellipsis">
                  {user.uid ? user.uid : "N/A"}
                </td>

                <td className="border p-2 whitespace-nowrap text-ellipsis">
                  {user.parentUID ? user.parentUID : "N/A"}
                </td>

                <td className="border p-2">{user.nickName || "N/A"}</td>
                <td className="border p-2">{user.email || user.phone}</td>
                <td className="border p-2">₹{user.totalBalance}</td>
                <td className="border p-2">
                  <span className="flex justify-center items-center gap-1">
                    {user.status} /
                    {user.isVerified ? (
                      <CheckCircle className="text-green-500 w-4 h-4" />
                    ) : (
                      <XCircle className="text-red-500 w-4 h-4" />
                    )}
                  </span>
                </td>

                <td className="border p-2 max-w-[150px] truncate overflow-hidden">
                  {user.statusRemarks}
                </td>

                <td className="border p-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  <button
                    // onClick={() => handleEditUser(user)} // Open modal with user data
                    onClick={() => navigate(`/users/user-profile/${user._id}`)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Open Profile
                  </button>
                  {/* <button
                    onClick={() => handleDeleteUser(user)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button> */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-4 text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full">
      <div className="p-4 mb-6 bg-white h-full min-h-screen shadow-md rounded-lg dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4">All Users</h2>

        {/* Search & Filters */}
        <div className="mb-4 flex flex-wrap gap-3 text-md">
          <input
            type="text"
            placeholder="Search by uid | phone | email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded bg-transparent"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded bg-gray-700"
          >
            <option value="createdAt">Sort by Created At</option>
            <option value="name">Sort by Name</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border p-2 rounded bg-gray-700"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded bg-gray-700"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : (
          <>
            {/* Admin Table */}
            {admins.length > 0 && (
              <UserTable title="Admins" data={admins} highlight />
            )}

            {/* Regular Users Table */}
            <UserTable title="Regular Users" data={regularUsers} />

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                className={`px-4 py-2 border rounded ${
                  page === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-300"
                }`}
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className={`px-4 py-2 border rounded ${
                  page === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-300"
                }`}
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Updates Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-transparent bg-slate-700 bg-opacity-40 p-6 rounded-lg shadow-lg w-[400px]">
              <h2 className="text-2xl font-semibold mb-4">Edit Profile Data</h2>

              {/* ID (Read-Only) */}
              <label className="block text-sm font-medium">User ID</label>
              <input
                type="text"
                value={selectedUser._id || "N/A"}
                disabled
                className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
              />

              {/* UID (Read-Only) */}
              <label className="block text-sm font-medium">Member UID</label>
              <input
                type="text"
                value={selectedUser.uid || "N/A"}
                disabled
                className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
              />

              {/* Email (Read-Only) */}
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={selectedUser.email || "N/A"}
                disabled
                className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
              />

              {/* Phone (Read-Only) */}
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="text"
                value={selectedUser.phone || "N/A"}
                disabled
                className="border p-2 w-full rounded mb-2 bg-transparent text-gray-400 cursor-not-allowed"
              />

              {/* Name (Editable) */}
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="nickName"
                value={selectedUser.nickName || ""}
                onChange={handleInputChange}
                className="border p-2 w-full rounded mb-2 bg-transparent"
              />

              {/* Status (Editable) */}
              <label className="block text-sm font-medium">Status</label>
              <select
                name="status"
                value={selectedUser.status || ""}
                onChange={handleInputChange}
                className="border p-2 w-full rounded mb-2 bg-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* isVerified (Editable Toggle) */}
              <label className="block text-sm font-medium">Verified</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={selectedUser.isVerified || false}
                  onChange={(e) =>
                    setSelectedUser((prev) => ({
                      ...prev,
                      isVerified: e.target.checked,
                    }))
                  }
                  className="w-5 h-5"
                />
                <span className="text-white">
                  {selectedUser.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="bg-red-400 text-white px-4 py-2 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleUpdateUser(selectedUser)}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <ParentToChildTree /> */}
    </div>
  );
};

export default UsersList;
