import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../config/axiosInstance";

const Announcements = () => {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axiosInstance.get(`/announcement/user/${userId}`);
        console.log(res);
        setAnnouncements(res.data.announcements);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center px-4 shadow-md text-white">
        <ArrowLeft
          className="mr-2 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <span className="text-lg font-semibold">Announcements</span>
      </div>

      {/* Content */}
      <div className="px-4 w-full mb-28">
        <div className="w-full mt-6 bg-white shadow-lg rounded-lg p-4">
          {loading ? (
            <p className="text-center text-gray-500">
              Loading announcements...
            </p>
          ) : announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="flex items-start p-4 border-b last:border-none"
              >
                <span className="text-xl mr-3">{announcement.icon}</span>
                <div className="flex-1">
                  <p
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  ></p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
