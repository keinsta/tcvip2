import React from "react";

const Card = ({ icon, title, value, percentage }) => {
  const isNegative = percentage?.includes("-"); // Check only if percentage exists

  return (
    <div
      className="bg-white text-dark p-5 rounded-lg shadow-md flex items-center space-x-6 
      dark:bg-gray-800 dark:text-white"
    >
      <div className="text-4xl text-gray-500">{icon}</div>
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-3xl font-bold mt-1">{value}</p>{" "}
        {/* Enhanced value display */}
        {/* Render percentage only if it exists */}
        {percentage && (
          <p
            className={`text-sm font-medium mt-1 ${
              isNegative ? "text-red-500" : "text-green-500"
            }`}
          >
            {percentage}
            <span className="text-gray-500 dark:text-gray-300 text-xs ml-1">
              in last week
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;
