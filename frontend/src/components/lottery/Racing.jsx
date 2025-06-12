import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import avatar7 from "../../assets/images/avatar/7.png";
import avatar4 from "../../assets/images/avatar/4.png";
import avatar8 from "../../assets/images/avatar/8.png";
import Lottery_Racing from "../../assets/images/lottery/lotterycategory_Racing.png";
import { Link } from "react-router-dom";

const dummyData = [
  {
    id: 1,
    name: "John Doe",
    prize: "₹5000",
    avatar: avatar7, // Working Avatar Image
  },

  {
    id: 2,
    name: "Michael Johnson",
    prize: "₹9000",
    avatar: avatar4, // Working Avatar Image
  },

  {
    id: 3,
    name: "Alice Smith",
    prize: "₹7000",
    avatar: avatar8, // Working Avatar Image
  },
];

const Racing = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dummyData.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[500px] p-2">
      <style>
        {`
        @keyframes shineMove {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(100%) rotate(25deg); }
        }
  
        @keyframes racingBgAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
  
        .card-3d-racing {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa, #6d28d9);
          background-size: 300% 300%;
          animation: racingBgAnim 10s ease-in-out infinite;
          border-radius: 1rem;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          perspective: 1000px;
          transform-style: preserve-3d;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 4px 12px rgba(0,0,0,0.3),
            0 8px 20px rgba(140, 0, 255, 0.3),
            inset 0 0 10px rgba(255,255,255,0.1);
        }
  
        .card-3d-racing:hover {
          transform: rotateX(6deg) rotateY(-6deg) scale(1.03);
          box-shadow:
            0 6px 24px rgba(0,0,0,0.5),
            0 0 40px rgba(200, 100, 255, 0.4);
        }
  
        .shine-racing::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
          transform: rotate(25deg);
          pointer-events: none;
          animation: shineMove 6s infinite linear;
        }
  
        .title-glow {
          text-shadow: 0 2px 4px rgba(0,0,0,0.6), 0 0 6px rgba(255,255,255,0.15);
        }
  
        .floating-img {
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
          transition: transform 0.3s ease;
          transform-style: preserve-3d;
        }
  
        .floating-img:hover {
          transform: translateY(-8px) rotateZ(-4deg) scale(1.05);
        }
  
        .glass-winner {
          background: linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.06) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(5px);
          box-shadow: inset 0 0 4px rgba(255,255,255,0.08);
        }
      `}
      </style>

      <Link to={"/games/racing"}>
        <div className="bg-[#595959] rounded-lg">
          <div className="relative card-3d-racing shine-racing p-4 flex flex-col">
            <div>
              <h3 className="text-lg font-bold text-white title-glow">
                Racing
              </h3>
              <p className="text-sm text-white mt-1">🏁 Bet Fast, Race Hard!</p>
              <p className="text-sm text-white mt-1">
                🚗 Real-Time Racing Rush!
              </p>
            </div>

            <img
              src={Lottery_Racing}
              alt="Corner Icon"
              className="absolute top-[-10px] right-[-10px] w-[100px] h-[80px] floating-img"
            />
          </div>

          <div className="w-full h-[50px] my-1 flex items-center justify-between shadow-md rounded-md overflow-hidden relative glass-winner">
            <AnimatePresence mode="wait">
              <motion.div
                key={dummyData[currentIndex].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full flex items-center justify-between px-2"
              >
                <div className="flex items-center">
                  <img
                    src={dummyData[currentIndex].avatar}
                    alt="Avatar"
                    className="w-[35px] h-[35px] rounded-full object-cover"
                  />
                  <p className="ml-3 font-semibold text-gray-200">
                    {dummyData[currentIndex].name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-300">Winning Price</p>
                  <p className="text-lg font-bold text-yellow-500">
                    {dummyData[currentIndex].prize}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Racing;
