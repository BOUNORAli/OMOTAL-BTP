"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function DetailDrawer({
  children,
  footer,
  onOpenChange,
  open,
  subtitle,
  title,
  width = "md",
}: {
  children: ReactNode;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  subtitle?: string;
  title: string;
  width?: "sm" | "md" | "lg";
}) {
  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 bg-slate-950/30 opacity-0 transition-opacity", open && "opacity-100")}
        onClick={() => onOpenChange(false)}
      />
      <aside
        aria-hidden={!open}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full translate-x-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200",
          width === "sm" && "sm:max-w-md",
          width === "md" && "sm:max-w-xl",
          width === "lg" && "sm:max-w-3xl",
          open && "translate-x-0",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <Button aria-label="Fermer" onClick={() => onOpenChange(false)} size="sm" variant="ghost">
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <footer className="border-t border-slate-200 px-5 py-4">{footer}</footer> : null}
      </aside>
    </div>
  );
}
