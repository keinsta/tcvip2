import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

const Punishments = () => {
  const { user } = useAuthStore();
  const [agentUID, setAgentUID] = useState("");
  const [agentProfile, setAgentProfile] = useState(null);
  const [agentProfileLoading, setAgentProfileLoading] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    reason: "",
    remarks: "",
    issuedBy: "",
  });

  const [userPunishments, setUserPunishments] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [sending, setSending] = useState(false);

  const getUserPunishments = async () => {
    try {
      const response = await axiosInstance.get(
        `/punishment/get-punishments-by-user/${agentProfile._id}`
      );
      toast.error("Success in fetching User Punishments");
      setUserPunishments(response.data.punishments);
    } catch (error) {
      toast.error("Error in fetching User Punishments");
      console.log(error);
    }
  };

  const fetchAgentProfile = async (e) => {
    e.preventDefault();
    const normalizedUID = agentUID.startsWith("MEMBER-")
      ? agentUID
      : `MEMBER-${agentUID}`;
    try {
      setAgentProfileLoading(true);
      const response = await axiosInstance.get(
        `/admin/get-agent-profile/${normalizedUID}`
      );
      setAgentProfile(response.data.agentProfile);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch agent profile."
      );
      setAgentProfile(null);
    } finally {
      setAgentProfileLoading(false);
    }
  };

  useEffect(() => {
    
  }, []) 

  const SkeletonLine = ({ width = "w-full" }) => (
    <div className={`h-4 rounded bg-gray-600 animate-pulse ${width}`} />
  );

  return (
    <div className="space-y-8">
      {/* Agent Search */}
      <div className="bg-gray-800 rounded-md shadow p-6 space-y-6">
        <h2 className="text-xl font-bold">Punishment</h2>
        <form
          onSubmit={(e) => fetchAgentProfile(e)}
          className="flex flex-col md:flex-row items-start md:items-end gap-4"
        >
          <input
            type="text"
            placeholder="Enter User UID"
            value={agentUID}
            onChange={(e) => setAgentUID(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full md:w-[300px]"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
          >
            {agentProfileLoading ? "Fetching..." : "Fetch Profile"}
          </button>
        </form>

        {/* Agent Profile */}
        <div className="mt-4">
          {agentProfileLoading ? (
            <div className="space-y-2">
              <SkeletonLine width="w-2/3" />
              {[...Array(6)].map((_, i) => (
                <SkeletonLine key={i} />
              ))}
            </div>
          ) : agentProfile ? (
            <div className="text-sm text-gray-300 space-y-1">
              <h3 className="text-lg font-semibold text-white">
                Agent Details (Level {agentProfile.level})
              </h3>
              <p>
                <strong>UID:</strong> {agentProfile.uid}
              </p>
              <p>
                <strong>Parent UID:</strong> {agentProfile.parentUID || "N/A"}
              </p>
              <p>
                <strong>Name:</strong> {agentProfile.nickname || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {agentProfile.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {agentProfile.phone || "N/A"}
              </p>
              <p>
                <strong>Total Balance:</strong> ₹
                {agentProfile.totalBalance || 0}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {agentProfile && (
        <div>
          {userPunishments.length > 0 ? (
            <div className="space-y-3">
              {userPunishments.map((p) => (
                <div key={p._id} className="bg-white p-4 rounded shadow border">
                  <p>
                    <strong>Reason:</strong> {p.reason}
                  </p>
                  {p.remarks && (
                    <p>
                      <strong>Remarks:</strong> {p.remarks}
                    </p>
                  )}
                  <p>
                    <strong>Issued By:</strong> {p.issuedBy}
                  </p>
                  <p>
                    <strong>Resolved:</strong>{" "}
                    {p.isResolved ? "✅ Yes" : "❌ No"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created At: {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No punishments found for this user.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Punishments;
