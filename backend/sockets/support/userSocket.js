const ChatSupport = require("../../models/customer-support/ChatSession");

module.exports = (io, socket) => {
  socket.on("userMessage", async ({ userId, message, fileUrl }) => {
    const chat = await ChatSupport.findOneAndUpdate(
      { userId },
      {
        $push: {
          messages: {
            sender: "user",
            message,
            fileUrl,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    io.emit("newMessage", {
      userId,
      message: chat.messages.at(-1),
    });
  });
};
