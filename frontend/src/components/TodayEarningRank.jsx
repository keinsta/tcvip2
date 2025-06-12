import React from "react";
import { Crown, Medal } from "lucide-react";
import avatar1 from "../assets/images/avatar/1.png";
import avatar2 from "../assets/images/avatar/2.png";
import avatar3 from "../assets/images/avatar/3.png";
import avatar4 from "../assets/images/avatar/4.png";
import avatar5 from "../assets/images/avatar/5.png";
import avatar6 from "../assets/images/avatar/6.png";
import avatar7 from "../assets/images/avatar/7.png";
import avatar8 from "../assets/images/avatar/8.png";
const dummyData = [
  {
    id: 1,
    name: "John Doe",
    memberId: "Member-001",
    prize: "₹9000",
    avatar: avatar1,
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 2,
    name: "Alice Smith",
    memberId: "Member-002",
    prize: "₹7000",
    avatar: avatar2,
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 3,
    name: "Michael Johnson",
    memberId: "Member-003",
    prize: "₹5000",
    avatar: avatar3,
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 4,
    name: "Sarah Williams",
    memberId: "Member-004",
    prize: "₹4000",
    avatar: avatar4,
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 5,
    name: "David Brown",
    memberId: "Member-005",
    prize: "₹3000",
    avatar: avatar5,
    badge: "https://picsum.photos/80/40",
  },
];

const maskMemberId = (id) => {
  if (!id.startsWith("Member-")) return id;
  const lastTwo = id.slice(-2);
  return `Mem****${lastTwo}`;
};

const RankStage = () => {
  return (
    <div className="flex flex-col items-center p-8  rounded-xl mt-4">
      <h2 className="text-2xl font-extrabold text-white">
        Today's Earnings Ranks
      </h2>

      <div className="relative flex justify-center items-end w-full mt-6 space-x-6">
        <div className="flex flex-col items-center w-28 bg-gray-200 rounded-lg p-4 shadow-lg relative">
          <Medal size={24} className="text-yellow-500 absolute top-[-20px]" />
          <img
            src={dummyData[1].avatar}
            alt="Runner-up"
            className="w-14 h-14 rounded-full border-2 border-gray-500"
          />
          <p className="text-gray-700 text-sm font-semibold mt-2">
            {maskMemberId(dummyData[1].memberId)}
          </p>
          <p className="text-gray-600 text-xs">{dummyData[1].prize}</p>
        </div>

        <div className="flex flex-col items-center w-36 bg-yellow-300 rounded-lg p-5 shadow-xl relative h-38">
          <Crown size={30} className="text-yellow-300 absolute top-[-25px]" />
          <img
            src={dummyData[0].avatar}
            alt="Winner"
            className="w-16 h-16 rounded-full border-4 border-yellow-700"
          />
          <p className="text-gray-900 text-lg font-bold mt-3">
            {maskMemberId(dummyData[0].memberId)}
          </p>
          <p className="text-gray-800 text-sm">{dummyData[0].prize}</p>
        </div>

        <div className="flex flex-col items-center w-28 bg-gray-200 rounded-lg p-4 shadow-lg relative">
          <Medal size={24} className="text-yellow-500 absolute top-[-20px]" />
          <img
            src={dummyData[2].avatar}
            alt="3rd Place"
            className="w-14 h-14 rounded-full border-2 border-gray-600"
          />
          <p className="text-gray-700 text-sm font-semibold mt-2">
            {maskMemberId(dummyData[2].memberId)}
          </p>
          <p className="text-gray-600 text-xs">{dummyData[2].prize}</p>
        </div>
      </div>

      <div className="relative mt-5 w-full space-y-2 overflow-hidden h-auto">
        {dummyData.slice(3).map((item, index) => (
          <div
            key={item.id}
            className="w-full h-[50px] bg-white rounded-lg shadow-lg flex items-center justify-between px-6 space-x-4"
          >
            <div className="flex items-center">
              <p className="text-sm font-bold text-gray-500 mr-2">
                {index + 4}th
              </p>
              <img
                src={item.avatar}
                alt="User Avatar"
                className="w-[45px] h-[45px] mr-3 rounded-full border-2 border-indigo-500 shadow-md"
              />
              <p className="text-gray-700 text-sm font-semibold">
                {maskMemberId(item.memberId)}
              </p>
            </div>

            <div className="flex flex-col items-center bg-gradient-to-r from-orange-400 to-orange-600 px-5 rounded-xl">
              <p className="text-l text-white">{item.prize}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankStage;
