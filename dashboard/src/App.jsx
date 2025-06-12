import "./App.css";
import "react-quill/dist/quill.snow.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThemeContextProvider from "./context/ThemeContextProvider";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Users from "./pages/Users";
import Agents from "./pages/Agents";
import AgentCommission from "./pages/AgentCommission";
import Punishments from "./pages/Punishments";
import Announcement from "./pages/Announcement";
// import ParentToChildTree from "./pages/ParentToChildTree";
import Profile from "./pages/Profile";
import Games from "./pages/Games";
import UserFinancial from "./pages/UserFinancial";
import AllUsersTransactionsRecord from "./pages/user-financial/AllUsersTransactionsRecords";
import UsersDepositRequests from "./pages/user-financial/UsersDepositRequests";
import UsersWithdrawalRequests from "./pages/user-financial/UsersWithdrawalRequests";
import UserRequests from "./pages/UserRequests";
import UsersFeedbacks from "./pages/UsersFeedbacks";
import Notifications from "./pages/Notifications";
import Payments from "./pages/Payments";
import Revenue from "./pages/Revenue";
import DepositPaymentMethods from "./pages/payment-methods/Deposit";
import WithdrawalPaymentMethods from "./pages/payment-methods/Withdraw";
import Settings from "./pages/Settings";
import ChatSupport from "./pages/ChatSupport";

import { Toaster } from "react-hot-toast";
import UserProfile from "./pages/UserProfile";
import useUSDTPriceStore from "./store/useUSDTPriceStore";
import { useEffect } from "react";

function Layout() {
  return (
    <div>
      {/* Sidebar (Always Visible in Protected Routes) */}
      <Sidebar />

      {/* Main Content */}
      <div
        className="grow ml-16 md:ml-64 h-full min-h-screen bg-gray-100 text-gray-900
        dark:bg-gray-900 dark:text-white"
      >
        {/* Navbar (Always Visible in Protected Routes) */}
        <Navbar />

        {/* Dynamic Content */}
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
            <Route path="/agent-panel" element={<Agents />} />
            <Route path="/agent-commission" element={<AgentCommission />} />
            <Route path="/punishment" element={<Punishments />} />
            <Route path="/announcement" element={<Announcement />} />
            <Route path="/chat-support" element={<ChatSupport />} />
            {/* <Route
              path="/parent-to-child-traverse"
              element={<ParentToChildTree />}
            /> */}
            <Route path="/users/user-profile/:id" element={<UserProfile />} />
            <Route path="/games" element={<Games />} />
            <Route path="/user-financial" element={<UserFinancial />} />
            <Route
              path="/all-users-transactions-records"
              element={<AllUsersTransactionsRecord />}
            />
            <Route path="/user-requests" element={<UserRequests />} />
            <Route
              path="/all-users-deposit-requests"
              element={<UsersDepositRequests />}
            />
            <Route
              path="/all-users-withdrawal-requests"
              element={<UsersWithdrawalRequests />}
            />
            <Route path="/users-feedbacks" element={<UsersFeedbacks />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route
              path="/deposit-payment-methods"
              element={<DepositPaymentMethods />}
            />
            <Route
              path="/withdrawal-payment-methods"
              element={<WithdrawalPaymentMethods />}
            />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  const fetchUSDTPrice = useUSDTPriceStore((state) => state.fetchUSDTPrice);

  useEffect(() => {
    fetchUSDTPrice();
  }, []);
  return (
    <ThemeContextProvider>
      <Toaster position="top-right" reverseOrder="true" />
      <Router>
        <Routes>
          {/* Full Page Login Route */}
          <Route path="/auth/login" element={<Login />} />

          {/* Protected Routes (Using Layout) */}
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<Layout />} />
          </Route>
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
