"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/features/assistant/assistant";
import { useChat } from "@/features/assistant/chat-context";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "How much did I spend on Mobility in August?",
  "What is a standing order?",
];

function Bubble({
  role,
  tone,
  children,
}: {
  role: ChatMessage["role"];
  tone?: "muted" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
        role === "user"
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted",
        tone === "muted" && "text-muted-foreground",
        tone === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </div>
  );
}

export default function AssistantPage() {
  // Kept in <ChatProvider>: survives navigation, a reload starts a fresh chat.
  const { messages, send, isPending, error } = useChat();
  const [draft, setDraft] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isPending) return;

    setDraft("");
    send(content);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Ask about your bookings or anything money-related.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2" aria-live="polite">
            {messages.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <p>Try for example:</p>
                {EXAMPLES.map((example) => (
                  <p key={example}>„{example}“</p>
                ))}
              </div>
            )}
            {messages.map((message, index) => (
              <Bubble key={index} role={message.role}>
                {message.content}
              </Bubble>
            ))}
            {isPending && (
              <Bubble role="assistant" tone="muted">
                Thinking…
              </Bubble>
            )}
            {error && (
              <Bubble role="assistant" tone="error">
                {error.message}
              </Bubble>
            )}
          </div>

          <form onSubmit={submit} className="flex gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a question"
              aria-label="Your question"
              maxLength={4000}
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !draft.trim()}>
              <Send className="size-4" aria-hidden />
              Send
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            AI answers can be wrong and are no financial advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
