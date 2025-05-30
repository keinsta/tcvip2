import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import aboutus from "../assets/images/aboutBg.png";
import license from "../assets/images/license.jpg";
import license1 from "../assets/images/license1.jpg";

const AboutUs = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(null);

  const confidentialityContent = `
    <h2 class='text-xl font-semibold'>Privacy Policy</h2>
    <p>This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your information...</p>
    <ul class='list-disc pl-5'>
      <li><strong>You</strong> means the individual accessing or using the Service...</li>
      <li><strong>Company</strong> refers to {1}.</li>
    </ul>
    <p>For more information, visit our <a href='{0}' class='text-blue-500 underline'>website</a>.</p>
  `;

  return (
    <div className="min-h-screen flex flex-col items-center space-y-4">
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">About Us</span>
        </div>
        <img src={aboutus} alt="Safe Banner" className="w-20" />
      </div>

      <div className="w-full px-4">
        <div className="grid grid-cols-2 gap-6">
          <div
            className="p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 flex items-center gap-2"
            onClick={() => setSelectedTab("confidentiality")}
          >
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <h2 className="text-sm lg:text-lg font-semibold">
              Confidentiality Agreement
            </h2>
          </div>
          <div
            className="p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 flex items-center gap-2"
            onClick={() => setSelectedTab("risk-disclosure")}
          >
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h2 className="text-sm lg:text-lg font-semibold">
              Risk Disclosure Agreement
            </h2>
          </div>
        </div>

        {selectedTab === "confidentiality" && (
          <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-300">
            <div
              dangerouslySetInnerHTML={{ __html: confidentialityContent }}
            ></div>
          </div>
        )}

        {selectedTab === "risk-disclosure" && (
          <div className="mt-6 p-4 bg-white shadow-md rounded-lg border border-gray-300">
            <h2 className="text-xl font-semibold">Risk Disclosure Agreement</h2>
            <img
              src={license}
              alt="Risk Agreement Page 1"
              className="mt-4 rounded-lg shadow-md"
            />
            <img
              src={license1}
              alt="Risk Agreement Page 2"
              className="mt-4 rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
