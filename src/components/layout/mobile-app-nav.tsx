"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { roleLabels } from "@/lib/domain/labels";
import { can } from "@/lib/domain/permissions";
import type { Role } from "@/lib/domain/types";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/utils/cn";
import { appNavItems } from "./sidebar";

export function MobileAppNav() {
  const pathname = usePathname();
  const currentUser = useAppStore((state) => state.currentUser);
  const [open, setOpen] = useState(false);

  const visibleItems = useMemo(
    () => appNavItems.filter((item) => can(currentUser.role as Role, item.permission)),
    [currentUser.role],
  );

  useEffect(() => {
    function toggle() {
      setOpen((value) => !value);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("omotal:toggle-mobile-nav", toggle);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("omotal:toggle-mobile-nav", toggle);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={cn("lg:hidden", !open && "pointer-events-none")} id="mobile-modules">
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 opacity-0 transition-opacity",
          open && "pointer-events-auto opacity-100",
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        aria-label="Navigation mobile"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-80 -translate-x-full flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200",
          open && "pointer-events-auto translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <Link className="flex items-center gap-3" href="/app/dashboard" onClick={() => setOpen(false)}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#12355b] text-xs font-black text-white">
              OT
            </span>
            <div>
              <strong className="block text-sm font-black text-slate-950">OMOTAL TRAVAUX</strong>
              <span className="text-xs font-semibold text-slate-500">Gestion chantiers</span>
            </div>
          </Link>
          <button
            aria-label="Fermer la navigation"
            className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100",
                  active && "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <Icon className="size-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Connecte</p>
          <strong className="mt-1 block text-sm text-slate-950">{currentUser.name}</strong>
          <span className="text-xs text-slate-500">{roleLabels[currentUser.role]}</span>
        </div>
      </aside>
    </div>
  );
}
