import { useEffect, useState } from "react";
import useChatSupportStore from "../store/useChatSupportStore";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import UserList from "../components/UserList";
const socket = io(`${API_BASE_URL}/support/chatSupport`, {
  transports: ["websocket"],
  autoConnect: false,
});
export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const { messages, setMessages, addMessage, resetUnseen } =
    useChatSupportStore();

  useEffect(() => {
    socket.emit("adminJoin");

    socket.on("userList", (list) => {
      setUserList(list);
    });

    socket.on("newMessage", ({ userId, message }) => {
      addMessage(userId, message);
    });

    return () => {
      socket.off("userList");
      socket.off("newMessage");
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    socket.emit("adminSelectUser", selectedUser);

    // Optionally fetch past messages
    fetch(`http://localhost:4000/api/admin/chat/${selectedUser}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(selectedUser, data.messages || []);
        resetUnseen(selectedUser);
      });
  }, [selectedUser]);

  const sendMessage = (text, fileUrl) => {
    socket.emit("adminMessage", {
      userId: selectedUser,
      message: text,
      fileUrl,
    });
  };

  const handleDownload = async () => {
    const res = await fetch(
      `http://localhost:4000/api/admin/chat/${selectedUser}/download`
    );
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedUser}_chat.json`;
    link.click();
  };

  return (
    <div className="flex h-screen">
      <UserList
        users={userList}
        selectedUser={selectedUser}
        onSelect={setSelectedUser}
      />

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">
            Chat with {selectedUser || "..."}
          </h1>
          {selectedUser && (
            <button
              onClick={handleDownload}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Download Chat
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border p-2 bg-gray-50">
          {(messages[selectedUser] || []).map((msg, idx) => (
            <ChatMessage key={idx} msg={msg} />
          ))}
        </div>

        {selectedUser && <ChatInput onSend={sendMessage} />}
      </div>
    </div>
  );
}
