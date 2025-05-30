import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Layers,
  Shield,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { avatars } from "../../assets/images/avatar/avatar";
import axiosInstance from "../../config/axiosInstance";
import toast from "react-hot-toast";

const settings = [
  {
    icon: <Briefcase className="w-7 h-7 text-yellow-500" />,
    title: "Change Password",
    subtitle: "My Betting History",
  },
  {
    icon: <Briefcase className="w-7 h-7 text-yellow-500" />,
    title: "Change Withdrawal Password",
    subtitle: "My Transaction History",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();
  const memberAvatar = user?.avatar;
  const memberId = user?.uid?.replace("MEMBER-", "") || "";
  const [selectedAvatar, setSelectedAvatar] = useState("");

  // For NickName
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [nickName, setNickname] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    isResponse: "",
    message: "",
  });

  // For Change Login Password
  const [loginPasswordModalOpen, setLoginPasswordModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // For Change Withdrawal Password
  const [withdrawalPasswordModalOpen, setWithdrawalPasswordModalOpen] =
    useState(false);
  const [withdrawalPassword, setWithdrawalPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const updateNickName = async () => {
    if (nickName.trim() === "") return;

    try {
      await axiosInstance.put("/auth/update-user-nickname", { nickName });
      setSuccess(true);
      fetchUser(); // Refresh user data
      setTimeout(() => {
        setSuccess(false);
        setNicknameModalOpen(false);
      }, 1000);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleChangePassword = async () => {
    if (loginPassword.newPassword !== loginPassword.confirmNewPassword) {
      toast.error("New Passwords do not match");
      return;
    }
    await axiosInstance
      .put("/auth/change-password", loginPassword)
      .then((response) => {
        setSuccess(true);
        fetchUser(); // Refresh user data
        setSuccessMessage({
          isResponse: "response",
          message: response.data.message,
        });
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage({
            isResponse: "",
            message: "",
          });
          setLoginPasswordModalOpen(false);
        }, 1000);
      })
      .catch((error) => {
        setSuccess(true);
        setSuccessMessage({
          isResponse: "error",
          message: error.response.data.message,
        });
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage({
            isResponse: "",
            message: "",
          });
          setLoginPasswordModalOpen(false);
        }, 2000);
      });
  };

  const handleSetWithdrawalPassword = async () => {
    await axiosInstance
      .put("/auth/update-withdrawal-password", {
        newWithdrawalPassword: withdrawalPassword.currentPassword,
      })
      .then((response) => {
        setSuccess(true);
        fetchUser(); // Refresh user data
        setSuccessMessage({
          isResponse: "response",
          message: response.data.message,
        });
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage({
            isResponse: "",
            message: "",
          });
          setWithdrawalPasswordModalOpen(false);
        }, 1000);
      })
      .catch((error) => {
        setSuccess(true);
        setSuccessMessage({
          isResponse: "error",
          message: error.response.data.message,
        });
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage({
            isResponse: "",
            message: "",
          });
          setLoginPasswordModalOpen(false);
        }, 2000);
      });
  };

  const handleUpdateWithdrawalPassword = async () => {
    if (
      withdrawalPassword.newPassword !== withdrawalPassword.confirmNewPassword
    ) {
      toast.error("New Passwords do not match");
      return;
    }
    await axiosInstance
      .put("/auth/update-withdrawal-password", {
        newWithdrawalPassword: withdrawalPassword.newPassword,
        oldWithdrawalPassword: withdrawalPassword.currentPassword,
      })
      .then((response) => {
        setSuccess(true);
        fetchUser(); // Refresh user data
        setSuccessMessage({
          isResponse: "response",
          message: response.data.message,
        });
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage({
            isResponse: "",
            message: "",
          });
          setWithdrawalPasswordModalOpen(false);
        }, 1000);
      })
      .catch((error) => {
        setSuccess(true);
        setSuccessMessage({
          isResponse: "error",
          message: error.response.data.message,
        });
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage({
            isResponse: "",
            message: "",
          });
          setLoginPasswordModalOpen(false);
        }, 2000);
      });
  };

  const handleResetWithdrawalPassword = async () => {};

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [user?.nickName]);

  useEffect(() => {
    const foundAvatar = avatars.find((avatar) => avatar.name === memberAvatar);
    setSelectedAvatar(foundAvatar);
  }, [memberAvatar]);

  return (
    <div className="mb-24 flex flex-col items-center">
      <div className="w-full bg-gradient-yellow-headers pb-16 rounded-b-3xl">
        <div className="w-full h-[54px] flex items-center justify-start px-4">
          <div className="flex-shrink-0">
            <ArrowLeft
              size={24}
              className="text-white cursor-pointer mr-2"
              onClick={() => navigate(-1)}
            />
          </div>
          <h2 className="text-lg text-white ">Settings</h2>
        </div>
      </div>

      <div className="w-full px-4 relative top-[-60px]">
        <div className="space-y-4">
          {/* Member/User Information */}
          <div className="bg-white shadow-md rounded-lg">
            {/* Avatar Tile */}
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => navigate("/change-avatar")}
            >
              <img
                src={selectedAvatar?.avatar}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover border-yellow-500 border-2"
              />
              <span className="flex font-semibold text-yellow-600 cursor-pointer">
                Change Avatar <ChevronRight />
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* User ID Tile */}
            <div className="flex justify-between p-4">
              <span className="text-sm font-semibold text-gray-700">UID</span>
              <span className="text-sm text-gray-600">{memberId}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Nickname Tile - Opens Modal */}
            <div
              className="flex justify-between p-4 cursor-pointer"
              onClick={() => setNicknameModalOpen(true)}
            >
              <span className="text-sm font-semibold text-yellow-600">
                Nickname
              </span>
              <span className="flex items-center text-sm text-yellow-600 font-bold">
                {user?.nickName ? user?.nickName : "Add your Nickname"}{" "}
                <ChevronRight />
              </span>
            </div>
          </div>

          {/* Security Information */}
          <div className="rounded-2xl shadow-md my-4">
            <div className="flex items-center my-4 text-lg text-yellow-600 font-semibold">
              <Shield className="mr-1" /> Security Information
            </div>
            <div className="grid grid-cols-1 gap-1">
              {/* Login Password */}
              <div
                className="flex items-center justify-between p-4 bg-[#595959] rounded-lg cursor-pointer hover:bg-[#4a4a4a] transition-all"
                onClick={() => setLoginPasswordModalOpen(true)}
              >
                <div className="flex items-center space-x-4">
                  <span>
                    <Briefcase className="w-7 h-7 text-yellow-500" />
                  </span>
                  <h3 className="text-white text-sm">Change Login Password</h3>
                </div>

                {/* Right Arrow and Badge for Notifications */}
                <div className="relative flex items-center">
                  <ChevronRight className="text-gray-300 text-lg ml-2" />
                </div>
              </div>

              {/* Withdrawal Password */}
              <div
                className="flex items-center justify-between p-4 bg-[#595959] rounded-lg cursor-pointer hover:bg-[#4a4a4a] transition-all"
                onClick={() => setWithdrawalPasswordModalOpen(true)}
              >
                <div className="flex items-center space-x-4">
                  <span>
                    <Briefcase className="w-7 h-7 text-yellow-500" />
                  </span>
                  <h3 className="text-white text-sm">
                    Set/Update Withdrawal Password
                  </h3>
                </div>

                {/* Right Arrow and Badge for Notifications */}
                <div className="relative flex items-center">
                  <ChevronRight className="text-gray-300 text-lg ml-2" />
                </div>
              </div>

              {/* Update Version */}
              <div className="flex items-center justify-between p-4 bg-[#595959] rounded-lg cursor-pointer hover:bg-[#4a4a4a] transition-all">
                <div className="flex items-center space-x-4">
                  <span>
                    <Layers className="w-7 h-7 text-yellow-500" />
                  </span>
                  <h3 className="text-white text-sm">Update Version</h3>
                </div>

                {/* Right Arrow and Badge for Notifications */}
                <div className="relative flex items-center">
                  <ChevronRight className="text-gray-300 text-lg ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nickname Modal */}
      {nicknameModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add Your Nickname
            </h2>

            <input
              type="text"
              placeholder="Enter nickname"
              value={nickName}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none"
            />

            <button
              onClick={updateNickName}
              className="w-full mt-4 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition"
            >
              Update
            </button>

            {success && (
              <p className="mt-4 text-green-600 font-semibold">
                Nickname updated successfully!
              </p>
            )}

            <button
              onClick={() => setNicknameModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Login Password Modal */}
      {loginPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Change Login Password
            </h2>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-2 border rounded-md"
              onChange={(e) =>
                setLoginPassword({
                  ...loginPassword,
                  currentPassword: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 border rounded-md mt-2"
              onChange={(e) =>
                setLoginPassword({
                  ...loginPassword,
                  newPassword: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-2 border rounded-md mt-2"
              onChange={(e) =>
                setLoginPassword({
                  ...loginPassword,
                  confirmNewPassword: e.target.value,
                })
              }
            />
            <button
              onClick={handleChangePassword}
              className="w-full mt-4 bg-yellow-600 text-white py-2 rounded-md"
            >
              Update
            </button>

            {success && successMessage.isResponse === "response" ? (
              <p className="mt-4 text-green-600 font-semibold">
                {successMessage.message}
              </p>
            ) : (
              <p className="mt-4 text-red-600 font-semibold">
                {successMessage.message}
              </p>
            )}

            <button
              onClick={() => setLoginPasswordModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Password Modal */}
      {withdrawalPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Change Withdrawal Password
            </h2>
            <input
              type="password"
              placeholder={
                user?.withdrawalPasswordStatus
                  ? "Current Password"
                  : "Create Password"
              }
              className="w-full p-2 border rounded-md"
              onChange={(e) =>
                setWithdrawalPassword({
                  ...withdrawalPassword,
                  currentPassword: e.target.value,
                })
              }
            />

            {/* For Updating Withdrawal Password */}
            {user?.withdrawalPasswordStatus ? (
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-2 border rounded-md mt-2"
                  onChange={(e) =>
                    setWithdrawalPassword({
                      ...withdrawalPassword,
                      newPassword: e.target.value,
                    })
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full p-2 border rounded-md mt-2"
                  onChange={(e) =>
                    setWithdrawalPassword({
                      ...withdrawalPassword,
                      confirmNewPassword: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div></div>
            )}

            {user?.withdrawalPasswordStatus ? (
              <button
                onClick={handleUpdateWithdrawalPassword}
                className="w-full mt-4 bg-yellow-600 text-white py-2 rounded-md"
              >
                Update Password
              </button>
            ) : (
              <button
                onClick={handleSetWithdrawalPassword}
                className="w-full mt-4 bg-yellow-600 text-white py-2 rounded-md"
              >
                Set Password
              </button>
            )}

            {success && successMessage.isResponse === "response" ? (
              <p className="mt-4 text-green-600 font-semibold">
                {successMessage.message}
              </p>
            ) : (
              <p className="mt-4 text-red-600 font-semibold">
                {successMessage.message}
              </p>
            )}

            <button
              onClick={() => setWithdrawalPasswordModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 text-xl"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
