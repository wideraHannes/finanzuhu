"use client";

import { createContext, useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { type ChatMessage, sendChat } from "@/features/assistant/assistant";

type Chat = {
  messages: ChatMessage[];
  send: (content: string) => void;
  isPending: boolean;
  error: Error | null;
};

const ChatContext = createContext<Chat | null>(null);

/**
 * Holds the assistant chat above the pages, so it survives navigating away
 * from `/assistant` (and a request in flight still lands). It is plain React
 * state: a reload starts a fresh chat.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chat = useMutation({
    mutationFn: sendChat,
    onSuccess: (reply) =>
      setMessages((current) => [...current, { role: "assistant", content: reply }]),
  });

  function send(content: string) {
    if (chat.isPending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    chat.mutate(next);
  }

  return (
    <ChatContext.Provider
      value={{ messages, send, isPending: chat.isPending, error: chat.error }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): Chat {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("useChat must be used inside <ChatProvider>.");
  return chat;
}
