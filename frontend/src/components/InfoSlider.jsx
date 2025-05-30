import React from "react";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react"; // Import the speaker icon from lucide-react

const InfoContainer = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-[30px] my-2 pl-2 pr-1 flex items-center overflow-hidden relative bg-[#595959] rounded-full">
      {/* Speaker Icon (Left) */}
      <div className="flex-shrink-0">
        <Volume2 size={18} className="text-white" />
      </div>

      {/* Marquee Text */}
      <div className="flex-1 overflow-hidden">
        <p className="text-xs text-white animate-marquee whitespace-nowrap">
          OFFICIAL TC WEBSITE LINK: tcvvip.com please make sure, to always use
          this links to login, don't use other link to login to avoid any fraud,
          All recharge methods only available in RECHARGE menu on OFFICIAL TC
          website and application; 2. Submit 12 UTR number / UPI ref no for
          INSTANT recharge; 3. TC recharge account change every time, DO NOT
          SAVE to AVOID LOSS!!!
        </p>
      </div>

      {/* Button with Fire Icon (Right) */}
      <div
        onClick={() => navigate("/user-announcements")}
        className="flex items-center justify-center bg-yellow-600 text-white rounded-full p-1 ml-auto cursor-pointer"
      >
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="mr-1"
          viewBox="0 0 16 16"
        >
          <path d="M7 0h2v8h-2z" />
        </svg> */}
        <span className="text-[12px] px-4">Details</span>
      </div>
    </div>
  );
};

export default InfoContainer;
