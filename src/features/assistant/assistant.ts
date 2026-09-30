/** One turn of the chat, as the browser keeps it and `POST /api/assistant` receives it. */
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Sends the whole history and returns the assistant's reply. */
export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? "The assistant could not answer.");
  }
  return body.reply;
}
