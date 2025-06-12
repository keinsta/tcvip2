import { create } from "zustand";

const useAdminChatStore = create((set) => ({
  selected: null,
  messages: [],
  setSelected: (info) => set({ selected: info }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
}));

export default useAdminChatStore;
