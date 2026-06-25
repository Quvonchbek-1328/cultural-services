import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({
  className,
  variant = "default",
  href = "/",
}: {
  className?: string;
  variant?: "default" | "light";
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-soft">
        {/* Uzbek star motif */}
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 14.8 6.9 17.8l1.2-5.6L3.9 8.4l5.6-.6z" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-bold tracking-tight",
            variant === "light" ? "text-white" : "text-foreground",
          )}
        >
          {APP_NAME}
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.18em]",
            variant === "light" ? "text-white/70" : "text-muted-foreground",
          )}
        >
          O'zbekiston
        </span>
      </span>
    </span>
  );

  if (href === null) return content;
  return <Link href={href}>{content}</Link>;
}
