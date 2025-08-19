import { create } from "zustand";
import type { Alert } from "../types/alert";

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AIAssistantState {
  messages: Message[];
  isOpen: boolean;
  isStreaming: boolean;
  selectedAlerts: Alert[];
  addMessage: (role: MessageRole, content: string) => string;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  toggleOpen: () => void;
  close: () => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setSelectedAlerts: (alerts: Alert[]) => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  messages: [],
  isOpen: false,
  isStreaming: false,
  selectedAlerts: [],

  addMessage: (role, content) => {
    const id = crypto.randomUUID();
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          role,
          content,
          timestamp: new Date(),
        },
      ],
    }));
    return id;
  },

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, content } : msg)),
    })),

  clearMessages: () => set({ messages: [] }),

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  close: () => set({ isOpen: false }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setSelectedAlerts: (alerts) => set({ selectedAlerts: alerts }),
}));
