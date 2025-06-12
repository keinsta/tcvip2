import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  ChevronRight,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  XCircle,
} from "lucide-react";
import Picker from "@emoji-mart/react"; // ✅ Correct import
import data from "@emoji-mart/data"; // ✅ Required for emoji-mart v5+
import aboutus from "../assets/images/serviceBg.png";

const CustomerService = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(false);
  const [selectedChat, setSelectedChat] = useState("");
  const [messages, setMessages] = useState([
    { sender: "agent", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // 📌 Send Message
  const sendMessage = () => {
    if (input.trim() === "" && attachments.length === 0) return;

    // Create a new message object
    const userMessage = {
      sender: "user",
      text: input,
      attachments: attachments.map((file) => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
    };

    // Update messages state
    setMessages([...messages, userMessage]);
    setInput("");
    setAttachments([]); // Clear attachments after sending

    // Simulated response from agent
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "agent",
          text: "Thank you for reaching out! An agent will assist you shortly.",
        },
      ]);
    }, 1000);
  };

  // 📌 Handle File Upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  // 📌 Remove Attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // 📌 Add Emoji
  const addEmoji = (emoji) => {
    setInput((prevInput) => prevInput + emoji.native);
  };

  return (
    <div className="min-h-screen flex flex-col items-center space-y-4">
      {/* Header */}
      <div className="w-full h-[54px] bg-gradient-yellow-headers flex items-center justify-between px-4 shadow-md text-white">
        <div className="flex justify-center">
          <ArrowLeft
            className="mr-2 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <span className="text-lg">Customer Service</span>
        </div>
        <img src={aboutus} alt="Safe Banner" className="w-20" />
      </div>

      {/* Service Options */}
      <div className="w-full px-4 space-y-4">
        <div
          className="flex items-center p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200"
          onClick={() => {
            setSelectedTab(!selectedTab);
            setSelectedChat("");
          }}
        >
          <Phone className="w-6 h-6 mr-2 text-red-600" />
          <h2 className="text-lg font-semibold">Online Customer Service</h2>
        </div>

        {selectedTab && (
          <div className="px-2 space-y-2">
            {/* <div
              onClick={() => setSelectedChat("self-service")}
              className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200"
            >
              <Phone className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-sm font-semibold">TC Self-Service Center</h2>
              <ChevronRight />
            </div> */}
            <div
              onClick={() => setSelectedChat("live-chat")}
              className="flex items-center justify-between p-2 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200"
            >
              <Phone className="w-6 h-6 mr-2 text-red-600" />
              <h2 className="text-sm font-semibold">LIVE CHAT</h2>
              <ChevronRight />
            </div>
          </div>
        )}

        {/* Live Chat Section */}
        {selectedChat === "live-chat" && (
          <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-300 mt-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="text-blue-500" /> Customer Support
            </h2>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto p-4 bg-gray-100 rounded-lg">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex text-sm ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`p-3 rounded-lg shadow-md ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {/* Message Text */}
                    <p>{msg.text}</p>

                    {/* Attachments Preview */}
                    {msg.attachments?.map((file, i) => (
                      <div key={i} className="mt-2">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={file.url}
                            alt="Attachment"
                            className="w-24 h-24 rounded-lg"
                          />
                        ) : file.type.startsWith("video/") ? (
                          <video controls className="w-24 h-24 rounded-lg">
                            <source src={file.url} />
                          </video>
                        ) : (
                          <a
                            href={file.url}
                            download={file.name}
                            className="text-sm text-blue-700 underline"
                          >
                            {file.name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-16 h-16 border rounded-lg flex items-center justify-center bg-gray-200"
                  >
                    {/* Show images */}
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : file.type.startsWith("video/") ? (
                      <video
                        controls
                        className="w-full h-full object-cover rounded-lg"
                      >
                        <source src={URL.createObjectURL(file)} />
                      </video>
                    ) : (
                      <span className="text-sm text-gray-700">{file.name}</span>
                    )}

                    {/* Remove Button */}
                    <XCircle
                      className="absolute top-0 right-0 text-red-600 cursor-pointer"
                      onClick={() => removeAttachment(index)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Input & Actions */}
            <div className="relative flex mt-4 gap-2 items-center w-full">
              {/* Emoji Picker Toggle */}
              <Smile
                className="text-gray-600 cursor-pointer"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 bg-white shadow-lg rounded-lg z-50">
                  <Picker
                    data={data}
                    onEmojiSelect={addEmoji}
                    perLine={6}
                    emojiSize={24}
                  />
                </div>
              )}

              {/* File Upload */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*, video/*, .pdf, .doc, .docx, .xls, .xlsx"
                onChange={handleFileUpload}
              />
              <Paperclip
                className="cursor-pointer text-gray-600 min-w-[30px]"
                onClick={() => fileInputRef.current.click()}
              />

              {/* Input Field */}
              <input
                type="text"
                className="w-1/3 flex-1 p-2 border rounded-lg focus:outline-none"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Send />
              </button>
            </div>
          </div>
        )}

        {/* Self-Service Center */}
        {selectedChat === "self-service" && <div>Self Service</div>}
      </div>
    </div>
  );
};

export default CustomerService;
