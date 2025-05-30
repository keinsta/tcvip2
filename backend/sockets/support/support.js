const userSocket = require("./userSocket");
const adminSocket = require("./adminSocket");
const ChatSupport = require("../../models/customer-support/ChatSession");

function socketHandler(io) {
  const chatSupportNamespace = io.of("/support/chatSupport");

  chatSupportNamespace.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", ({ userId }) => {
      socket.join(userId); // room = userId
    });

    socket.on("sendMessage", async ({ userId, sender, message }) => {
      const newMsg = { sender, message, timestamp: new Date() };

      let chat = await ChatSupport.findOne({ userId });
      if (!chat) chat = new Chat({ userId, messages: [] });
      chat.messages.push(newMsg);
      await chat.save();

      chatSupportNamespace.to(userId).emit("receiveMessage", newMsg); // emit to user/admin
      chatSupportNamespace
        .to("admin")
        .emit("newNotification", { userId, message }); // notify admin
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
