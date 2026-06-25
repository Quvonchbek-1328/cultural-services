import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { CompareTray } from "@/components/shared/compare-tray";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CompareTray />
    </div>
  );
}
