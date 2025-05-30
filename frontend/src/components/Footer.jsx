import React from "react";
import { Home, Percent, Users, Wallet, User } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full max-w-[500px] h-[70px] bg-yellow-500 flex items-center justify-around shadow-t-md">
      <div className="flex justify-around w-[40%]">
        <Link to={"/"}>
          <FooterItem icon={<Home size={24} />} label="Home" />
        </Link>
        <Link to={"/promotion"}>
          <FooterItem icon={<Percent size={24} />} label="Promo" />
        </Link>
      </div>

      {/* Central Agent Icon (Larger & Raised) */}
      <div className="flex flex-col items-center absolute -top-7 bg-yellow-500 w-20 h-20 pt-2 rounded-full ">
        <Link to={"/agent"}>
          <FooterItem icon={<Users size={30} />} label="Agent" isCentral />
        </Link>
      </div>

      <div className="flex justify-around w-[40%]">
        <Link to={"/wallet"}>
          <FooterItem icon={<Wallet size={24} />} label="Wallet" />
        </Link>
        <Link to={"/user-me"}>
          <FooterItem icon={<User size={24} />} label="Me" />
        </Link>
      </div>
    </footer>
  );
};

// Reusable Footer Item Component
const FooterItem = ({ icon, label, isCentral }) => {
  return (
    <div
      className={`flex flex-col items-center cursor-pointer transition-all duration-300
      ${isCentral ? "text-white scale-110" : "text-white hover:text-yellow-200"}
      `}
    >
      <div
        className={
          isCentral
            ? "hover:scale-125 transition-transform"
            : "hover:scale-110 transition-transform"
        }
      >
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

export default Footer;
