import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import Loader from "../../components/Loaders/SpinLoader";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add state
  const [captcha, setCaptcha] = useState("");
  const [enteredCaptcha, setEnteredCaptcha] = useState(""); // State for user-entered captcha
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const generatedCaptcha = generateCaptcha();
    setCaptcha(generatedCaptcha);
  }, []);

  const generateCaptcha = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captchaCode = "";
    for (let i = 0; i < 6; i++) {
      captchaCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return captchaCode;
  };

  const handleInputChange = (e, setter) => setter(e.target.value);

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enteredCaptcha !== captcha) {
      toast.error("Captcha doesn't match! Please try again.");
      return;
    }

    let payload = {};
    let authBy = "";

    if (activeSection === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      payload = { email, password };
      authBy = "email";
    } else if (activeSection === "phone") {
      payload = { phone: `${countryCode}${phoneNumber}`, password };
      authBy = "phone";
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        `/auth/login?authBy=${authBy}`,
        payload
      ); // Adjusted to include authBy in query
      // console.log("API Response:", response.data);

      if (response.data.success) {
        // console.log("User:", response.data.user);
        // console.log("Token:", response.data.token);

        toast.success("Login successful!");

        // Update Zustand state immediately to avoid reload
        useAuthStore.getState().login(response.data.token);

        setLoading(false);
        // Redirect user if needed
        navigate("/user-me");
      } else {
        toast.error("Internal Server Error");
      }
    } catch (error) {
      // console.error("Error logging in:", error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto mb-24">
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
            Login
          </div>
          <div className="flex-shrink-0 text-white">
            <select className="bg-transparent border-none text-white">
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
        </div>

        <div className="w-full px-4">
          <h2 className="text-2xl text-white font-semibold mb-2">Login</h2>
          <p className="text-sm text-white">
            Please log in using your phone number or email.
          </p>
          <p className="text-sm text-white">
            If you forget your password, please contact customer service.
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
          <div className="text-lg">Login with Phone</div>
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
      <div className="w-full p-4 space-y-6">
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

        <div>
          <label className="text-sm text-gray-300 font-semibold">
            Password
          </label>
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
        </div>

        <div>
          <label className="text-sm text-gray-300 font-semibold">Captcha</label>
          <div className="flex items-center mt-2 border border-gray-300 rounded-lg p-2">
            <Shield size={20} className="text-gray-300 mr-3" />
            <input
              type="text"
              value={enteredCaptcha}
              onChange={(e) => setEnteredCaptcha(e.target.value)}
              placeholder="Enter captcha"
              className="w-full p-2 text-white bg-transparent focus:outline-none text-sm"
            />
          </div>

          <div className="mt-4 text-center flex justify-center items-center">
            <span className="text-sm text-gray-300 mr-1">Enter the code: </span>
            <div className="text-2xl font-bold text-yellow-500">{captcha}</div>
          </div>
        </div>

        <div className="flex">
          <button
            onClick={handleSubmit}
            className="w-full py-2 mr-1 text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg text-lg font-bold transition-all"
          >
            Log In
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-full py-2 ml-1 text-gray-600 border-2 border-yellow-600 bg-white rounded-lg shadow-lg text-lg font-bold hover:bg-yellow-600 hover:text-white transition-all"
          >
            Register
          </button>
        </div>

        <div>
          <div className="w-full flex justify-between items-center mt-6">
            <Link to={"/forgot-password"}>
              <div className="flex items-center cursor-pointer">
                <Lock size={20} className="text-gray-200 mr-2" />
                <span className="text-sm text-gray-200">Forget Password</span>
              </div>
            </Link>
            <div className="flex items-center cursor-pointer">
              <Shield size={20} className="text-gray-200 mr-2" />
              <span className="text-sm text-gray-200">Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
