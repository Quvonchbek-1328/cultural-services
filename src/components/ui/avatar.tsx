import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, name, size = 40, className, ring }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-300",
        ring && "ring-2 ring-surface shadow-sm",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
