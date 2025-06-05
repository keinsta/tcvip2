const ChatSupport = require("../../models/customer-support/ChatSession");
const Message = require("../../models/customer-support/Message");

function userSocket(io) {
  io.of("/user").on("connection", (socket) => {
    socket.on("joinSession", (sessionId) => socket.join(sessionId));
    console.log("Session start", sessionId);

    socket.on("sendMessage", async ({ sessionId, content, fileUrl }) => {
      const msg = await Message.create({
        chatSessionId: sessionId,
        sender: "user",
        content,
        fileUrl,
      });
      io.of("/user").to(sessionId).emit("receiveMessage", msg);
      io.of("/admin").emit("newMessage", { sessionId, message: msg });
    });
  });
}

module.exports = userSocket;
