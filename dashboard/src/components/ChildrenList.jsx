import React, { useEffect } from "react";

export default function ChildrenList({ childrenList }) {
  useEffect(() => {
    console.log(childrenList);
  }, []);
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Child Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {childrenList.map((user) => (
          <div
            key={user._id}
            className="bg-white shadow rounded-xl p-4 space-y-2 border"
          >
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">{user.email}</div>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  user.role === "admin"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {user.role.toUpperCase()}
              </span>
            </div>

            <div className="text-sm text-gray-500">UID: {user.uid}</div>

            <div className="flex flex-wrap gap-2 mt-2 text-sm">
              <div className="bg-gray-100 px-2 py-1 rounded">
                Balance: ₹{user.totalBalance}
              </div>
              <div className="bg-gray-100 px-2 py-1 rounded">
                Deposits: ₹{user.totalDepositsAmount}
              </div>
              <div className="bg-gray-100 px-2 py-1 rounded">
                Withdrawals: ₹{user.totalWithdrawalsAmount}
              </div>
              <div className="bg-gray-100 px-2 py-1 rounded">
                Winnings: ₹{user.winningsAmount}
              </div>
            </div>

            <div className="mt-2 text-sm">
              <p>
                First Deposit: ₹{user.firstDepositAmount}{" "}
                {user.firstDepositRewardClaimed && (
                  <span className="text-green-600">(Reward Claimed)</span>
                )}
              </p>
              {user.secondDepositAmount > 0 && (
                <p>
                  Second Deposit: ₹{user.secondDepositAmount}{" "}
                  {user.secondDepositRewardClaimed && (
                    <span className="text-green-600">(Reward Claimed)</span>
                  )}
                </p>
              )}
              {user.thirdDepositAmount > 0 && (
                <p>
                  Third Deposit: ₹{user.thirdDepositAmount}{" "}
                  {user.thirdDepositRewardClaimed && (
                    <span className="text-green-600">(Reward Claimed)</span>
                  )}
                </p>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <p>
                Status:{" "}
                <span
                  className={`font-medium ${
                    user.status === "active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {user.status}
                </span>
              </p>
              <p>Level: {user.level}</p>
              <p>Registered IP: {user.registerTimeIP}</p>
            </div>

            {user.loginHistory?.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-sm">Login History:</p>
                <ul className="list-disc pl-4 text-xs text-gray-600">
                  {user.loginHistory.slice(0, 3).map((login) => (
                    <li key={login._id}>
                      {new Date(login.loginAt).toLocaleString()} –{" "}
                      {login.userAgent}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
