import * as React from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function MinistryLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="ministry">{children}</DashboardShell>;
}
