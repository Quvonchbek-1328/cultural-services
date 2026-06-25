import { Clock, CheckCircle2, XCircle, CircleDot, Ban, Eye, EyeOff, BadgeCheck } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { SERVICE_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/constants";
import type { ServiceStatus, OrderStatus, ReviewStatus } from "@/lib/types";

type Variant = BadgeProps["variant"];

const SERVICE: Record<ServiceStatus, { variant: Variant; icon: React.ReactNode }> = {
  DRAFT: { variant: "neutral", icon: <CircleDot /> },
  PENDING_ADMIN_REVIEW: { variant: "warning", icon: <Clock /> },
  ADMIN_APPROVED: { variant: "info", icon: <BadgeCheck /> },
  PENDING_MINISTRY_APPROVAL: { variant: "info", icon: <Clock /> },
  MINISTRY_APPROVED: { variant: "secondary", icon: <BadgeCheck /> },
  PUBLISHED: { variant: "success", icon: <CheckCircle2 /> },
  ADMIN_REJECTED: { variant: "danger", icon: <XCircle /> },
  MINISTRY_REJECTED: { variant: "danger", icon: <XCircle /> },
};

const ORDER: Record<OrderStatus, { variant: Variant; icon: React.ReactNode }> = {
  pending: { variant: "warning", icon: <Clock /> },
  accepted: { variant: "info", icon: <CircleDot /> },
  rejected: { variant: "danger", icon: <XCircle /> },
  completed: { variant: "success", icon: <CheckCircle2 /> },
  cancelled: { variant: "neutral", icon: <Ban /> },
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  const s = SERVICE[status];
  return (
    <Badge variant={s.variant}>
      {s.icon} {SERVICE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER[status];
  return (
    <Badge variant={s.variant}>
      {s.icon} {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return status === "visible" ? (
    <Badge variant="success">
      <Eye /> Ko'rinadi
    </Badge>
  ) : (
    <Badge variant="neutral">
      <EyeOff /> Yashirilgan
    </Badge>
  );
}

export function VerifiedBadge({ withLabel = true }: { withLabel?: boolean }) {
  return (
    <Badge variant="secondary">
      <BadgeCheck /> {withLabel && "Tasdiqlangan"}
    </Badge>
  );
}
