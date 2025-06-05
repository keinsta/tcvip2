const ChatSupport = require("../../models/customer-support/ChatSession");
const Message = require("../../models/customer-support/Message");

function adminSocket(io) {
  io.of("/admin").on("connection", (socket) => {
    socket.on("joinSession", (sessionId) => socket.join(sessionId));

    socket.on("sendMessage", async ({ sessionId, content }) => {
      const msg = await Message.create({
        chatSessionId: sessionId,
        sender: "admin",
        content,
      });
      io.of("/admin").to(sessionId).emit("receiveMessage", msg);
      io.of("/user").to(sessionId).emit("receiveMessage", msg);
    });
  });
}

module.exports = adminSocket;
