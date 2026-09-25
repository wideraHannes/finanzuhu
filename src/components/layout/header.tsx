import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { account } from "@/lib/account";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b px-4 md:px-6">
      <Link href="/" aria-label="Finanzuhu — overview">
        <BrandLogo />
      </Link>

      <div className="flex items-center gap-4">
        <div className="hidden flex-col text-right leading-tight sm:flex">
          <span className="text-sm font-medium">{account.name}</span>
          <span className="text-xs text-muted-foreground">
            DE12 3456 ···· 7890
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
