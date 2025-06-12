import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import Loader from "../../components/Loaders/SpinLoader";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add state
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isAgreed, setIsAgreed] = useState(false); // State for agreement checkbox

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };
  const isValidPassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );
  };
  const navigate = useNavigate();

  const handleInputChange = (e, setter) => setter(e.target.value);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeSection === "phone") {
      if (!phoneNumber.trim() || !password.trim()) {
        toast.error("All fields are required!");
        return;
      }
    }
    if (activeSection === "email") {
      if (!email.trim() || !password.trim()) {
        toast.error("All fields are required!");
        return;
      }
      if (!isValidEmail(email)) {
        toast.error("Invalid email format!");
        return;
      }
    }
    if (!isValidPassword(password)) {
      toast.error(
        "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character!"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!isAgreed) {
      toast.error("You must agree to the terms and conditions.");
      return;
    }

    const data =
      activeSection === "phone"
        ? {
            phone: `${countryCode}${phoneNumber}`,
            password,
            inviteCode,
          }
        : activeSection === "email"
        ? {
            email,
            password,
            inviteCode,
          }
        : {};

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `/auth/register?authBy=${activeSection}`,
        data
      ); // Adjusted to include authBy in query
      // console.log("API Response:", response.data);

      if (response.data.success) {
        toast.success("Registered successful!");

        setLoading(false);
        // Redirect user if needed
        navigate("/");
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      // console.error("Error logging in:", error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  useEffect(() => {
    const code = searchParams.get("invite_code");
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-[500px] mx-auto mb-10">
      {loading && <Loader />} {/* Show loader when loading */}
      <div className="w-full bg-gradient-yellow-headers pb-3">
        <div className="w-full h-[54px] flex items-center justify-between px-4">
          <div className="flex-shrink-0">
            <ArrowLeft
              size={24}
              className="text-white cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex-grow text-center text-white font-semibold">
            Register
          </div>
          <div className="flex-shrink-0 text-white">
            <select className="bg-transparent border-none text-white">
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
        </div>

        <div className="w-full px-4">
          <h2 className="text-2xl text-white font-semibold mb-2">Register</h2>
          <p className="text-sm text-white">
            Please register using your phone number & email.
          </p>
        </div>
      </div>
      <div className="w-full h-[70px] flex border-b border-gray-300">
        <div
          className={`flex flex-col items-center justify-center w-1/2 cursor-pointer ${
            activeSection === "phone"
              ? "text-yellow-500 border-b-2 border-yellow-500"
              : "text-gray-200"
          }`}
          onClick={() => handleSectionClick("phone")}
        >
          <Phone size={24} className="mr-4" />
          <div className="text-lg">Register with Phone</div>
        </div>

        <div
          className={`flex flex-col items-center justify-center w-1/2 cursor-pointer ${
            activeSection === "email"
              ? "text-yellow-500 border-b-2 border-yellow-500"
              : "text-gray-200"
          }`}
          onClick={() => handleSectionClick("email")}
        >
          <Mail size={24} className="mr-4" />
          <div className="text-lg">Email Account</div>
        </div>
      </div>
      {/* <div className="w-full text-yellow-500 border-b-2 border-yellow-500">
        <h2 className="text-xl text-center py-3">
          Registration with TCVVIP 2.0
        </h2>
      </div> */}
      <div className="w-full p-4 space-y-6">
        {activeSection === "email" && (
          <div>
            <label className="text-sm text-gray-300 font-semibold">
              Email Address
            </label>
            <div className="flex items-center mt-2 border border-gray-300 rounded-lg p-2">
              <input
                type="email"
                value={email}
                onChange={(e) => handleInputChange(e, setEmail)}
                placeholder="Enter your email"
                className="w-full p-2 text-white bg-transparent focus:outline-none text-sm"
              />
            </div>
          </div>
        )}

        {activeSection === "phone" && (
          <div>
            <label className="text-sm text-gray-300 font-semibold">
              Phone Number
            </label>
            <div className="flex items-center mt-2 border border-gray-300 rounded-lg p-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="border-none text-sm focus:ring-0 w-1/4 p-1 rounded-l-lg bg-white"
              >
                <option value="+91">+91</option>
                <option value="+971">+971</option>
                <option value="+880">+880</option>
              </select>
              <input
                type="number"
                value={phoneNumber}
                onChange={(e) => handleInputChange(e, setPhoneNumber)}
                placeholder="Enter phone number"
                className="w-3/4 p-2 bg-transparent focus:outline-none rounded-r-lg text-sm text-white placeholder-gray-400 no-spinner"
              />
            </div>
          </div>
        )}

        <div className="flex items-center mt-2 border border-gray-300 rounded-lg p-2">
          <Lock size={20} className="text-gray-300 mr-3" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handleInputChange(e, setPassword)}
            placeholder="Enter your password"
            className="w-full p-2 text-white bg-transparent focus:outline-none text-sm"
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer ml-2 text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 font-semibold">
            Confirm Password
          </label>
          <div className="flex items-center mt-2 border border-gray-300 rounded-lg p-2">
            <Lock size={20} className="text-gray-300 mr-3" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => handleInputChange(e, setConfirmPassword)}
              placeholder="Confirm your password"
              className="w-full p-2 text-white bg-transparent focus:outline-none text-sm"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer ml-2 text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
        </div>

        {inviteCode && (
          <div>
            <label className="text-sm text-gray-300 font-semibold">
              Invitation Code
            </label>
            <div className="flex items-center mt-2 border border-gray-300 rounded-lg p-2">
              <input
                disabled
                value={inviteCode}
                // onChange={(e) => handleInputChange(e, setPassword)}
                placeholder="Enter your password"
                className="w-full p-2 text-white bg-transparent focus:outline-none text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={handleAgreementChange}
            className="h-5 w-5 cursor-pointer"
          />
          <label className="text-sm text-gray-300">
            I agree to the terms and conditions.
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 mt-6 text-white bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg shadow-lg text-lg font-bold transition-all"
        >
          Register
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 mt-6 text-gray-600 border-2 border-yellow-600 bg-white rounded-lg shadow-lg text-lg font-bold hover:bg-yellow-600 hover:text-white transition-all"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Register;
