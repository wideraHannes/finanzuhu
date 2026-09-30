import "server-only";

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import type { ChatMessage } from "@/features/assistant/assistant";
import {
  searchTransactions,
  type TransactionQuery,
} from "@/lib/assistant-tools";
import { getTransactions, referenceDate } from "@/lib/transactions";

const DEFAULT_MODEL = "azure/gpt-6-luna@germanywestcentral";
const MAX_ROUNDS = 5;

/** A failure with a message that is safe to show in the chat. */
export class AssistantError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** The real calendar day on the server, as `YYYY-MM-DD` in local time. */
function today(): string {
  return new Date().toLocaleDateString("sv-SE");
}

function systemPrompt(): string {
  return [
    "You are the assistant of Finanzuhu, a personal-finance app.",
    `Today is ${today()}. Resolve relative dates like "last month" against this date.`,
    `The ledger's last booking is on ${referenceDate()}; there is no data after that day.`,
    "For any question about the user's bookings, call search_transactions and report its `total`. Never invent or add up figures yourself.",
    "Answer general questions directly from your own knowledge, without calling a tool.",
    "Reply in plain text without Markdown, in the language of the question. Format amounts like 1.234,56 €.",
  ].join("\n");
}

function searchTool(categories: string[]) {
  return {
    type: "function" as const,
    function: {
      name: "search_transactions",
      description:
        "Bookings of the user's ledger filtered by date range, category and direction, plus their signed total in euros (expenses are negative).",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "First day, inclusive, YYYY-MM-DD" },
          to: { type: "string", description: "Last day, inclusive, YYYY-MM-DD" },
          category: { type: "string", enum: categories },
          type: { type: "string", enum: ["income", "expense"] },
        },
        additionalProperties: false,
      },
    },
  };
}

function runSearch(args: string): string {
  try {
    const query = JSON.parse(args) as TransactionQuery;
    return JSON.stringify(searchTransactions(getTransactions(), query));
  } catch {
    return JSON.stringify({ error: "The tool arguments are not valid JSON." });
  }
}

/** Answers the last user message, letting the model look up bookings on the way. */
export async function askAssistant(history: ChatMessage[]): Promise<string> {
  const apiKey = process.env.REQUESTY_API_KEY;
  const baseURL = process.env.REQUESTY_BASE_URL;
  const model = process.env.REQUESTY_MODEL || DEFAULT_MODEL;
  if (!apiKey || !baseURL) {
    throw new AssistantError("The assistant is not configured.", 503);
  }

  const client = new OpenAI({ apiKey, baseURL, timeout: 30_000, maxRetries: 1 });
  const categories = [...new Set(getTransactions().map((t) => t.category))].sort();
  const tools = [searchTool(categories)];
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt() },
    ...history,
  ];

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const completion = await client.chat.completions.create({
        model,
        messages,
        tools,
      });
      const message = completion.choices[0]?.message;
      if (!message) break;

      if (!message.tool_calls?.length) {
        return message.content ?? "";
      }

      messages.push(message);
      for (const call of message.tool_calls) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content:
            call.type === "function" && call.function.name === "search_transactions"
              ? runSearch(call.function.arguments)
              : JSON.stringify({ error: "Unknown tool." }),
        });
      }
    }
  } catch (error) {
    console.error("Assistant request failed:", error);
    if (error instanceof OpenAI.AuthenticationError) {
      throw new AssistantError("The assistant is not configured correctly.", 503);
    }
    if (error instanceof OpenAI.APIConnectionError) {
      throw new AssistantError("The assistant is unreachable right now.", 502);
    }
    if (error instanceof OpenAI.APIError) {
      throw new AssistantError("The language model returned an error.", 502);
    }
    throw error;
  }

  throw new AssistantError("The assistant could not finish its answer.", 502);
}
