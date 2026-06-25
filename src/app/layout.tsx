import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Madaniy Xizmatlar — O'zbekiston madaniy xizmatlari platformasi",
    template: "%s · Madaniy Xizmatlar",
  },
  description:
    "Xonanda, boshlovchi, raqs jamoasi, fotograf, videograf, ovoz texnikasi va dekoratorlarni yagona platformada toping va buyurtma qiling.",
  keywords: ["O'zbekiston", "madaniy xizmatlar", "to'y", "xonanda", "fotograf", "tadbir"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={`${inter.variable} ${sora.variable}`} style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
