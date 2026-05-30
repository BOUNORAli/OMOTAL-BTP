"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { can } from "@/lib/domain/permissions";
import type { Role } from "@/lib/domain/types";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/utils/cn";
import { appNavItems } from "./sidebar";

const priorityHrefs = ["/app/dashboard", "/app/caisse", "/app/gasoil", "/app/validations"];

export function MobileAppNav() {
  const pathname = usePathname();
  const currentUser = useAppStore((state) => state.currentUser);
  const [open, setOpen] = useState(false);

  const visibleItems = useMemo(
    () => appNavItems.filter((item) => can(currentUser.role as Role, item.permission)),
    [currentUser.role],
  );
  const quickItems = visibleItems.filter((item) => priorityHrefs.includes(item.href)).slice(0, 4);

  useEffect(() => {
    function toggle() {
      setOpen((value) => !value);
    }
    window.addEventListener("omotal:toggle-mobile-nav", toggle);
    return () => window.removeEventListener("omotal:toggle-mobile-nav", toggle);
  }, []);

  return (
    <>
      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 lg:hidden" id="mobile-modules">
        {open ? (
          <div className="mb-3 max-h-[58vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
            <div className="mb-1 flex items-center justify-between px-2 py-2">
              <strong className="text-sm text-slate-950">Modules</strong>
              <button
                aria-label="Fermer le menu mobile"
                className="grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    className={cn(
                      "flex min-h-14 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm font-bold text-slate-700",
                      active && "border-orange-200 bg-orange-50 text-orange-700",
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}

        <nav className="grid grid-cols-5 items-center rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur">
          {quickItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-black text-slate-500",
                  active && "bg-[#12355b] text-white",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-5" />
                <span className="max-w-full truncate px-1">{shortLabel(item.label)}</span>
              </Link>
            );
          })}
          <button
            aria-expanded={open}
            aria-label="Ouvrir le menu des modules"
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-black text-slate-500",
              open && "bg-orange-50 text-orange-700",
            )}
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <Menu className="size-5" />
            Modules
          </button>
        </nav>
      </div>
    </>
  );
}

function shortLabel(label: string) {
  return label
    .replace("Tableau de bord", "Dashboard")
    .replace("Validations", "Valider")
    .replace("Administration", "Admin");
}
