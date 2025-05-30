import { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeedbacks = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/admin/get-all-feedbacks?page=${pageNumber}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFeedbacks(res.data.feedbacks);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) {
      console.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await axiosInstance.patch(
        `/admin/acknowledge-feedback/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchFeedbacks(page); // Refresh current page
    } catch (error) {
      console.error(error.response?.data?.message || "Acknowledge failed");
    }
  };

  useEffect(() => {
    fetchFeedbacks(page);
  }, [page]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Feedbacks</h1>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <p>No feedbacks yet.</p>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb._id} className="border p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">{fb.type}</div>
                {fb.acknowledged ? (
                  <span className="text-green-600 font-medium">
                    Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(fb._id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
              <p className="text-gray-700 mb-2">{fb.description}</p>
              <div className="text-xs text-gray-400">
                Submitted by: {fb.userId?.nickName || "Unknown"} (
                {fb.userId?.email || "No Email"})
              </div>
              <div className="text-xs text-gray-400">
                Submitted at: {new Date(fb.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="self-center">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
