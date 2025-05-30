import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PromotionsDetails = () => {
  const navigate = useNavigate();
  const { title, image, details } = useParams();
  return (
    <div className="mb-28 min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Activity Details</span>
        </div>
      </div>
      <div className="p-4 space-y-4 rounded-lg">
        <img className="rounded-lg" src={decodeURIComponent(image)} />
        <h3 className="text-white text-center text-lg font-semibold">
          {title}
        </h3>
        <img className="rounded-lg" src={decodeURIComponent(details)} />
      </div>
    </div>
  );
};

export default PromotionsDetails;
