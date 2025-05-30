import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useUSDTPriceStore from "./store/useUSDTPriceStore";
import { Toaster } from "react-hot-toast";

import Footer from "./components/Footer";

import PrivateRoute from "./routes/PrivateRoute";
import GamesRoutes from "./routes/GamesRoutes";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Promotions from "./pages/Promotions";
import Notifications from "./pages/Notifications";
import AgentPage from "./pages/AgentPage";
import AgentTeamReport from "./pages/AgentTeamReport";
import UserProfile from "./pages/user/UserProfile";
import UserWallet from "./pages/user/UserWallet";
import Deposit from "./pages/user/Deposit";
import Deposit2 from "./pages/user/Deposit2";
import DepositFinals from "./pages/user/DepositFinals";
import DepositBonuses from "./pages/DepositBonuses";
import Withdraw from "./pages/user/Withdraw";
import SVIP from "./pages/user/SVIP";
import Avatar from "./pages/user/Avatar";
import Settings from "./pages/user/Settings";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import BetHistory from "./pages/user/history/BetHistory";
import TransactionHistory from "./pages/user/history/TransactionHistory";
import DepositHistory from "./pages/user/history/DepositHistory";
import WithdrawHistory from "./pages/user/history/WithdrawHistory";
import Safe from "./pages/user/Safe";
import Gift from "./pages/user/Gift";
import Tasks from "./pages/user/Tasks/Tasks";
import ClaimHistory from "./pages/user/Tasks/ClaimHistory";
import GamesStats from "./pages/user/GamesStats";
import Feedback from "./pages/user/Feedback";
import Announcements from "./pages/user/Announcements";
import AboutUs from "./pages/AboutUs";
import CustomerService from "./pages/CustomerService";
import AppDownloadReward from "./pages/AppDownloadReward";
import AttendanceBonus from "./pages/user/DailyAttendanceRewards";
import PromotionsDetails from "./pages/PromotionsDetails";
import GameRules from "./routes/GameRules";

const App = () => {
  const { fetchUser } = useAuthStore();
  const fetchUSDTPrice = useUSDTPriceStore((state) => state.fetchUSDTPrice);

  useEffect(() => {
    fetchUSDTPrice();
    fetchUser();
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={true} />
      <main className="flex flex-col items-center justify-center bg-gray-500">
        {/* Outer container that takes full screen height */}
        <div className="w-full max-w-[500px] bg-app-bg shadow-xl relative overflow-hidden flex flex-col min-h-screen">
          {/* Content Section (This grows and pushes footer to bottom) */}
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/promotion" element={<Promotions />} />
                <Route
                  path="/promotions-details/:title/:image/:details"
                  element={<PromotionsDetails />}
                />
                <Route path="/user-me" element={<UserProfile />} />
                <Route path="/user-me/settings" element={<Settings />} />
                <Route path="/change-avatar" element={<Avatar />} />
                <Route path="/user-message" element={<Notifications />} />
                <Route path="/agent" element={<AgentPage />} />
                <Route
                  path="/agent/team-report"
                  element={<AgentTeamReport />}
                />
                <Route path="/wallet" element={<UserWallet />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/deposit2" element={<Deposit2 />} />
                <Route path="/deposit-finals" element={<DepositFinals />} />
                <Route path="/withdraw" element={<Withdraw />} />
                <Route path="/svip" element={<SVIP />} />
                <Route path="/bet-history" element={<BetHistory />} />
                <Route path="/safe-box" element={<Safe />} />
                <Route path="/user-redeem-gift" element={<Gift />} />
                <Route path="/game-statistics" element={<GamesStats />} />
                <Route path="/user-feedback" element={<Feedback />} />
                <Route path="/user-announcements" element={<Announcements />} />
                <Route path="/user-tasks" element={<Tasks />} />
                <Route
                  path="/user-tasks/claim-history"
                  element={<ClaimHistory />}
                />
                <Route
                  path="/promotion/recharge-awards"
                  element={<DepositBonuses />}
                />
                <Route
                  path="/promotion/app-download-rewards"
                  element={<AppDownloadReward />}
                />
                <Route
                  path="/daily-attendance-reward"
                  element={<AttendanceBonus />}
                />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/customer-service" element={<CustomerService />} />
                <Route
                  path="/transaction-history"
                  element={<TransactionHistory />}
                />
                <Route path="/deposit-history" element={<DepositHistory />} />
                <Route path="/withdraw-history" element={<WithdrawHistory />} />

                {/* Nested Games Routes */}
                <Route path="/games/*" element={<GamesRoutes />} />

                {/* Games Rules */}
                <Route path="/rules/*" element={<GameRules />} />
              </Route>
            </Routes>
          </div>

          {/* Footer (Always at bottom, no overlap) */}
          <Footer />
        </div>
      </main>
    </>
  );
};

export default App;
