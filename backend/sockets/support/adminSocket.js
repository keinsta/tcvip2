const ChatSupport = require("../../models/customer-support/ChatSession");

module.exports = (io, socket) => {
  socket.on("adminMessage", async ({ userId, message }) => {
    const chat = await ChatSupport.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            sender: "admin",
            message,
            fileUrl: null,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    io.to(userId).emit("newMessage", {
      userId,
      message: chat.messages.at(-1),
    });
  });
};
