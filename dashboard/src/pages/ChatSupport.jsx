import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import axiosInstance from "../config/axiosInstance";
const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");
const socket = io(`${API_BASE_URL}/admin`, {
  transports: ["websocket"],
  autoConnect: false,
});

export default function AdminApp() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/admin/chat-session/users")
      .then((res) => setUsers(res.data));
  }, []);

  const loadMessages = async (userId) => {
    const sessions = await axiosInstance.get(`/user/${userId}/sessions`);
    if (!sessions.data.length) return;
    const sessionId = sessions.data[0]._id;
    setSelected({ sessionId, userId });
    socket.emit("joinSession", sessionId);
    const msgRes = await axiosInstance.get(
      `/user/session/${sessionId}/messages`
    );
    setMessages(msgRes.data);
  };

  const sendMessage = async () => {
    if (!content.trim() && !file) return;
    let attachmentUrl = null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("/user/upload", formData);
      attachmentUrl = res.data.url;
      setFile(null);
    }
    socket.emit("sendMessage", {
      sessionId: selected.sessionId,
      content,
      attachment: attachmentUrl,
    });
    setContent("");
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("newMessage", ({ sessionId, message }) => {
      if (selected?.sessionId === sessionId)
        setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("newMessage");
    };
  }, [selected]);

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r overflow-y-auto p-4">
        <h2 className="text-xl mb-4 font-bold">Users</h2>
        {users.map((u) => (
          <div
            key={u._id}
            className="mb-2 cursor-pointer"
            onClick={() => loadMessages(u._id)}
          >
            <div className="p-2 bg-gray-700 rounded">{u.email}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-4">
        {selected ? (
          <>
            <div className="h-[80%] overflow-y-auto border p-3 mb-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`mb-2 ${
                    m.sender === "admin" ? "text-right" : "text-left"
                  }`}
                >
                  <div className="inline-block bg-blue-100 px-3 py-1 rounded">
                    {m.content && <p>{m.content}</p>}
                    {m.attachment && (
                      <a
                        href={m.attachment}
                        target="_blank"
                        className="text-blue-500 underline"
                      >
                        Attachment
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="border p-1"
              />
              <div className="flex gap-2">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border flex-1 p-2 bg-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500">Select a user to view messages</div>
        )}
      </div>
    </div>
  );
}
