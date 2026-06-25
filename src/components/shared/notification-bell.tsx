"use client";
import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications, type Recipient } from "@/lib/store/notifications";
import { useAuthStore } from "@/lib/store/auth";
import { useHydrated } from "@/lib/store/hydrated";
import { cn } from "@/lib/utils";

/** Topbar qo'ng'iroq — o'qilmaganlar soni + bildirishnomalar ro'yxati. */
export function NotificationBell() {
  const hydrated = useHydrated();
  const me = useAuthStore((s) => s.currentUser);
  const items = useNotifications((s) => s.items);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const [open, setOpen] = React.useState(false);

  if (!hydrated || !me) return null;

  const recipient: Recipient = { id: me.id, providerId: me.providerId, role: me.role };
  const mine = items.filter(
    (n) =>
      (n.recipientId && n.recipientId === me.id) ||
      (n.recipientProviderId && me.providerId && n.recipientProviderId === me.providerId) ||
      (n.recipientRole && n.recipientRole === me.role),
  );
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        aria-label="Bildirishnomalar"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-border p-3">
              <span className="font-semibold text-foreground">Bildirishnomalar</span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead(recipient)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Barchasini o&apos;qildim
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {mine.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Bildirishnoma yo&apos;q</div>
              ) : (
                mine.slice(0, 20).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "block border-b border-border p-3 transition-colors last:border-0 hover:bg-muted",
                      !n.read && "bg-primary-50/40",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                      <div className={cn("min-w-0", n.read && "pl-4")}>
                        <div className="text-sm font-medium text-foreground">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{n.message}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
