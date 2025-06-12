import React, { useState, useEffect } from "react";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";
import { RichTextEditor } from "@mantine/rte";
import { MultiSelect } from "@mantine/core";

const Announcement = () => {
  const [icon, setIcon] = useState("🔔");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [users, setUsers] = useState([]);

  const [announcements, setAnnouncements] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const now = new Date();
    setDate(
      now.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setTime(
      now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    axiosInstance
      .get("/admin/get-all-users2")
      .then((res) => setUsers(res.data.users || []))
      .catch(() => toast.error("Failed to fetch users"));

    fetchAnnouncements(1);
  }, []);

  const fetchAnnouncements = async (pageNum) => {
    try {
      const res = await axiosInstance.get(
        `/announcement/all?page=${pageNum}&pageSize=${pageSize}`
      );
      setAnnouncements(res.data.announcements);
      setPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      toast.error("Failed to fetch announcements");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content) {
      toast.error("Please enter content before creating Announcement");
      return;
    }

    try {
      const payload = { icon, content, date, time, userIds };
      await axiosInstance.post("/announcement/create", payload);
      toast.success("Announcement created successfully!");
      setContent("");
      setUserIds([]);
      fetchAnnouncements(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create announcement");
    }
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Announcement Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-2">Create Announcement</h2>

        <div>
          <label className="block font-medium">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="border px-3 py-2 rounded w-20 text-center"
            maxLength={2}
          />
        </div>

        <div>
          <label className="block font-medium">Content</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div>
          <label className="block font-medium mb-1">Send To (Optional)</label>
          {/* <select
            multiple
            value={userIds}
            onChange={(e) =>
              setUserIds(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="border px-3 py-2 rounded w-full h-40 text-black"
          >
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.uid}
              </option>
            ))}
          </select> */}
          <MultiSelect
            label="Send To (Optional)"
            placeholder="Type to search users"
            searchable
            clearable
            nothingFound="No users found"
            data={users.map((user) => ({
              value: user._id,
              label: user.uid,
            }))}
            value={userIds}
            onChange={setUserIds}
            classNames={{
              input: "text-black",
            }}
            styles={{
              dropdown: { zIndex: 9999 },
            }}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank to send to all users.
          </p>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Create Announcement
        </button>
      </form>

      {/* Announcement List */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>

        {announcements.length === 0 ? (
          <p className="text-gray-400">No announcements yet.</p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a, idx) => (
              <li key={idx} className="bg-gray-800 p-4 rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm text-gray-400">
                    {a.date} at {a.time}
                  </span>
                </div>
                <div
                  className="prose prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: a.content }}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => fetchAnnouncements(page - 1)}
            disabled={page <= 1}
            className="px-4 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchAnnouncements(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
