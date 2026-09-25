"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex gap-1 border-b border-sidebar-border bg-sidebar p-2 md:w-56 md:shrink-0 md:flex-col md:border-r md:border-b-0 md:p-3"
    >
      <div className="hidden items-center gap-2 px-2 py-3 md:flex">
        <span className="text-lg" aria-hidden>
          🦉
        </span>
        <span className="font-semibold tracking-tight">Finanzuhu</span>
      </div>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors md:flex-none",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
