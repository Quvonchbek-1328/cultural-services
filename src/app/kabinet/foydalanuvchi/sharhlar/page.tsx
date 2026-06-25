"use client";
import * as React from "react";
import Link from "next/link";
import { Star, PenLine, MessageSquarePlus } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ReviewCard } from "@/components/shared/review-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { useAppStore } from "@/lib/store/app";
import type { Order, Service } from "@/lib/types";

interface PendingReviewTarget {
  serviceId: string;
  serviceTitle: string;
  providerId: string;
}

export default function SharhlarPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const reviews = useAppStore((s) => s.reviews);
  const services = useAppStore((s) => s.services);
  const orders = useAppStore((s) => s.orders);
  const addReview = useAppStore((s) => s.addReview);

  const [target, setTarget] = React.useState<PendingReviewTarget | null>(null);
  const [rating, setRating] = React.useState(5);
  const [hover, setHover] = React.useState(0);
  const [text, setText] = React.useState("");

  const serviceMap = React.useMemo(
    () => new Map<string, Service>(services.map((s) => [s.id, s])),
    [services],
  );

  // Foydalanuvchi qoldirgan sharhlar
  const myReviews = React.useMemo(
    () =>
      reviews
        .filter((r) => r.authorId === currentUser?.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [reviews, currentUser?.id],
  );

  // Bajarilgan, ammo hali sharhlanmagan xizmatlar
  const reviewableTargets = React.useMemo(() => {
    const reviewedServiceIds = new Set(
      reviews
        .filter((r) => r.authorId === currentUser?.id)
        .map((r) => r.serviceId),
    );
    const seen = new Set<string>();
    const out: { order: Order; service?: Service }[] = [];
    orders
      .filter(
        (o) =>
          o.customerId === currentUser?.id &&
          o.status === "completed" &&
          !reviewedServiceIds.has(o.serviceId),
      )
      .forEach((o) => {
        if (seen.has(o.serviceId)) return;
        seen.add(o.serviceId);
        out.push({ order: o, service: serviceMap.get(o.serviceId) });
      });
    return out;
  }, [orders, reviews, currentUser?.id, serviceMap]);

  const openReview = (t: PendingReviewTarget) => {
    setTarget(t);
    setRating(5);
    setHover(0);
    setText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !currentUser) return;
    addReview({
      serviceId: target.serviceId,
      providerId: target.providerId,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatar,
      rating,
      text: text.trim(),
    });
    setTarget(null);
  };

  if (!currentUser) return null;

  return (
    <>
      <PageHeader
        eyebrow="Fikrlar"
        icons={["Star", "MessageSquare"]}
        title="Sharhlarim"
        description="Siz qoldirgan sharhlar va sharh qoldirish mumkin bo'lgan xizmatlar."
      />

      {/* Sharh qoldirish mumkin */}
      {reviewableTargets.length > 0 && (
        <div className="mb-8">
          <SectionHeading
            title="Sharh qoldirish mumkin"
            description="Bajarilgan buyurtmalaringiz uchun tajribangizni baholang."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {reviewableTargets.map(({ order, service }) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-semibold text-foreground">
                      {order.serviceTitle}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Buyurtma bajarilgan — fikringizni bildiring.
                    </p>
                  </div>
                  <Button
                    variant="soft"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      openReview({
                        serviceId: order.serviceId,
                        serviceTitle: order.serviceTitle,
                        providerId: service?.providerId ?? order.providerId,
                      })
                    }
                  >
                    <PenLine className="size-4" /> Sharh yozish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mavjud sharhlar */}
      {reviewableTargets.length > 0 && (
        <SectionHeading title="Mening sharhlarim" />
      )}

      <div className={cn(reviewableTargets.length > 0 && "mt-4")}>
        {myReviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Hali sharh qoldirmagansiz"
            description="Bajarilgan buyurtmalaringiz uchun sharh qoldiring — bu boshqalarga to'g'ri tanlov qilishga yordam beradi."
            action={
              <Button asChild variant="outline">
                <Link href="/kabinet/foydalanuvchi/buyurtmalar">
                  Buyurtmalarga o'tish
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {myReviews.map((r) => {
              const svc = serviceMap.get(r.serviceId);
              return (
                <div key={r.id} className="space-y-2">
                  {svc ? (
                    <Link
                      href={`/xizmatlar/${svc.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:underline"
                    >
                      {svc.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      Xizmat
                    </span>
                  )}
                  <ReviewCard review={r} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sharh yozish dialogi */}
      <Dialog
        open={!!target}
        onClose={() => setTarget(null)}
        title="Sharh yozish"
        description={target?.serviceTitle}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Bahoyingiz</Label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${i} yulduz`}
                  className="rounded-md p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      i <= (hover || rating)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                {rating} / 5
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-text">Sharhingiz</Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Xizmat sifati, ijrochi bilan muloqot va umumiy taassurotlaringizni yozing…"
              required
              maxLength={600}
            />
            <p className="text-right text-xs text-muted-foreground">
              {text.length}/600
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTarget(null)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary">
              <MessageSquarePlus className="size-4" /> Yuborish
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
