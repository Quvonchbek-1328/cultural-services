import { Avatar } from "@/components/ui/avatar";
import { Stars } from "./rating-badge";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <Avatar src={review.authorAvatar} name={review.authorName} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-foreground">{review.authorName}</div>
          <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/80">{review.text}</p>
    </div>
  );
}
