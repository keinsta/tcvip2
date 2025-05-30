import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

const dummyData = [
  {
    id: 1,
    name: "John Doe",
    memberId: "Member-001",
    prize: "₹5000",
    avatar: "https://i.pravatar.cc/50?img=1",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 2,
    name: "Alice Smith",
    memberId: "Member-002",
    prize: "₹7000",
    avatar: "https://i.pravatar.cc/50?img=2",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 3,
    name: "Michael Johnson",
    memberId: "Member-00fh3",
    prize: "₹9000",
    avatar: "https://i.pravatar.cc/50?img=3",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 4,
    name: "Sarah Williams",
    memberId: "Member-004",
    prize: "₹6000",
    avatar: "https://i.pravatar.cc/50?img=4",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 5,
    name: "David Brown",
    memberId: "Member-005",
    prize: "₹8000",
    avatar: "https://i.pravatar.cc/50?img=5",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 6,
    name: "Emily Davis",
    memberId: "Member-006",
    prize: "₹7500",
    avatar: "https://i.pravatar.cc/50?img=6",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 7,
    name: "Chris Martin",
    memberId: "Member-007",
    prize: "₹9200",
    avatar: "https://i.pravatar.cc/50?img=7",
    badge: "https://picsum.photos/80/40",
  },
  {
    id: 8,
    name: "Sophia Wilson",
    memberId: "Member-008",
    prize: "₹8600",
    avatar: "https://i.pravatar.cc/50?img=8",
    badge: "https://picsum.photos/80/40",
  },
];

const WinTile = () => {
  const [tiles, setTiles] = useState(dummyData.slice(0, 6));
  const [isFading, setIsFading] = useState(false);

  const maskMemberId = (id) => {
    if (!id.startsWith("Member-")) return id; // Ensure it's the correct format
    const lastTwo = id.slice(-2); // Get last 2 characters
    return `Mem****${lastTwo}`; // Mask the middle part
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true); // Start fade-out effect

      setTimeout(() => {
        setTiles((prevTiles) => {
          const updatedTiles = [...prevTiles];
          const nextTile =
            dummyData[
              (dummyData.indexOf(updatedTiles[0]) + 6) % dummyData.length
            ]; // Get next tile from list
          updatedTiles.shift(); // Remove first tile
          updatedTiles.push(nextTile); // Add new tile at the end
          return updatedTiles;
        });

        setIsFading(false); // Fade-in new content
      }, 400); // Sync with animation duration
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center bg-[#595959] p-4 space-y-4 overflow-hidden rounded-xl shadow-xl mt-2 mx-2">
      {/* Header - No Animation Applied */}
      <div className="w-full flex items-center">
        <Trophy size={30} className="text-yellow-600 mr-2 animate-bounce" />
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-600 to-yellow-300 bg-clip-text text-transparent">
          Winning Information
        </h1>
      </div>

      {/* Animated Tile Section */}
      <div className="relative w-full space-y-2 overflow-hidden h-[390px]">
        {tiles.map((item, index) => (
          <motion.div
            key={item.id}
            className="w-full h-[60px] bg-app-bg rounded-lg shadow-lg flex items-center justify-between px-6 space-x-4 absolute transition-transform duration-700 ease-in-out"
            style={{ top: `${index * 65}px` }}
          >
            {/* Animated Inner Content */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isFading ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between w-full"
            >
              {/* Avatar & ID */}
              <div className="flex items-center">
                <img
                  src={item.avatar}
                  alt="User Avatar"
                  className="w-[45px] h-[45px] mr-3 rounded-full border-2 border-indigo-500 shadow-md"
                />
                <p className="text-gray-200 text-sm font-semibold">
                  ID: {maskMemberId(item.memberId)}{" "}
                </p>
              </div>

              {/* Badge Image */}
              <img
                src={item.badge}
                alt="Badge"
                className="w-[70px] h-[40px] rounded-md shadow-md"
              />

              {/* Prize Info */}
              <div className="flex flex-col items-center">
                <p className="text-xl font-bold text-yellow-500">
                  {item.prize}
                </p>
                <p className="text-sm text-gray-400">Winning Prize</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WinTile;
