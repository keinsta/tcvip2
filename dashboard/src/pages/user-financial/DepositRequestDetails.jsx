import { FaSearch, FaTimes } from "react-icons/fa";
import useUSDTPriceStore from "../../store/useUSDTPriceStore";

const DepositRequestDetails = ({
  selectedRequest,
  onClose,
  onApprove,
  userFinanceDetails,
}) => {
  // if (!selectedRequest) return null;
  const usdtPriceInINR = useUSDTPriceStore((state) => state.usdtPriceInINR);

  const { method } = selectedRequest;
  const methodDetails = userFinanceDetails?.methodDetails || {};

  const renderMethodDetails = () => {
    switch (method) {
      case "Bank Card":
        return (
          <div className="space-y-1">
            <p>Bank: {methodDetails.bank?.label || "N/A"}</p>
            <p>Cardholder Name: {methodDetails.cardholderName}</p>
            <p>Account Number: {methodDetails.accountNumber}</p>
            <p>IFSC Code: {methodDetails.ifscCode}</p>
            <p>Email: {methodDetails.email}</p>
            <p>Phone: {methodDetails.phone}</p>
            <p>State: {methodDetails.state}</p>
            <p>City: {methodDetails.city}</p>
            <p>Branch: {methodDetails.branch}</p>
          </div>
        );
      case "Wallet":
        return (
          <div className="space-y-1">
            <p>Wallet Type: {methodDetails.walletType?.label || "N/A"}</p>
            <p>Wallet Address: {methodDetails.walletAddress}</p>
          </div>
        );
      case "USDT":
        return (
          <div className="space-y-1">
            <p>USDT Type: {methodDetails.usdtType?.label || "N/A"}</p>
            <p>Wallet Address: {methodDetails.usdtWalletAddress}</p>
          </div>
        );
      default:
        return <p>No financial details available.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 w-full max-w-5xl rounded-lg shadow-md  p-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes size={20} />
        </button>

        <h3 className="text-2xl font-semibold mb-6 text-center">
          Deposit Request Details
        </h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="text-gray-300 font-semibold space-y-2">
            <p>User Name:</p>
            <p>User Email:</p>
            <p>Transaction ID:</p>
            <p>Transaction Type:</p>
            <p>Amount:</p>
            <p>Method:</p>
            <p>Payment Option (via):</p>
            <p>Status:</p>
            <p>Request Date:</p>
          </div>

          <div className="space-y-2">
            <p>{selectedRequest.user?.nickName || "N/A"}</p>
            <p>{selectedRequest.user?.email}</p>
            <p>{selectedRequest.transactionId}</p>
            <p>{selectedRequest.type}</p>
            {selectedRequest.method === "USDT" ? (
              <p>$ {(selectedRequest.amount / usdtPriceInINR).toFixed(2)}</p>
            ) : (
              <p>₹ {selectedRequest.amount}</p>
            )}
            <p>{selectedRequest.method}</p>
            <p>{selectedRequest.paymentOption || "N/A"}</p>
            <p className="text-yellow-400">{selectedRequest.status}</p>
            <p>
              {new Date(selectedRequest.createdAt)
                .toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
                .replace(",", "")}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {/* <h4 className="text-lg font-semibold mb-2 text-white">
            Withdrawal / Financial Details
          </h4>
          <div className="bg-gray-800 p-4 rounded-md text-sm">
            {renderMethodDetails()}
          </div> */}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {selectedRequest?.status === "Pending" ? (
            <>
              <button
                onClick={() => onApprove("Completed")}
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                Proceed
              </button>
              <button
                onClick={() => onApprove("Cancelled")}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <span className="text-green-500">Request Already Processed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositRequestDetails;
