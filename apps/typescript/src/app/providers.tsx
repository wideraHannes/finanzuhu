"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * The one client-side provider this app needs.
 *
 * `staleTime: Infinity` because the ledger is a fixed file: once a range has
 * been fetched it never changes, so switching tabs back and forth is instant
 * and never refetches.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
