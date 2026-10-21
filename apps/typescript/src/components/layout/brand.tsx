import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The full lockup from assets/logo_finanzuhu.jpeg. The artwork sits on white,
 * so it brings its own light plate along — that keeps it on brand in either
 * theme.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-black/5",
        className,
      )}
    >
      <Image
        src="/finanzuhu-logo.png"
        alt="Finanzuhu"
        width={2241}
        height={886}
        priority
        sizes="128px"
        className="h-8 w-auto md:h-9"
      />
    </span>
  );
}
