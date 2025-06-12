import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import toast from "react-hot-toast";

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-1 border-b border-gray-100">
    <span className="font-medium text-gray-100">{label}</span>
    <span className="col-span-2 text-gray-200">{value || "—"}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-gray-900 rounded-2xl shadow p-4 mb-6">
    <h3 className="text-lg font-semibold mb-3 border-b pb-1">{title}</h3>
    {children}
  </div>
);

const UserFinancialDetails = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFinancialDetails = async () => {
    try {
      const response = await axiosInstance.get(
        `/admin/get-user-financial-details?id=${userId}`
      );
      setData(response.data);
    } catch (error) {
      toast.error("Error while fetching Financial Details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserFinancialDetails();
  }, [userId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data)
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-2xl font-bold mb-6">No User Financial Details</h2>
      </div>
    );

  const {
    methodDetails: {
      bank,
      cardholderName,
      accountNumber,
      ifscCode,
      email,
      phone,
      state,
      city,
      branch,
      walletAddress,
      walletType,
      usdtWalletAddress,
      usdtType,
    } = {},
  } = data;

  return (
    <div className="w-full p-6 bg-gray-800 rounded-md">
      <h2 className="text-2xl font-bold mb-6">User Financial Details</h2>

      <Section title="Bank Information">
        <InfoRow label="Bank Name" value={bank?.label} />
        <InfoRow label="Account Holder" value={cardholderName} />
        <InfoRow label="Account Number" value={accountNumber} />
        <InfoRow label="IFSC Code" value={ifscCode} />
        <InfoRow label="Email" value={email} />
        <InfoRow label="Phone" value={phone} />
        <InfoRow label="State" value={state} />
        <InfoRow label="City" value={city} />
        <InfoRow label="Branch" value={branch} />
      </Section>

      <Section title="Wallet Information">
        <InfoRow label="Wallet Type" value={walletType?.label} />
        <InfoRow label="Wallet Address" value={walletAddress} />
      </Section>

      <Section title="USDT Information">
        <InfoRow label="USDT Type" value={usdtType?.label} />
        <InfoRow label="USDT Wallet Address" value={usdtWalletAddress} />
      </Section>
    </div>
  );
};

export default UserFinancialDetails;
