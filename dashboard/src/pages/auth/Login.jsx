import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import axiosInstance from "../../config/axiosInstance";
import toast from "react-hot-toast";

export function Login() {
  const { login, setAdmin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login?authBy=email", {
        email,
        password,
      });
      setEmail("");
      setPassword("");
      setAdmin(response.data);
      login(response.data.token);
      setLoading(false);
      toast.success("Login Successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      {/* Left Section (Form) */}
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Sign In</h2>
          <p className="text-lg text-gray-600">
            Enter your email and password to Sign In.
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2 bg-white p-6 rounded-lg shadow-md"
          onSubmit={handleLogin}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Your Email
            </label>
            <input
              type="email"
              placeholder="name@mail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-all"
          >
            {loading ? "Authenticating" : "Sign In"}
          </button>
        </form>
      </div>

      {/* Right Section (Image) */}
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
          alt="Pattern"
        />
      </div>
    </section>
  );
}

export default Login;
