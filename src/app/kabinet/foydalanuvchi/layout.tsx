import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function FoydalanuvchiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="user">{children}</DashboardShell>;
}
