"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ChatProvider } from "@/features/assistant/chat-context";

/**
 * The client-side providers this app needs.
 *
 * Ledger mutations explicitly invalidate their affected query families, so
 * switching views stays instant between successful writes.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ChatProvider>{children}</ChatProvider>
    </QueryClientProvider>
  );
}
