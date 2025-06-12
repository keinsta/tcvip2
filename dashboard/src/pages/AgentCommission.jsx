import React, { useState } from "react";
import axiosInstance from "../config/axiosInstance";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

const AgentCommission = () => {
  const { user } = useAuthStore();
  const [agentUID, setAgentUID] = useState("");
  const [agentProfile, setAgentProfile] = useState(null);
  const [agentProfileLoading, setAgentProfileLoading] = useState(false);

  const [commissionType, setCommissionType] = useState("");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleSendCommission = async (e) => {
    e.preventDefault();
    if (!commissionType || !commissionAmount) {
      return toast.error("Please fill in type and amount.");
    }

    try {
      setSending(true);
      const response = await axiosInstance.post(
        "/admin/send-commission-to-agent",
        {
          userId: agentProfile._id,
          sendBy: user._id, // Replace or fetch dynamically
          type: commissionType,
          amount: Number(commissionAmount),
          remarks,
        }
      );

      toast.success("Commission sent successfully!");
      setCommissionAmount("");
      setCommissionType("");
      setRemarks("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send commission."
      );
    } finally {
      setSending(false);
    }
  };

  const SkeletonLine = ({ width = "w-full" }) => (
    <div className={`h-4 rounded bg-gray-600 animate-pulse ${width}`} />
  );

  return (
    <div className="space-y-8">
      {/* Agent Search */}
      <div className="bg-gray-800 rounded-md shadow p-6 space-y-6">
        <form
          onSubmit={(e) => fetchAgentProfile(e)}
          className="flex flex-col md:flex-row items-start md:items-end gap-4"
        >
          <input
            type="text"
            placeholder="Enter Agent UID"
            value={agentUID}
            onChange={(e) => setAgentUID(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full md:w-[300px]"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded"
          >
            {agentProfileLoading ? "Fetching..." : "Fetch Agent Profile"}
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

      {/* Commission Form */}
      {agentProfile && (
        <div className="bg-gray-800 rounded-md shadow p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg">
            Send Commission to {agentProfile.nickname || agentProfile.uid}
          </h3>
          <form onSubmit={handleSendCommission} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">
                Commission Type
              </label>
              <input
                type="text"
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full"
                placeholder="e.g. Referral Bonus"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full"
                placeholder="e.g. 100"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white p-2 rounded w-full"
                placeholder="Any optional remarks..."
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded"
            >
              {sending ? "Sending..." : "Send Commission"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgentCommission;
