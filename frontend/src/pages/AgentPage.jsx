import React, { useEffect, useState, useMemo } from "react";
import {
  UserCircle,
  Bell,
  Gift,
  BarChart3,
  Languages,
  ChevronRight,
  Clipboard,
  Users,
  DollarSign,
  UserPlus,
  FileText,
  Headphones,
  Percent,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import useParentChildStore from "../store/parentToChildStore";
import { Link } from "react-router-dom";

//   {
//     title: "Direct Subordinates",
//     stats: [
//       { label: "Registration Accounts", value: 0 },
//       { label: "Deposit Accounts", value: 0 },
//       { label: "Deposit Amount", value: 0 },
//       { label: "New Deposit Accounts", value: 0 },
//     ],
//   },
//   {
//     title: "Team Subordinates",
//     stats: [
//       { label: "Registration Accounts", value: 0 },
//       { label: "Deposit Accounts", value: 0 },
//       { label: "Deposit Amount", value: 0 },
//       { label: "New Deposit Accounts", value: 0 },
//     ],
//   },
// ];

const settings = [
  {
    icon: <Clipboard className="w-7 h-7 text-yellow-500" />,
    title: "Copy Invitation Code",
    subtitle: "E5C0E13182140",
  },
  {
    icon: <Users className="w-7 h-7 text-yellow-500" />,
    title: "Subordinate Data",
    subtitle: "Total Subordinates: 25",
    to_link: "/agent/team-report",
  },
  {
    icon: <DollarSign className="w-7 h-7 text-yellow-500" />,
    title: "Commission Details",
    subtitle: "Total Earnings: ₹4500",
    to_link: "/agent/team-report",
  },
  {
    icon: <UserPlus className="w-7 h-7 text-yellow-500" />,
    title: "New Subordinates",
    subtitle: "5 joined this month",
    to_link: "/agent/team-report",
  },
  {
    icon: <FileText className="w-7 h-7 text-yellow-500" />,
    title: "Invitation Rules",
    subtitle: "Updated on 20th Feb 2025",
    to_link: "/agent/team-report",
  },
  {
    icon: <Headphones className="w-7 h-7 text-yellow-500" />,
    title: "Agent Line Customer Service",
    subtitle: "24/7 support available",
    to_link: "/agent/team-report",
  },
  {
    icon: <Percent className="w-7 h-7 text-yellow-500" />,
    title: "Rebate Ratio",
    subtitle: "Current Rebate: 15%",
    to_link: "/agent/team-report",
  },
];

const AgentPage = () => {
  const { user } = useAuthStore();
  const { childrenStats, teamStats, subOrdinatesStats } = useParentChildStore();
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);

  const handleInviteCodeCopy = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setInviteCodeCopied(true);
      setTimeout(() => setInviteCodeCopied(false), 1500); // hide after 1.5s
    }
  };

  const handleInviteLinkCopy = () => {
    if (user?.inviteCode) {
      const baseUrl = import.meta.env.VITE_API_CLIENT_URL;
      const fullLink = `${baseUrl}/register?invite_code=${user.inviteCode}`;
      navigator.clipboard.writeText(fullLink);
      setInviteLinkCopied(true);
      setTimeout(() => setInviteLinkCopied(false), 1500);
    }
  };

  // ⬇️ Place useMemo HERE
  const data = useMemo(
    () => [
      {
        title: "Direct Subordinates",
        stats: [
          {
            label: "Total Subordinates",
            value: childrenStats?.totalSubordinates || 0,
          },
          {
            label: "Registration Accounts",
            value: childrenStats?.registrationAccounts || 0,
          },
          {
            label: "Deposit Accounts",
            value: childrenStats?.depositAccounts || 0,
          },
          { label: "Deposit Amount", value: childrenStats?.depositAmount || 0 },
          {
            label: "New Deposit Accounts",
            value: childrenStats?.newDepositAccounts || 0,
          },
        ],
      },
      {
        title: "Team Subordinates",
        stats: [
          {
            label: "Total Subordinates",
            value: teamStats?.totalSubordinates || 0,
          },
          {
            label: "Registration Accounts",
            value: teamStats?.registrationAccounts || 0,
          },
          { label: "Deposit Accounts", value: teamStats?.depositAccounts || 0 },
          { label: "Deposit Amount", value: teamStats?.depositAmount || 0 },
          {
            label: "New Deposit Accounts",
            value: teamStats?.newDepositAccounts || 0,
          },
        ],
      },
    ],
    [childrenStats, teamStats]
  );

  useEffect(() => {
    // console.log("Sub Ordinates Stats", subOrdinatesStats);
    // console.log("Children Stats", childrenStats);
    // console.log("Team Stats", teamStats);
  }, []);

  return (
    <div className="w-full mb-28">
      <div className="flex flex-col items-center bg-gradient-yellow-headers p-2">
        <div className="flex flex-col items-center">
          <h1 className="my-2 text-white text-lg">Agent</h1>
          <div className="flex flex-col items-center text-white my-4">
            <h3 className="text-sm ">
              Upgrade the level to increase commission income
            </h3>
            <div className="flex flex-col items-center my-2">
              <span className="text-2xl">0.00</span>
              <h5>Commission Balance</h5>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">0.00</span>
              <h5>Total Commission Yesterday</h5>
            </div>
          </div>
        </div>

        <div className="w-full px-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 my-2">
            <button className="bg-white text-yellow-800 px-4 py-2 rounded-lg shadow-md text-sm font-semibold">
              Turn into Balance
            </button>
            <button className="bg-white text-yellow-800 px-4 py-2 rounded-lg shadow-md text-sm font-semibold">
              Commission Withdrawal
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 bg-[#595959] rounded-lg">
          {data.map((section, index) => (
            <div
              key={index}
              className="p-4 bg-[#595959] rounded-lg shadow flex flex-col space-y-3"
            >
              {/* Section Heading */}
              <div className="flex items-center space-x-2 text-gray-700">
                <UserCircle className="w-6 h-6 text-yellow-500" />
                <h2 className="text-sm font-semibold text-white">
                  {section.title}
                </h2>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                {section.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between bg-app-bg p-2 rounded-md text-sm"
                  >
                    <span className="text-gray-100 text-xs">{stat.label}</span>
                    <span className="text-gray-100 font-semibold">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="relative w-full mt-4">
          {inviteLinkCopied && (
            <p className="text-center my-1 text-xs text-yellow-500 px-2 py-0.5 rounded shadow">
              Link Copied!
            </p>
          )}
          <button
            onClick={handleInviteLinkCopy}
            className="w-full bg-yellow-600 text-white py-1 rounded-xl"
          >
            Invitation Link
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="w-full rounded-2xl shadow-md px-4">
        <div className="grid grid-cols-1 gap-1">
          {settings.map((tile, index) => {
            const isFirst = index === 0;

            const content = (
              <div
                key={index}
                onClick={isFirst ? handleInviteCodeCopy : undefined}
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all relative bg-[#595959] hover:bg-[#4a4a4a]`}
              >
                <div className="flex items-center space-x-4">
                  <span>{tile.icon}</span>
                  <h3 className="text-white font-semibold text-sm">
                    {tile.title}
                  </h3>
                </div>

                <div className="relative flex items-center">
                  {isFirst && (
                    <>
                      <span className="text-white text-sm">
                        {user?.inviteCode}
                      </span>
                      {inviteCodeCopied && (
                        <span className="absolute -top-6 right-0 text-xs text-yellow-500 bg-[#595959] px-2 py-0.5 rounded-md shadow-md">
                          Copied!
                        </span>
                      )}
                    </>
                  )}
                  <ChevronRight className="text-gray-300 text-lg ml-2" />
                </div>
              </div>
            );

            return isFirst ? (
              content
            ) : (
              <Link key={index} to={tile.to_link}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Promotion Data */}
      <div className=" p-4 rounded-lg shadow-lg w-full">
        {/* Heading */}
        <h2 className="text-xl font-semibold text-yellow-500 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-yellow-500" />
          Promotion Data
        </h2>

        {/* Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Single Column Items */}
          <div className="p-4 bg-[#595959] rounded-lg">
            <h3 className="text-gray-100">This Week's Commission</h3>
            <p className="text-lg font-bold text-white">0.00</p>
          </div>

          <div className="p-4 bg-[#595959] rounded-lg">
            <h3 className="text-gray-100">Direct Subordinates</h3>
            <p className="text-lg font-bold text-white">0</p>
          </div>

          {/* Two Column Items */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#595959] rounded-lg">
              <h3 className="text-gray-100">Total Commission</h3>
              <p className="text-lg font-bold text-white">0.00</p>
            </div>

            <div className="p-4 bg-[#595959] rounded-lg">
              <h3 className="text-gray-100">Total Subordinates</h3>
              <p className="text-lg font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
