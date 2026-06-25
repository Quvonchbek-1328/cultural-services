import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingBadge({
  rating,
  reviewCount,
  size = "md",
  showCount = true,
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: { star: "size-3", text: "text-xs" },
    md: { star: "size-3.5", text: "text-sm" },
    lg: { star: "size-4", text: "text-base" },
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", sizes.text, className)}>
      <Star className={cn(sizes.star, "fill-accent text-accent")} />
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-muted-foreground">({reviewCount})</span>
      )}
    </span>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= Math.round(rating) ? "fill-accent text-accent" : "fill-muted text-muted",
          )}
        />
      ))}
    </span>
  );
}
