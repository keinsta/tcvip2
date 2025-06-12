const StatCard = ({ title, stats }) => {
  return (
    <div className="bg-gray-900 shadow rounded-xl p-4 transition-transform hover:scale-[1.02] duration-300">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-300">Bets: {stats?.count ?? 0}</p>
      <p className="text-sm text-blue-600 font-bold">
        Amount: ₹{stats?.totalAmount?.toFixed(2) ?? 0}
      </p>
      <p className="text-sm text-green-600 font-bold">
        Fee: ₹{stats?.totalServiceFee?.toFixed(2) ?? 0}
      </p>
    </div>
  );
};

export default StatCard;
