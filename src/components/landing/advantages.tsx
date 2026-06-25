import { BadgeCheck, ShieldCheck, Zap, MapPinned, Layers, MonitorSmartphone } from "lucide-react";
import { SectionHeading } from "@/components/shared/page-header";

const ADVANTAGES = [
  { icon: BadgeCheck, title: "Tasdiqlangan ijrochilar", text: "Har bir ijrochi administrator tomonidan tekshirilib, tasdiqlangan." },
  { icon: ShieldCheck, title: "Xavfsiz buyurtma", text: "Buyurtma jarayoni shaffof — narx, sana va shartlar oldindan aniq." },
  { icon: Zap, title: "Tez aloqa", text: "Ijrochi bilan to'g'ridan-to'g'ri bog'laning, javobni tez oling." },
  { icon: MapPinned, title: "Hududlar bo'yicha qidiruv", text: "O'z viloyatingiz va tumaningizdagi xizmatlarni oson toping." },
  { icon: Layers, title: "Tayyor jamlanmalar", text: "Bir nechta xizmat yagona, qulay paketda — vaqtni tejang." },
  { icon: MonitorSmartphone, title: "Onlayn boshqaruv", text: "Buyurtma, kalendar va daromadni bitta kabinetdan boshqaring." },
];

export function Advantages() {
  return (
    <section className="container-page py-16">
      <SectionHeading
        eyebrow="Afzalliklar"
        title="Nega aynan bizning platforma"
        description="Davlat va madaniy xizmatlar uchun ishonchli, shaffof va qulay marketplace."
        align="center"
      />
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ADVANTAGES.map((a) => (
          <div key={a.title} className="card-hover rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
              <a.icon className="size-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{a.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
