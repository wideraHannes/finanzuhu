import type { ChatMessage } from "@/features/assistant/assistant";
import { AssistantError, askAssistant } from "@/lib/llm";

const MAX_MESSAGES = 50;
const MAX_LENGTH = 4000;

/**
 * Only user and assistant turns get through — a client cannot smuggle in
 * `system` or `tool` messages.
 */
function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const { role, content } = value as Record<string, unknown>;
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.length <= MAX_LENGTH
  );
}

function parseMessages(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages)) return null;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  if (!messages.every(isChatMessage)) return null;

  const last = messages[messages.length - 1];
  if (last.role !== "user" || !last.content.trim()) return null;
  return messages.map(({ role, content }) => ({ role, content }));
}

export async function POST(request: Request) {
  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  try {
    return Response.json({ reply: await askAssistant(messages) });
  } catch (error) {
    if (error instanceof AssistantError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Assistant route failed:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
