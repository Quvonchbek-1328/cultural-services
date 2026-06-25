"use client";
import * as React from "react";
import { Sparkles, Users, ShoppingBag, MapPin } from "lucide-react";

/** Ko'rinishga kirgach bir marta ishlaydigan ease-out count-up. */
function useCountUp(target: number, run: boolean, duration = 1400) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

const ICONS = { Sparkles, Users, ShoppingBag, MapPin } as const;

function Stat({ icon, value, suffix, label, run, delay }: {
  icon: keyof typeof ICONS; value: number; suffix: string; label: string; run: boolean; delay: number;
}) {
  const n = useCountUp(value, run);
  const Icon = ICONS[icon];
  return (
    <div
      className="card-hover rounded-2xl border border-border bg-surface/70 p-6 text-center shadow-soft backdrop-blur"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="mt-3 font-display text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
        {n.toLocaleString("uz")}{suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function StatsBand({ services, providers, orders, regions }: {
  services: number; providers: number; orders: number; regions: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [run, setRun] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setRun(true);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = [
    { icon: "Sparkles", value: services, suffix: "+", label: "Xizmatlar soni" },
    { icon: "Users", value: providers, suffix: "+", label: "Faol ijrochilar" },
    { icon: "ShoppingBag", value: orders, suffix: "+", label: "Buyurtmalar soni" },
    { icon: "MapPin", value: regions, suffix: "", label: "Viloyatlar soni" },
  ] as const;

  return (
    <section className="container-page py-12">
      <div ref={ref} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((s, i) => (
          <Stat key={s.label} icon={s.icon} value={s.value} suffix={s.suffix} label={s.label} run={run} delay={i * 80} />
        ))}
      </div>
    </section>
  );
}
