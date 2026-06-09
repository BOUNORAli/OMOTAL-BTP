import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeTone = "slate" | "green" | "orange" | "red" | "blue" | "yellow";

export function Badge({
  children,
  className,
  tone = "slate",
}: {
  children: ReactNode;
  className?: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold",
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        tone === "orange" && "bg-orange-50 text-orange-700",
        tone === "red" && "bg-red-50 text-red-700",
        tone === "blue" && "bg-blue-50 text-blue-700",
        tone === "yellow" && "bg-yellow-50 text-yellow-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
