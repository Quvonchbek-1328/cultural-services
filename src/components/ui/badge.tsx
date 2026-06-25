import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-50 text-primary",
        secondary: "border-transparent bg-secondary-50 text-secondary",
        accent: "border-transparent bg-accent-100 text-accent-600",
        outline: "border-border text-muted-foreground",
        success: "border-transparent bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning: "border-transparent bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        danger: "border-transparent bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
        info: "border-transparent bg-[var(--color-info-bg)] text-[var(--color-info)]",
        neutral: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
