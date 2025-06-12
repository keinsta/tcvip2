import React, { useState, useRef } from "react";
import { Ticket } from "lucide-react";

import Header from "../components/Header";
import Carousel from "../components/Carousel/HeroCarousel";
import InfoContainer from "../components/InfoSlider";
import WinTile from "../components/WinningInfo";
import RankStage from "../components/TodayEarningRank";

import Lottery from "../components/lottery/Lottery";
import MiniGames from "../components/mini-games/MiniGames";
import Slots from "../components/slots/Slots";
import Sports from "../components/sports/Sports";
import Casino from "../components/casino/Casino";
import Rummy from "../components/rummy/Rummy";
import Fishing from "../components/fishing/Fishing";
import Popular from "../components/popular/Popular";

import { images } from "../assets/images/home-game-list/index";

const items = [
  { name: "Popular", image: images.image8, component: <Popular /> },
  { name: "Lottery", image: images.image1, component: <Lottery /> },
  { name: "Original", image: images.image2, component: <MiniGames /> },
  { name: "Slots", image: images.image3, component: <Slots /> },
  { name: "Sports", image: images.image4, component: <Sports /> },
  { name: "Casino", image: images.image5, component: <Casino /> },
  { name: "Rummy", image: images.image6, component: <Rummy /> },
  { name: "Fishing", image: images.image7, component: <Fishing /> },
];

const LandingPage = () => {
  const [selectedItem, setSelectedItem] = useState(0);
  const contentRef = useRef();

  const handleItemClick = (index) => {
    setSelectedItem(index);
    setTimeout(() => {
      if (contentRef.current) {
        const topPos = contentRef.current.offsetTop;
        window.scrollTo({
          top: topPos - 20,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen mb-24 flex flex-col items-center">
      {/* Internal CSS */}
      <style>
        {`
          /* 3D Animated Gradient Background */
          @keyframes animatedGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .three-d-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            background: linear-gradient(135deg, #1e3c72, #2a5298, #e100ff, #7f00ff);
            background-size: 400% 400%;
            animation: animatedGradient 20s ease infinite;
            filter: blur(50px);
          }

          /* 3D Container Perspective */
          .three-d-container {
            perspective: 1200px;
          }

          /* Card Styles with 3D Hover Effect */
          .three-d-card {
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            transform-style: preserve-3d;
            will-change: transform;
            // background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
            border: 1px solid #ffd70088;
            box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05);
          }

          .three-d-card:hover {
            transform: rotateY(10deg) rotateX(6deg) scale(1.05);
            box-shadow: 0 15px 30px rgba(255, 215, 0, 0.6), 0 0 25px rgba(255, 255, 255, 0.2);
          }

          /* Text Styling */
          .item-name {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
      <Header />

      {/* Content Area */}
      <div className="flex-grow w-full flex flex-col items-center pt-2 ">
        <Carousel />
        <InfoContainer />

        {/* Background */}
        <div className="three-d-bg"></div>

        {/* Items */}
        <div className="three-d-container mx-auto flex flex-wrap justify-center items-center rounded-lg">
          {items.map((item, index) => (
            <div
              key={index}
              className={`three-d-card w-[109px] h-[120px] p-2 rounded-xl flex flex-col justify-center items-center m-1 cursor-pointer ${
                selectedItem === index ? "bg-yellow-700" : ""
              }`}
              onClick={() => handleItemClick(index)}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-[80px] rounded-lg object-cover"
              />
              <p
                className={`mt-1 text-sm item-name ${
                  selectedItem === index
                    ? "text-white font-semibold"
                    : "text-yellow-300"
                }`}
              >
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Home Menu Lottery Container */}
        <div
          ref={contentRef}
          className="w-full mx-auto flex flex-col items-center mt-3"
        >
          <div className="w-full flex items-center pl-4 py-2 ">
            <Ticket size={30} className="text-yellow-600 mr-2" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-300 bg-clip-text text-transparent">
              {items[selectedItem].name}
            </h1>
          </div>
          {items[selectedItem].component}
        </div>
      </div>
      {/* Home Winning Information */}
      <div className="w-full">
        <WinTile />
      </div>

      {/* Today's Earning Ranks section */}
      <RankStage />
    </div>
  );
};

export default LandingPage;
