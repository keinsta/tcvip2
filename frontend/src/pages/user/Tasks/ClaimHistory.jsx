import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";

const CLAIM_HISTORY_API = [
  { id: 1, amount: 100, date: "2025-03-01", status: "Completed" },
  { id: 2, amount: 50, date: "2025-03-02", status: "Pending" },
  { id: 3, amount: 200, date: "2025-03-03", status: "Completed" },
  { id: 4, amount: 75, date: "2025-03-04", status: "Pending" },
  { id: 5, amount: 300, date: "2025-03-05", status: "Completed" },
];

const ClaimHistory = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState(CLAIM_HISTORY_API);

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Claim History</span>
        </div>
      </div>
      <div className="min-h-screen px-4 flex flex-col items-center ">
        <h2 className="text-2xl font-bold mb-4">💰 Claim History</h2>

        <div className="w-full max-w-lg bg-[#595959] shadow-md rounded-lg p-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="flex items-center justify-between p-3 border-b last:border-none"
            >
              <div>
                <h3 className="text-white text-sm font-medium">
                  Claimed ₹{claim.amount}
                </h3>
                <p className="text-xs text-gray-300">{claim.date}</p>
              </div>

              <div className="flex items-center space-x-2">
                {claim.status === "Completed" ? (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                ) : (
                  <Clock className="text-yellow-500 w-5 h-5" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    claim.status === "Completed"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {claim.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClaimHistory;
