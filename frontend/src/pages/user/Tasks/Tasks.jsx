import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, History, XCircle, CheckCircle } from "lucide-react";
import present from "../../../assets/images/Task/present.png";

const TASKS_API = {
  daily: [
    {
      id: 1,
      name: "Third-Party game bet amount",
      progress: 0,
      target: 100000,
      reward: 20,
    },
    {
      id: 2,
      name: "Third-Party game bet amount",
      progress: 0,
      target: 50000,
      reward: 15,
    },
    {
      id: 3,
      name: "Third-Party game bet amount",
      progress: 10000,
      target: 10000,
      reward: 10,
    },
    {
      id: 4,
      name: "Third-Party game bet amount",
      progress: 0,
      target: 5000,
      reward: 5,
    },
    {
      id: 5,
      name: "Sports betting amount",
      progress: 0,
      target: 100000,
      reward: 20,
    },
    {
      id: 6,
      name: "Sports betting amount",
      progress: 0,
      target: 50000,
      reward: 15,
    },
    {
      id: 7,
      name: "Sports betting amount",
      progress: 0,
      target: 10000,
      reward: 10,
    },
    {
      id: 8,
      name: "Sports betting amount",
      progress: 0,
      target: 5000,
      reward: 5,
    },
    {
      id: 9,
      name: "Rummy game bet amount",
      progress: 0,
      target: 100000,
      reward: 20,
    },
    {
      id: 10,
      name: "Rummy game bet amount",
      progress: 0,
      target: 50000,
      reward: 15,
    },
  ],
  weekly: [
    {
      id: 11,
      name: "Rummy game bet amount",
      progress: 0,
      target: 1000000,
      reward: 222,
    },
    {
      id: 12,
      name: "Casino game bet amount",
      progress: 0,
      target: 1000000,
      reward: 222,
    },
    {
      id: 13,
      name: "Slot game bet amount",
      progress: 0,
      target: 1000000,
      reward: 222,
    },
    {
      id: 14,
      name: "Lottery bet amount",
      progress: 0,
      target: 1000000,
      reward: 222,
    },
    {
      id: 15,
      name: "Third-Party game bet amount",
      progress: 0,
      target: 1000000,
      reward: 222,
    },
    {
      id: 16,
      name: "Sports betting amount",
      progress: 0,
      target: 1000000,
      reward: 222,
    },
  ],
};

const Tasks = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("daily");
  const [tasks, setTasks] = useState(TASKS_API.daily);

  // Handle Task Completion
  const completeTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, progress: task.target } : task
      )
    );
  };

  return (
    <div className="w-full max-w-[500px] mx-auto mb-24">
      <div className="w-full bg-gradient-yellow-headers pb-3">
        <div className="w-full h-[54px] flex items-center justify-between px-4">
          <div className="flex items-center text-white">
            <ArrowLeft
              size={24}
              className="mr-2 cursor-pointer"
              onClick={() => navigate(-1)}
            />
            <span className="text-lg">Task List</span>
          </div>

          {/* <div className="flex-shrink-0 text-white">
            <select className="bg-transparent border-none text-white">
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div> */}
          <Link to={"/user-tasks/claim-history"}>
            <span className="flex items-center gap-1 text-xs text-yellow-800 cursor-pointer">
              <History size={18} />
              Claim History
            </span>
          </Link>
        </div>

        <div className="w-full justify-center items-center flex px-4">
          <div className="w-72 sm:w-52">
            <img src={present} alt="Task Reward" />
          </div>
          <div>
            <h2 className="text-sm text-white font-semibold mb-2">
              Task Reward
            </h2>
            <p className="text-xs text-white">
              Complete weekly/daily tasks to earn generous rewards Weekly
              rewards cannot be carried over to the next week, and daily rewards
              cannot be carried over to the next day.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-screen p-4 flex flex-col items-center ">
        <h2 className="text-white text-2xl font-bold mb-4">🎯 Task Center</h2>

        {/* Toggle Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-6 py-2 rounded-lg font-semibold ${
              selectedTab === "daily"
                ? "bg-yellow-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => {
              setSelectedTab("daily");
              setTasks(TASKS_API.daily);
            }}
          >
            Daily Tasks
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-semibold ${
              selectedTab === "weekly"
                ? "bg-yellow-500 text-white"
                : "bg-gray-300"
            }`}
            onClick={() => {
              setSelectedTab("weekly");
              setTasks(TASKS_API.weekly);
            }}
          >
            Weekly Tasks
          </button>
        </div>

        {/* Task List */}
        <div className="w-full max-w-lg bg-[#595959] shadow-md rounded-lg p-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 border-b last:border-none"
            >
              <div className="flex items-center gap-2">
                {/* Status Indicator */}
                {task.progress >= task.target ? (
                  <CheckCircle className="text-green-500 w-6 h-6" />
                ) : (
                  <XCircle className="text-red-500 w-6 h-6" />
                )}
                <div>
                  <h3 className="text-white text-sm font-medium">
                    {task.name}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {task.progress}/{task.target}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-yellow-500 font-semibold">
                  +₹{task.reward}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
