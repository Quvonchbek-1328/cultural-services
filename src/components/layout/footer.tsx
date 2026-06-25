import Link from "next/link";
import { Mail, Phone, MapPin, Globe, AtSign, Send } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { CATEGORIES } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Platforma",
    links: [
      { label: "Xizmatlar", href: "/xizmatlar" },
      { label: "Tavsiya etilganlar", href: "/xizmatlar?saralash=reyting" },
      { label: "Tadbirlar", href: "/#tadbirlar" },
      { label: "Qanday ishlaydi", href: "/#qanday-ishlaydi" },
    ],
  },
  {
    title: "Xizmat ko'rsatuvchilar uchun",
    links: [
      { label: "Ijrochi bo'lish", href: "/royxatdan-otish" },
      { label: "Ijrochi kabineti", href: "/kabinet/ijrochi" },
      { label: "Tashkilot qo'shish", href: "/royxatdan-otish" },
      { label: "Tasdiqlash", href: "/#qanday-ishlaydi" },
    ],
  },
  {
    title: "Kompaniya",
    links: [
      { label: "Biz haqimizda", href: "/#qanday-ishlaydi" },
      { label: "Ishonch va xavfsizlik", href: "/#qanday-ishlaydi" },
      { label: "Yordam markazi", href: "/#qanday-ishlaydi" },
      { label: "Bog'lanish", href: "/#qanday-ishlaydi" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-border bg-slate-950 text-slate-300">
      <div className="motif-grid absolute inset-0 opacity-[0.15]" />
      <div className="container-page relative py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              O'zbekistondagi madaniy xizmatlarni jamlovchi ishonchli platforma — xonanda,
              raqs jamoasi, fotograf, ovoz texnikasi va boshqalar bir joyda.
            </p>
            <div className="mt-5 flex gap-2">
              {[Globe, AtSign, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition-colors hover:border-primary hover:text-primary-300"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-slate-400 transition-colors hover:text-primary-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-800 pt-8">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/xizmatlar?kategoriya=${c.id}`}
              className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-400 transition-colors hover:border-primary hover:text-primary-300"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2"><MapPin className="size-4" /> Toshkent, O'zbekiston</span>
            <a href="tel:+998712000000" className="inline-flex items-center gap-2 transition-colors hover:text-primary-300"><Phone className="size-4" /> +998 71 200 00 00</a>
            <a href="https://t.me/madaniyxizmatlar" target="_blank" rel="noopener" className="inline-flex items-center gap-2 transition-colors hover:text-primary-300"><Send className="size-4" /> Telegram</a>
            <a href="mailto:info@madaniyxizmatlar.uz" className="inline-flex items-center gap-2 transition-colors hover:text-primary-300"><Mail className="size-4" /> info@madaniyxizmatlar.uz</a>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/#" className="transition-colors hover:text-primary-300">Foydalanish shartlari</Link>
            <Link href="/#" className="transition-colors hover:text-primary-300">Maxfiylik siyosati</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 md:text-left">© 2026 Madaniy Xizmatlar. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}
