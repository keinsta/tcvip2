import { create } from "zustand";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api/v1", "");
const socket = io(`${API_BASE_URL}/support/chatSupport`, {
  transports: ["websocket"],
  autoConnect: false,
});

const useChatSupportStore = create((set) => ({
  messages: {},
  unseen: {},

  setMessages: (userId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [userId]: msgs },
    })),

  addMessage: (userId, msg) =>
    set((state) => {
      const isFromUser = msg.sender === "user";
      const unseenCount = isFromUser
        ? (state.unseen[userId] || 0) + 1
        : state.unseen[userId] || 0;

      return {
        messages: {
          ...state.messages,
          [userId]: [...(state.messages[userId] || []), msg],
        },
        unseen: {
          ...state.unseen,
          [userId]: unseenCount,
        },
      };
    }),

  resetUnseen: (userId) =>
    set((state) => ({
      unseen: {
        ...state.unseen,
        [userId]: 0,
      },
    })),
}));

export default useChatSupportStore;
