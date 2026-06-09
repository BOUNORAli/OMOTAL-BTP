import Link from "next/link";
import type { MetricItem } from "@/lib/ui/types";
import { cn } from "@/utils/cn";

const toneClass = {
  neutral: "border-slate-200 bg-white text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-xs font-black uppercase text-slate-500">{item.label}</span>
              {Icon ? <Icon className="size-4 shrink-0 text-slate-500" /> : null}
            </div>
            <strong className="mt-2 block truncate text-xl font-black text-slate-950">{item.value}</strong>
            {item.caption ? <span className="mt-1 block truncate text-xs font-semibold text-slate-500">{item.caption}</span> : null}
          </>
        );

        const className = cn("rounded-lg border px-3 py-3", toneClass[item.tone ?? "neutral"]);
        return item.href ? (
          <Link className={cn(className, "transition hover:border-orange-300 hover:bg-orange-50")} href={item.href} key={item.label}>
            {content}
          </Link>
        ) : (
          <div className={className} key={item.label}>
            {content}
          </div>
        );
      })}
    </section>
  );
}
