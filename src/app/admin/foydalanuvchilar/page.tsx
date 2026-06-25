"use client";
import * as React from "react";
import { Ban, ShieldCheck, Lock, Unlock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/shared/data-table";
import { useAuthStore } from "@/lib/store/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Account, Role } from "@/lib/types";

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "accent" | "neutral"> = {
  user: "neutral",
  provider: "default",
  ministry: "secondary",
  admin: "accent",
};

type RoleFilter = "all" | Role;

export default function AdminUsersPage() {
  const accounts = useAuthStore((s) => s.accounts);
  const setAccountStatus = useAuthStore((s) => s.setAccountStatus);

  const [filter, setFilter] = React.useState<RoleFilter>("all");

  const count = (r: RoleFilter) =>
    r === "all" ? accounts.length : accounts.filter((a) => a.role === r).length;

  const data = React.useMemo(
    () => (filter === "all" ? accounts : accounts.filter((a) => a.role === filter)),
    [accounts, filter],
  );

  const tabs = [
    { value: "all", label: "Hammasi", badge: <Badge variant="neutral">{count("all")}</Badge> },
    ...(["user", "provider", "organization", "admin"] as Role[]).map((r) => ({
      value: r,
      label: ROLE_LABELS[r],
      badge: <Badge variant="neutral">{count(r)}</Badge>,
    })),
  ];

  const columns: Column<Account>[] = [
    {
      key: "user",
      header: "Foydalanuvchi",
      sortValue: (a) => a.fullName,
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar src={a.avatar} name={a.fullName} size={38} />
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">{a.fullName}</div>
            <div className="truncate text-xs text-muted-foreground">{a.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      sortValue: (a) => ROLE_LABELS[a.role],
      render: (a) => <Badge variant={ROLE_VARIANT[a.role]}>{ROLE_LABELS[a.role]}</Badge>,
    },
    {
      key: "region",
      header: "Viloyat",
      sortValue: (a) => a.region,
      render: (a) => <span className="text-muted-foreground">{a.region || "—"}</span>,
    },
    {
      key: "status",
      header: "Holat",
      sortValue: (a) => a.status,
      render: (a) =>
        a.status === "active" ? (
          <Badge variant="success">Faol</Badge>
        ) : (
          <Badge variant="danger">
            <Ban /> Bloklangan
          </Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Ro'yxatdan o'tgan",
      sortValue: (a) => a.createdAt,
      render: (a) => <span className="text-muted-foreground">{formatDate(a.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Amallar",
      align: "right",
      render: (a) => {
        if (a.role === "admin") {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Himoyalangan
            </span>
          );
        }
        return a.status === "active" ? (
          <Button size="sm" variant="outline" onClick={() => setAccountStatus(a.id, "blocked")}>
            <Lock /> Bloklash
          </Button>
        ) : (
          <Button size="sm" variant="soft" onClick={() => setAccountStatus(a.id, "active")}>
            <Unlock /> Blokdan chiqarish
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Foydalanuvchilar"
        description="Barcha hisoblarni boshqaring — rollar, holatlar va kirish huquqi."
      />

      <div className="mb-4 overflow-x-auto">
        <Tabs tabs={tabs} value={filter} onValueChange={(v) => setFilter(v as RoleFilter)} />
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKeys={(a) => `${a.fullName} ${a.email} ${a.phone}`}
        pageSize={10}
        emptyLabel="Foydalanuvchi topilmadi"
      />
    </div>
  );
}
