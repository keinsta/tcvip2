import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { avatars } from "../../assets/images/avatar/avatar";
import axiosInstance from "../../config/axiosInstance";
import toast from "react-hot-toast";

const Avatar = () => {
  const navigate = useNavigate();

  const updateAvatar = async (avatar) => {
    await axiosInstance
      .put("/auth/update-user-avatar", { avatar })
      .then((res) => {
        toast.success(res.data.message);
        navigate(-1);
      })
      .catch((error) => toast.error(error.response.data.message));
  };

  return (
    <div>
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center px-4 shadow-md text-white">
        <ArrowLeft
          className="mr-4 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <span className="text-lg">Change Avatar</span>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 mb-24">
        {avatars.map((avatar, index) => (
          <div
            onClick={() => updateAvatar(avatar.name)}
            key={index}
            className="flex justify-center items-center cursor-pointer"
          >
            <img
              src={avatar.avatar}
              alt={`Avatar ${index + 1}`}
              className="w-24 h-24 object-cover rounded-full border-2 border-gray-300 shadow-lg transition-transform transform hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Avatar;
