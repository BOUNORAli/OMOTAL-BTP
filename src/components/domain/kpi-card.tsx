import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";

type KpiTone = "normal" | "success" | "warning" | "danger" | "blue";

export function KpiCard({
  caption,
  icon,
  label,
  tone = "normal",
  value,
}: {
  caption?: string;
  icon?: ReactNode;
  label: string;
  tone?: KpiTone;
  value: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4",
        tone === "success" && "border-emerald-100 bg-emerald-50/70",
        tone === "warning" && "border-orange-100 bg-orange-50/70",
        tone === "danger" && "border-red-100 bg-red-50/70",
        tone === "blue" && "border-blue-100 bg-blue-50/70",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-black uppercase text-slate-500">{label}</span>
        <span className="rounded-lg bg-white/80 p-2 text-slate-600 shadow-sm">{icon ?? <ArrowUpRight className="size-4" />}</span>
      </div>
      <strong className="mt-3 block text-2xl font-black text-slate-950">{value}</strong>
      {caption ? <p className="mt-1 text-sm text-slate-600">{caption}</p> : null}
    </Card>
  );
}
