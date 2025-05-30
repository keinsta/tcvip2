import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Announcements = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulating API call to fetch announcements
  useEffect(() => {
    setTimeout(() => {
      setAnnouncements([
        {
          id: 1,
          icon: "🔔",
          content:
            "<strong>Important Update:</strong> The system will be under maintenance on <a href='#' class='text-blue-500'>March 10, 2025</a>.",
          date: "March 5, 2025",
          time: "10:30 AM",
        },
        {
          id: 2,
          icon: "📢",
          content:
            "<strong>New Feature:</strong> Dark mode is now available! Check your settings.",
          date: "March 3, 2025",
          time: "3:15 PM",
        },
        {
          id: 3,
          icon: "⚡",
          content:
            "🚀 Exciting news! We just launched our new referral program. <a href='#' class='text-blue-500'>Learn More</a>",
          date: "March 1, 2025",
          time: "9:00 AM",
        },
      ]);
      setLoading(false);
    }, 1000); // Simulated delay
  }, []);

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
      <div className="px-4">
        <div className="w-full mt-6 bg-white shadow-lg rounded-lg p-4">
          {loading ? (
            <p className="text-center text-gray-500">
              Loading announcements...
            </p>
          ) : announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start p-4 border-b last:border-none"
              >
                <span className="text-xl mr-3">{announcement.icon}</span>
                <div className="flex-1">
                  <p
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  ></p>
                  <p className="text-xs text-gray-500 mt-1">
                    {announcement.date} at {announcement.time}
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
