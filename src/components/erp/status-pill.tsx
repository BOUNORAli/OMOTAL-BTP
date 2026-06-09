import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export function StatusPill({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: StatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-bold",
        tone === "neutral" && "border-slate-200 bg-slate-50 text-slate-700",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700",
        tone === "info" && "border-blue-200 bg-blue-50 text-blue-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ModuleBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-slate-900 px-2 text-xs font-bold text-white">
      {children}
    </span>
  );
}
