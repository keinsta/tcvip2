import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaUsers,
  FaUser,
  FaBox,
  FaFileAlt,
  FaCog,
  FaGamepad,
  FaInbox,
  FaBell,
  FaCreditCard,
  FaDollarSign,
  FaFileInvoice,
  FaCommentAlt,
  FaGavel,
} from "react-icons/fa";
import { ArrowDownCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const menuItems = [
    {
      label: "Dashboard Stats",
      icon: <FaTachometerAlt />,
      path: "/",
    },
    // {
    //   label: "Admin Profile",
    //   icon: <FaUser />,
    //   path: "/profile",
    // },
    // {
    //   label: "User Tree Nodes",
    //   icon: <FaUsers />,
    //   path: "/parent-to-child-traverse",
    // },
    {
      label: "Agents & Users",
      icon: <FaUsers />,
      // path: "/users",
      subOptions: [
        {
          label: "Agent Panel",
          icon: <FaUsers size={16} />,
          path: "/agent-panel",
        },
        { label: "All Users", icon: <FaUsers size={16} />, path: "/users" },
        {
          label: "Commission",
          icon: <FaDollarSign size={16} />,
          path: "/agent-commission",
        },
        {
          label: "Punishments",
          icon: <FaGavel size={16} />,
          path: "/punishment",
        },
        {
          label: "User Feedbacks",
          icon: <FaCommentAlt size={16} />,
          path: "/users-feedbacks",
        },
      ],
    },
    {
      label: "Users Financial",
      icon: <FaInbox size={18} />,
      path: "/user-financial",
      subOptions: [
        {
          label: "Transactions Records",
          icon: <FaFileAlt size={16} />,
          path: "/all-users-transactions-records",
        },
        // {
        //   label: "User Requests",
        //   icon: <FaFileInvoice size={18} />,
        //   path: "/user-requests",
        // },
        {
          label: "Deposit Requests",
          icon: <FaFileInvoice size={16} />,
          path: "/all-users-deposit-requests",
        },
        {
          label: "Withdrawal Requests",
          icon: <FaFileInvoice size={16} />,
          path: "/all-users-withdrawal-requests",
        },
      ],
    },
    {
      label: "Payment Methods",
      icon: <FaCog />,
      // path: "/settings",
      subOptions: [
        {
          label: "Deposit",
          icon: <ArrowDownCircle size={16} />,
          path: "/deposit-payment-methods",
        },
        {
          label: "Withdraw",
          icon: <Download size={16} />,
          path: "/withdrawal-payment-methods",
        },
      ],
    },
    {
      label: "Announcements",
      icon: <FaGavel size={16} />,
      path: "/announcement",
    },
    {
      label: "Games",
      icon: <FaGamepad />,
      path: "/games",
    },
    // {
    //   label: "Notifications",
    //   icon: <FaBell />,
    //   path: "/notifications",
    // },
    {
      label: "Revenue",
      icon: <FaDollarSign />,
      path: "/revenue",
    },
    // {
    //   label: "Settings",
    //   icon: <FaCog />,
    //   path: "/settings",
    // },
  ];

  const toggleSubMenu = (label) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white h-full min-h-screen px-4 fixed w-16 md:w-64 border-r border-gray-300 dark:border-gray-600">
      <h1 className="text-2xl font-bold hidden md:block mt-4 text-center italic">
        TCVIP 2.0 Administrations
      </h1>
      <ul className="flex flex-col mt-5 text-xl">
        {menuItems.map((item, idx) => (
          <div key={idx}>
            <li
              onClick={() =>
                item.subOptions ? toggleSubMenu(item.label) : null
              }
              className="flex text-sm font-extrabold items-center justify-between py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white"
            >
              <Link to={item.path} className="flex items-center w-full">
                <span className="md:hidden">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
              {item.subOptions && (
                <span className="hidden md:inline">
                  {openSubMenu === item.label ? "▲" : "▼"}
                </span>
              )}
            </li>
            {item.subOptions && openSubMenu === item.label && (
              <ul className="ml-6 mt-1 mb-2 space-y-1">
                {item.subOptions.map((sub, subIdx) => (
                  <Link to={sub.path} key={subIdx} className="hidden md:inline">
                    <li className="text-sm flex items-center gap-1 py-1 px-2 hover:bg-blue-500 hover:text-white rounded cursor-pointer">
                      {sub.icon} {sub.label}
                    </li>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
