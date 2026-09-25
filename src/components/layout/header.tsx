import { ThemeToggle } from "@/components/layout/theme-toggle";
import { account } from "@/lib/account";

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium">{account.name}</span>
        <span className="text-xs text-muted-foreground">DE12 3456 ···· 7890</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
