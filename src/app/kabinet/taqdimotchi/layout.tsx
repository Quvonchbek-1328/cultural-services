import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function TaqdimotchiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="provider">{children}</DashboardShell>;
}
