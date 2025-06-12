import { useState } from "react";
import axiosInstance from "../config/axiosInstance";
export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const send = async () => {
    let fileUrl = null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axiosInstance.post("/api/v1/support/upload", formData);
      fileUrl = res.data.fileUrl;
    }
    onSend({ message, fileUrl });
    setMessage("");
    setFile(null);
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        className="border p-2 flex-1 rounded"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={send}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
